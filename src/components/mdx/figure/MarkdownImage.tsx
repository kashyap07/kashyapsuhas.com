import { Figure } from "./Figure";

type Props = {
  src?: string;
  alt?: string;
  title?: string;
  "data-figure"?: string;
};

// plain markdown `![alt](src "caption")`. remarkFigureImages flags images
// that sit alone in their paragraph; those become a full Figure with the
// title as caption. anything still inline (an image inside a link, mid
// sentence) stays a plain inline img, a <figure> can't live inside a <p>.
export function MarkdownImage({ src, alt, title, ...rest }: Props) {
  if (!src) return null;
  if (rest["data-figure"] !== undefined) {
    return <Figure src={src} alt={alt ?? ""} caption={title} />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt ?? ""} title={title} className="inline" />;
}
