"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";

import { ChevronDown } from "lucide-react";

import { useTripRoute } from "./TripContext";
import {
  arrivalProgress,
  locateScroll,
  pointAlongLeg,
  readStopsFromDom,
} from "./geo";
import type { Coord } from "./types";

const TripMap = dynamic(() => import("./TripMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-surface-subtle font-sans text-sm text-muted">
      loading map...
    </div>
  ),
});

// keep the inline svg small: the glyph doesn't need every road kink
const MAX_GLYPH_POINTS = 240;
const GLYPH_HEIGHT = 100;

// projects the route polyline into a tiny svg glyph. equirectangular with
// latitude correction; height fixed, width follows the route's real aspect.
function buildGlyph(polyline: Coord[]) {
  const stride = Math.max(1, Math.ceil(polyline.length / MAX_GLYPH_POINTS));
  const pts: Coord[] = [];
  for (let i = 0; i < polyline.length; i += stride) pts.push(polyline[i]);
  if (pts[pts.length - 1] !== polyline[polyline.length - 1]) {
    pts.push(polyline[polyline.length - 1]);
  }

  let minLng = Infinity,
    maxLng = -Infinity,
    minLat = Infinity,
    maxLat = -Infinity;
  for (const [lng, lat] of polyline) {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }
  const k = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
  const s = GLYPH_HEIGHT / Math.max(1e-9, maxLat - minLat);
  const width = (maxLng - minLng) * k * s;

  const px = (c: Coord): [number, number] => [
    (c[0] - minLng) * k * s,
    (maxLat - c[1]) * s,
  ];

  const proj = pts.map(px);
  const d = proj
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join("");

  // cumulative length per glyph point, for stroke-dashoffset of the traveled
  // portion. same units as the path itself, so the dash math is exact.
  const cum = new Float32Array(proj.length);
  for (let i = 1; i < proj.length; i++) {
    cum[i] =
      cum[i - 1] +
      Math.hypot(proj[i][0] - proj[i - 1][0], proj[i][1] - proj[i - 1][1]);
  }

  return { d, width, stride, cum, total: cum[cum.length - 1], px };
}

// slim sticky journey strip for < xl: the whole route as an svg glyph with
// the car sliding along it, current stop label, and a tap-to-expand panel
// hosting the real follow-map (one shared maplibre instance, created on
// first expand and kept alive after).
export default function TripRibbon({ active }: { active: boolean }) {
  const route = useTripRoute();
  const [open, setOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);

  const carRef = useRef<SVGCircleElement>(null);
  const traveledRef = useRef<SVGPathElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  const glyph = useMemo(() => buildGlyph(route.polyline), [route]);
  const start = glyph.px(route.polyline[0]);

  // crossing into xl (rotate/resize): drop the panel map so the hidden ribbon
  // doesn't keep a live maplibre instance around next to the sidebar's
  useEffect(() => {
    if (!active) {
      setOpen(false);
      setEverOpened(false);
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

      if (carRef.current) {
        const [x, y] = glyph.px(coord);
        carRef.current.setAttribute("cx", x.toFixed(1));
        carRef.current.setAttribute("cy", y.toFixed(1));
      }
      if (traveledRef.current) {
        const gi = Math.min(
          glyph.cum.length - 1,
          Math.round(floor / glyph.stride),
        );
        traveledRef.current.style.strokeDashoffset = String(
          Math.max(0, glyph.total - glyph.cum[gi]),
        );
      }
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
    <div className="not-prose sticky top-0 z-30 -mx-6 md:mx-0 xl:hidden">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setEverOpened(true);
        }}
        aria-expanded={open}
        aria-label="toggle trip map"
        className="flex w-full items-center gap-3 border-b border-line bg-background px-4 py-1.5 text-left"
      >
        <svg
          viewBox={`-5 -5 ${glyph.width + 10} ${GLYPH_HEIGHT + 10}`}
          className="h-11 w-auto shrink-0"
          aria-hidden
        >
          <path
            d={glyph.d}
            fill="none"
            stroke="var(--foreground)"
            opacity="0.18"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            ref={traveledRef}
            d={glyph.d}
            fill="none"
            stroke="var(--columbiaYellow)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={glyph.total}
            strokeDashoffset={glyph.total}
          />
          <circle
            ref={carRef}
            cx={start[0].toFixed(1)}
            cy={start[1].toFixed(1)}
            r="7"
            fill="#fff"
            stroke="var(--columbiaYellow)"
            strokeWidth="4"
          />
        </svg>
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
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`overflow-hidden bg-surface-subtle transition-[height] duration-300 ${
          open ? "h-[25vh] border-b border-line" : "h-0"
        }`}
      >
        {everOpened && (
          <div className="h-[25vh] w-full">
            <TripMap />
          </div>
        )}
      </div>
    </div>
  );
}
