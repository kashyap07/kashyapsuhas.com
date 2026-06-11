"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";

import { ChevronDown } from "lucide-react";

import RouteGlyph from "./RouteGlyph";
import { useTripRoute } from "./TripContext";
import {
  INTRO_STOPS,
  arrivalProgress,
  locateScroll,
  pointAlongLeg,
  readStopsFromDom,
} from "./geo";
import { buildGlyph, updateGlyph } from "./glyph";

const TripMap = dynamic(() => import("./TripMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-surface-subtle font-sans text-sm text-muted">
      loading map...
    </div>
  ),
});

// slim sticky journey strip for < xl: the whole route as an svg glyph with
// the car sliding along it, current stop label, and a tap-to-expand panel
// hosting the real follow-map (one shared maplibre instance, kept alive once
// created). on load the panel auto-opens on a whole-route overview and folds
// away once the reader scrolls past the intro stops.
export default function TripRibbon({ active }: { active: boolean }) {
  const route = useTripRoute();
  const [open, setOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);

  // true while the panel is open because of the intro auto-open; a manual
  // toggle cancels it and hands control back to the reader
  const autoOpenRef = useRef(false);
  // intro runs once per page load, not on every effect re-run
  const introTriedRef = useRef(false);
  const carRef = useRef<SVGCircleElement>(null);
  const traveledRef = useRef<SVGPathElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  const glyph = useMemo(() => buildGlyph(route.polyline), [route]);

  // crossing into xl (rotate/resize): drop the panel map so the hidden ribbon
  // doesn't keep a live maplibre instance around next to the sidebar's
  useEffect(() => {
    if (!active) {
      setOpen(false);
      setEverOpened(false);
      autoOpenRef.current = false;
    }
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const polyline = route.polyline;
    const stops = readStopsFromDom();
    if (stops.length === 0) return;

    let rafId: number | null = null;

    // first impression: pop the panel open on the whole-route overview, fold
    // it once the reader is past the intro stops. skipped when the page loads
    // already scrolled into the journey.
    if (!introTriedRef.current) {
      introTriedRef.current = true;
      if (locateScroll(stops).idx < INTRO_STOPS) {
        autoOpenRef.current = true;
        setOpen(true);
        setEverOpened(true);
      }
    }

    const tick = () => {
      rafId = null;
      const { idx, progress } = locateScroll(stops);
      if (autoOpenRef.current && idx >= INTRO_STOPS) {
        autoOpenRef.current = false;
        setOpen(false);
      }
      const fromIdx = idx === 0 ? stops[0].polyIdx : stops[idx - 1].polyIdx;
      const toIdx = stops[idx].polyIdx;
      const { coord, floor } = pointAlongLeg(
        polyline,
        fromIdx,
        toIdx,
        arrivalProgress(progress),
      );

      updateGlyph(glyph, carRef.current, traveledRef.current, coord, floor);
      if (titleRef.current) {
        titleRef.current.textContent = stops[idx].title || `stop ${idx + 1}`;
      }
      if (counterRef.current) {
        counterRef.current.textContent = `stop ${idx + 1} of ${stops.length}`;
      }
    };

    const onScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(tick);
    };

    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
    };
  }, [active, route, glyph]);

  return (
    <div className="not-prose sticky top-0 z-30 -mx-6 shadow-sm md:mx-0 xl:hidden">
      <button
        type="button"
        onClick={() => {
          autoOpenRef.current = false;
          setOpen((o) => !o);
          setEverOpened(true);
        }}
        aria-expanded={open}
        aria-label="toggle trip map"
        className="flex w-full items-center gap-3 border-b border-line bg-background px-4 py-1.5 text-left"
      >
        <RouteGlyph
          glyph={glyph}
          carRef={carRef}
          traveledRef={traveledRef}
          className="h-11 w-auto shrink-0"
        />
        <span className="min-w-0 flex-1">
          <span
            ref={titleRef}
            className="block truncate font-sans text-sm font-medium text-foreground"
          >
            the route
          </span>
          <span ref={counterRef} className="block font-sans text-xs text-muted">
            stop - of -
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-accent py-1 pl-2.5 pr-1.5 font-sans text-xs font-medium text-black">
          map
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      <div
        className={`overflow-hidden bg-surface-subtle transition-[height] duration-300 ${
          open ? "h-[20vh] border-b border-line" : "h-0"
        }`}
      >
        {everOpened && (
          <div className="h-[20vh] w-full">
            <TripMap cooperative hud="none" intro />
          </div>
        )}
      </div>
    </div>
  );
}
