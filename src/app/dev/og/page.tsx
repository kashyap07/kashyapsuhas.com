import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageOgCard } from "./PageOgCard";
import { allOgPaths, allPagePaths, ogModulePagePaths } from "./registry";

export const metadata: Metadata = { title: "og preview" };

// dev-only gallery: every custom og image, plus every remaining page with
// whatever og image it actually resolves to (usually the site default)
export default function OgPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  const ogPaths = allOgPaths();
  const covered = ogModulePagePaths();
  const otherPages = allPagePaths().filter((p) => !covered.has(p));

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold">
        custom og images{" "}
        <span className="text-slate-400">({ogPaths.length})</span>
      </h1>
      <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2">
        {ogPaths.map((p) => (
          <figure key={p}>
            <a href={`/dev/og/${p}`} target="_blank">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/dev/og/${p}`}
                alt={p}
                width={1200}
                height={630}
                loading="lazy"
                className="w-full rounded-lg border border-slate-200"
              />
            </a>
            <figcaption className="mt-2 text-sm text-slate-500">
              /{p}
            </figcaption>
          </figure>
        ))}
      </div>

      <h1 className="mt-16 text-2xl font-semibold">
        remaining pages{" "}
        <span className="text-slate-400">({otherPages.length})</span>
      </h1>
      <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2">
        {otherPages.map((p) => (
          <PageOgCard key={p} page={p} />
        ))}
      </div>
    </main>
  );
}
