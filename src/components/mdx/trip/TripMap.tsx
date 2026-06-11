"use client";

import { useEffect, useMemo, useRef } from "react";

import RouteGlyph from "./RouteGlyph";
import { useTripRoute } from "./TripContext";
import {
  INTRO_STOPS,
  arrivalProgress,
  bearingDeg,
  locateScroll,
  pointAlongLeg,
  readStopsFromDom,
} from "./geo";
import { buildGlyph, updateGlyph } from "./glyph";
import { type RouteMapHandle, createRouteMap } from "./routeMap";
import type { Coord } from "./types";

const FOLLOW_ZOOM = 6;
// bearing looks this many polyline points ahead so the car points at the
// macro direction of travel instead of jittering with every road kink.
const BEARING_LOOKAHEAD = 10;

interface Props {
  // two-finger pan / ctrl+wheel (for the inline mobile panel)
  cooperative?: boolean;
  // "glyph" overlays the whole-route glyph + stop label (desktop sidebar);
  // "none" for hosts that already show that info elsewhere (mobile ribbon)
  hud?: "glyph" | "none";
  // start on a whole-route overview and hold it through the first
  // INTRO_STOPS sections, then glide the camera down to the car
  intro?: boolean;
}

// scroll-following map: each stop section's scroll drives the leg
// coord_{prev} -> coord_{stop}, so while you read a section the car is
// animating in. the map is fully interactive; a user pan/zoom pauses the
// follow-cam, and scrolling the article glides the camera back onto the car.
export default function TripMap({
  cooperative = false,
  hud = "glyph",
  intro = false,
}: Props) {
  const route = useTripRoute();
  const containerRef = useRef<HTMLDivElement>(null);
  const glyphCarRef = useRef<SVGCircleElement>(null);
  const glyphTraveledRef = useRef<SVGPathElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  const glyph = useMemo(() => buildGlyph(route.polyline), [route]);

  useEffect(() => {
    if (!containerRef.current) return;

    const polyline = route.polyline;
    const stops = readStopsFromDom();
    if (stops.length === 0) return;

    let rafId: number | null = null;
    let following = true;
    // overview phase: camera parked on the whole route, no follow yet
    let introActive = intro;
    // first follow on a non-intro map snaps, so a mid-article load lands on
    // the car instead of gliding in from the initial view
    let snapNext = !intro;

    const handle: RouteMapHandle = createRouteMap({
      container: containerRef.current,
      polyline,
      waypoints: route.waypoints,
      view: intro
        ? {
            kind: "fit",
            coords: polyline,
            // extra bottom so bangalore + the car clear the attribution bar
            padding: { top: 20, right: 24, bottom: 56, left: 24 },
          }
        : { kind: "center", center: stops[0].coord, zoom: FOLLOW_ZOOM },
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
      if (introActive && idx >= INTRO_STOPS) introActive = false;
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
      if (following && !introActive) {
        handle.follow(carCoord, FOLLOW_ZOOM, snapNext);
        snapNext = false;
      }

      const trail: Coord[] = polyline.slice(0, floor + 1);
      trail.push(carCoord);
      handle.setTrail(trail);

      if (hud === "glyph") {
        updateGlyph(
          glyph,
          glyphCarRef.current,
          glyphTraveledRef.current,
          carCoord,
          floor,
        );
        if (titleRef.current) {
          titleRef.current.textContent = stops[idx].title || `stop ${idx + 1}`;
        }
        if (counterRef.current) {
          counterRef.current.textContent = `stop ${idx + 1} of ${stops.length}`;
        }
      }
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
  }, [route, glyph, cooperative, hud, intro]);

  return (
    <div ref={containerRef} className="relative h-full w-full">
      {hud === "glyph" && (
        <div className="pointer-events-none absolute left-3 top-3 z-20 flex items-center gap-2.5 rounded bg-white/90 px-2.5 py-1.5 font-sans shadow-sm backdrop-blur-sm">
          <RouteGlyph
            glyph={glyph}
            carRef={glyphCarRef}
            traveledRef={glyphTraveledRef}
            className="h-12 w-auto shrink-0"
          />
          <span className="min-w-0">
            <span
              ref={titleRef}
              className="block max-w-44 truncate text-xs font-medium text-foreground"
            >
              the route
            </span>
            <span ref={counterRef} className="block text-xs text-muted">
              stop - of -
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
