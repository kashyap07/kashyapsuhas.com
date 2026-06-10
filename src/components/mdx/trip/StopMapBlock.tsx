"use client";

import { useEffect, useRef, useState } from "react";

import { useTripRoute } from "./TripContext";
import {
  arrivalProgress,
  bearingDeg,
  pointAlongLeg,
  readStopsFromDom,
  sectionScrollProgress,
} from "./geo";
import type { RouteMapHandle } from "./routeMap";
import type { Coord } from "./types";

interface Props {
  coord: Coord;
}

// inline map shown below each stop on < xl. drives the leg coming IN to
// `coord` from the previous coord-stop as the section scrolls. first stop
// parks the car and becomes a single-point view.
export default function StopMapBlock({ coord }: Props) {
  const route = useTripRoute();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  // mount the map while near the viewport, tear it down once it's far away.
  // mobile safari caps live webgl contexts (~8), so a long travelogue that
  // kept every scrolled-past map alive would start losing contexts and
  // rendering blank maps.
  useEffect(() => {
    if (!wrapperRef.current) return;
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: "800px 0px" },
    );
    io.observe(wrapperRef.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const polyline = route.polyline;
    const wrapper = wrapperRef.current;
    const stopSection = wrapper?.closest("[data-stop]") as HTMLElement | null;
    if (!stopSection) return;

    const stops = readStopsFromDom();
    const myIdx = stops.findIndex((s) => s.el === stopSection);
    if (myIdx === -1) return;

    const hasPrev = myIdx > 0;
    const toIdx = stops[myIdx].polyIdx;
    const fromIdx = hasPrev ? stops[myIdx - 1].polyIdx : toIdx;
    const fromCoord = hasPrev ? stops[myIdx - 1].coord : coord;
    const legLen = Math.abs(toIdx - fromIdx);
    // bearing lookahead scaled to leg length so short legs don't overshoot.
    // min 2 points to avoid jitter, max 8 so we don't ignore turns.
    const lookahead = Math.min(8, Math.max(2, Math.floor(legLen / 6)));

    const lo = Math.min(fromIdx, toIdx);
    const hi = Math.max(fromIdx, toIdx);
    const legPolyline = polyline.slice(lo, hi + 1);

    let handle: RouteMapHandle | null = null;
    let rafId: number | null = null;
    let disposed = false;

    function update() {
      if (!handle || !stopSection) return;
      const p = arrivalProgress(sectionScrollProgress(stopSection));
      const {
        coord: carCoord,
        floor,
        direction,
      } = pointAlongLeg(polyline, fromIdx, toIdx, p);

      let bearing: number | undefined;
      if (hasPrev && legLen > 0) {
        const aheadIdx = Math.max(
          0,
          Math.min(polyline.length - 1, floor + direction * lookahead),
        );
        const ahead = polyline[aheadIdx];
        const a = polyline[floor];
        if (ahead[0] !== a[0] || ahead[1] !== a[1]) {
          bearing = bearingDeg(a, ahead);
        }
      }
      handle.setCar(carCoord, bearing);

      // trail: from-end of the leg up to the car
      let trail: Coord[];
      if (direction > 0) {
        trail = polyline.slice(fromIdx, floor + 1);
        trail.push(carCoord);
      } else {
        trail = polyline.slice(floor, fromIdx + 1);
        trail.unshift(carCoord);
      }
      handle.setTrail(trail);
    }

    // maplibre is heavy; only pull it in when a map actually mounts
    import("./routeMap").then(({ createRouteMap }) => {
      if (disposed || !containerRef.current) return;
      handle = createRouteMap({
        container: containerRef.current,
        polyline: legPolyline,
        view: hasPrev
          ? {
              kind: "fit",
              coords: [...legPolyline, fromCoord, coord],
              padding: 40,
            }
          : { kind: "center", center: coord, zoom: 9 },
        carSize: 30,
        onReady: update,
      });
      handle.setCar(
        fromCoord,
        hasPrev ? bearingDeg(fromCoord, coord) : undefined,
      );
    });

    function onScroll() {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        update();
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      disposed = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      handle?.destroy();
      handle = null;
    };
  }, [active, coord, route]);

  return (
    <div
      ref={wrapperRef}
      className="not-prose my-8 h-[32vh] w-full overflow-hidden rounded-lg border border-line bg-surface-subtle xl:hidden"
    >
      {active ? (
        <div ref={containerRef} className="h-full w-full" />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-sans text-sm text-muted">
          loading map...
        </div>
      )}
    </div>
  );
}
