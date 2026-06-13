"use client";

import dynamic from "next/dynamic";
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";

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

// the unopened "map" pill starts glowing at this stop and the glow ramps up to
// full insistence by NUDGE_FULL_STOP, the longer the reader keeps ignoring it
const NUDGE_START_STOP = 3;
const NUDGE_FULL_STOP = 8;

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
// created). the "map" pill glows once the reader is a few stops in and still
// hasn't opened it.
export default function TripRibbon({ active }: { active: boolean }) {
  const route = useTripRoute();
  const [open, setOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);
  // furthest stop reached while the map's still unopened; drives the glow
  // intensity. -1 == not nudging yet.
  const [nudgeIdx, setNudgeIdx] = useState(-1);

  // refs so the scroll tick reads state without re-subscribing the listener
  const openedRef = useRef(false);
  const nudgeIdxRef = useRef(-1);
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
      setNudgeIdx(-1);
      openedRef.current = false;
      nudgeIdxRef.current = -1;
    }
  }, [active]);

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

      // the longer the reader goes without opening the map, the harder the
      // pill nudges. ratchet up by furthest stop reached; cleared on open.
      if (
        !openedRef.current &&
        idx >= NUDGE_START_STOP &&
        idx > nudgeIdxRef.current
      ) {
        nudgeIdxRef.current = idx;
        setNudgeIdx(idx);
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

  // map nudgeIdx -> glow intensity in [0,1], then to the css vars the keyframe
  // reads. gentle at NUDGE_START_STOP, maxed out by NUDGE_FULL_STOP.
  const nudging = nudgeIdx >= NUDGE_START_STOP;
  const t = nudging
    ? Math.min(
        1,
        (nudgeIdx - NUDGE_START_STOP) / (NUDGE_FULL_STOP - NUDGE_START_STOP),
      )
    : 0;
  const lerp = (a: number, b: number) => a + (b - a) * t;
  const nudgeStyle = nudging
    ? ({
        "--nudge-spread": `${lerp(4, 11).toFixed(1)}px`,
        "--nudge-alpha": lerp(0.25, 0.6).toFixed(2),
        "--nudge-scale": lerp(1.04, 1.12).toFixed(3),
        "--nudge-speed": `${lerp(2, 1).toFixed(2)}s`,
      } as CSSProperties)
    : undefined;

  return (
    <div className="not-prose sticky top-0 z-30 -mx-6 shadow-sm md:mx-0 xl:hidden">
      <button
        type="button"
        onClick={() => {
          openedRef.current = true;
          setNudgeIdx(-1);
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
        <span
          style={nudgeStyle}
          className={`flex shrink-0 items-center gap-1 rounded-full bg-accent py-1 pl-2.5 pr-1.5 font-sans text-xs font-medium text-black ${nudging ? "motion-safe:animate-map-nudge" : ""}`}
        >
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
