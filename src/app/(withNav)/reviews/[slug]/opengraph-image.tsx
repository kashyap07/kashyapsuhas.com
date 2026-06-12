import { ImageResponse } from "next/og";

import { getReviewBySlug, getReviews } from "@db/reviews";
import {
  FRAUNCES,
  ShapedTitle,
  hasComplexScript,
  loadGoogleFont,
  shapeWords,
} from "@utils/ogText";

export const alt = "Review by Suhas Kashyap";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// prerender all review cards at build, no runtime font fetches
export function generateStaticParams() {
  return getReviews().map((r) => ({ slug: r.slug }));
}

// satori can't read css vars or tailwind classes, mirror the tokens.
// tints/text colors follow categories.ts (tailwind *-50 / *-700 values).
const ACCENT = "#f0a044";
const FOREGROUND = "#1e293b";
const MUTED = "#64748b";
const SUCCESS = "#16a34a";
const DANGER = "#dc2626";

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Media: { bg: "#eef2ff", text: "#4338ca" },
  Tech: { bg: "#ecfeff", text: "#0e7490" },
  Vehicles: { bg: "#f8fafc", text: "#334155" },
  Games: { bg: "#fffbeb", text: "#b45309" },
  Restaurants: { bg: "#fff7ed", text: "#c2410c" },
  Services: { bg: "#f5f3ff", text: "#6d28d9" },
  Travel: { bg: "#f0f9ff", text: "#0369a1" },
  Photo: { bg: "#f0fdfa", text: "#0f766e" },
  Book: { bg: "#fefce8", text: "#a16207" },
  Others: { bg: "#fafaf9", text: "#44403c" },
};

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const review = getReviewBySlug(slug);
  if (!review) return new Response("Not found", { status: 404 });

  const { name, category, rating, wouldRecommend, reviewDate } = review;
  const colors = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.Others;
  // review dates are stored as ist-midnight utc timestamps, format in ist so
  // the date doesn't slip back a day
  const date = new Date(reviewDate).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  });
  const verdict = wouldRecommend ? "would recommend" : "would not recommend";
  const titleSize = name.length > 50 ? 54 : name.length > 30 ? 62 : 72;

  // indic names get harfbuzz-shaped word images (satori can't shape them)
  const complex = hasComplexScript(name);
  const [fraunces, shapedName] = await Promise.all([
    loadGoogleFont(
      FRAUNCES,
      `${complex ? "" : name}Suhas Kashyap${category}${date}${rating}/10${verdict}· `,
    ),
    complex ? shapeWords(name, titleSize, FOREGROUND) : null,
  ]);

  const nameNode = shapedName ? (
    <ShapedTitle words={shapedName} fontSize={titleSize} />
  ) : (
    <div style={{ color: FOREGROUND, fontSize: titleSize, lineHeight: 1.12 }}>
      {name}
    </div>
  );

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: colors.bg,
        padding: 64,
        fontFamily: "Fraunces",
      }}
    >
      <div style={{ color: ACCENT, fontSize: 32 }}>Suhas Kashyap</div>

      <div style={{ display: "flex", flexDirection: "column", maxWidth: 1000 }}>
        {nameNode}
        <div style={{ display: "flex", marginTop: 18, fontSize: 26 }}>
          <span style={{ color: colors.text }}>{category}</span>
          {/* satori trims leading whitespace in text nodes, gap via margin */}
          <span style={{ color: MUTED, marginLeft: 10 }}>{`· ${date}`}</span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span style={{ color: FOREGROUND, fontSize: 84 }}>{rating}</span>
          <span style={{ color: MUTED, fontSize: 32, marginLeft: 6 }}>/10</span>
        </div>
        <span
          style={{
            color: wouldRecommend ? SUCCESS : DANGER,
            fontSize: 30,
            marginBottom: 14,
          }}
        >
          {verdict}
        </span>
      </div>
    </div>,
    {
      ...size,
      fonts: fraunces
        ? [{ name: "Fraunces", data: fraunces, style: "normal", weight: 600 }]
        : undefined,
    },
  );
}
