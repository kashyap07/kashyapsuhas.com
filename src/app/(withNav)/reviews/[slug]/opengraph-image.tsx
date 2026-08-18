import { getReviewBySlug, getReviews } from "@db/reviews";
import {
  DANGER,
  FOREGROUND,
  MUTED,
  OgFrame,
  SUCCESS,
  ShapedTitle,
  hasComplexScript,
  ogImage,
  shapeWords,
} from "@utils/og";

export const alt = "Review by Suhas Kashyap";
export { contentType, size } from "@utils/og";

// prerender all review cards at build, no runtime font fetches
export function generateStaticParams() {
  return getReviews().map((r) => ({ slug: r.slug }));
}

// tints/text colors follow categories.ts (tailwind *-50 / *-700 values)
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
  // reviewDate is utc midnight of the day that was picked, so read it back in
  // utc. matches the date on the review page itself.
  const date = new Date(reviewDate).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  const verdict = wouldRecommend ? "would recommend" : "would not recommend";
  const titleSize = name.length > 50 ? 54 : name.length > 30 ? 62 : 72;

  // indic names get harfbuzz-shaped word images (satori can't shape them)
  const shapedName = hasComplexScript(name)
    ? await shapeWords(name, titleSize, FOREGROUND)
    : null;

  const nameNode = shapedName ? (
    <ShapedTitle words={shapedName} fontSize={titleSize} />
  ) : (
    <div style={{ color: FOREGROUND, fontSize: titleSize, lineHeight: 1.12 }}>
      {name}
    </div>
  );

  return ogImage(
    <OgFrame
      background={colors.bg}
      footer={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span style={{ color: FOREGROUND, fontSize: 84 }}>{rating}</span>
            <span style={{ color: MUTED, fontSize: 32, marginLeft: 6 }}>
              /10
            </span>
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
      }
    >
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 1000 }}>
        {nameNode}
        <div style={{ display: "flex", marginTop: 18, fontSize: 26 }}>
          <span style={{ color: colors.text }}>{category}</span>
          {/* satori trims leading whitespace in text nodes, gap via margin */}
          <span style={{ color: MUTED, marginLeft: 10 }}>{`· ${date}`}</span>
        </div>
      </div>
    </OgFrame>,
  );
}
