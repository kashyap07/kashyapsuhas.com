// build-india-borders.mjs
//
// openfreemap tiles (osm data) draw de facto boundaries: kashmir carved up
// by dashed disputed lines plus de facto india-pakistan-china borders, and
// arunachal's north edge dashed. not the depiction the government of india
// mandates. the map hides the tiles' disputed dashes AND every border
// between india/pakistan/china, then overlays this file: natural earth's
// boundary segments filtered to india's point of view (FCLASS_IN), so
// kashmir and arunachal read as plain international boundary.
//
// sources:
// - disputed_areas: claim lines (kashmir outer boundary etc.) india draws
// - lines_land (10m): the regular ind/pak/chn segments india's view keeps
//   (radcliffe line, middle sector, sikkim, mcmahon line) minus the ones it
//   doesn't recognize (loc, lac, sino-pak shaksgam line)
// - lines_land (50m, marked low:1): whole-world borders for z<5, because
//   the tiles' low-zoom boundary features are merged blobs with no country
//   codes or disputed flags (the loc gets baked in), so the map hides them
//   entirely below z5 and draws these instead
//
// one-time generation; commit the output.
// run: node scripts/build-india-borders.mjs
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_PATH = path.join(ROOT, "src/components/mdx/trip/indiaClaim.json");

const NE_BASE =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson";
const DISPUTED_URL = `${NE_BASE}/ne_10m_admin_0_boundary_lines_disputed_areas.geojson`;
const LAND_URL = `${NE_BASE}/ne_10m_admin_0_boundary_lines_land.geojson`;
const LAND_50M_URL = `${NE_BASE}/ne_50m_admin_0_boundary_lines_land.geojson`;

// country pairs whose tile-drawn borders the map hides entirely
const PAIRS = new Set(["CHN-IND", "IND-PAK", "CHN-PAK"]);

const round = (n) => Math.round(n * 1e4) / 1e4;
// z<5 only, so 0.01 deg (~1km, sub-pixel there) is plenty
const round50 = (n) => Math.round(n * 1e2) / 1e2;
const isIntl = (v) => String(v ?? "").startsWith("International boundary");
const pairOf = (p) => [p.ADM0_A3_L ?? "", p.ADM0_A3_R ?? ""].sort().join("-");

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`http ${res.status} fetching ${url}`);
  return res.json();
}

function compact(f, properties, rnd = round) {
  // rounding creates runs of identical points; keep one of each
  const line = (coords) => {
    const out = [];
    for (const [x, y] of coords) {
      const p = [rnd(x), rnd(y)];
      const last = out[out.length - 1];
      if (!last || last[0] !== p[0] || last[1] !== p[1]) out.push(p);
    }
    return out;
  };
  return {
    type: "Feature",
    properties,
    geometry: {
      type: f.geometry.type,
      coordinates:
        f.geometry.type === "LineString"
          ? line(f.geometry.coordinates)
          : f.geometry.coordinates.map(line),
    },
  };
}

async function main() {
  const [disputed, land, land50] = await Promise.all([
    getJson(DISPUTED_URL),
    getJson(LAND_URL),
    getJson(LAND_50M_URL),
  ]);

  // claim lines india's pov draws as international boundary
  const claims = disputed.features
    .filter((f) => isIntl(f.properties.FCLASS_IN))
    .map((f) => compact(f, { name: f.properties.NAME ?? "claim" }));

  // regular segments between the hidden pairs that india's view keeps:
  // FCLASS_IN empty means everyone draws it, "International boundary"
  // means india specifically does; "Unrecognized" (loc, lac) drops out
  const kept = land.features
    .filter(
      (f) =>
        PAIRS.has(pairOf(f.properties)) &&
        (!f.properties.FCLASS_IN || isIntl(f.properties.FCLASS_IN)),
    )
    .map((f) => compact(f, { name: pairOf(f.properties) }));

  // 50m world set for z<5 (india pov: same FCLASS_IN rule). the ind/pak/chn
  // segments here overlap the 10m ones above, but 10m vs 50m is sub-pixel
  // below z5 so the doubling is invisible
  const low = land50.features
    .filter((f) => !f.properties.FCLASS_IN || isIntl(f.properties.FCLASS_IN))
    .map((f) => compact(f, { low: 1 }, round50));

  const out = {
    type: "FeatureCollection",
    features: [...claims, ...kept, ...low],
  };
  await fs.writeFile(OUT_PATH, JSON.stringify(out) + "\n");
  const kb = Math.round(JSON.stringify(out).length / 1024);
  console.log(
    `wrote ${out.features.length} segment(s) (${low.length} low-zoom world) to ${path.relative(ROOT, OUT_PATH)} (${kb}KB)`,
  );
  for (const f of [...claims, ...kept]) console.log(" -", f.properties.name);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
