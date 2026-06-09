"use client";

import { useEffect, useRef } from "react";

import maplibregl from "maplibre-gl";

import "maplibre-gl/dist/maplibre-gl.css";

import route from "./route.json";

const COLUMBIA_YELLOW = "#f0a044";
const FOREGROUND = "#1e293b";

// white kia seltos top-down. inner <g data-bearing> is rotated to face direction of travel.
const CAR_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" style="display:block;overflow:visible;">
  <g data-bearing style="transform-origin:center;transform-box:fill-box;filter:drop-shadow(0 2px 3px rgba(0,0,0,0.3));">
    <rect x="6" y="14" width="2.5" height="4" rx="0.5" fill="#1e293b"/>
    <rect x="31.5" y="14" width="2.5" height="4" rx="0.5" fill="#1e293b"/>
    <rect x="6" y="22" width="2.5" height="4" rx="0.5" fill="#1e293b"/>
    <rect x="31.5" y="22" width="2.5" height="4" rx="0.5" fill="#1e293b"/>
    <rect x="8" y="9" width="24" height="22" rx="4" fill="#f5f5f5" stroke="#c0c4c8" stroke-width="0.6"/>
    <rect x="10.5" y="13" width="19" height="14" rx="2.5" fill="#eaeaea" stroke="#c0c4c8" stroke-width="0.4"/>
    <rect x="10.5" y="13" width="19" height="3.5" fill="#7a8995" opacity="0.65"/>
    <rect x="10.5" y="23.5" width="19" height="3.5" fill="#7a8995" opacity="0.5"/>
    <rect x="10" y="14" width="0.6" height="12" fill="#888"/>
    <rect x="29.4" y="14" width="0.6" height="12" fill="#888"/>
    <rect x="19" y="9" width="2" height="3" rx="0.3" fill="#d8d8d8"/>
    <rect x="19" y="28" width="2" height="3" rx="0.3" fill="#d8d8d8"/>
  </g>
