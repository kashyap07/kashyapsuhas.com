import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { getBlogPost, getBlogPosts } from "@db/blog";
import {
  ACCENT,
  FOREGROUND,
  MUTED,
  OgFrame,
  ShapedTitle,
  hasComplexScript,
  ogImage,
  shapeWords,
} from "@utils/og";
import { SITE_URL } from "@utils/site";

export const alt = "Blog post by Suhas Kashyap";
export { contentType, size } from "@utils/og";

// prerender published posts' cards at build (heroes read from disk there).
// drafts still render on demand in the deployed function via the cdn fallback.
export function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }));
}

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

// hero lives in public/. build/dev prerenders read it from disk and inline a
// data uri. public/ is excluded from the deployed function bundle (file
// tracing blew vercel's size limit), so on-demand renders (drafts) fall back
// to the cdn copy of the asset. external urls pass through.
async function loadHero(heroImage: string): Promise<string | null> {
  if (!heroImage) return null;
  if (heroImage.startsWith("http")) return heroImage;
  // public/ absent means we're in the deployed function bundle (file tracing
  // excludes it): the asset lives on the cdn, satori fetches it from there
  if (!existsSync(path.join(process.cwd(), "public"))) {
    return `${SITE_URL}${heroImage.startsWith("/") ? "" : "/"}${heroImage}`;
  }
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
    // file genuinely missing: render the no-hero card instead
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
  const post = getBlogPost(slug, { includeDrafts: true });
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
  const shapedTitle = hasComplexScript(title)
    ? await shapeWords(title, titleSize, titleColor)
    : null;

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
    <OgFrame
      footer={
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
      }
    >
      <div style={{ display: "flex", maxWidth: 1000 }}>{titleNode}</div>
    </OgFrame>
  );

  return ogImage(card);
}
