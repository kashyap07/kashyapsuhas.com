// graha drishti (aspects).
//
// counted in whole rashis, which is what a south indian chart assumes: a graha
// aspects a rashi, and therefore everything standing in it. this is rashi drishti,
// not the degree-based tajika aspects.
//
// every graha aspects the 7th from itself. three add their own special aspects, and
// those extras are where most of the interpretive weight sits.
import type { GrahaId } from "./types";

/** extra aspects beyond the universal 7th, counted forward in rashis. */
const SPECIAL: Partial<Record<GrahaId, number[]>> = {
  kuja: [4, 8],
  guru: [5, 9],
  shani: [3, 10],
};

/**
 * rahu and ketu are genuinely disputed: many lineages give them 5, 7 and 9 like guru,
 * others give them no drishti at all. off by default, so a reading never leans on a
 * contested aspect without the caller choosing it.
 */
const NODE_ASPECTS = [5, 7, 9];

export type DrishtiOptions = {
  /** include the disputed rahu/ketu aspects. off by default. */
  nodeAspects?: boolean;
};

/** how many rashis a graha casts its drishti across, from its own rashi. */
export function aspectDistances(
  graha: GrahaId,
  opts: DrishtiOptions = {},
): number[] {
  if (graha === "rahu" || graha === "ketu") {
    return opts.nodeAspects ? [...NODE_ASPECTS] : [];
  }
  return [7, ...(SPECIAL[graha] ?? [])].sort((a, b) => a - b);
}

/** the rashis a graha standing in `fromRashi` aspects. */
export function aspectedRashis(
  graha: GrahaId,
  fromRashi: number,
  opts: DrishtiOptions = {},
): number[] {
  return aspectDistances(graha, opts).map((d) => (fromRashi + d - 1) % 12);
}

/** does `graha` in `fromRashi` aspect `targetRashi`? */
export function aspects(
  graha: GrahaId,
  fromRashi: number,
  targetRashi: number,
  opts: DrishtiOptions = {},
): boolean {
  return aspectedRashis(graha, fromRashi, opts).includes(targetRashi);
}

export type Aspect = {
  graha: GrahaId;
  /** rashis counted from the aspecting graha to the target */
  distance: number;
  /** true for the special 4/8, 5/9 or 3/10 aspects rather than the universal 7th */
  special: boolean;
};

/** every graha aspecting a given rashi. */
export function aspectsOnRashi(
  targetRashi: number,
  rashiOf: Record<GrahaId, number>,
  opts: DrishtiOptions = {},
): Aspect[] {
  const out: Aspect[] = [];
  for (const id of Object.keys(rashiOf) as GrahaId[]) {
    const from = rashiOf[id];
    for (const d of aspectDistances(id, opts)) {
      if ((from + d - 1) % 12 === targetRashi) {
        out.push({ graha: id, distance: d, special: d !== 7 });
      }
    }
  }
  return out;
}
