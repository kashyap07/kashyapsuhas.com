import imageCompression from "browser-image-compression";

/**
 * Compresses an image using browser-image-compression.
 * @param {string} imageDataUrl - The image data URL.
 * @param {number} compressionPercentage - The compression percentage (1-100).
 * @returns {Promise<{ dataUrl: string, size: number }>} - The compressed image data URL and size.
 */
export async function compressImage(
  imageDataUrl: string,
  compressionPercentage: number,
) {
  const blob = await fetch(imageDataUrl).then((res) => res.blob());
  const options = {
    maxSizeMB: (blob.size / 1024 / 1024) * (compressionPercentage / 100),
    useWebWorker: true,
  };
  const file = new File([blob], "image.jpg", { type: blob.type });
  const compressedBlob = await imageCompression(file, options);
  const compressedDataUrl =
    await imageCompression.getDataUrlFromFile(compressedBlob);
  const size = compressedBlob.size;
  return { dataUrl: compressedDataUrl, size };
}
