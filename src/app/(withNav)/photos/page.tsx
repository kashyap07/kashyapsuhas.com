"use client";

import Image from "next/image";
import { Wrapper } from "@/components/Wrapper";
import { useState, useEffect, useCallback } from "react";
import galleryImages, { GalleryImage } from "./galleryImages";
import ImageAutoHeight from "@/components/ImageAutoHeight";
import styles from '../../photos.module.css'; // Import CSS module

// Maybe in the future: https://vercel.com/blog/building-a-fast-animated-image-gallery-with-next-js

export default function Photos() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openImage = (index: number) => setSelectedIndex(index);
  const closeImage = useCallback(() => setSelectedIndex(null), []);

  const currentImage = selectedIndex !== null ? galleryImages[selectedIndex] : null;

  const goToNextImage = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % galleryImages.length);
  }, [selectedIndex]);

  const goToPreviousImage = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex(
      (selectedIndex - 1 + galleryImages.length) % galleryImages.length
    );
  }, [selectedIndex]);

  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        goToPreviousImage();
      } else if (event.key === "ArrowRight") {
        goToNextImage();
      } else if (event.key === "Escape") {
        closeImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedIndex, goToPreviousImage, goToNextImage, closeImage]);

  return (
    <>
      <Wrapper className="mb-12 flex w-full flex-col items-center justify-center gap-4 md:mb-20">
        <div className="columns-1 gap-4 sm:columns-2 xl:columns-3">
          {galleryImages.map(({ src, title, width, height }, idx) => (
            <div
              key={idx}
              style={{ width: width, height: height }} // Inline style for dimensions only
              className={styles.skeleton_placeholder} // Use CSS module for background and margin
            >
              <Image
                alt={title}
                src={src}
                width={width} // Use dimensions from galleryImages
                height={height} // Use dimensions from galleryImages
                sizes="(max-width: 640px) 100vw,
                    (max-width: 1280px) 50vw,
                    (max-width: 1536px) 33vw,
                    25vw"
                className="cursor-pointer"
                onClick={() => openImage(idx)} // Updated to pass index
                onLoadingComplete={(img) => { if (img.parentElement) img.parentElement.style.backgroundColor = 'transparent'; }}
              />
            </div>
          ))}
        </div>
      </Wrapper>

      {selectedIndex !== null && currentImage && (
        <Wrapper
          maxWidth="FULL_WIDTH"
          data-description="photos-selected-image-wrapper"
        >
          <div
            className="fixed left-0 top-0 z-50 flex h-full w-full cursor-pointer flex-col items-center justify-center gap-4 bg-black bg-opacity-50 p-4 pt-24 backdrop-blur-xl md:gap-8 md:p-32"
            onClick={closeImage} // Clicking backdrop closes the image
          >
            <button
              onClick={(e) => { e.stopPropagation(); goToPreviousImage(); }}
              className="absolute left-4 top-1/2 z-[51] -translate-y-1/2 rounded-full bg-white p-2 text-black md:left-8" // Example styling
              aria-label="Previous image"
            >
              {/* Basic SVG for Previous - Consider replacing with a proper icon library if available */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>

            <ImageAutoHeight
              src={currentImage.src}
              alt={currentImage.title || "selected image"}
              className="max-h-full max-w-full"
              // width={currentImage.width} // Pass if ImageAutoHeight can use them for optimization
              // height={currentImage.height}
            />
            
            <button
              onClick={(e) => { e.stopPropagation(); goToNextImage(); }}
              className="absolute right-4 top-1/2 z-[51] -translate-y-1/2 rounded-full bg-white p-2 text-black md:right-8" // Example styling
              aria-label="Next image"
            >
              {/* Basic SVG for Next - Consider replacing with a proper icon library if available */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>

            <div
              className="mx-auto mb-10 text-center"
              data-description="photos-selected-title-text"
            >
              <span className="text-3xl text-white">{currentImage.title}</span>
            </div>
          </div>
        </Wrapper>
      )}
    </>
  );
}
