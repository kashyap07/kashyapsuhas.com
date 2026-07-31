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

interface Props {
  // two-finger pan / ctrl+wheel (for the inline mobile panel)
  cooperative?: boolean;
}

// scroll-following map: each stop section's scroll drives the leg
// coord_{prev} -> coord_{stop}, so while you read a section the car is
// animating in. the map is fully interactive; a user pan/zoom pauses the
// follow-cam, and scrolling the article glides the camera back onto the car.
export default function TripMap({ cooperative = false }: Props) {
  const route = useTripRoute();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const polyline = route.polyline;
    const stops = readStopsFromDom();
    if (stops.length === 0) return;

    let rafId: number | null = null;
    let following = true;
    // first follow snaps, so a mid-article load lands on the car instead of
    // gliding in from the initial view
    let snapNext = true;

    const handle: RouteMapHandle = createRouteMap({
      container: containerRef.current,
      polyline,
      waypoints: route.waypoints,
      center: stops[0].coord,
      zoom: FOLLOW_ZOOM,
      carSize: 50,
      cooperativeGestures: cooperative,
      onUserInteract: () => {
        following = false;
      },
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
      if (following) {
        handle.follow(carCoord, FOLLOW_ZOOM, snapNext);
        snapNext = false;
      }

      const trail: Coord[] = polyline.slice(0, floor + 1);
      trail.push(carCoord);
      handle.setTrail(trail);
    }

    function onScroll() {
      // scrolling the article hands the camera back to the car
      following = true;
      if (rafId !== null) return;
      rafId = requestAnimationFrame(tickScroll);
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      handle.destroy();
    };
  }, [route, cooperative]);

  return <div ref={containerRef} className="h-full w-full" />;
}
