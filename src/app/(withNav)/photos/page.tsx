"use client";

import Image from "next/image";

import { Wrapper } from "@/components/Wrapper";
import { MaxWidth } from "@/variables/sizes";
import { useState } from "react";
import galleryImages, { GalleryImage } from "./galleryImages";
import ImageAutoHeight from "@/components/ImageAutoHeight";

// Maybe in the future: https://vercel.com/blog/building-a-fast-animated-image-gallery-with-next-js

export default function Photos() {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const openImage = (src: GalleryImage) => setSelectedImage(src);
  const closeImage = () => setSelectedImage(null);

  return (
    <>
      <Wrapper className="mb-12 md:mb-20 flex w-full flex-col items-center justify-center gap-4">
        <div className="columns-1 gap-4 sm:columns-2 xl:columns-3 ">
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
          maxWidth={MaxWidth.FullWidth}
          data-locatorID="photos-selected-image-wrapper"
        >
          <div
            className="fixed p-4 pt-24 md:p-24 z-50 top-0 left-0 w-full h-full flex flex-col gap-4 items-center justify-center bg-black bg-opacity-50 backdrop-blur-xl cursor-pointer"
            onClick={closeImage}
          >
            <ImageAutoHeight
              src={selectedImage.src}
              alt={selectedImage.title || "selected image"}
              className="max-w-full max-h-full"
            />
            
            <div
              className="mx-auto mb-10 text-center"
              data-locatorID="photos-selected-title-text"
            >
              <span className="text-3xl">{selectedImage.title}</span>
            </div>
          </div>
        </Wrapper>
      )}
    </>
  );
}
