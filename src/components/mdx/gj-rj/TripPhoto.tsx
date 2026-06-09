import Image from "next/image";

import OpenLightboxButton from "./OpenLightboxButton";
import photos from "./photos.json";
import type { Photo } from "./types";

const BY_NAME = new Map<string, Photo>();
for (const p of photos as Photo[]) {
  BY_NAME.set(p.src, p);
  const name = p.src.split("/").pop();
  if (name) BY_NAME.set(name, p);
}

type Variant = "full" | "grid";

interface Props {
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

export default function TripPhoto({
  src,
  caption,
  alt,
  variant = "full",
}: Props) {
  const photo = BY_NAME.get(src);
  if (!photo) return <NotFound src={src} />;

  if (variant === "grid") {
    return (
      <figure className="not-prose m-0 flex flex-col gap-1">
        <OpenLightboxButton
          src={photo.src}
          className="relative block aspect-square w-full overflow-hidden rounded transition-opacity hocus:opacity-90"
        >
          <Image
            src={photo.src}
            alt={alt ?? caption ?? ""}
            fill
            sizes="(min-width: 768px) 220px, 50vw"
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
        src={photo.src}
        className="block transition-opacity hocus:opacity-90"
      >
        <Image
          src={photo.src}
          width={photo.width}
          height={photo.height}
          alt={alt ?? caption ?? ""}
          sizes="(min-width: 768px) 672px, 100vw"
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
