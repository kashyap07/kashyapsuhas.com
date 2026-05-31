import { ImageAutoHeight } from "@components/ui";

interface ImageMDXProps {
  src: string;
  alt?: string;
  mdHalfWidth?: boolean;
}

// wrapper around ImageAutoHeight for MDX usage
// convert pure markdown image to use nextjs Image.
// alt: caller must pass a string. empty string is allowed (decorative).
// in dev we warn when alt is undefined to surface missing alt text in mdx.
export function ImageMDX({ src, alt, mdHalfWidth = false }: ImageMDXProps) {
  if (!src) return null;
  if (process.env.NODE_ENV !== "production" && alt === undefined) {
    // eslint-disable-next-line no-console
    console.warn(`[ImageMDX] missing alt for src="${src}". use alt="" if decorative.`);
  }
  return (
    <ImageAutoHeight mdHalfWidth={mdHalfWidth} src={src} alt={alt ?? ""} />
  );
}
