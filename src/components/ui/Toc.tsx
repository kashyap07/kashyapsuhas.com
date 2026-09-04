"use client";

import { useEffect, useRef, useState } from "react";

import cn from "@utils/cn";
import type { Heading } from "@utils/headings";

// the reading position, as a distance from the top of the viewport. a heading
// becomes current once it crosses this line.
const ACTIVATION_LINE = 120;

interface Props {
  headings: Heading[];
}

// keeps the marked row inside a container that scrolls on its own. nudges the
// container, never the page.
function nudge(container: HTMLElement | null, id: string) {
  if (!container) return;
  const row = container.querySelector<HTMLElement>(`[data-toc="${id}"]`);
  if (!row) return;
  const rowBox = row.getBoundingClientRect();
  const box = container.getBoundingClientRect();
  if (rowBox.top < box.top) {
    container.scrollTop -= box.top - rowBox.top + 12;
  } else if (rowBox.bottom > box.bottom) {
    container.scrollTop += rowBox.bottom - box.bottom + 12;
  }
}

/**
 * margin table of contents, substack style. it is a fixed rail of tick marks
 * pinned to the left edge of the screen, one tick per heading, with the current
 * section marked. clicking the rail opens the titles in a panel beside it, and
 * the panel stays open until it is dismissed. nothing expands under the cursor
 * while you read, which is the whole point.
 */
