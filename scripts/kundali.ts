// print a janma kundali from the command line.
//
//   npm run kundali -- --date 1990-05-01 --time 06:00 --lat 12.9716 --lon 77.5946
//
// this is the ganita core with a terminal on the front. it exists so a chart can be
// diffed against a printed panchanga without a browser, which is how the phala layer
// will get validated later.
import { parseArgs } from "node:util";

import { formatDms } from "../src/lib/jyotisha/angles";
import { buildChart } from "../src/lib/jyotisha/chart";
import {
  BHAVAS,
  GRAHA_NAMES,
  NAKSHATRAS,
  RASHIS,
} from "../src/lib/jyotisha/constants";
import { dashaAt, dashaBalance, vimshottari } from "../src/lib/jyotisha/dasha";
import {
  HISTORICAL_ZONES,
  type TimeZoneSpec,
  resolveInstant,
  timeAmbiguities,
} from "../src/lib/jyotisha/time";
import type { GrahaId } from "../src/lib/jyotisha/types";

const { values } = parseArgs({
  options: {
    date: { type: "string" },
    time: { type: "string", default: "12:00" },
    lat: { type: "string" },
    lon: { type: "string" },
    tz: { type: "string", default: "Asia/Kolkata" },
    place: { type: "string", default: "" },
    node: { type: "string", default: "mean" },
    help: { type: "boolean", default: false },
  },
});

if (values.help || !values.date || !values.lat || !values.lon) {
  console.log(`
janma kundali

  --date   YYYY-MM-DD          birth date (required)
  --time   HH:MM or HH:MM:SS   local clock time, default 12:00
  --lat    decimal degrees     north positive (required)
  --lon    decimal degrees     east positive (required)
  --tz     IANA zone or one of: ${Object.keys(HISTORICAL_ZONES).join(", ")}
  --place  free text, only used to flag historical timezone ambiguity
  --node   mean | true         rahu convention, default mean

example, bengaluru:
  npm run kundali -- --date 1990-05-01 --time 06:00 --lat 12.9716 --lon 77.5946
`);
  process.exit(values.help ? 0 : 1);
}

// ---- resolve the instant ----------------------------------------------------

const [y, mo, d] = values.date.split("-").map(Number);
const [hh, mm, ss] = values.time.split(":").map(Number);
const local = {
  year: y,
  month: mo,
  day: d,
  hour: hh,
  minute: mm || 0,
  second: ss || 0,
};

const tz: TimeZoneSpec =
  values.tz in HISTORICAL_ZONES
    ? HISTORICAL_ZONES[values.tz as keyof typeof HISTORICAL_ZONES]
    : { kind: "iana", zone: values.tz };

const when = resolveInstant(local, tz);
const latitude = Number(values.lat);
const longitude = Number(values.lon);

const chart = buildChart(
  { when, latitude, longitude },
  { node: values.node === "true" ? "true" : "mean" },
);

// ---- header -----------------------------------------------------------------

const tzLabel = tz.kind === "fixed" ? tz.label : tz.zone;
const line = (s = "") => console.log(s);

line();
line(`  ${values.date} ${values.time}  ${tzLabel}`);
line(
  `  ${latitude.toFixed(4)}N ${longitude.toFixed(4)}E${values.place ? `  ${values.place}` : ""}`,
);
line(`  UTC instant   ${when.toISOString()}`);
line(`  ayanamsa      ${formatDms(chart.ayanamsa)}  (Lahiri)`);
line();

const warnings = timeAmbiguities(local, values.place);
if (warnings.length) {
  line("  ! timezone ambiguity");
  for (const w of warnings) {
    line(`    ${w.message}`);
    if (w.alternative) {
      // print the flag value, not the human label, so the hint can be pasted
      const key = Object.entries(HISTORICAL_ZONES).find(
        ([, z]) => z.label === (w.alternative as { label?: string }).label,
      )?.[0];
      const alt =
        key ??
        (w.alternative.kind === "iana"
          ? w.alternative.zone
          : w.alternative.label);
      line(`    try:  --tz ${alt}`);
    }
  }
  line();
}

// ---- lagna and grahas -------------------------------------------------------

const rashiName = (i: number) => RASHIS[i].name;
const nakName = (i: number) => NAKSHATRAS[i].name;

