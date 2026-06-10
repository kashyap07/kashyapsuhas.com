// thin wrapper around maplibre that owns the shared "route + car + trail"
// setup used by both the sidebar map and the inline per-stop maps.
// import this lazily (dynamic import) so maplibre only loads when a map
// actually mounts.
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import type { Coord, Waypoint } from "./types";

const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

// map colors track the design tokens instead of hardcoding hex twice
// (--columbiaYellow already changed once; maps shouldn't drift out of sync).
function cssVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return v || fallback;
}

// white kia seltos top-down, facing north. inner <g data-bearing> rotates to
// face travel. suv stance: blunt liftgate, greenhouse tapers rearward, small
// sunroof, black tailgate (glass + spoiler read as one dark mass from above).
const carSvg = (size: number) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 40 40" style="display:block;overflow:visible;">
  <g data-bearing="" style="filter: drop-shadow(rgba(0, 0, 0, 0.35) 0px 2px 3px); transform-box: fill-box; transform-origin: 50% 50%;" transform="matrix(1, 0, 0, 1, 421.170258, 297.20285)">
    <rect x="12.3" y="7.4" width="1.6" height="4.8" rx="0.8" fill="#23272b"></rect>
    <rect x="26.1" y="7.4" width="1.6" height="4.8" rx="0.8" fill="#23272b"></rect>
    <rect x="12.3" y="25.8" width="1.6" height="4.8" rx="0.8" fill="#23272b"></rect>
    <rect x="26.1" y="25.8" width="1.6" height="4.8" rx="0.8" fill="#23272b"></rect>
    <g transform="rotate(-18 12.4 13.45)">
      <rect x="11.3" y="12.7" width="2.2" height="1.5" rx="0.7" fill="#eceeef" stroke="#b9bec4" stroke-width="0.4"></rect>
    </g>
    <g transform="rotate(18 27.6 13.45)">
      <rect x="26.5" y="12.7" width="2.2" height="1.5" rx="0.7" fill="#eceeef" stroke="#b9bec4" stroke-width="0.4"></rect>
    </g>
    <path d="M 19.983 4 C 16.578 4 14.571 4.862 14.192 7.215 C 13.53 9.469 13.456 11.057 13.456 13.018 L 13.456 31.445 C 13.456 32.817 13.929 33.406 15.158 33.504 C 16.766 33.602 18.47 33.651 19.983 33.651 C 21.496 33.651 23.2 33.602 24.809 33.504 C 26.038 33.406 26.511 32.817 26.511 31.445 L 26.511 13.018 C 26.511 11.057 26.545 9.489 25.883 7.235 C 25.505 4.882 23.389 4 19.983 4 Z" fill="#f7f8f8" stroke="#c3c8cc" stroke-width="0.5"></path>
    <path d="M16.6 6.2 C 16 8, 15.7 9.6, 15.6 11.4 M23.4 6.2 C 24 8, 24.3 9.6, 24.4 11.4" stroke="#e3e6e8" stroke-width="0.5" fill="none"></path>
    <path d="M14.6 12.3 C 17.2 11.8, 22.8 11.8, 25.4 12.3 C 25.2 13.9, 25 15.1, 24.7 16 C 21.6 15.5, 18.4 15.5, 15.3 16 C 15 15.1, 14.8 13.9, 14.6 12.3 Z" fill="#171b1f"></path>
    <path d="M15.8 15.6 C 17.6 15, 19.4 14.5, 21 14.3 M21.8 15.5 C 23.1 15.1, 24.2 14.7, 25 14.3" stroke="#20262b" stroke-width="0.4" fill="none"></path>
    <g transform="rotate(-2 14.5 14)">
      <rect x="13.744" y="15.994" width="1.2" height="14" rx="0.6" fill="#454d54"></rect>
    </g>
    <g transform="rotate(2 25.5 14)">
      <rect x="25.056" y="15.994" width="1.2" height="14" rx="0.6" fill="#454d54"></rect>
    </g>
    <g transform="rotate(-2 15.65 14.8)">
      <rect x="15.154" y="16.794" width="0.7" height="12" rx="0.35" fill="#aab3bb"></rect>
    </g>
    <g transform="rotate(2 24.35 14.8)">
      <rect x="24.146" y="16.794" width="0.7" height="12" rx="0.35" fill="#aab3bb"></rect>
    </g>
    <rect x="16.4" y="16.9" width="7.2" height="4.6" rx="1.1" fill="#0d1013"></rect>
    <rect x="16.9" y="17.4" width="6.2" height="3.6" rx="0.8" fill="none" stroke="#343c44" stroke-width="0.4"></rect>
    <path d="M20 26.9 C 20.5 27.3, 20.7 27.7, 20.7 28.1 L 19.3 28.1 C 19.3 27.7, 19.5 27.3, 20 26.9 Z" fill="#1c2126"></path>
    <path d="M 14.7 29.3 C 17.6 30, 22.4 30, 25.3 29.3 C 25.7 29.5, 25.9 29.9, 25.9 30.6 L 25.9 31.4 C 25.9 32.6, 25.5 33.15, 24.5 33.25 C 23 33.37, 21.3 33.42, 20 33.42 C 18.7 33.42, 17 33.37, 15.5 33.25 C 14.5 33.15, 14.1 32.6, 14.1 31.4 L 14.1 30.6 C 14.1 29.9, 14.3 29.5, 14.7 29.3 Z" fill="#15191d"></path>
  </g>
