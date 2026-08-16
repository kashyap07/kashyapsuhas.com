// vimshottari dasha.
//
// the 120 year cycle, keyed off the exact fractional position of chandra in its
// nakshatra at birth. this is why the moon's longitude carries more weight than any
// other number in the chart: a few arcminutes of chandra moves the dasha balance by
// weeks, and every date the system ever produces hangs off it.
import { norm360 } from "./angles";
import {
  NAKSHATRAS,
  NAKSHATRA_SPAN,
  VIMSHOTTARI_ORDER,
  VIMSHOTTARI_YEARS,
} from "./constants";
import type { GrahaId } from "./types";

/**
 * how long a "year" is when converting dasha years to real time.
 *
 * this is a genuine fork between lineages, not a rounding detail. over shukra's
 * 20 year mahadasha, savana vs solar reckoning differ by about ten months. drik
 * panchanga practice (and every mainstream implementation) uses the solar year, so
 * that is the default, but the choice is exposed rather than buried.
 */
export const YEAR_LENGTHS = {
  /** julian year. what JHora and most software use. */
  solar: 365.25,
  /** gregorian mean year. differs from solar by 0.15 days over a 20 year dasha. */
  tropical: 365.2425,
  /** savana (civil) year of 360 days. some older lineages reckon this way. */
  savana: 360,
} as const;

export type YearLength = keyof typeof YEAR_LENGTHS;

export type DashaLevel = 1 | 2 | 3;

export type DashaPeriod = {
  lord: GrahaId;
  start: Date;
  end: Date;
  level: DashaLevel;
  /**
   * true for the mahadasha in progress at birth. its start is before the birth
   * instant: only the balance runs. consumers that render a timeline should clamp
   * the displayed start, not the computed one, or the nesting drifts.
   */
  startedBeforeBirth?: boolean;
  children?: DashaPeriod[];
};

export type VimshottariOptions = {
  year?: YearLength;
  /** how many mahadashas to emit. 9 covers the full 120 year cycle. */
  cycles?: number;
  /** build antardashas (level 2) and pratyantardashas (level 3). */
  depth?: DashaLevel;
};

const DAY_MS = 86400000;

function addYears(from: Date, years: number, yearDays: number): Date {
  return new Date(from.getTime() + years * yearDays * DAY_MS);
}

/** the fraction of its nakshatra chandra has already crossed, 0 to 1. */
export function nakshatraFraction(moonLon: number): number {
  const lon = norm360(moonLon);
  return (lon % NAKSHATRA_SPAN) / NAKSHATRA_SPAN;
}

function subPeriods(
  parent: DashaPeriod,
  yearDays: number,
  level: DashaLevel,
  maxLevel: DashaLevel,
): DashaPeriod[] | undefined {
  if (level > maxLevel) return undefined;

  const parentDays = (parent.end.getTime() - parent.start.getTime()) / DAY_MS;
  const startIndex = VIMSHOTTARI_ORDER.indexOf(parent.lord);
  const out: DashaPeriod[] = [];
  let cursor = parent.start;

  for (let i = 0; i < 9; i++) {
    const lord = VIMSHOTTARI_ORDER[(startIndex + i) % 9];
    // a sub period takes the same share of its parent as its lord takes of 120 years
    const share = VIMSHOTTARI_YEARS[lord] / 120;
    const end = new Date(cursor.getTime() + parentDays * share * DAY_MS);
    const period: DashaPeriod = { lord, start: cursor, end, level };
    period.children = subPeriods(
      period,
      yearDays,
      (level + 1) as DashaLevel,
      maxLevel,
    );
    out.push(period);
    cursor = end;
  }

  return out;
}

/**
 * the full vimshottari tree from birth.
 *
 * `moonLon` is chandra's sidereal longitude at the birth instant.
 */
export function vimshottari(
  moonLon: number,
  birth: Date,
  opts: VimshottariOptions = {},
): DashaPeriod[] {
  const yearDays = YEAR_LENGTHS[opts.year ?? "solar"];
  const cycles = opts.cycles ?? 9;
  const depth = opts.depth ?? 2;

  const nakshatra = Math.floor(norm360(moonLon) / NAKSHATRA_SPAN);
  const firstLord = NAKSHATRAS[nakshatra].lord;
  const elapsed = nakshatraFraction(moonLon);

  // the running mahadasha started before birth. place its true start so that the
  // antardashas inside it land on the right dates.
  const firstFull = VIMSHOTTARI_YEARS[firstLord];
  const firstStart = addYears(birth, -elapsed * firstFull, yearDays);

  const out: DashaPeriod[] = [];
  let cursor = firstStart;
  const startIndex = VIMSHOTTARI_ORDER.indexOf(firstLord);

  for (let i = 0; i < cycles; i++) {
    const lord = VIMSHOTTARI_ORDER[(startIndex + i) % 9];
    const end = addYears(cursor, VIMSHOTTARI_YEARS[lord], yearDays);
    const period: DashaPeriod = {
      lord,
      start: cursor,
      end,
      level: 1,
      ...(i === 0 ? { startedBeforeBirth: true } : {}),
    };
    period.children = subPeriods(period, yearDays, 2, depth);
    out.push(period);
    cursor = end;
  }

  return out;
}

/** balance of the first mahadasha at birth, in years. the number panchangas print. */
export function dashaBalance(moonLon: number): {
  lord: GrahaId;
  years: number;
} {
  const nakshatra = Math.floor(norm360(moonLon) / NAKSHATRA_SPAN);
  const lord = NAKSHATRAS[nakshatra].lord;
  return {
    lord,
    years: (1 - nakshatraFraction(moonLon)) * VIMSHOTTARI_YEARS[lord],
  };
}

/**
 * the nested dasha lords running at a given moment, outermost first.
 * this is the spine of the "what was the chart saying then" timeline.
 */
export function dashaAt(periods: DashaPeriod[], when: Date): DashaPeriod[] {
  const t = when.getTime();
  const hit = periods.find(
    (p) => t >= p.start.getTime() && t < p.end.getTime(),
  );
  if (!hit) return [];
  return [hit, ...(hit.children ? dashaAt(hit.children, when) : [])];
}
