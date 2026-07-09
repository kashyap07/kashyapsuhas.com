"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";

import { ChevronDown } from "lucide-react";

import RouteGlyph from "./RouteGlyph";
import { useTripRoute } from "./TripContext";
import {
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
// the car sliding along it, current stop label, and the real follow-map open
// underneath by default (one shared maplibre instance, kept alive across
// collapse/expand). tapping the strip toggles the map panel.
export default function TripRibbon({ active }: { active: boolean }) {
  const route = useTripRoute();
  const [open, setOpen] = useState(true);

  const carRef = useRef<SVGCircleElement>(null);
  const traveledRef = useRef<SVGPathElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  const glyph = useMemo(() => buildGlyph(route.polyline), [route]);

  // crossing into xl (rotate/resize) remounts this via a key in the host, which
  // resets all state + refs and drops the panel's live maplibre instance, so no
  // reset effect is needed here.

  useEffect(() => {
    if (!active) return;
    const polyline = route.polyline;
    const stops = readStopsFromDom();
    if (stops.length === 0) return;

    let rafId: number | null = null;

    const tick = () => {
      rafId = null;
      const { idx, progress } = locateScroll(stops);
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
        onClick={() => setOpen((o) => !o)}
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
        {/* map mounts as soon as the ribbon is live and stays mounted while
            collapsed, so closing and reopening never reboots maplibre */}
        {active && (
          <div className="h-[20vh] w-full">
            <TripMap cooperative hud="none" intro />
          </div>
        )}
      </div>
    </div>
  );
}
