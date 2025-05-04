"use client";

import { useState, useEffect, useMemo } from "react";
import { Wrapper } from "@/components/Wrapper";
import { compressImage } from "@/app/(withNav)/tools/image-compressor/compressImage";
import ImageAutoHeight from "@/components/ImageAutoHeight";

export default function ImageCompressor() {
  const [image, setImage] = useState<File | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [compressionPercentage, setCompressionPercentage] = useState(100);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [comparisonSliderPosition, setComparisonSliderPosition] = useState(50);

  // Update the logic to display the original image without compression upon upload.
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      setOriginalSize(file.size);
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result && typeof reader.result === "string") {
          setCompressedImage(reader.result); // Display the original image as-is
          setCompressedSize(file.size); // Set the compressed size to the original size initially
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Update the compression logic to only apply when the slider is adjusted below 100%.
  const handleCompressionSliderChange = async (value: number) => {
    setCompressionPercentage(value);
    if (image && value < 100) {
      const reader = new FileReader();
      reader.onload = async () => {
        if (reader.result && typeof reader.result === "string") {
          const compressed = await compressImage(reader.result, value);
          setCompressedImage(compressed.dataUrl);
          setCompressedSize(compressed.size);
        }
      };
      reader.readAsDataURL(image);
    } else if (image && value === 100) {
      // Reset to original image when slider is at 100%
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result && typeof reader.result === "string") {
          setCompressedImage(reader.result);
          setCompressedSize(originalSize);
        }
      };
      reader.readAsDataURL(image);
    }
  };

  // Memoize the original image to prevent unnecessary re-renders.
  const originalImageSrc = useMemo(() => {
    return image ? URL.createObjectURL(image) : "";
  }, [image]);

  return (
    <Wrapper className="mb-12 w-full md:mb-20">
      <h1 className="text-5xl font-medium md:text-8xl">Image Compressor</h1>
      <div className="mt-2 flex flex-col gap-6">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="file:mr-4 file:rounded file:border-0 file:px-4 file:py-2 file:text-black hover:file:bg-columbiaYellow"
        />
        {compressedImage && (
          <div className="mt-8 flex flex-col gap-8 md:flex-row md:justify-between">
            {/* left section */}
            {/* image + comparison slider */}
            <div className="relative w-full max-w-lg">
              <div className="macos-shadow relative h-full w-full overflow-hidden rounded-sm">
                <ImageAutoHeight
                  src={compressedImage}
                  alt="Compressed"
                  className="h-full w-full object-contain"
                />
                <div
                  className="absolute left-0 top-0 h-full w-full overflow-hidden"
                  style={{
                    clipPath: `inset(0 ${100 - comparisonSliderPosition}% 0 0)`,
                  }}
                >
                  <ImageAutoHeight
                    src={originalImageSrc}
                    alt="Original"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div
                  className="absolute left-0 top-0 z-10 h-full w-1 bg-gray-800"
                  style={{ left: `${comparisonSliderPosition}%` }}
                ></div>
                <input
                  type="range"
                  value={comparisonSliderPosition}
                  onChange={(e) =>
                    setComparisonSliderPosition(Number(e.target.value))
                  }
                  min="0"
                  max="100"
                  className="absolute left-0 top-0 z-20 h-full w-full cursor-pointer opacity-0"
                  style={{ appearance: "none" }}
                />
              </div>
            </div>

            {/* right section */}
            {/* file info, slider, download */}
            <div className="w-full md:w-2/5">
              <label className="block text-lg font-medium text-gray-500">
                Compression
                <input
                  type="range"
                  value={compressionPercentage}
                  onChange={(e) =>
                    handleCompressionSliderChange(Number(e.target.value))
                  }
                  min="1"
                  max="100"
                  className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-[#F2F2F2]"
                />
                <span className="mt-1 block text-center text-xl font-semibold text-black">
                  {compressionPercentage}%
                </span>
              </label>
              <div className="mt-4 flex flex-col gap-0 text-center">
                <span className="flex justify-between text-gray-600">
                  <span>Original:</span>
                  <span>
                    {originalSize ? (originalSize / 1024).toFixed(2) : "-"} KB
                  </span>
                </span>
                <span className="flex justify-between text-gray-600">
                  <span>Compressed:</span>
                  <span>
                    {" "}
                    {compressedSize
                      ? (compressedSize / 1024).toFixed(2)
                      : "-"}{" "}
                    KB
                  </span>
                </span>
              </div>
              <a
                href={compressedImage}
                download="compressed-image.jpg"
                className="mt-4 flex items-center justify-center rounded bg-columbiaYellow py-2 font-medium text-black transition-all duration-100 ease-in-out hover:text-black hover:no-underline hover:shadow-md"
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
                Download Compressed Image
              </a>
            </div>
          </div>
        )}
      </div>
    </Wrapper>
  );
}
