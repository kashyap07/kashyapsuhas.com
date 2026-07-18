import { renderToCanvas, type DreamParams } from "./gl";

// full-res export, entirely in-browser. renders through the same dreamify
// pipeline as the preview (variable blur + bloom in linear light), encodes,
// and for jpeg copies the original file's exif across so camera metadata
// survives the round trip.

function blobFromCanvas(canvas: HTMLCanvasElement, mime: string, quality?: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("could not encode the image"))),
      mime,
      quality,
    );
  });
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [head, b64] = dataUrl.split(",");
  const mime = head.match(/data:(.*?);base64/)?.[1] ?? "image/jpeg";
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

// copy exif from the original jpeg into the freshly encoded one. pixels are
// baked upright by createImageBitmap, so we force orientation back to 1 to
// stop viewers from re-rotating.
async function copyExif(originalFile: File, encoded: Blob): Promise<Blob> {
  if (!/jpe?g/i.test(originalFile.type)) return encoded; // only jpeg carries exif
  const piexif = (await import("piexifjs")).default;
  const [origUrl, outUrl] = await Promise.all([
    blobToDataUrl(originalFile),
    blobToDataUrl(encoded),
  ]);
  const exif = piexif.load(origUrl);
  if (exif["0th"]) exif["0th"][piexif.ImageIFD.Orientation] = 1;
  const merged = piexif.insert(piexif.dump(exif), outUrl);
  return dataUrlToBlob(merged);
}

export async function exportBlurred(opts: {
  originalFile: File;
  bitmap: ImageBitmap;
  params: DreamParams; // sigmas in full-res px
  format: "jpeg" | "png";
  quality?: number; // 0..1, jpeg only
}): Promise<Blob> {
  const { originalFile, bitmap, params, format, quality = 0.95 } = opts;
  const canvas = renderToCanvas({ bitmap, params });
  if (format === "png") {
    return blobFromCanvas(canvas, "image/png");
  }
  const jpeg = await blobFromCanvas(canvas, "image/jpeg", quality);
  try {
    return await copyExif(originalFile, jpeg);
  } catch {
    // metadata is a nicety; never fail the export over it
    return jpeg;
  }
}
