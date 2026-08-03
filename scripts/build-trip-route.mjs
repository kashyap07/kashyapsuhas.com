// build-trip-route.mjs
//
// reads driving-order waypoints from content/trips/<trip>/waypoints.json
// ([{ id, name, coord: [lng, lat] }]), hits the public OSRM demo server for
// each consecutive pair, merges the polylines into a single linestring, and
// writes content/trips/<trip>/route.json. one-time generation; commit it.
//
// each output waypoint carries `polyIdx`, its exact index into the merged
// polyline (legs are simplified individually so join points survive). <Stop>
// anchors to waypoints by id, so no client-side nearest-point matching.
//
// an entry marked `"via": true` is a shaping point, not a place: osrm is
// routed through it so the line follows the road actually driven (osrm picks
// the *fastest* path, which isn't always the one you took), but it's left out
// of route.json entirely - no map dot, no <Stop> anchor - and the hops either
// side of it collapse into one leg. `name` is optional on those.
//
// run: npm run build-trip-route [-- <trip-slug>]   (default: gj-rj)
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const TRIP = process.argv[2] ?? "gj-rj";
const TRIP_DIR = path.join(ROOT, `content/trips/${TRIP}`);
const WAYPOINTS_PATH = path.join(TRIP_DIR, "waypoints.json");
const OUT_PATH = path.join(TRIP_DIR, "route.json");

const WAYPOINTS = JSON.parse(await fs.readFile(WAYPOINTS_PATH, "utf-8"));
for (const w of WAYPOINTS) {
  if (!w.id || !Array.isArray(w.coord) || (!w.name && !w.via)) {
    throw new Error(
      `bad waypoint (needs id, coord, and name unless via): ${JSON.stringify(w)}`,
    );
  }
}
if (WAYPOINTS.at(0)?.via || WAYPOINTS.at(-1)?.via) {
  throw new Error("first and last waypoint can't be via points");
}

// vias have no name; fall back to the id for console output only
const label = (w) => w.name ?? `${w.id} (via)`;

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
    process.stdout.write(`  ${label(a)} -> ${label(b)} ... `);
    const leg = await fetchLeg(a.coord, b.coord);
    const km = Math.round(leg.distance_m / 1000);
    const h = (leg.duration_s / 3600).toFixed(1);
    console.log(`${km}km / ~${h}h, ${leg.polyline.length} points`);
    legs.push({
      distance_m: leg.distance_m,
      duration_s: leg.duration_s,
      polyline: leg.polyline,
    });
    totalDist += leg.distance_m;
    totalDur += leg.duration_s;
    // be polite to the public demo server
    await new Promise((r) => setTimeout(r, 200));
  }

  // simplify per leg (endpoints always survive douglas-peucker), then merge
  // dropping the duplicate join point. tracking merged length at each join
  // gives every waypoint its exact polyline index.
  let rawCount = 0;
  const merged = [];
  const polyIdxByWaypoint = [0];
  for (let i = 0; i < legs.length; i++) {
    rawCount += legs[i].polyline.length;
    const pts = simplify(legs[i].polyline, SIMPLIFY_EPSILON);
    if (i === 0) merged.push(...pts);
    else merged.push(...pts.slice(1));
    polyIdxByWaypoint.push(merged.length - 1);
  }
  const reduction = Math.round((1 - merged.length / rawCount) * 100);
  console.log(
    `\nsimplified ${rawCount} -> ${merged.length} points (${reduction}% reduction)`,
  );

  // a via contributes two osrm hops that are really one journey, so fold them
  // back together: `legs` stays a list of the drives a reader would recognise.
  const mergedLegs = [];
  let acc = null;
  for (let i = 0; i < legs.length; i++) {
    const a = WAYPOINTS[i];
    const b = WAYPOINTS[i + 1];
    acc ??= { from: a.name, from_coord: a.coord, distance_m: 0, duration_s: 0 };
    acc.distance_m += legs[i].distance_m;
    acc.duration_s += legs[i].duration_s;
    if (b.via) continue;
    mergedLegs.push({
      from: acc.from,
      to: b.name,
      from_coord: acc.from_coord,
      to_coord: b.coord,
      distance_km: Math.round(acc.distance_m / 1000),
      duration_h: parseFloat((acc.duration_s / 3600).toFixed(1)),
    });
    acc = null;
  }

  const output = {
    // vias shape the line only: they never reach route.json, so nothing
    // downstream can render a dot for them or anchor a <Stop> to one.
    waypoints: WAYPOINTS.map((w, i) => ({
      ...w,
      polyIdx: polyIdxByWaypoint[i],
    })).filter((w) => !w.via),
    distance_km: Math.round(totalDist / 1000),
    duration_h: parseFloat((totalDur / 3600).toFixed(1)),
    point_count: merged.length,
    polyline: merged,
    legs: mergedLegs,
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