</svg>
`;

type View =
  | { kind: "center"; center: Coord; zoom: number }
  | { kind: "fit"; coords: Coord[]; padding: number };

export interface RouteMapHandle {
  setCar(coord: Coord, bearing?: number): void;
  setTrail(coords: Coord[]): void;
  jumpTo(center: Coord, zoom: number): void;
  destroy(): void;
}

interface Options {
  container: HTMLElement;
  // dim base line (full route for the sidebar, just the leg for stop maps)
  polyline: Coord[];
  // optional city dots
  waypoints?: Waypoint[];
  view: View;
  carSize?: number;
  // fires once layers exist; do initial setCar/setTrail positioning here
  onReady?: () => void;
}

function lineFeature(coords: Coord[]): GeoJSON.Feature {
  return {
    type: "Feature",
    properties: {},
    geometry: { type: "LineString", coordinates: coords },
  };
}

export function createRouteMap(opts: Options): RouteMapHandle {
  const accent = cssVar("--columbiaYellow", "#f0a044");
  const foreground = cssVar("--foreground", "#1e293b");

  const base: Partial<maplibregl.MapOptions> = {
    container: opts.container,
    style: STYLE_URL,
    interactive: false,
    attributionControl: { compact: true },
  };

  let mapOptions: maplibregl.MapOptions;
  if (opts.view.kind === "fit") {
    const coords = opts.view.coords;
    const bounds = new maplibregl.LngLatBounds(coords[0], coords[0]);
    for (const c of coords) bounds.extend(c);
    mapOptions = {
      ...base,
      bounds,
      fitBoundsOptions: { padding: opts.view.padding },
    } as maplibregl.MapOptions;
  } else {
    mapOptions = {
      ...base,
      center: opts.view.center,
      zoom: opts.view.zoom,
    } as maplibregl.MapOptions;
  }

  const map = new maplibregl.Map(mapOptions);

  const resizeObserver = new ResizeObserver(() => map.resize());
  resizeObserver.observe(opts.container);

  // markers are dom overlays, safe to add before the style loads
  const carEl = document.createElement("div");
  carEl.innerHTML = carSvg(opts.carSize ?? 40).trim();
  const carInner = carEl.querySelector<HTMLElement>("[data-bearing]");
  const carMarker = new maplibregl.Marker({ element: carEl, anchor: "center" })
    .setLngLat(opts.polyline[0])
    .addTo(map);

  let loaded = false;
  let pendingTrail: Coord[] | null = null;

  function applyTrail(coords: Coord[]) {
    const src = map.getSource("traveled") as
      | maplibregl.GeoJSONSource
      | undefined;
    src?.setData(
      lineFeature(coords.length > 1 ? coords : [coords[0], coords[0]]),
    );
  }

  map.on("load", () => {
    map.addSource("route-base", {
      type: "geojson",
      data: lineFeature(opts.polyline),
    });
    map.addLayer({
      id: "route-halo",
      type: "line",
      source: "route-base",
      layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-color": "#fff", "line-width": 6, "line-opacity": 0.55 },
    });
    map.addLayer({
      id: "route-line",
      type: "line",
      source: "route-base",
      layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-color": accent, "line-width": 2.5, "line-opacity": 0.4 },
    });

    // bright traveled portion, grows as the car moves
    map.addSource("traveled", {
      type: "geojson",
      data: lineFeature([opts.polyline[0], opts.polyline[0]]),
    });
    map.addLayer({
      id: "traveled-line",
      type: "line",
      source: "traveled",
      layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-color": accent, "line-width": 4 },
    });

    if (opts.waypoints?.length) {
      map.addSource("waypoints", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: opts.waypoints.map((w, i) => ({
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
          "circle-stroke-color": foreground,
          "circle-stroke-width": 1.2,
        },
      });
    }

    loaded = true;
    if (pendingTrail) {
      applyTrail(pendingTrail);
      pendingTrail = null;
    }
    opts.onReady?.();
  });

  return {
    setCar(coord, bearing) {
      carMarker.setLngLat(coord);
      if (bearing !== undefined && carInner) {
        carInner.style.transform = `rotate(${bearing}deg)`;
      }
    },
    setTrail(coords) {
      if (!loaded) {
        pendingTrail = coords;
        return;
      }
      applyTrail(coords);
    },
    jumpTo(center, zoom) {
      map.jumpTo({ center, zoom });
    },
    destroy() {
      resizeObserver.disconnect();
      map.remove();
    },
  };
}
