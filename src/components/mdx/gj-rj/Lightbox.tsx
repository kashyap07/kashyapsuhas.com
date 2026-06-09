"use client";

import { useCallback, useEffect, useState } from "react";

import { Dialog, DialogPanel } from "@headlessui/react";
import Image from "next/image";

import photos from "./photos.json";
import type { Photo } from "./types";

const ALL = photos as Photo[];

// chronologically sorted (the process script sorts by takenAt asc), so prev/next
// just walks indices. resolves both full src and basename for callers.
const INDEX_BY_KEY = new Map<string, number>();
ALL.forEach((p, i) => {
  INDEX_BY_KEY.set(p.src, i);
  const name = p.src.split("/").pop();
  if (name) INDEX_BY_KEY.set(name, i);
});

function formatTaken(p: Photo): string {
  if (!p.takenAt) return p.src.split("/").pop() ?? "";
  const d = new Date(p.takenAt);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Lightbox() {
  const [idx, setIdx] = useState<number | null>(null);

  useEffect(() => {
    function onOpen(e: Event) {
      const detail = (e as CustomEvent<{ src: string }>).detail;
      const i = INDEX_BY_KEY.get(detail.src);
      if (i !== undefined) setIdx(i);
    }
    window.addEventListener("trip-lightbox-open", onOpen);
    return () => window.removeEventListener("trip-lightbox-open", onOpen);
  }, []);

  const prev = useCallback(() => {
    setIdx((i) => (i === null ? null : Math.max(0, i - 1)));
  }, []);

  const next = useCallback(() => {
    setIdx((i) => (i === null ? null : Math.min(ALL.length - 1, i + 1)));
  }, []);

  useEffect(() => {
    if (idx === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, prev, next]);

  if (idx === null) return null;
  const photo = ALL[idx];
  const atStart = idx === 0;
  const atEnd = idx === ALL.length - 1;

  return (
    <Dialog
      open
      onClose={() => setIdx(null)}
      className="relative z-50 font-sans"
    >
      <div className="fixed inset-0 bg-black/85" aria-hidden="true" />
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-3 p-4">
        <DialogPanel className="flex max-h-full max-w-full flex-col items-center gap-3">
          <Image
            src={photo.src}
            alt=""
            width={photo.width}
            height={photo.height}
            sizes="100vw"
            className="max-h-[82vh] w-auto rounded"
            priority
          />
          <div className="flex items-center gap-4 text-sm text-white/85">
            <button
              type="button"
              onClick={prev}
              disabled={atStart}
              className="rounded px-2 py-1 disabled:opacity-30 hocus:bg-white/10"
              aria-label="previous photo"
            >
              ←
            </button>
            <span>
              {formatTaken(photo)} · {idx + 1} / {ALL.length}
            </span>
            <button
              type="button"
              onClick={next}
              disabled={atEnd}
              className="rounded px-2 py-1 disabled:opacity-30 hocus:bg-white/10"
              aria-label="next photo"
            >
              →
            </button>
            <button
              type="button"
              onClick={() => setIdx(null)}
              className="rounded px-2 py-1 hocus:bg-white/10"
              aria-label="close"
            >
              ✕
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