export function Toc({ headings }: Props) {
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);
  const [railClipped, setRailClipped] = useState(false);
  const [listClipped, setListClipped] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const railRef = useRef<HTMLSpanElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  // document offset of every heading, cached. see measure().
  const topsRef = useRef<number[]>([]);

  // headings is a fresh array on every server render, so key the effect off the
  // ids themselves. otherwise the listeners get torn down and rebuilt for a
  // list that never actually changed.
  const idKey = headings.map((h) => h.id).join("|");

  useEffect(() => {
    const ids = idKey ? idKey.split("|") : [];
    if (!ids.length) return;

    let frame = 0;

    // heading offsets only move when the document reflows, so they are read
    // once and cached. the scroll handler then does nothing but compare
    // numbers, instead of forcing a layout read per heading per frame in a
    // post that is literally about not doing that.
    const measure = () => {
      topsRef.current = ids.map((id) => {
        const el = document.getElementById(id);
        return el ? el.getBoundingClientRect().top + window.scrollY : NaN;
      });
    };

    const update = () => {
      frame = 0;
      const tops = topsRef.current;
      const anchor = window.scrollY + ACTIVATION_LINE;

      // ids are in document order, so the first heading still below the
      // reading line ends the search
      let i = -1;
      for (let k = 0; k < tops.length; k++) {
        if (Number.isNaN(tops[k])) continue;
        if (tops[k] > anchor) break;
        i = k;
      }

      // the last section rarely pushes its own heading past the reading line,
      // so reaching the bottom of the page counts as being in it
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 24;
      if (atBottom) i = tops.length - 1;

      // nothing is marked over the intro: no heading has been passed yet, and
      // lighting up row 0 there would just be a lie
      if (i < 0) {
        setActive("");
        return;
      }

      setActive(ids[i]);
      nudge(railRef.current, ids[i]);
      nudge(listRef.current, ids[i]);
    };

    const onScroll = () => {
      frame ||= requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      onScroll();
    };

    // one controller for both listeners, and a cancelled frame. writing a
    // sloppy scroll handler in the memory leak post would be embarrassing.
    const ac = new AbortController();
    window.addEventListener("scroll", onScroll, {
      passive: true,
      signal: ac.signal,
    });
    window.addEventListener("resize", onResize, {
      passive: true,
      signal: ac.signal,
    });

    // late images and fonts move every heading below them, and no scroll or
    // resize event fires for that
    const ro = new ResizeObserver(onResize);
    ro.observe(document.body);

    measure();
    update();

    return () => {
      ac.abort();
      ro.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [idKey]);

  // the panel is a disclosure, not a modal: no focus trap, but escape and a
  // click anywhere else should still put it away.
  useEffect(() => {
    if (!open) return;

    const ac = new AbortController();

    document.addEventListener(
      "keydown",
      (e) => {
        if (e.key !== "Escape") return;
        setOpen(false);
        buttonRef.current?.focus();
      },
      { signal: ac.signal },
    );

    // pointerdown, not click: dismiss on the press, the same as every other
    // popover on the platform
    document.addEventListener(
      "pointerdown",
      (e) => {
        if (wrapRef.current?.contains(e.target as Node)) return;
        setOpen(false);
      },
      { signal: ac.signal },
    );

    return () => ac.abort();
  }, [open]);

  // both the rail and the list cap out on a short viewport. only fade an edge
  // when there is really more behind it, otherwise a short post gets a
  // gradient over nothing.
  useEffect(() => {
    const targets = [
      [railRef.current, setRailClipped],
      [listRef.current, setListClipped],
    ] as const;

    const check = () => {
      for (const [el, set] of targets) {
        if (el) set(el.scrollHeight > el.clientHeight + 1);
      }
    };

    const ro = new ResizeObserver(check);
    for (const [el] of targets) if (el) ro.observe(el);
    check();
    return () => ro.disconnect();
  }, [open, idKey]);

  if (!headings.length) return null;

  return (
    // fixed to the left edge and centred on the viewport, so the rail sits in
    // the same place no matter where the reading column happens to be
    <div
      ref={wrapRef}
      className="fixed left-2 top-1/2 z-30 hidden -translate-y-1/2 items-center gap-2 toc:flex"
    >
      {/* the whole rail is one control. the ticks are decoration, every link
          lives in the panel, which keeps a 24px wide target from having to
          serve as nineteen separate ones. */}
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="toc-panel"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "rounded-lg p-2 transition-colors duration-200 hover:bg-surface-subtle",
          open && "bg-surface-subtle",
        )}
      >
        <span className="sr-only">
          {open ? "Hide table of contents" : "Show table of contents"}
        </span>
        <span
          ref={railRef}
          aria-hidden
          data-overflowing={railClipped ? "ends" : undefined}
          className="toc-scroll flex max-h-[70vh] flex-col overflow-y-auto"
        >
          {headings.map((heading) => (
            <span
              key={heading.id}
              data-toc={heading.id}
              className="flex h-3 w-4 shrink-0 items-center justify-end"
            >
              {/* ticks are right flush and only 2px shorter for an h3: enough
                  to read as a level, not enough to read as a bar chart */}
              <span
                className={cn(
                  "h-[1.5px] rounded-full transition-all duration-200",
                  heading.level === 3 ? "w-3" : "w-4",
                  heading.id === active ? "bg-foreground" : "bg-subtle",
                )}
              />
            </span>
          ))}
        </span>
      </button>

      {open && (
        <nav
          id="toc-panel"
          aria-label="Table of contents"
          className="toc-panel w-64 rounded-lg bg-background p-3 ring-1 ring-line"
        >
          <p className="mb-1.5 font-sans text-[11px] uppercase tracking-wider text-foreground">
            Contents
          </p>

          <ul
            ref={listRef}
            data-overflowing={listClipped || undefined}
            className="toc-scroll max-h-[70vh] overflow-y-auto"
          >
            {headings.map((heading) => {
              const isActive = heading.id === active;
              return (
                <li key={heading.id}>
                  <a
                    href={`#${heading.id}`}
                    data-toc={heading.id}
                    aria-current={isActive ? "location" : undefined}
                    // hover:no-underline is not redundant: globals gives every
                    // `a` an `a:hover { underline }`, which outranks a plain
                    // .no-underline on specificity
                    className={cn(
                      // truncate, not wrap: uniform rows are the whole point
                      // of a list you scan rather than read
                      "block truncate py-1 font-sans text-label leading-snug no-underline transition-colors duration-200 hover:no-underline",
                      heading.level === 3 ? "pl-3" : "pl-0",
                      isActive
                        ? "text-foreground"
                        : "text-muted hover:text-foreground",
                    )}
                  >
                    {heading.text}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