</svg>
`;

type Coord = [number, number];
type StopEntry = { el: HTMLElement; coord: Coord; polyIdx: number };

const POLYLINE = route.polyline as Coord[];
const TOTAL_KM = route.distance_km;

function haversineKm(a: Coord, b: Coord): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const sa = Math.sin(dLat / 2);
  const sn = Math.sin(dLng / 2);
  const x =
    sa * sa + Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * sn * sn;
  return 2 * R * Math.asin(Math.sqrt(x));
}

const CUM_KM = (() => {
  const arr = new Float32Array(POLYLINE.length);
  for (let i = 1; i < POLYLINE.length; i++) {
    arr[i] = arr[i - 1] + haversineKm(POLYLINE[i - 1], POLYLINE[i]);
  }
  const rawTotal = arr[arr.length - 1];
  const scale = TOTAL_KM / rawTotal;
  for (let i = 0; i < arr.length; i++) arr[i] *= scale;
  return arr;
})();

function formatKm(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

function bearingDeg(from: Coord, to: Coord): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const lat1 = toRad(from[1]);
  const lat2 = toRad(to[1]);
  const dLng = toRad(to[0] - from[0]);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

function nearestPolylineIndex(target: Coord): number {
  let bestIdx = 0;
  let bestD = Infinity;
  for (let i = 0; i < POLYLINE.length; i++) {
    const dx = POLYLINE[i][0] - target[0];
    const dy = POLYLINE[i][1] - target[1];
    const d = dx * dx + dy * dy;
    if (d < bestD) {
      bestD = d;
      bestIdx = i;
    }
  }
  return bestIdx;
}

function readStopsFromDom(): StopEntry[] {
  const out: StopEntry[] = [];
  document.querySelectorAll<HTMLElement>("[data-stop]").forEach((el) => {
    const raw = el.dataset.stopCoord;
    if (!raw) return;
    const [lng, lat] = raw.split(",").map(Number);
    if (Number.isFinite(lng) && Number.isFinite(lat)) {
      const coord: Coord = [lng, lat];
      out.push({ el, coord, polyIdx: nearestPolylineIndex(coord) });
    }
  });
  return out;
}

// each section A's scroll drives the leg coord_{prev} -> coord_A (so the
// section is "about arriving at A"). progress is 0 at A's top (car still at
// prev) and 1 at A's bottom (car has arrived at A). budget = section A's own
// height: while you read A, the car is animating in.
//
// first stop has no prev, so it parks the car at coord_0 throughout.
function locateScroll(stops: StopEntry[]): { idx: number; progress: number } {
  if (stops.length === 0) return { idx: 0, progress: 0 };
  const vh = window.innerHeight;
  const center = vh / 2;
  const rects = stops.map((s) => s.el.getBoundingClientRect());

  if (rects[0].top > center) return { idx: 0, progress: 0 };

  let idx = 0;
  for (let i = 0; i < stops.length; i++) {
    if (rects[i].top <= center) idx = i;
  }

  const rect = rects[idx];
  const raw = (center - rect.top) / Math.max(1, rect.height);
  return { idx, progress: Math.max(0, Math.min(1, raw)) };
}

export default function TripMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const kmRef = useRef<HTMLSpanElement>(null);
  const stopRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const stops = readStopsFromDom();
    if (stops.length === 0) return;

    const FOLLOW_ZOOM = 6;
    // bearing looks this many polyline points ahead so the car points at the
    // macro direction of travel instead of jittering with every road kink.
    const BEARING_LOOKAHEAD = 10;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: stops[0].coord,
      zoom: FOLLOW_ZOOM,
      interactive: false,
      attributionControl: { compact: true },
    });

    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);

    let carMarker: maplibregl.Marker | null = null;
    let carInnerEl: HTMLElement | null = null;
    let mapLoaded = false;
    let rafId: number | null = null;

    function applyBearing(deg: number) {
      if (carInnerEl) carInnerEl.style.transform = `rotate(${deg}deg)`;
    }

    function setTraveled(uptoFloor: number, carCoord: Coord) {
      const base = POLYLINE.slice(0, uptoFloor + 1);
      base.push(carCoord);
      const src = map.getSource("route-traveled") as
        | maplibregl.GeoJSONSource
        | undefined;
      src?.setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: base.length > 1 ? base : [POLYLINE[0], POLYLINE[0]],
        },
      });
    }

    function tickScroll() {
      rafId = null;
      if (!mapLoaded) return;

      const { idx, progress } = locateScroll(stops);
      // section idx's scroll animates car from stops[idx-1] (prev) into stops[idx].
      // first stop has no prev, so it parks at coord_0 (from=to=0).
      const fromIdx = idx === 0 ? stops[0].polyIdx : stops[idx - 1].polyIdx;
      const toIdx = stops[idx].polyIdx;

      const direction = toIdx >= fromIdx ? 1 : -1;
      const legLen = Math.abs(toIdx - fromIdx);
      const exact = fromIdx + direction * (progress * legLen);
      const floor = Math.floor(exact);
      const next = Math.min(
        POLYLINE.length - 1,
        Math.max(0, floor + (direction >= 0 ? 1 : -1)),
      );
      const frac = direction > 0 ? exact - floor : floor - exact;
      const a = POLYLINE[floor];
      const b = POLYLINE[next];
      const carCoord: Coord = [
        a[0] + (b[0] - a[0]) * frac,
        a[1] + (b[1] - a[1]) * frac,
      ];

      carMarker?.setLngLat(carCoord);

      // bearing: look further ahead along the polyline so the car points at
      // the broad direction of travel, not the next 6km kink.
      if (legLen > 0) {
        const aheadIdx = Math.max(
          0,
          Math.min(POLYLINE.length - 1, floor + direction * BEARING_LOOKAHEAD),
        );
        const ahead = POLYLINE[aheadIdx];
        if (ahead[0] !== a[0] || ahead[1] !== a[1]) {
          applyBearing(bearingDeg(a, ahead));
        }
      }

      map.jumpTo({ center: carCoord, zoom: FOLLOW_ZOOM });
      setTraveled(floor, carCoord);

      if (kmRef.current) {
        const km = CUM_KM[Math.max(0, Math.min(POLYLINE.length - 1, floor))];
        kmRef.current.textContent = `${formatKm(km)} / ${formatKm(TOTAL_KM)} km`;
      }
      if (stopRef.current) {
        stopRef.current.textContent = `stop ${idx + 1} of ${stops.length}`;
      }
    }

    function onScroll() {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(tickScroll);
    }

    map.on("load", () => {
      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: POLYLINE },
        },
      });
      map.addLayer({
        id: "route-halo",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#fff", "line-width": 6, "line-opacity": 0.55 },
      });
      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": COLUMBIA_YELLOW,
          "line-width": 2.5,
          "line-opacity": 0.4,
        },
      });

      map.addSource("route-traveled", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [stops[0].coord, stops[0].coord],
          },
        },
      });
      map.addLayer({
        id: "route-traveled-line",
        type: "line",
        source: "route-traveled",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": COLUMBIA_YELLOW, "line-width": 4 },
      });

      // city waypoint dots
      map.addSource("waypoints", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: route.waypoints.map((w, i) => ({
            type: "Feature",
            properties: { name: w.name, idx: i },
            geometry: { type: "Point", coordinates: w.coord },
          })),
        },
      });
      map.addLayer({
        id: "waypoints-dot",
        type: "circle",
        source: "waypoints",
        paint: {
          "circle-radius": 3,
          "circle-color": "#fff",
          "circle-stroke-color": FOREGROUND,
          "circle-stroke-width": 1.2,
        },
      });

      const carEl = document.createElement("div");
      carEl.innerHTML = CAR_SVG.trim();
      carInnerEl = carEl.querySelector<HTMLElement>("[data-bearing]");
      carMarker = new maplibregl.Marker({ element: carEl, anchor: "center" })
        .setLngLat(stops[0].coord)
        .addTo(map);
      if (stops.length > 1) {
        applyBearing(bearingDeg(stops[0].coord, stops[1].coord));
      }

      mapLoaded = true;
      tickScroll();
    });

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      resizeObserver.disconnect();
      map.remove();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <div className="pointer-events-none absolute left-3 top-3 z-20 flex items-center gap-2 rounded bg-white/90 px-2.5 py-1 font-sans text-xs font-medium text-foreground shadow-sm backdrop-blur-sm">
        <span ref={kmRef}>0 / {formatKm(TOTAL_KM)} km</span>
        <span className="text-subtle">·</span>
        <span ref={stopRef}>stop -</span>
      </div>
    </div>
  );
}
