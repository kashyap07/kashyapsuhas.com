"use client";

import { useEffect, useRef } from "react";

import { useTripRoute } from "./TripContext";
import {
  arrivalProgress,
  bearingDeg,
  locateScroll,
  pointAlongLeg,
  readStopsFromDom,
} from "./geo";
import { type RouteMapHandle, createRouteMap } from "./routeMap";
import type { Coord } from "./types";

const FOLLOW_ZOOM = 6;
// bearing looks this many polyline points ahead so the car points at the
// macro direction of travel instead of jittering with every road kink.
const BEARING_LOOKAHEAD = 10;

// fixed sidebar map (xl+). follows the car as the reader scrolls: each stop
// section's scroll drives the leg coord_{prev} -> coord_{stop}, so while you
// read a section the car is animating in. first stop just parks the car.
export default function TripMap() {
  const route = useTripRoute();
  const containerRef = useRef<HTMLDivElement>(null);
  const stopRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const polyline = route.polyline;
    const stops = readStopsFromDom();
    if (stops.length === 0) return;

    let rafId: number | null = null;

    const handle: RouteMapHandle = createRouteMap({
      container: containerRef.current,
      polyline,
      waypoints: route.waypoints,
      view: { kind: "center", center: stops[0].coord, zoom: FOLLOW_ZOOM },
      carSize: 50,
      onReady: () => {
        if (stops.length > 1) {
          handle.setCar(
            stops[0].coord,
            bearingDeg(stops[0].coord, stops[1].coord),
          );
        }
        tickScroll();
      },
    });

    function tickScroll() {
      rafId = null;

      const { idx, progress } = locateScroll(stops);
      const fromIdx = idx === 0 ? stops[0].polyIdx : stops[idx - 1].polyIdx;
      const toIdx = stops[idx].polyIdx;

      const {
        coord: carCoord,
        floor,
        direction,
      } = pointAlongLeg(polyline, fromIdx, toIdx, arrivalProgress(progress));

      let bearing: number | undefined;
      if (toIdx !== fromIdx) {
        const aheadIdx = Math.max(
          0,
          Math.min(polyline.length - 1, floor + direction * BEARING_LOOKAHEAD),
        );
        const ahead = polyline[aheadIdx];
        const a = polyline[floor];
        if (ahead[0] !== a[0] || ahead[1] !== a[1]) {
          bearing = bearingDeg(a, ahead);
        }
      }

      handle.setCar(carCoord, bearing);
      handle.jumpTo(carCoord, FOLLOW_ZOOM);

      const trail: Coord[] = polyline.slice(0, floor + 1);
      trail.push(carCoord);
      handle.setTrail(trail);

      if (stopRef.current) {
        stopRef.current.textContent = `stop ${idx + 1} of ${stops.length}`;
      }
    }

    function onScroll() {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(tickScroll);
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      handle.destroy();
    };
  }, [route]);

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <div className="pointer-events-none absolute left-3 top-3 z-20 rounded bg-white/90 px-2.5 py-1 font-sans text-xs font-medium text-foreground shadow-sm backdrop-blur-sm">
        <span ref={stopRef}>stop -</span>
      </div>
    </div>
  );
}
