"use client";

import { useEffect, useRef, useState } from "react";

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
  // maplibre 5 dropped its supported() check: with webgl off (firefox's
  // webgl.disabled, blocklisted drivers) the Map constructor throws, and a
  // throw from the effect below takes the whole post to the error boundary,
  // not just the map. catching it there is the whole fix - don't feature
  // probe up front, a throwaway probe context costs a real context create
  // + loseContext right before maplibre asks for its own, which stalls
  // noticeably on ios safari.
  const [noWebGL, setNoWebGL] = useState(false);

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

    let handle: RouteMapHandle;
    try {
      handle = createRouteMap({
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
    } catch {
      // maplibre fills the container with its canvas and controls before the
      // painter fails, and react never knew about those children, so it won't
      // clear them when this swaps to the notice. wipe them by hand.
      containerRef.current.replaceChildren();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- recovery path, not sync: one extra render beats the throw escaping to the error boundary
      setNoWebGL(true);
      return;
    }

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

  if (noWebGL) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-surface-subtle p-4 text-center font-sans text-sm text-muted">
        This map needs webgl which is disabled on your browser. <br />
        It is juicy, so I recommend you enable it or use a different browser.
      </div>
    );
  }

  return <div ref={containerRef} className="h-full w-full" />;
}
