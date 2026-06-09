"use client";

import { useEffect, useRef, useState } from "react";

import maplibregl from "maplibre-gl";

import "maplibre-gl/dist/maplibre-gl.css";

import route from "./route.json";

const COLUMBIA_YELLOW = "#f0a044";

type Coord = [number, number];
const POLYLINE = route.polyline as Coord[];

const CAR_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 40 40" style="display:block;overflow:visible;">
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
  </g>
</svg>
`;

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

// walks DOM backward from this block's parent <Stop> to find the previous
// coord-bearing stop's <section>. returns null if this is the first.
function findPrevCoordStopSection(wrapperEl: Element | null): HTMLElement | null {
  if (!wrapperEl) return null;
  const myStop = wrapperEl.closest("[data-stop]");
  if (!myStop) return null;
  const all = Array.from(document.querySelectorAll<HTMLElement>("[data-stop]"));
  const idx = all.indexOf(myStop as HTMLElement);
  for (let j = idx - 1; j >= 0; j--) {
    const raw = all[j].dataset.stopCoord;
    if (!raw) continue;
    const [lng, lat] = raw.split(",").map(Number);
    if (Number.isFinite(lng) && Number.isFinite(lat)) return all[j];
  }
  return null;
}

function parseCoord(el: HTMLElement): Coord | null {
  const raw = el.dataset.stopCoord;
  if (!raw) return null;
  const [lng, lat] = raw.split(",").map(Number);
  return Number.isFinite(lng) && Number.isFinite(lat) ? [lng, lat] : null;
}

// progress within this section's own bounds. 0 at section top (car at prev
// coord), 1 at section bottom (car has arrived at this coord). naturally taller
// sections take more scroll px per unit of progress, so the car moves slower
// when there's more to read.
function sectionScrollProgress(section: HTMLElement): number {
  const vh = window.innerHeight;
  const center = vh / 2;
  const rect = section.getBoundingClientRect();
  const raw = (center - rect.top) / Math.max(1, rect.height);
  return Math.max(0, Math.min(1, raw));
}

interface Props {
  coord: Coord;
}

export default function StopMapBlock({ coord }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShouldMount(true);
            io.disconnect();
            return;
          }
        }
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(wrapperRef.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldMount || !containerRef.current) return;

    const wrapper = wrapperRef.current;
    const stopSection = wrapper?.closest("[data-stop]") as HTMLElement | null;
    // this section's scroll drives the leg coming IN to `coord` from the
    // previous coord-stop. if there's no prev (first stop), the car just
    // parks at `coord` and the block becomes a single-point view.
    const prevSection = findPrevCoordStopSection(wrapper);
    const prevCoord = prevSection ? parseCoord(prevSection) : null;
    const hasPrev = prevCoord !== null;
    const fromCoord = prevCoord ?? coord;
    const toCoord = coord;
    const fromIdx = nearestPolylineIndex(fromCoord);
    const toIdx = nearestPolylineIndex(toCoord);
    const direction = toIdx >= fromIdx ? 1 : -1;
    const legLen = Math.abs(toIdx - fromIdx);
    // bearing lookahead: scale to leg length so short legs don't overshoot the
    // whole route. min 2 points to avoid jitter, max 8 so we don't ignore turns.
    const BEARING_LOOKAHEAD = Math.min(8, Math.max(2, Math.floor(legLen / 6)));

    const lo = Math.min(fromIdx, toIdx);
    const hi = Math.max(fromIdx, toIdx);
    const legPolyline = POLYLINE.slice(lo, hi + 1);

    // first-stop case (no prev): legLen is 0, so just center on the coord.
    // otherwise fit the whole leg with padding so the route stays in view.
    const mapOptions: maplibregl.MapOptions = hasPrev
      ? (() => {
          const bounds = new maplibregl.LngLatBounds(fromCoord, fromCoord);
          bounds.extend(toCoord);
          for (const c of legPolyline) bounds.extend(c);
          return {
            container: containerRef.current,
            style: "https://tiles.openfreemap.org/styles/liberty",
            bounds,
            fitBoundsOptions: { padding: 40 },
            interactive: false,
            attributionControl: { compact: true },
          };
        })()
      : {
          container: containerRef.current,
          style: "https://tiles.openfreemap.org/styles/liberty",
          center: coord,
          zoom: 9,
          interactive: false,
          attributionControl: { compact: true },
        };

    const map = new maplibregl.Map(mapOptions);

    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);

    let carMarker: maplibregl.Marker | null = null;
    let carInnerEl: HTMLElement | null = null;
    let mapLoaded = false;
    let rafId: number | null = null;

    function applyBearing(deg: number) {
      if (carInnerEl) carInnerEl.style.transform = `rotate(${deg}deg)`;
    }

    function updateForProgress(p: number) {
      if (!mapLoaded) return;
      const exact = fromIdx + direction * (p * legLen);
      const floor = Math.floor(exact);
      const ceil = Math.min(POLYLINE.length - 1, Math.max(0, floor + direction));
      const frac = direction > 0 ? exact - floor : floor - exact;
      const a = POLYLINE[floor];
      const b = POLYLINE[ceil];
      const carCoord: Coord = [
        a[0] + (b[0] - a[0]) * frac,
        a[1] + (b[1] - a[1]) * frac,
      ];

      carMarker?.setLngLat(carCoord);
      if (hasPrev && legLen > 0) {
        const aheadIdx = Math.max(
          0,
          Math.min(POLYLINE.length - 1, floor + direction * BEARING_LOOKAHEAD),
        );
        const ahead = POLYLINE[aheadIdx];
        if (ahead[0] !== a[0] || ahead[1] !== a[1]) {
          applyBearing(bearingDeg(a, ahead));
        }
      }

      // trail: from-end of the leg up to the car
      let trail: Coord[];
      if (direction > 0) {
        trail = POLYLINE.slice(fromIdx, floor + 1);
        trail.push(carCoord);
      } else {
        trail = POLYLINE.slice(floor, fromIdx + 1);
        trail.unshift(carCoord);
      }
      const src = map.getSource("traveled") as
        | maplibregl.GeoJSONSource
        | undefined;
      src?.setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: trail.length > 1 ? trail : [carCoord, carCoord],
        },
      });
    }

    map.on("load", () => {
      // dim base of just this leg
      map.addSource("leg", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: legPolyline },
        },
      });
      map.addLayer({
        id: "leg-halo",
        type: "line",
        source: "leg",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#fff", "line-width": 5, "line-opacity": 0.55 },
      });
      map.addLayer({
        id: "leg-line",
        type: "line",
        source: "leg",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": COLUMBIA_YELLOW,
          "line-width": 2,
          "line-opacity": 0.4,
        },
      });

      // bright traveled portion (grows as the car moves)
      map.addSource("traveled", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: [fromCoord, fromCoord] },
        },
      });
      map.addLayer({
        id: "traveled-line",
        type: "line",
        source: "traveled",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": COLUMBIA_YELLOW, "line-width": 4 },
      });

      const carEl = document.createElement("div");
      carEl.innerHTML = CAR_SVG.trim();
      carInnerEl = carEl.querySelector<HTMLElement>("[data-bearing]");
      carMarker = new maplibregl.Marker({ element: carEl, anchor: "center" })
        .setLngLat(fromCoord)
        .addTo(map);
      if (hasPrev) applyBearing(bearingDeg(fromCoord, toCoord));

      mapLoaded = true;
      updateForProgress(stopSection ? sectionScrollProgress(stopSection) : 0);
    });

    function onScroll() {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        updateForProgress(stopSection ? sectionScrollProgress(stopSection) : 0);
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      resizeObserver.disconnect();
      map.remove();
    };
  }, [shouldMount, coord]);

  return (
    <div
      ref={wrapperRef}
      className="not-prose my-8 h-[32vh] w-full overflow-hidden rounded-lg border border-line bg-surface-subtle xl:hidden"
    >
      {shouldMount ? (
        <div ref={containerRef} className="h-full w-full" />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-sans text-sm text-muted">
          loading map...
        </div>
      )}
    </div>
  );
}
