"use client";

import { ReactNode } from "react";

export interface LightboxPhotoData {
  src: string;
  caption?: string;
  takenAt?: string;
  width: number;
  height: number;
}

// thin client wrapper so server-rendered TripPhoto can trigger the lightbox
// without becoming a client component. everything the lightbox needs to show
// rides along as data attributes; the lightbox walks [data-lightbox] buttons
// in document order, so the gallery is exactly the photos in the post.
export default function OpenLightboxButton({
  photo,
  children,
  className,
}: {
  photo: LightboxPhotoData;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      data-lightbox
      data-lightbox-src={photo.src}
      data-lightbox-caption={photo.caption}
      data-lightbox-taken={photo.takenAt}
      data-lightbox-w={photo.width}
      data-lightbox-h={photo.height}
      onClick={(e) =>
        window.dispatchEvent(
          new CustomEvent("trip-lightbox-open", {
            detail: { el: e.currentTarget },
          }),
        )
      }
      className={className}
    >
      {children}
    </button>
  );
}
