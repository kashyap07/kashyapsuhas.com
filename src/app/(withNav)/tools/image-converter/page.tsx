"use client";

import { useEffect, useState } from "react";

import ImageAutoHeight from "@/components/ImageAutoHeight";
import { Wrapper } from "@/components/Wrapper";

const outputFormats = [
  { label: "JPEG", value: "image/jpeg", ext: "jpg" },
  { label: "PNG", value: "image/png", ext: "png" },
  { label: "WebP", value: "image/webp", ext: "webp" },
];

export default function ImageConverter() {
  const [image, setImage] = useState<File | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState(outputFormats[0]);
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      setFileName(file.name.replace(/\.[^.]+$/, ""));
      setConvertedUrl(null);
      setError(null);
    }
  };

  const handleFormatChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const format = outputFormats.find((f) => f.value === event.target.value);
    if (format) setOutputFormat(format);
  };

  const handleConvert = async () => {
    if (!image) return;
    setError(null);
    try {
      if (
        image.type === "image/heic" ||
        image.name.toLowerCase().endsWith(".heic")
      ) {
        // Use window.heic2any from CDN
        // @ts-ignore
        const heic2any = window.heic2any;
        if (!heic2any) {
          setError("heic2any not loaded");
          return;
        }
        try {
          const result = await heic2any({
            blob: image,
            toType: outputFormat.value,
            quality: 0.92,
          });
          const blob = Array.isArray(result) ? result[0] : result;
          setConvertedUrl(URL.createObjectURL(blob));
        } catch (e: any) {
          setError(
            "This HEIC file could not be converted. Try a different photo, preferably a standard iPhone photo (not a Live Photo or edited image).",
          );
        }
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new window.Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(img, 0, 0);
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  setConvertedUrl(URL.createObjectURL(blob));
                } else {
                  setError("Conversion failed.");
                }
              },
              outputFormat.value,
              0.92,
            );
          };
          img.onerror = () => setError("Failed to load image for conversion.");
          if (typeof reader.result === "string") {
            img.src = reader.result;
          }
        };
        reader.onerror = () => setError("Failed to read image file.");
        reader.readAsDataURL(image);
      }
    } catch (e: any) {
      setError("Conversion failed: " + (e?.message || e));
    }
  };

  if (!isClient) return null;

  return (
    <Wrapper className="mb-12 w-full md:mb-20">
      <h1 className="text-5xl font-medium md:text-8xl">Image Converter</h1>
      <div className="mt-2 flex flex-col gap-6">
        <input
          type="file"
          accept="image/*,.heic"
          onChange={handleImageUpload}
          className="file:mr-4 file:rounded file:border-0 file:px-4 file:py-2 file:text-black hover:file:bg-columbiaYellow"
        />
        <div className="flex flex-col items-center gap-4 md:flex-row">
          <label className="text-lg font-medium text-gray-500">
            Output Format:
            <select
              className="ml-2 rounded border px-2 py-1"
              value={outputFormat.value}
              onChange={handleFormatChange}
            >
              {outputFormats.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <button
            className="rounded bg-columbiaYellow px-4 py-2 font-medium text-black transition-all duration-100 ease-in-out hover:text-black hover:no-underline hover:shadow-md"
            onClick={handleConvert}
            disabled={!image}
          >
            Convert
          </button>
        </div>
        {error && <div className="text-red-600">{error}</div>}
        {convertedUrl && (
          <div className="mt-8 flex flex-col gap-8 md:flex-row md:justify-between">
            <div className="relative w-full max-w-lg">
              <div className="macos-shadow relative h-full w-full overflow-hidden rounded-sm">
                <ImageAutoHeight
                  src={convertedUrl}
                  alt="Converted"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
            <div className="flex w-full flex-col items-center justify-center md:w-2/5">
              <a
                href={convertedUrl}
                download={`${fileName || "converted-image"}.${outputFormat.ext}`}
                className="mt-4 flex w-full items-center justify-center rounded bg-columbiaYellow py-2 font-medium text-black transition-all duration-100 ease-in-out hover:text-black hover:no-underline hover:shadow-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="mr-2 h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16.5v-13m0 13l-3.75-3.75M12 16.5l3.75-3.75M4.5 19.5h15"
                  />
                </svg>
                Download Converted Image
              </a>
            </div>
          </div>
        )}
      </div>
    </Wrapper>
  );
}