line(
  `  Lagna  ${rashiName(chart.lagna.rashi)} ${formatDms(chart.lagna.degInRashi)}  ` +
    `${nakName(chart.lagna.nakshatra)} pada ${chart.lagna.pada}`,
);
line();

const ORDER: GrahaId[] = [
  "surya",
  "chandra",
  "kuja",
  "budha",
  "guru",
  "shukra",
  "shani",
  "rahu",
  "ketu",
];

const pad = (s: string, n: number) => s.padEnd(n);
line(
  `  ${pad("Graha", 12)}${pad("Rashi", 12)}${pad("Degree", 14)}${pad("Nakshatra", 19)}${pad("Pada", 6)}${pad("Bhava", 7)}`,
);
line(`  ${"-".repeat(72)}`);
for (const id of ORDER) {
  const g = chart.grahas[id];
  const bhavaIndex = chart.bhava[id] - 1;
  line(
    `  ${pad(GRAHA_NAMES[id].name + (g.vakri ? " (V)" : ""), 12)}` +
      `${pad(rashiName(g.rashi), 12)}` +
      `${pad(formatDms(g.degInRashi), 14)}` +
      `${pad(nakName(g.nakshatra), 19)}` +
      `${pad(String(g.pada), 6)}` +
      `${pad(`${chart.bhava[id]} ${BHAVAS[bhavaIndex].name}`, 7)}`,
  );
}
line();

// ---- south indian chart -----------------------------------------------------

// fixed grid, rashis run clockwise from meena in the top left corner
const GRID: (number | null)[][] = [
  [11, 0, 1, 2],
  [10, null, null, 3],
  [9, null, null, 4],
  [8, 7, 6, 5],
];

const occupants = new Map<number, string[]>();
for (const id of ORDER) {
  const r = chart.grahas[id].rashi;
  const list = occupants.get(r) ?? [];
  list.push(GRAHA_NAMES[id].short);
  occupants.set(r, list);
}

const CELL_W = 17;
const CELL_H = 4;

line("  South Indian chart");
line();
for (const row of GRID) {
  const buffers: string[][] = row.map(() => []);
  row.forEach((rashi, i) => {
    if (rashi === null) {
      buffers[i] = Array(CELL_H).fill(" ".repeat(CELL_W));
      return;
    }
    const isLagna = rashi === chart.lagna.rashi;
    const head = `${RASHIS[rashi].name}${isLagna ? " <La>" : ""}`;
    const grahas = occupants.get(rashi) ?? [];
    const body: string[] = [];
    for (let k = 0; k < grahas.length; k += 4) {
      body.push(grahas.slice(k, k + 4).join(" "));
    }
    const cell = [head, ...body];
    while (cell.length < CELL_H) cell.push("");
    buffers[i] = cell.slice(0, CELL_H).map((s) => ` ${s.padEnd(CELL_W - 2)} `);
  });

  line(`  +${Array(4).fill("-".repeat(CELL_W)).join("+")}+`);
  for (let r = 0; r < CELL_H; r++) {
    line(`  |${buffers.map((b) => b[r]).join("|")}|`);
  }
}
line(`  +${Array(4).fill("-".repeat(CELL_W)).join("+")}+`);
line();

// ---- vimshottari ------------------------------------------------------------

const moonLon = chart.grahas.chandra.lon;
const balance = dashaBalance(moonLon);
const tree = vimshottari(moonLon, when, { depth: 3 });

line(
  `  Dasha balance at birth   ${GRAHA_NAMES[balance.lord].name} ${balance.years.toFixed(3)} years`,
);

const fmtDate = (dt: Date) => dt.toISOString().slice(0, 10);
const running = dashaAt(tree, new Date());
if (running.length) {
  line(
    `  Running today            ${running
      .map((p) => GRAHA_NAMES[p.lord].name)
      .join(" / ")}`,
  );
}
line();

line("  Mahadasha timeline");
for (const p of tree) {
  const from = p.startedBeforeBirth ? when : p.start;
  const mark = p.startedBeforeBirth ? " (balance)" : "";
  line(
    `    ${pad(GRAHA_NAMES[p.lord].name, 9)} ${fmtDate(from)}  to  ${fmtDate(p.end)}${mark}`,
  );
}
line();
