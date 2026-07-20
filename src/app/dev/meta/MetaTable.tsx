"use client";

import { useEffect, useMemo, useState } from "react";

import type { PageMeta } from "./scrape/route";

// mirrors the fallback in the root layout's metadata
const DEFAULT_OG = "/kashyapcom-og.png";
const TITLE_MAX = 60;
const DESC_MAX = 160;
const CONCURRENCY = 6;

type Issue = { label: string; level: "red" | "amber" };

function issuesFor(
  meta: PageMeta,
  dupTitles: Set<string>,
  dupDescs: Set<string>,
): Issue[] {
  if (meta.error) return [{ label: `fetch error ${meta.error}`, level: "red" }];
  const issues: Issue[] = [];
  if (!meta.title) issues.push({ label: "no title", level: "red" });
  else if (meta.title.length > TITLE_MAX)
    issues.push({ label: `title ${meta.title.length} chars`, level: "amber" });
  if (!meta.description)
    issues.push({ label: "no description", level: "red" });
  else if (meta.description.length > DESC_MAX)
    issues.push({
      label: `description ${meta.description.length} chars`,
      level: "amber",
    });
  if (!meta.canonical) issues.push({ label: "no canonical", level: "amber" });
  if (!meta.ogImage) issues.push({ label: "no og image", level: "red" });
  if (meta.title && dupTitles.has(meta.title))
    issues.push({ label: "dup title", level: "amber" });
  if (meta.description && dupDescs.has(meta.description))
    issues.push({ label: "dup description", level: "amber" });
  return issues;
}

const BADGE = {
  red: "bg-red-100 text-red-700",
  amber: "bg-amber-100 text-amber-700",
};

// fetches every page's rendered head through /dev/meta/scrape (a few at a
// time, each fetch is a full dev render) and reports what silently rots:
// missing or overlong titles/descriptions, missing canonicals, duplicates
export function MetaTable({ paths }: { paths: string[] }) {
  const [metas, setMetas] = useState<Record<string, PageMeta>>({});
  const [issuesOnly, setIssuesOnly] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const queue = [...paths];
    const worker = async () => {
      for (let p = queue.shift(); p && !cancelled; p = queue.shift()) {
        const page = p;
        const meta: PageMeta = await fetch(
          `/dev/meta/scrape?path=${encodeURIComponent(page)}`,
        )
          .then((r) => r.json())
          .catch(() => ({ error: -1 }));
        if (!cancelled) setMetas((prev) => ({ ...prev, [page]: meta }));
      }
    };
    for (let i = 0; i < CONCURRENCY; i++) void worker();
    return () => {
      cancelled = true;
    };
  }, [paths]);

  // exact-match duplicates across everything loaded so far
  const { dupTitles, dupDescs } = useMemo(() => {
    const count = (key: "title" | "description") => {
      const seen = new Map<string, number>();
      for (const m of Object.values(metas)) {
        const v = m[key];
        if (v) seen.set(v, (seen.get(v) ?? 0) + 1);
      }
      return new Set([...seen].filter(([, n]) => n > 1).map(([v]) => v));
    };
    return { dupTitles: count("title"), dupDescs: count("description") };
  }, [metas]);

  const rows = paths.map((p) => {
    const meta = metas[p];
    return {
      path: p,
      meta,
      issues: meta ? issuesFor(meta, dupTitles, dupDescs) : [],
    };
  });
  const loaded = rows.filter((r) => r.meta).length;
  const withIssues = rows.filter((r) => r.issues.length > 0).length;
  const shown = issuesOnly ? rows.filter((r) => r.issues.length > 0) : rows;

  return (
    <div>
      <div className="mt-4 flex items-center gap-6 text-sm text-slate-500">
        <span>
          {loaded < paths.length
            ? `scanning ${loaded} / ${paths.length}…`
            : `${paths.length} pages, ${withIssues} with issues`}
        </span>
        <label className="flex cursor-pointer items-center gap-1.5">
          <input
            type="checkbox"
            checked={issuesOnly}
            onChange={(e) => setIssuesOnly(e.target.checked)}
          />
          issues only
        </label>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[56rem] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs text-slate-400">
              <th className="py-2 pr-4 font-medium">page</th>
              <th className="py-2 pr-4 font-medium">title</th>
              <th className="py-2 pr-4 font-medium">description</th>
              <th className="py-2 pr-4 font-medium">canonical</th>
              <th className="py-2 pr-4 font-medium">og image</th>
              <th className="py-2 pr-4 font-medium">json-ld</th>
              <th className="py-2 font-medium">issues</th>
            </tr>
          </thead>
          <tbody>
            {shown.map(({ path, meta, issues }) => (
              <tr key={path} className="border-b border-slate-100 align-top">
                <td className="py-2 pr-4 whitespace-nowrap">
                  <a
                    href={path}
                    target="_blank"
                    className="text-slate-700 hover:underline"
                  >
                    {path}
                  </a>
                </td>
                {!meta ? (
                  <td colSpan={6} className="py-2 text-slate-300">
                    resolving…
                  </td>
                ) : (
                  <>
                    <td
                      className="max-w-64 truncate py-2 pr-4 text-slate-600"
                      title={meta.title ?? undefined}
                    >
                      {meta.title ?? "-"}
                      {meta.title && (
                        <span className="ml-1 text-xs text-slate-400">
                          {meta.title.length}
                        </span>
                      )}
                    </td>
                    <td
                      className="max-w-80 truncate py-2 pr-4 text-slate-600"
                      title={meta.description ?? undefined}
                    >
                      {meta.description ?? "-"}
                      {meta.description && (
                        <span className="ml-1 text-xs text-slate-400">
                          {meta.description.length}
                        </span>
                      )}
                    </td>
                    <td className="max-w-48 truncate py-2 pr-4 text-slate-600">
                      {meta.canonical ?? "-"}
                    </td>
                    <td className="py-2 pr-4 whitespace-nowrap text-slate-600">
                      {!meta.ogImage
                        ? "-"
                        : meta.ogImage === DEFAULT_OG
                          ? "default"
                          : "own"}
                    </td>
                    <td className="py-2 pr-4 whitespace-nowrap text-slate-600">
                      {meta.jsonLd.length ? meta.jsonLd.join(", ") : "-"}
                    </td>
                    <td className="py-2">
                      <span className="flex flex-wrap gap-1">
                        {issues.map((issue) => (
                          <span
                            key={issue.label}
                            className={`rounded px-1.5 py-0.5 text-xs whitespace-nowrap ${BADGE[issue.level]}`}
                          >
                            {issue.label}
                          </span>
                        ))}
                      </span>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
