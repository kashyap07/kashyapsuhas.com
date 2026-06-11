import { ImageResponse } from "next/og";

import { readFile } from "node:fs/promises";
import path from "node:path";

import { getBlogPosts } from "@db/blog";
import {
  FRAUNCES,
  ShapedTitle,
  hasComplexScript,
  loadGoogleFont,
  shapeWords,
} from "@utils/ogText";

export const alt = "Blog post by Suhas Kashyap";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// satori can't read css vars, mirror globals.css tokens
const ACCENT = "#f0a044";
const FOREGROUND = "#1e293b";
const MUTED = "#64748b";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

// hero lives in public/. inline as data uri so generation doesn't depend on
// the deployed site being up. external urls pass through, satori fetches them.
async function loadHero(heroImage: string): Promise<string | null> {
  if (!heroImage) return null;
  if (heroImage.startsWith("http")) return heroImage;
  try {
    const rel = decodeURIComponent(heroImage);
    const mime = MIME[path.extname(rel).toLowerCase()];
    if (!mime) return null;
    const data = await readFile(
      path.join(process.cwd(), "public", rel),
      "base64",
    );
    return `data:${mime};base64,${data}`;
  } catch {
    return null;
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // drafts included so shared preview urls still get a proper card
  const post = getBlogPosts({ includeDrafts: true }).find(
    (p) => p.slug === slug,
  );
  if (!post) return new Response("Not found", { status: 404 });

  const { title: rawTitle, publishedDateTime, heroImage } = post.metadata;
  const title = rawTitle.length > 140 ? `${rawTitle.slice(0, 137)}…` : rawTitle;
  const date = new Date(publishedDateTime).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  const hero = await loadHero(heroImage);
  const titleSize =
    (title.length > 70 ? 50 : title.length > 40 ? 58 : 68) + (hero ? 0 : 4);
  const titleColor = hero ? "#fff" : FOREGROUND;

  // indic titles get harfbuzz-shaped word images (satori can't shape them),
  // everything else renders as plain fraunces text
  const complex = hasComplexScript(title);
  const [fraunces, shapedTitle] = await Promise.all([
    loadGoogleFont(
      FRAUNCES,
      `${complex ? "" : title}Suhas Kashyap${date}kashyapsuhas.com· `,
    ),
    complex ? shapeWords(title, titleSize, titleColor) : null,
  ]);

  const titleNode = shapedTitle ? (
    <ShapedTitle words={shapedTitle} fontSize={titleSize} />
  ) : (
    <div style={{ color: titleColor, fontSize: titleSize, lineHeight: 1.12 }}>
      {title}
    </div>
  );

  const card = hero ? (
    // hero variant: full-bleed photo, dark gradient, title pinned bottom-left
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        fontFamily: "Fraunces",
      }}
    >
      <img
        src={hero}
        alt=""
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(180deg, rgba(15,23,42,0.05) 35%, rgba(15,23,42,0.84) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 64,
          right: 64,
          bottom: 56,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ color: ACCENT, fontSize: 30, marginBottom: 14 }}>
          Suhas Kashyap
        </div>
        {titleNode}
        {/* single template string: satori treats {a} text {b} as multiple
            children and demands display:flex on the parent */}
        <div
          style={{
            marginTop: 20,
            color: "rgba(255,255,255,0.82)",
            fontSize: 24,
          }}
        >
          {`${date} · kashyapsuhas.com`}
        </div>
      </div>
    </div>
  ) : (
    // no hero: light card matching the site
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#fff",
        padding: 64,
        fontFamily: "Fraunces",
      }}
    >
      <div style={{ color: ACCENT, fontSize: 32 }}>Suhas Kashyap</div>
      <div style={{ display: "flex", maxWidth: 1000 }}>{titleNode}</div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          color: MUTED,
          fontSize: 24,
        }}
      >
        <span>{date}</span>
        <span>kashyapsuhas.com</span>
      </div>
    </div>
  );

  return new ImageResponse(card, {
    ...size,
    fonts: fraunces
      ? [{ name: "Fraunces", data: fraunces, style: "normal", weight: 600 }]
      : undefined,
  });
}
