import Image from "next/image";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import { Children, cloneElement, isValidElement } from "react";

import cn from "@utils/cn";

import OpenLightboxButton from "../trip/OpenLightboxButton";
import { getImageDims, optimizedSrc } from "./dimensions";

export type FigureSize = "full" | "half" | "wide";

export interface FigureProps {
  src: string;
  alt?: string;
  // plain text caption. for links / emphasis, pass children instead.
  caption?: string;
  size?: FigureSize;
  children?: ReactNode;
  // injected by <Figures>; authors don't set this
  cols?: number;
}

// prose column is max-w-2xl (672px), the post wrapper is max-w-4xl (896px).
// wide bleeds out to the wrapper, same width as the hero card. md is a step
// smaller because at 768-1023 the wrapper is just the viewport.
const sizeClass: Record<FigureSize, string> = {
  full: "w-full",
  half: "mx-auto w-full md:w-1/2",
  wide: "md:-mx-12 lg:-mx-28",
};

const sizeHint: Record<FigureSize, string> = {
  full: "(max-width: 768px) 100vw, 672px",
  half: "(max-width: 768px) 100vw, 336px",
  wide: "(max-width: 768px) 100vw, 896px",
};

function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement(node)) {
    return textOf((node.props as { children?: ReactNode }).children);
  }
  return "";
}

function NotFound({ src }: { src: string }) {
  return (
    <span className="my-4 block rounded border border-line bg-surface-subtle p-4 font-sans text-sm text-danger">
      image not found in /public: <code>{src}</code>
    </span>
  );
}

export function Figure({
  src,
  alt,
  caption,
  size = "full",
  children,
  cols,
}: FigureProps) {
  if (!src) return null;
  if (process.env.NODE_ENV !== "production" && alt === undefined) {
    console.warn(
      `[Figure] missing alt for src="${src}". use alt="" if decorative.`,
    );
  }

  const captionNode = children ?? caption;
  const hasCaption = captionNode != null && captionNode !== "";
  const inRow = cols !== undefined;

  // remote image: next/image has no remotePatterns configured, so plain img
  if (!src.startsWith("/")) {
    return (
      <figure className={cn("my-8 flex flex-col gap-2", sizeClass[size])}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt ?? ""} className="h-auto w-full" />
        {hasCaption && <Caption>{captionNode}</Caption>}
      </figure>
    );
  }

  const dims = getImageDims(src);
  if (!dims) return <NotFound src={src} />;

  const sizes = inRow
    ? `(max-width: 640px) 100vw, ${Math.round(896 / cols)}px`
    : sizeHint[size];

  return (
    <figure
      className={cn(
        "flex flex-col gap-2",
        inRow ? "m-0" : ["my-8", sizeClass[size]],
      )}
    >
      <OpenLightboxButton
        photo={{
          src: optimizedSrc(src),
          caption: textOf(captionNode) || alt,
          width: dims.width,
          height: dims.height,
        }}
        className="block w-full cursor-zoom-in"
      >
        <Image
          src={src}
          alt={alt ?? ""}
          width={dims.width}
          height={dims.height}
          sizes={sizes}
          className="h-auto w-full rounded-lg shadow-macos"
        />
      </OpenLightboxButton>
      {hasCaption && <Caption>{captionNode}</Caption>}
    </figure>
  );
}

function Caption({ children }: { children: ReactNode }) {
  // children captions written on their own lines come wrapped in <p>
  return (
    <figcaption className="m-0 text-center font-sans text-sm text-muted [&>p]:m-0">
      {children}
    </figcaption>
  );
}

export interface FiguresProps {
  children: ReactNode;
  caption?: string;
  size?: "full" | "wide";
}

// a row of figures. stacks on phones, side by side from sm up.
export function Figures({ children, caption, size = "full" }: FiguresProps) {
  const items = Children.toArray(children).filter(isValidElement);
  const cols = items.length || 1;

  return (
    <figure className={cn("my-8 flex flex-col gap-2", sizeClass[size])}>
      <div
        className="grid grid-cols-1 items-start gap-4 sm:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]"
        style={{ "--cols": cols } as CSSProperties}
      >
        {items.map((child) =>
          cloneElement(child as ReactElement<FigureProps>, { cols }),
        )}
      </div>
      {caption && <Caption>{caption}</Caption>}
    </figure>
  );
}
