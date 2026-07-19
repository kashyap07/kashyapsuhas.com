"use client";

import { useEffect, useState } from "react";

type Meta = { image: string | null; isDefault: boolean; error?: number };

// one page in the coverage section: resolves the page's real og image via
// /dev/og/meta and shows it with a default / own-og / missing badge
export function PageOgCard({ page }: { page: string }) {
  const [meta, setMeta] = useState<Meta | null>(null);

  useEffect(() => {
    fetch(`/dev/og/meta?path=${encodeURIComponent(page)}`)
      .then((r) => r.json())
      .then(setMeta)
      .catch(() => setMeta({ image: null, isDefault: false }));
  }, [page]);

  const badge = !meta
    ? null
    : meta.error
      ? { label: `error ${meta.error}`, cls: "bg-red-100 text-red-700" }
      : !meta.image
        ? { label: "no og image", cls: "bg-red-100 text-red-700" }
        : meta.isDefault
          ? { label: "default", cls: "bg-slate-100 text-slate-600" }
          : { label: "own og", cls: "bg-amber-100 text-amber-700" };

  return (
    <figure>
      {meta?.image ? (
        <a href={meta.image} target="_blank">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={meta.image}
            alt={page}
            width={1200}
            height={630}
            loading="lazy"
            className="w-full rounded-lg border border-slate-200"
          />
        </a>
      ) : (
        <div className="flex aspect-[1200/630] w-full items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-400">
          {meta ? "no og image" : "resolving…"}
        </div>
      )}
      <figcaption className="mt-2 flex items-center gap-2 text-sm text-slate-500">
        <a href={page} target="_blank" className="hover:underline">
          {page}
        </a>
        {badge && (
          <span className={`rounded px-1.5 py-0.5 text-xs ${badge.cls}`}>
            {badge.label}
          </span>
        )}
      </figcaption>
    </figure>
  );
}
