// shared kit for og images: tokens, the card frame, and a renderer that
// harvests text from the element tree so nobody hand-maintains font subset
// strings. script shaping helpers live in ogText and are re-exported here.

import { ImageResponse } from "next/og";
import type { ReactElement, ReactNode } from "react";

import { FRAUNCES, loadGoogleFont } from "./ogText";

export { ShapedTitle, hasComplexScript, shapeWords } from "./ogText";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// satori can't read css vars, these mirror globals.css tokens
export const ACCENT = "#f0a044";
export const FOREGROUND = "#1e293b";
export const MUTED = "#64748b";
export const SUBTLE = "#94a3b8";
export const SUCCESS = "#16a34a";
export const DANGER = "#dc2626";

// walk the tree collecting every string that satori will render as text.
// function components (OgFrame, ShapedTitle) are expanded the same way
// satori expands them, so text they render from props is harvested too.
// shaped words are <img> nodes so they naturally stay out of the subset.
function collectText(node: unknown): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(collectText).join(" ");
  if (node && typeof node === "object" && "type" in node && "props" in node) {
    const el = node as { type: unknown; props: { children?: unknown } };
    if (typeof el.type === "function") {
      return collectText((el.type as (props: unknown) => unknown)(el.props));
    }
    return collectText(el.props.children);
  }
  return "";
}

// render a finished tree. fraunces is fetched subsetted to exactly the
// characters in the tree; on fetch failure satori falls back to its default.
export async function ogImage(node: ReactElement, extraText = "") {
  const chars = Array.from(new Set(collectText(node) + extraText + " ")).join(
    "",
  );
  const fraunces = await loadGoogleFont(FRAUNCES, chars);
  return new ImageResponse(node, {
    ...size,
    fonts: fraunces
      ? [{ name: "Fraunces", data: fraunces, style: "normal", weight: 600 }]
      : undefined,
  });
}

// the standard card: header row, content, footer. path fills the header's
// right label and the default footer url; pass footer to replace it.
export function OgFrame({
  path,
  background = "#fff",
  footer,
  children,
}: {
  path?: string;
  background?: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background,
        color: FOREGROUND,
        padding: 64,
        fontFamily: "Fraunces",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ color: ACCENT, fontSize: 32 }}>Suhas Kashyap</div>
        {path && (
          <div style={{ color: MUTED, fontSize: 24 }}>
            {path.split("/").join(" / ")}
          </div>
        )}
      </div>

      {children}

      {footer ??
        (path && (
          <div style={{ display: "flex", color: MUTED, fontSize: 24 }}>
            {`kashyapsuhas.com/${path}`}
          </div>
        ))}
    </div>
  );
}
