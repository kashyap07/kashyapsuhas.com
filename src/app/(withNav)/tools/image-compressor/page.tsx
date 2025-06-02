"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
  const [isCompressing, setIsCompressing] = useState(false);
  // Debounce timer ref
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Update the logic to display the original image without compression upon upload.
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      setOriginalSize(file.size);
      setCompressionPercentage(100);
      setComparisonSliderPosition(50);
      setCompressedSize(file.size);
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result && typeof reader.result === "string") {
          setCompressedImage(reader.result); // Display the original image as-is
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Update the compression logic to only apply when the slider is adjusted below 100%.
  const handleCompressionSliderChange = (value: number) => {
    setCompressionPercentage(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      compressImageDebounced(value);
    }, 350); // 350ms debounce
  };

  const MIN_TIME = 600;

  // Debounced compression logic
  const compressImageDebounced = async (value: number) => {
    if (image && value < 100) {
      setIsCompressing(true);
      const start = Date.now();
      const reader = new FileReader();
      reader.onload = async () => {
        if (reader.result && typeof reader.result === "string") {
          const compressed = await compressImage(reader.result, value);
          setCompressedImage(compressed.dataUrl);
          setCompressedSize(compressed.size);
          const elapsed = Date.now() - start;
          if (elapsed < MIN_TIME) {
            setTimeout(() => setIsCompressing(false), MIN_TIME - elapsed);
          } else {
            setIsCompressing(false);
          }
        }
      };
      reader.readAsDataURL(image);
    } else if (image && value === 100) {
      setIsCompressing(true);
      const start = Date.now();
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result && typeof reader.result === "string") {
          setCompressedImage(reader.result);
          setCompressedSize(originalSize);
          const elapsed = Date.now() - start;
          if (elapsed < MIN_TIME) {
            setTimeout(() => setIsCompressing(false), MIN_TIME - elapsed);
          } else {
            setIsCompressing(false);
          }
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
          disabled={isCompressing}
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
                  style={{ clipPath: `inset(0 ${100 - comparisonSliderPosition}% 0 0)` }}
                >
                  <ImageAutoHeight
                    src={originalImageSrc}
                    alt="Original"
                    className="h-full w-full object-contain"
                  />
                </div>
                {/* Comparison slider handle and labels (reverted labels and line, keep improved handle) */}
                <div className="absolute left-0 top-0 z-20 flex h-full w-full pointer-events-none">
                  <span className="absolute left-2 top-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">BEFORE</span>
                  <span className="absolute right-2 top-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">AFTER</span>
                  {/* Simple gray dividing line */}
                  <div
                    className="absolute left-0 top-0 z-10 h-full w-1 bg-gray-800 cursor-grab"
                    style={{ left: `${comparisonSliderPosition}%` }}
                  ></div>
                  {/* Improved custom slider handle */}
                  <div
                    className="absolute z-30 flex flex-col items-center justify-center"
                    style={{ left: `${comparisonSliderPosition}%`, top: '50%', transform: 'translate(-50%, -50%)' }}
                  >
                    <div className="bg-columbiaYellow border-4 border-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg transition-all duration-200">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 5L3 10L7 15" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M13 5L17 10L13 15" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <input
                  type="range"
                  value={comparisonSliderPosition}
                  onChange={(e) =>
                    setComparisonSliderPosition(Number(e.target.value))
                  }
                  min="0"
                  max="100"
                  className="absolute left-0 top-0 z-40 h-full w-full cursor-pointer opacity-0"
                  style={{ appearance: "none" }}
                  disabled={isCompressing}
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
                  min="0.1"
                  max="100"
                  step="0.1"
                  className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-[#F2F2F2]"
                  disabled={isCompressing}
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
                style={{ pointerEvents: isCompressing ? 'none' : 'auto', opacity: isCompressing ? 0.5 : 1 }}
                tabIndex={isCompressing ? -1 : 0}
                aria-disabled={isCompressing}
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
      {/* Loader overlay */}
      {isCompressing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="flex flex-col items-center gap-4 p-8 bg-white rounded shadow-lg">
            <svg className="animate-spin h-10 w-10 text-columbiaYellow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <span className="text-lg font-semibold text-gray-800">Compressing...</span>
          </div>
        </div>
      )}
    </Wrapper>
  );
}
