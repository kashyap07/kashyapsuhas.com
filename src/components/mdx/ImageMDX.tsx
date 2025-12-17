import { ImageAutoHeight } from "@components/ui";

interface ImageMDXProps {
  src: string;
  alt: string;
  mdHalfWidth?: boolean;
}

// wrapper around ImageAutoHeight for MDX usage
// convert pure markdown image to use nextjs Image
export function ImageMDX({ src, alt, mdHalfWidth = false }: ImageMDXProps) {
  return <ImageAutoHeight mdHalfWidth={mdHalfWidth} src={src} alt={alt} />;
}
