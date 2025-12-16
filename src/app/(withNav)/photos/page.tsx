"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { ImageAutoHeight, Wrapper } from "@components/ui";
import Dialog from "@components/ui/Dialog";

import galleryImages, { GalleryImage } from "./galleryImages";

function Photos() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openImage = (index: number) => {
    setSelectedIndex(index);
    setIsOpen(true);
  };

  const closeImage = () => {
    setIsOpen(false);
    setSelectedIndex(null);
  };

  const goToNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % galleryImages.length);
  }, [selectedIndex]);

  const goToPrevious = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex(
      (selectedIndex - 1 + galleryImages.length) % galleryImages.length,
    );
  }, [selectedIndex]);

  // keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === "Escape") {
        e.preventDefault();
        closeImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, goToNext, goToPrevious]);

  const selectedImage =
    selectedIndex !== null ? galleryImages[selectedIndex] : null;

  return (
    <>
      <Wrapper className="mb-12 flex w-full flex-col items-center justify-center gap-4 md:mb-20">
        <div className="columns-1 gap-4 sm:columns-2 xl:columns-3">
          {galleryImages.map(({ src, title }, idx) => (
            <div
              key={idx}
              className="group relative mb-4 cursor-pointer overflow-hidden rounded-lg transition-all hover:shadow-xl"
              onClick={() => openImage(idx)}
            >
              <Image
                alt={title}
                src={src}
                width={720}
                height={480}
                sizes="(max-width: 640px) 100vw,
                    (max-width: 1280px) 50vw,
                    (max-width: 1536px) 33vw,
                    25vw"
                className="transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black opacity-0 transition-opacity duration-300 group-hover:opacity-30" />
              <div className="absolute bottom-0 left-0 right-0 translate-y-full bg-gradient-to-t from-black/80 to-transparent p-4 transition-transform duration-300 group-hover:translate-y-0">
                <p className="text-sm font-medium text-white">{title}</p>
              </div>
            </div>
          ))}
        </div>
      </Wrapper>

      {/* enhanced lightbox dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Content
          className="max-w-[95vw] border-none bg-transparent p-0 shadow-none sm:max-w-[90vw]"
          showCloseButton={false}
        >
          {selectedImage && (
            <div className="relative flex flex-col items-center gap-4">
              {/* image container */}
              <div className="relative h-[70vh] w-full">
                <ImageAutoHeight
                  src={selectedImage.src}
                  alt={selectedImage.title || "selected image"}
                  className="h-full max-h-full w-full max-w-full contain-strict"
                  imageClassName="!absolute rounded-lg shadow-2xl"
                />

                {/* navigation buttons */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevious();
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white backdrop-blur-sm transition-all hover:bg-black/70 md:left-4 md:p-4"
                  aria-label="Previous image"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white backdrop-blur-sm transition-all hover:bg-black/70 md:right-4 md:p-4"
                  aria-label="Next image"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                {/* close button */}
                <button
                  onClick={closeImage}
                  className="absolute right-2 top-2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/70 md:right-4 md:top-4 md:p-3"
                  aria-label="Close"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* image info */}
              <div className="flex w-full items-center justify-between rounded-lg bg-black/50 px-6 py-4 text-white backdrop-blur-md">
                <div>
                  <h3 className="text-xl font-semibold md:text-2xl">
                    {selectedImage.title}
                  </h3>
                  <p className="text-sm text-gray-300">
                    {selectedIndex !== null && selectedIndex + 1} of{" "}
                    {galleryImages.length}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="rounded bg-white/10 px-3 py-1 text-sm">
                    Use ← → to navigate
                  </span>
                </div>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog>
    </>
  );
}

export default Photos;
