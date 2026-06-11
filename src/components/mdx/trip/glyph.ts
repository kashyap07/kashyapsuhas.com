// tiny svg projection of the route polyline, shared by the mobile ribbon and
// the desktop sidebar hud. hosts own the refs and drive updates from their
// scroll ticks via updateGlyph.
import type { Coord } from "./types";

// keep the inline svg small: the glyph doesn't need every road kink
const MAX_GLYPH_POINTS = 240;
export const GLYPH_HEIGHT = 100;

export type Glyph = {
  d: string;
  width: number;
  height: number;
  stride: number;
  cum: Float32Array;
  total: number;
  px: (c: Coord) => [number, number];
  start: [number, number];
};

// equirectangular with latitude correction; height fixed, width follows the
// route's real aspect ratio.
export function buildGlyph(polyline: Coord[]): Glyph {
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

  return {
    d,
    width,
    height: GLYPH_HEIGHT,
    stride,
    cum,
    total: cum[cum.length - 1],
    px,
    start: proj[0],
  };
}

export function updateGlyph(
  glyph: Glyph,
  car: SVGCircleElement | null,
  traveled: SVGPathElement | null,
  coord: Coord,
  floor: number,
) {
  if (car) {
    const [x, y] = glyph.px(coord);
    car.setAttribute("cx", x.toFixed(1));
    car.setAttribute("cy", y.toFixed(1));
  }
  if (traveled) {
    const gi = Math.min(glyph.cum.length - 1, Math.round(floor / glyph.stride));
    traveled.style.strokeDashoffset = String(
      Math.max(0, glyph.total - glyph.cum[gi]),
    );
  }
}
