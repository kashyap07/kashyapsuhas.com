import { imageSize } from "image-size";
import { readFileSync } from "node:fs";
import path from "node:path";

export type Dims = { width: number; height: number };

const cache = new Map<string, Dims | null>();

// intrinsic size of a /public image, read at build time (posts are
// force-static). gives next/image real width/height so the box is reserved
// before load, no fill + css override hack. null for remote or missing files.
export function getImageDims(src: string): Dims | null {
  if (!src.startsWith("/")) return null;
  if (cache.has(src)) return cache.get(src)!;

  let dims: Dims | null = null;
  try {
    const file = path.join(process.cwd(), "public", decodeURI(src));
    const { width, height, orientation } = imageSize(readFileSync(file));
    if (width && height) {
      // exif 5-8 means the camera stored it rotated 90deg. the optimizer
      // auto-rotates, so the displayed box is the swapped one.
      const rotated = orientation !== undefined && orientation >= 5;
      dims = rotated ? { width: height, height: width } : { width, height };
    }
  } catch {
    dims = null;
  }
  cache.set(src, dims);
  return dims;
}

// next's optimizer url for a public image. the lightbox shows images
// unoptimized, and some originals are 3MB+ phone jpegs. 1920 is in the
// default deviceSizes and 75 is in next.config's qualities, so this is a
// url next would generate itself.
export function optimizedSrc(src: string, width = 1920): string {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`;
}
