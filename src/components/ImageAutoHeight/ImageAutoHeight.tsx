import cn from "@/utils/cn";
import Image, { ImageProps } from "next/image";

type ImageAutoHeightProps = ImageProps & {
  src: string;
  alt: string;
  width?: string;
  className?: string;
};

/**
 * next/image component but with pre built parent wrapper that
 * makes it take max width and auto set height
 *
 * This is normally not possible, as you need to know the image size
 * before you can render it (or set layout fill and ruin image proportions)
 * or set object fit to cover and get empty space above and below the image
 *
 * This component is a workaround for that.
 *
 * @see https://github.com/vercel/next.js/discussions/18739#discussioncomment-344932 reference
 *
 * @param src - imge source
 * @param alt - image alt
 * @param width - image width
 * @param className - extra classes to be added
 * @returns next/image Component with auto height
 */
const ImageAutoHeight = ({
  src,
  alt,
  width: parentWidth,
  className,
  ...rest
}: ImageAutoHeightProps) => {
  return (
    <div
      className={cn(
        "children:!position-unset grid self-center justify-self-center",
        className,
      )}
      style={{
        width: parentWidth ? parentWidth : "100%",
      }}
    >
      <Image
        src={src}
        alt={alt}
        layout="fill"
        {...rest}
        className="!h-unset !relative !w-full !object-contain"
      />
    </div>
  );
};

export default ImageAutoHeight;
