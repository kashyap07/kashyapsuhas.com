"use client";

import { useState } from "react";

import Image from "next/image";

import ImageAutoHeight from "@/components/ImageAutoHeight";
import { Wrapper } from "@/components/Wrapper";

import galleryImages, { GalleryImage } from "./galleryImages";

// maybe in the future: https://vercel.com/blog/building-a-fast-animated-image-gallery-with-next-js

function Photos() {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const openImage = (src: GalleryImage) => setSelectedImage(src);
  const closeImage = () => setSelectedImage(null);

  return (
    <>
      <Wrapper className="mb-12 flex w-full flex-col items-center justify-center gap-4 md:mb-20">
        <div className="columns-1 gap-4 sm:columns-2 xl:columns-3">
          {galleryImages.map(({ src, title }, idx) => (
            <Image
              key={idx}
              alt={title}
              src={src}
              width={720}
              height={480}
              sizes="(max-width: 640px) 100vw,
                  (max-width: 1280px) 50vw,
                  (max-width: 1536px) 33vw,
                  25vw"
              className="mb-4 cursor-pointer"
              onClick={() => openImage({ src, title })}
            />
          ))}
        </div>
      </Wrapper>

      {/* this should be a path maybe */}
      {selectedImage && (
        <Wrapper
          maxWidth="FULL_WIDTH"
          data-locator-id="photos-selected-image-wrapper"
        >
          <div
            className="fixed left-0 top-0 z-50 flex h-full w-full cursor-pointer flex-col items-center justify-center gap-4 bg-black bg-opacity-50 px-4 py-32 pt-24 backdrop-blur-xl md:gap-8"
            onClick={closeImage}
          >
            <ImageAutoHeight
              src={selectedImage.src}
              alt={selectedImage.title || "selected image"}
              className="h-full max-h-full w-full max-w-full contain-strict"
              imageClassName="!absolute"
            />

            <div
              className="mx-auto mb-0 text-center"
              data-locator-id="photos-selected-title-text"
            >
              <span className="text-3xl text-white">{selectedImage.title}</span>
            </div>
          </div>
        </Wrapper>
      )}
    </>
  );
}

export default Photos;
