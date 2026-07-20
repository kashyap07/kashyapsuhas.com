import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getBlogPosts } from "@db/blog";
import { getReviews } from "@db/reviews";

export const metadata: Metadata = { title: "content health" };

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

function Badge({
  children,
  tone = "amber",
}: {
  children: React.ReactNode;
  tone?: "amber" | "red" | "slate";
}) {
  const cls = {
    red: "bg-red-100 text-red-700",
    amber: "bg-amber-100 text-amber-700",
    slate: "bg-slate-100 text-slate-600",
  }[tone];
  return (
    <span className={`rounded px-1.5 py-0.5 text-xs whitespace-nowrap ${cls}`}>
      {children}
    </span>
  );
}

function Row({
  href,
  title,
  sub,
  badges,
}: {
  href: string;
  title: string;
  sub: string;
  badges: React.ReactNode;
}) {
  return (
    <li className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-slate-100 py-2.5">
      <a href={href} target="_blank" className="text-slate-700 hover:underline">
        {title}
      </a>
      <span className="text-sm text-slate-400">{sub}</span>
      <span className="flex flex-wrap items-center gap-1">{badges}</span>
    </li>
  );
}

// dev-only content dashboard: what's unfinished (drafts, todo markers) and
// what's missing frontmatter, so nobody greps for it
export default function ContentHealthPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  const posts = getBlogPosts({ includeDrafts: true });
  const drafts = posts.filter((p) => p.metadata.draft);
  const published = posts.filter((p) => !p.metadata.draft);
  const reviews = getReviews();

  const postIssues = (p: (typeof posts)[number]) => {
    const issues: string[] = [];
    if (!p.metadata.description) issues.push("no description");
    if (!p.metadata.heroImage) issues.push("no hero");
    return issues;
  };
  const reviewIssues = (r: (typeof reviews)[number]) => {
    const issues: string[] = [];
    if (!r.summary) issues.push("no summary");
    if (r.pros.length === 0) issues.push("no pros");
    if (r.cons.length === 0) issues.push("no cons");
    return issues;
  };

  const publishedWithIssues = published.filter((p) => postIssues(p).length);
  const reviewsWithIssues = reviews.filter((r) => reviewIssues(r).length);
  const words = (content: string) => content.trim().split(/\s+/).length;
  const todos = (content: string) =>
    (content.match(/<(TODO|FIXME)/g) ?? []).length;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold">content health</h1>
      <p className="mt-2 text-sm text-slate-500">
        {published.length} published posts, {drafts.length} drafts,{" "}
        {reviews.length} reviews
      </p>

      <h2 className="mt-12 text-xl font-semibold">
        drafts <span className="text-slate-400">({drafts.length})</span>
      </h2>
      {drafts.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">nothing in progress</p>
      ) : (
        <ul className="mt-4">
          {drafts.map((p) => (
            <Row
              key={p.slug}
              href={`/blog/${p.slug}`}
              title={p.metadata.title}
              sub={`${dateFmt.format(new Date(p.metadata.publishedDateTime))} · ${words(p.content)} words`}
              badges={
                <>
                  {p.metadata.trip && <Badge tone="slate">trip</Badge>}
                  {todos(p.content) > 0 && (
                    <Badge tone="red">{todos(p.content)} todo</Badge>
                  )}
                  {postIssues(p).map((issue) => (
                    <Badge key={issue}>{issue}</Badge>
                  ))}
                </>
              }
            />
          ))}
        </ul>
      )}

      <h2 className="mt-12 text-xl font-semibold">
        published posts with issues{" "}
        <span className="text-slate-400">({publishedWithIssues.length})</span>
      </h2>
      {publishedWithIssues.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">all clear</p>
      ) : (
        <ul className="mt-4">
          {publishedWithIssues.map((p) => (
            <Row
              key={p.slug}
              href={`/blog/${p.slug}`}
              title={p.metadata.title}
              sub={dateFmt.format(new Date(p.metadata.publishedDateTime))}
              badges={postIssues(p).map((issue) => (
                <Badge key={issue}>{issue}</Badge>
              ))}
            />
          ))}
        </ul>
      )}

      <h2 className="mt-12 text-xl font-semibold">
        reviews with issues{" "}
        <span className="text-slate-400">({reviewsWithIssues.length})</span>
      </h2>
      {reviewsWithIssues.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">all clear</p>
      ) : (
        <ul className="mt-4">
          {reviewsWithIssues.map((r) => (
            <Row
              key={r.slug}
              href={`/reviews/${r.slug}`}
              title={r.name}
              sub={`${r.category} · ${r.rating}/10`}
              badges={reviewIssues(r).map((issue) => (
                <Badge key={issue}>{issue}</Badge>
              ))}
            />
          ))}
        </ul>
      )}
    </main>
  );
}
