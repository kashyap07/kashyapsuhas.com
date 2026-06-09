// build-trip-route.mjs
//
// hits the public OSRM demo server for each consecutive pair of waypoints,
// merges the polylines into a single linestring, and writes the result to
// src/components/mdx/gj-rj/route.json. one-time generation; commit the output.
//
// run: npm run build-trip-route

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_PATH = path.join(ROOT, "src/components/mdx/gj-rj/route.json");

// trip waypoints in driving order. coords are [lng, lat].
// real trip went through these cities roughly; refine as needed.
const WAYPOINTS = [
  { name: "Bangalore", coord: [77.5946, 12.9716] },
  { name: "Belgaum", coord: [74.4977, 15.8497] },
  { name: "Pune", coord: [73.8567, 18.5204] },
  { name: "Vadodara", coord: [73.1812, 22.3072] },
  { name: "Ahmedabad", coord: [72.5862, 23.0205] },
  { name: "Udaipur", coord: [73.6839, 24.5771] },
  { name: "Jodhpur", coord: [73.0243, 26.2389] },
];

const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";

// douglas-peucker tolerance in degrees. ~500m at this latitude.
// at sidebar zoom (z=6, ~850m/px) this is sub-pixel error; no visible loss.
const SIMPLIFY_EPSILON = 0.005;

// perpendicular distance from p to segment ab (treats lng/lat as cartesian;
// fine for our error budget).
function perpDistance(p, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  if (dx === 0 && dy === 0) {
    return Math.hypot(p[0] - a[0], p[1] - a[1]);
  }
  const t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy);
  const tc = Math.max(0, Math.min(1, t));
  return Math.hypot(p[0] - (a[0] + tc * dx), p[1] - (a[1] + tc * dy));
}

// iterative douglas-peucker to avoid deep recursion on long polylines.
function simplify(points, epsilon) {
  if (points.length <= 2) return points.slice();
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [lo, hi] = stack.pop();
    let dmax = 0;
    let idx = -1;
    for (let i = lo + 1; i < hi; i++) {
      const d = perpDistance(points[i], points[lo], points[hi]);
      if (d > dmax) {
        dmax = d;
        idx = i;
      }
    }
    if (idx !== -1 && dmax > epsilon) {
      keep[idx] = 1;
      stack.push([lo, idx], [idx, hi]);
    }
  }
  const out = [];
  for (let i = 0; i < points.length; i++) if (keep[i]) out.push(points[i]);
  return out;
}

async function fetchLeg(from, to) {
  const url = `${OSRM_BASE}/${from.join(",")};${to.join(",")}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`http ${res.status} from osrm`);
  const data = await res.json();
  if (data.code !== "Ok")
    throw new Error(`osrm: ${data.code} - ${data.message ?? ""}`);
  return {
    polyline: data.routes[0].geometry.coordinates,
    distance_m: data.routes[0].distance,
    duration_s: data.routes[0].duration,
  };
}

async function main() {
  const legs = [];
  let totalDist = 0;
  let totalDur = 0;

  for (let i = 0; i < WAYPOINTS.length - 1; i++) {
    const a = WAYPOINTS[i];
    const b = WAYPOINTS[i + 1];
    process.stdout.write(`  ${a.name} -> ${b.name} ... `);
    const leg = await fetchLeg(a.coord, b.coord);
    const km = Math.round(leg.distance_m / 1000);
    const h = (leg.duration_s / 3600).toFixed(1);
    console.log(`${km}km / ~${h}h, ${leg.polyline.length} points`);
    legs.push({
      from: a.name,
      to: b.name,
      from_coord: a.coord,
      to_coord: b.coord,
      distance_km: km,
      duration_h: parseFloat(h),
      polyline: leg.polyline,
    });
    totalDist += leg.distance_m;
    totalDur += leg.duration_s;
    // be polite to the public demo server
    await new Promise((r) => setTimeout(r, 200));
  }

  // merged polyline: concat legs, drop the duplicate join point between legs
  const merged = [];
  for (let i = 0; i < legs.length; i++) {
    const pts = legs[i].polyline;
    if (i === 0) merged.push(...pts);
    else merged.push(...pts.slice(1));
  }

  const simplified = simplify(merged, SIMPLIFY_EPSILON);
  const reduction = Math.round((1 - simplified.length / merged.length) * 100);
  console.log(
    `\nsimplified ${merged.length} -> ${simplified.length} points (${reduction}% reduction)`,
  );

  const output = {
    waypoints: WAYPOINTS,
    distance_km: Math.round(totalDist / 1000),
    duration_h: parseFloat((totalDur / 3600).toFixed(1)),
    point_count: simplified.length,
    polyline: simplified,
    legs: legs.map(({ polyline, ...rest }) => rest), // strip polylines from legs (kept in merged)
  };

  await fs.writeFile(OUT_PATH, JSON.stringify(output, null, 2) + "\n");
  const sizeKB = Math.round(JSON.stringify(output).length / 1024);
  console.log(
    `\nwrote ${path.relative(ROOT, OUT_PATH)} - ${output.distance_km}km, ${output.point_count} points, ${sizeKB}KB`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
