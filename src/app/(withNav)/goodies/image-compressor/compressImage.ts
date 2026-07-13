// lazy load browser-image-compression to avoid bundling it at page level
export async function compressImage(
  imageDataUrl: string,
  compressionPercentage: number,
) {
  const imageCompression = (await import("browser-image-compression")).default;

  const blob = await fetch(imageDataUrl).then((res) => res.blob());
  const minSizeMB = 0.01; // allow very small compressed sizes
  const calculatedSizeMB =
    (blob.size / 1024 / 1024) * (compressionPercentage / 100);
  const options = {
    maxSizeMB: Math.max(calculatedSizeMB, minSizeMB),
    useWebWorker: true,
  };
  const file = new File([blob], "image.jpg", { type: blob.type });
  const compressedBlob = await imageCompression(file, options);
  const compressedDataUrl =
    await imageCompression.getDataUrlFromFile(compressedBlob);
  const size = compressedBlob.size;
  return { dataUrl: compressedDataUrl, size };
}
