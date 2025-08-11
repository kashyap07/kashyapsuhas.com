import Image, { ImageProps } from "next/image";

import cn from "@utils/cn";

type ImageAutoHeightProps = ImageProps & {
  src: string;
  alt: string;
  mdHalfWidth?: boolean; // poor design lol. but this is for blog post half width
  className?: string;
  imageClassName?: string;
};

/**
 * next/image component but with pre built parent wrapper that
 * makes it take max width and auto set height
 *
 * this is normally not possible, as you need to know the image size
 * before you can render it (or set layout fill and ruin image proportions)
 * or set object fit to cover and get empty space above and below the image
 *
 * this component is a workaround for that.
 *
 * @see https://github.com/vercel/next.js/discussions/18739#discussioncomment-344932 reference
 */
const ImageAutoHeight = ({
  src,
  alt,
  mdHalfWidth,
  className,
  imageClassName,
  ...rest
}: ImageAutoHeightProps) => {
  return (
    <div
      className={cn(
        "css-ImageAutoHeight children:!position-unset grid self-center justify-self-center",
        mdHalfWidth && "md:w-1/2",
        className,
      )}
      data-component="ImageAutoHeight"
    >
      <Image
        src={src}
        alt={alt}
        layout="fill"
        {...rest}
        className={cn(
          "!h-unset !relative !w-full !object-contain",
          imageClassName,
        )}
      />
    </div>
  );
};

export default ImageAutoHeight;
