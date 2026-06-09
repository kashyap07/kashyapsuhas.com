"use client";

import { ReactNode } from "react";

// thin client wrapper so server-rendered TripPhoto can still trigger the
// lightbox without paying the cost of becoming a client component itself.
export default function OpenLightboxButton({
  src,
  children,
  className,
}: {
  src: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        window.dispatchEvent(
          new CustomEvent("trip-lightbox-open", { detail: { src } }),
        )
      }
      className={className}
    >
      {children}
    </button>
  );
}
