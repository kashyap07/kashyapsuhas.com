// gochara: where the grahas actually are as life runs on, rather than at birth.
//
// dasha says which years belong to which graha. gochara says what is passing overhead
// during them. the classical way to pin an event to a year rather than a five year
// stretch is to take the dasha window first and then look for the transit that
// triggers it, and for that Guru is the workhorse: roughly one rashi a year, so his
// position names a year the way no slower graha can.
import * as Astronomy from "astronomy-engine";

import { RASHI_SPAN } from "./constants";
import { siderealLongitude } from "./ephemeris";
import type { GrahaId } from "./types";

export type Transit = {
  rashi: number;
  from: Date;
  to: Date;
};

const DAY_MS = 86400000;

function rashiAt(graha: GrahaId, date: Date): number {
  const lon = siderealLongitude(graha, Astronomy.MakeTime(date));
  return Math.floor(lon / RASHI_SPAN);
}

/**
 * refine a rashi change to the day by bisection.
 * `before` and `after` must straddle exactly one boundary.
 */
function refine(graha: GrahaId, before: Date, after: Date): Date {
  let lo = before.getTime();
  let hi = after.getTime();
  const target = rashiAt(graha, before);
  while (hi - lo > DAY_MS) {
    const mid = (lo + hi) / 2;
    if (rashiAt(graha, new Date(mid)) === target) lo = mid;
    else hi = mid;
  }
  return new Date(hi);
}

/**
 * the intervals a graha spends in each rashi across a range.
 *
 * `stepDays` has to be small enough that no rashi is skipped between samples. guru
 * takes about a year per rashi so 10 days is generous; chandra changes every two and
 * a half days and would need a much finer step, which is why this is really meant for
 * the slow grahas.
 */
export function rashiTransits(
  graha: GrahaId,
  from: Date,
  to: Date,
  stepDays = 10,
): Transit[] {
  const out: Transit[] = [];
  let cursorDate = from;
  let cursorRashi = rashiAt(graha, from);
  let prev = from;

  for (
    let t = from.getTime() + stepDays * DAY_MS;
    t <= to.getTime();
    t += stepDays * DAY_MS
  ) {
    const now = new Date(t);
    const rashi = rashiAt(graha, now);
    if (rashi !== cursorRashi) {
      const boundary = refine(graha, prev, now);
      out.push({ rashi: cursorRashi, from: cursorDate, to: boundary });
      cursorDate = boundary;
      cursorRashi = rashi;
    }
    prev = now;
  }

  out.push({ rashi: cursorRashi, from: cursorDate, to });
  return out;
}

/**
 * when Guru is either standing in a rashi or throwing his drishti on it.
 *
 * Guru aspects the 5th, 7th and 9th from himself, so a bhava gets his attention four
 * times in each twelve year circuit, not once. the tradition treats his arrival on a
 * bhava or its lord as the moment a promise in that bhava becomes payable.
 */
export function guruTouches(
  targetRashi: number,
  from: Date,
  to: Date,
): { from: Date; to: Date }[] {
  // the rashis from which Guru would occupy or aspect the target
  const sources = new Set([
    targetRashi, // standing in it
    (targetRashi - 4 + 12) % 12, // his 5th
    (targetRashi - 6 + 12) % 12, // his 7th
    (targetRashi - 8 + 12) % 12, // his 9th
  ]);

  // guru turns retrograde for about four months a year, so near a boundary he
  // crosses, backs out and crosses again: 5, 6, 5, 6, 7. those fragments belong to
  // one contact and should be merged.
  //
  // but the merge must happen WITHIN a rashi, never across two. the sources here are
  // every other rashi (occupation plus the 5th, 7th and 9th drishti), so two genuinely
  // separate contacts are parted by a single intervening rashi, and retrogradation
  // chops even that into stretches of only about five months. merging on elapsed time
  // alone therefore welds distinct contacts into one multi-year blob, which makes
  // "Guru triggers this" true of every window and so worth nothing.
  const byRashi = new Map<number, { from: Date; to: Date }[]>();
  for (const t of rashiTransits("guru", from, to)) {
    if (!sources.has(t.rashi)) continue;
    const list = byRashi.get(t.rashi) ?? [];
    list.push({ from: t.from, to: t.to });
    byRashi.set(t.rashi, list);
  }

  return [...byRashi.values()]
    .flatMap((list) => mergeIntervals(list, 200))
    .sort((a, b) => a.from.getTime() - b.from.getTime());
}

/** merge intervals separated by less than `toleranceDays`. */
export function mergeIntervals(
  intervals: { from: Date; to: Date }[],
  toleranceDays: number,
): { from: Date; to: Date }[] {
  if (!intervals.length) return [];
  const sorted = [...intervals].sort(
    (a, b) => a.from.getTime() - b.from.getTime(),
  );
  const out = [{ ...sorted[0] }];
  for (const next of sorted.slice(1)) {
    const last = out[out.length - 1];
    if (next.from.getTime() - last.to.getTime() <= toleranceDays * DAY_MS) {
      if (next.to > last.to) last.to = next.to;
    } else {
      out.push({ ...next });
    }
  }
  return out;
}

/** does an interval overlap another? */
export function overlaps(
  a: { from: Date; to: Date },
  b: { from: Date; to: Date },
): boolean {
  return a.from < b.to && b.from < a.to;
}

/** the intersection of two intervals, or null. */
export function intersect(
  a: { from: Date; to: Date },
  b: { from: Date; to: Date },
): { from: Date; to: Date } | null {
  if (!overlaps(a, b)) return null;
  return {
    from: new Date(Math.max(a.from.getTime(), b.from.getTime())),
    to: new Date(Math.min(a.to.getTime(), b.to.getTime())),
  };
}
