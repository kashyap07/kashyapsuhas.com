import Image from "next/image";

import OpenLightboxButton from "./OpenLightboxButton";
import { findPhoto, thumbSrc } from "./manifest";
import type { Photo } from "./types";

type Variant = "full" | "grid";

export interface TripPhotoProps {
  src: string;
  caption?: string;
  alt?: string;
  variant?: Variant; // injected by <PhotoGrid> via cloneElement; authors don't set this
}

function NotFound({ src }: { src: string }) {
  return (
    <span className="my-4 block rounded border border-line bg-surface-subtle p-4 font-sans text-sm text-danger">
      photo not found in manifest: <code>{src}</code>. run{" "}
      <code>npm run process-trip-photos</code>.
    </span>
  );
}

// images are pre-sized by the process script (1600px full, 720px thumb) and
// served as-is (`unoptimized`) so a ~400 photo post doesn't eat the vercel
// image optimization quota.
export default function TripPhoto({
  photos,
  src,
  caption,
  alt,
  variant = "full",
}: TripPhotoProps & { photos: Photo[] }) {
  const photo = findPhoto(photos, src);
  if (!photo) return <NotFound src={src} />;

  const lightboxData = {
    src: photo.src,
    caption,
    takenAt: photo.takenAt ?? undefined,
    width: photo.width,
    height: photo.height,
  };

  if (variant === "grid") {
    return (
      <figure className="not-prose m-0 flex flex-col gap-1">
        <OpenLightboxButton
          photo={lightboxData}
          className="relative block aspect-square w-full overflow-hidden rounded transition-opacity hocus:opacity-90"
        >
          <Image
            src={thumbSrc(photo.src)}
            alt={alt ?? caption ?? ""}
            fill
            unoptimized
            className="object-cover"
          />
        </OpenLightboxButton>
        {caption && (
          <figcaption className="font-sans text-xs text-muted">
            {caption}
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    <figure className="my-8 flex flex-col items-center gap-2">
      <OpenLightboxButton
        photo={lightboxData}
        className="block transition-opacity hocus:opacity-90"
      >
        <Image
          src={photo.src}
          width={photo.width}
          height={photo.height}
          alt={alt ?? caption ?? ""}
          unoptimized
          className="rounded-lg shadow-macos"
        />
      </OpenLightboxButton>
      {caption && (
        <figcaption className="text-center font-sans text-sm text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
