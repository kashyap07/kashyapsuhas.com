"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { Dialog, DialogPanel } from "@headlessui/react";

type Item = {
  src: string;
  caption: string;
  takenAt: string;
  width: number;
  height: number;
};

function readItem(el: HTMLElement): Item {
  return {
    src: el.dataset.lightboxSrc ?? "",
    caption: el.dataset.lightboxCaption ?? "",
    takenAt: el.dataset.lightboxTaken ?? "",
    width: Number(el.dataset.lightboxW) || 1600,
    height: Number(el.dataset.lightboxH) || 1067,
  };
}

function formatTaken(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const SWIPE_MIN_PX = 48;

// gallery order comes from the dom ([data-lightbox] buttons in document
// order), so prev/next walk exactly the photos in the post, not the whole
// photo manifest. nothing unpublished is reachable.
export default function Lightbox() {
  const [items, setItems] = useState<Item[]>([]);
  const [idx, setIdx] = useState<number | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    function onOpen(e: Event) {
      const el = (e as CustomEvent<{ el: HTMLElement }>).detail?.el;
      if (!el) return;
      // offsetParent is null for display:none subtrees, so css-hidden photos
      // never join the gallery.
      const els = Array.from(
        document.querySelectorAll<HTMLElement>("[data-lightbox]"),
      ).filter((b) => b.offsetParent !== null);
      const i = els.indexOf(el);
      if (i === -1) return;
      setItems(els.map(readItem));
      setIdx(i);
    }
    window.addEventListener("trip-lightbox-open", onOpen);
    return () => window.removeEventListener("trip-lightbox-open", onOpen);
  }, []);

  const prev = useCallback(() => {
    setIdx((i) => (i === null ? null : Math.max(0, i - 1)));
  }, []);

  const next = useCallback(() => {
    setIdx((i) => (i === null ? null : Math.min(items.length - 1, i + 1)));
  }, [items.length]);

  useEffect(() => {
    if (idx === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, prev, next]);

  // warm the neighbours so arrows/swipes feel instant
  useEffect(() => {
    if (idx === null) return;
    for (const n of [idx - 1, idx + 1]) {
      const item = items[n];
      if (item) new window.Image().src = item.src;
    }
  }, [idx, items]);

  if (idx === null) return null;
  const item = items[idx];
  if (!item) return null;
  const atStart = idx === 0;
  const atEnd = idx === items.length - 1;
  const taken = formatTaken(item.takenAt);

  return (
    <Dialog
      open
      onClose={() => setIdx(null)}
      className="relative z-50 font-sans"
    >
      <div className="fixed inset-0 bg-black/85" aria-hidden="true" />
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-3 p-4">
        <DialogPanel
          className="flex max-h-full max-w-full flex-col items-center gap-3"
          onTouchStart={(e) => {
            touchStart.current = {
              x: e.touches[0].clientX,
              y: e.touches[0].clientY,
            };
          }}
          onTouchEnd={(e) => {
            const start = touchStart.current;
            touchStart.current = null;
            if (!start) return;
            const dx = e.changedTouches[0].clientX - start.x;
            const dy = e.changedTouches[0].clientY - start.y;
            if (Math.abs(dx) > SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy)) {
              if (dx > 0) prev();
              else next();
            }
          }}
        >
          {/* fixed-height stage: portrait and landscape shots both center
              inside it, so the caption + controls below sit at the same y for
              every photo instead of riding the image height. clicking the
              empty space beside the photo closes, same as the backdrop. */}
          <div
            className="flex h-[78vh] max-h-full min-h-0 w-full items-center justify-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIdx(null);
            }}
          >
            <Image
              src={item.src}
              alt={item.caption}
              width={item.width}
              height={item.height}
              unoptimized
              className="max-h-full w-auto rounded"
              priority
            />
          </div>
          {/* always rendered: the reserved two lines keep an absent or
              wrapping caption from shifting the controls */}
          <p className="min-h-[2.5rem] max-w-[85vw] text-center text-sm text-white/90">
            {item.caption}
          </p>
          <div className="flex items-center gap-3 text-sm text-white/75 sm:gap-4">
            <button
              type="button"
              onClick={prev}
              disabled={atStart}
              className="rounded px-2 py-1 disabled:opacity-30 hocus:bg-white/10"
              aria-label="previous photo"
            >
              ←
            </button>
            {/* fixed width + tabular figures: the date and counter change
                length photo to photo, and a shrink-to-fit label would drag
                both arrows sideways under the cursor while paging */}
            <span className="w-44 shrink-0 whitespace-nowrap text-center tabular-nums">
              {taken && `${taken} · `}
              {idx + 1} / {items.length}
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
