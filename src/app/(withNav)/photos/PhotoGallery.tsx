"use client";

import { ReactNode, createContext, useContext, useState } from "react";

import { ImageAutoHeight, Wrapper } from "@components/ui";

import { GalleryImage } from "./galleryImages";

// context for managing modal state across gallery
const GalleryContext = createContext<{
  selectedImage: GalleryImage | null;
  openImage: (image: GalleryImage) => void;
  closeImage: () => void;
} | null>(null);

function useGalleryContext() {
  const context = useContext(GalleryContext);
  if (!context) {
    throw new Error("useGalleryContext must be used within GalleryProvider");
  }
  return context;
}

// provider to wrap the entire gallery
export function GalleryProvider({ children }: { children: ReactNode }) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const openImage = (image: GalleryImage) => setSelectedImage(image);
  const closeImage = () => setSelectedImage(null);

  return (
    <GalleryContext.Provider value={{ selectedImage, openImage, closeImage }}>
      {children}
      <ImageModal />
    </GalleryContext.Provider>
  );
}

// lightweight wrapper for each image that adds click handler
export function GalleryImageWrapper({
  src,
  title,
  children,
}: {
  src: string;
  title: string;
  children: ReactNode;
}) {
  const { openImage } = useGalleryContext();

  return <div onClick={() => openImage({ src, title })}>{children}</div>;
}

// modal component for displaying selected image
function ImageModal() {
  const { selectedImage, closeImage } = useGalleryContext();

  if (!selectedImage) return null;

  return (
    <Wrapper
      maxWidth="FULL_WIDTH"
      data-locator-id="photos-selected-image-wrapper"
    >
      <div
        className="fixed left-0 top-0 z-50 flex h-full w-full cursor-pointer flex-col items-center justify-center gap-4 bg-black bg-opacity-50 px-4 py-24 backdrop-blur-xl md:gap-8"
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
  );
}
