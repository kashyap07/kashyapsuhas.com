// pure math + dom helpers shared by TripMap (sidebar) and StopMapBlock (inline).
// client-side only callers, but the module itself is import-safe anywhere.
import type { Coord } from "./types";

const toRad = (d: number) => (d * Math.PI) / 180;

export function bearingDeg(from: Coord, to: Coord): number {
  const lat1 = toRad(from[1]);
  const lat2 = toRad(to[1]);
  const dLng = toRad(to[0] - from[0]);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

// interpolated position along the leg fromIdx -> toIdx at progress p in [0,1].
// floor is the last whole polyline index passed (used for trail + bearing).
export function pointAlongLeg(
  polyline: Coord[],
  fromIdx: number,
  toIdx: number,
  p: number,
): { coord: Coord; floor: number; direction: 1 | -1 } {
  const direction: 1 | -1 = toIdx >= fromIdx ? 1 : -1;
  const legLen = Math.abs(toIdx - fromIdx);
  const exact = fromIdx + direction * (p * legLen);
  const floor = Math.max(0, Math.min(polyline.length - 1, Math.floor(exact)));
  const next = Math.min(polyline.length - 1, floor + 1);
  const frac = exact - floor;
  const a = polyline[floor];
  const b = polyline[next];
  return {
    coord: [a[0] + (b[0] - a[0]) * frac, a[1] + (b[1] - a[1]) * frac],
    floor,
    direction,
  };
}

// car arrives at the stop once this fraction of the section has scrolled by,
// then rests there for the remainder. arriving exactly at the section
// boundary (1.0) would mean the car never visibly sits at the stop you're
// reading: the next section takes over at that same instant.
const ARRIVAL_FRACTION = 0.9;

export function arrivalProgress(raw: number): number {
  return Math.min(1, raw / ARRIVAL_FRACTION);
}

// "near the start" window (prep + day 0): the trip map holds its whole-route
// overview while idx < INTRO_STOPS, then dives the camera down to the car. a
// deep-link past these stops skips the overview straight to the car.
export const INTRO_STOPS = 2;

export type StopEntry = {
  el: HTMLElement;
  coord: Coord;
  polyIdx: number;
  title: string;
};

// server-rendered <Stop> sections carry their waypoint coord + exact polyline
// index as data attributes; the client maps read them back here instead of
// needing the mdx tree or any nearest-point matching.
export function readStopsFromDom(): StopEntry[] {
  const out: StopEntry[] = [];
  document.querySelectorAll<HTMLElement>("[data-stop]").forEach((el) => {
    const rawCoord = el.dataset.stopCoord;
    const rawIdx = el.dataset.stopIdx;
    if (!rawCoord || !rawIdx) return;
    const [lng, lat] = rawCoord.split(",").map(Number);
    const polyIdx = Number(rawIdx);
    if (
      Number.isFinite(lng) &&
      Number.isFinite(lat) &&
      Number.isInteger(polyIdx)
    ) {
      out.push({
        el,
        coord: [lng, lat],
        polyIdx,
        title: el.dataset.stopTitle ?? "",
      });
    }
  });
  return out;
}

// progress within a section's own bounds. 0 at section top (car at prev
// coord), 1 at section bottom (car has arrived). taller sections take more
// scroll px per unit of progress, so the car moves slower with more to read.
export function sectionScrollProgress(section: HTMLElement): number {
  const center = window.innerHeight / 2;
  const rect = section.getBoundingClientRect();
  const raw = (center - rect.top) / Math.max(1, rect.height);
  return Math.max(0, Math.min(1, raw));
}

// which stop section currently owns the viewport center, plus progress
// through it. section idx's scroll drives the leg coord_{idx-1} -> coord_idx.
export function locateScroll(stops: StopEntry[]): {
  idx: number;
  progress: number;
} {
  if (stops.length === 0) return { idx: 0, progress: 0 };
  const center = window.innerHeight / 2;
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
