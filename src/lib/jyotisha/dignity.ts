// graha dignity and state: uccha, neecha, swakshetra, moolatrikona, astangata.
//
// this is the layer every phala rule reads from. it is still ganita in the sense that
// it is mechanical and has no interpretive freedom: the exaltation degrees are fixed
// numbers the tradition states outright, not judgements.
import { signedDiff } from "./angles";
import { RASHIS } from "./constants";
import type { GrahaId, GrahaSet } from "./types";

export type DignityKind =
  | "uccha" // exalted
  | "moolatrikona"
  | "swakshetra" // own sign
  | "mitra" // friend's sign
  | "sama" // neutral
  | "shatru" // enemy's sign
  | "neecha"; // debilitated

/** exact exaltation degree. debilitation is the same degree in the opposite rashi. */
const UCCHA: Record<
  Exclude<GrahaId, "rahu" | "ketu">,
  { rashi: number; deg: number }
> = {
  surya: { rashi: 0, deg: 10 }, // mesha 10
  chandra: { rashi: 1, deg: 3 }, // vrishabha 3
  kuja: { rashi: 9, deg: 28 }, // makara 28
  budha: { rashi: 5, deg: 15 }, // kanya 15
  guru: { rashi: 3, deg: 5 }, // kataka 5
  shukra: { rashi: 11, deg: 27 }, // meena 27
  shani: { rashi: 6, deg: 20 }, // tula 20
};

/** moolatrikona spans, degrees within the rashi. */
const MOOLATRIKONA: Record<
  Exclude<GrahaId, "rahu" | "ketu">,
  { rashi: number; from: number; to: number }
> = {
  surya: { rashi: 4, from: 0, to: 20 }, // simha
  chandra: { rashi: 1, from: 4, to: 30 }, // vrishabha
  kuja: { rashi: 0, from: 0, to: 12 }, // mesha
  budha: { rashi: 5, from: 16, to: 20 }, // kanya
  guru: { rashi: 8, from: 0, to: 10 }, // dhanu
  shukra: { rashi: 6, from: 0, to: 15 }, // tula
  shani: { rashi: 10, from: 0, to: 20 }, // kumbha
};

/**
 * naisargika maitri, the natural friendship table. anything not listed as friend or
 * enemy is neutral.
 */
const FRIENDS: Record<GrahaId, GrahaId[]> = {
  surya: ["chandra", "kuja", "guru"],
  chandra: ["surya", "budha"],
  kuja: ["surya", "chandra", "guru"],
  budha: ["surya", "shukra"],
  guru: ["surya", "chandra", "kuja"],
  shukra: ["budha", "shani"],
  shani: ["budha", "shukra"],
  rahu: ["shukra", "shani", "budha"],
  ketu: ["kuja", "shukra", "shani"],
};

const ENEMIES: Record<GrahaId, GrahaId[]> = {
  surya: ["shukra", "shani"],
  chandra: [],
  kuja: ["budha"],
  budha: ["chandra"],
  guru: ["budha", "shukra"],
  shukra: ["surya", "chandra"],
  shani: ["surya", "chandra", "kuja"],
  rahu: ["surya", "chandra", "kuja"],
  ketu: ["surya", "chandra"],
};

/**
 * astangata (combustion) orbs in degrees from surya. budha and shukra get a tighter
 * orb when vakri, which is the standard parashari refinement.
 */
const COMBUSTION_ORB: Record<
  Exclude<GrahaId, "surya" | "rahu" | "ketu">,
  { direct: number; vakri: number }
> = {
  chandra: { direct: 12, vakri: 12 },
  kuja: { direct: 17, vakri: 17 },
  budha: { direct: 14, vakri: 12 },
  guru: { direct: 11, vakri: 11 },
  shukra: { direct: 10, vakri: 8 },
  shani: { direct: 15, vakri: 15 },
};

export function relationship(
  graha: GrahaId,
  toward: GrahaId,
): "mitra" | "sama" | "shatru" {
  if (FRIENDS[graha]?.includes(toward)) return "mitra";
  if (ENEMIES[graha]?.includes(toward)) return "shatru";
  return "sama";
}

export type GrahaState = {
  graha: GrahaId;
  dignity: DignityKind;
  /** exact degree of exaltation or debilitation, when that is what applies */
  uccha?: { rashi: number; deg: number };
  /** true when within the combustion orb of surya */
  astangata: boolean;
  /** angular distance from surya, degrees */
  fromSurya: number;
  vakri: boolean;
  /** lord of the rashi the graha sits in */
  dispositor: GrahaId;
};

/**
 * rahu and ketu own no rashi and the tradition disagrees about their exaltation, so
 * they get dignity by dispositor relationship only. asserting a single exaltation for
 * them would be picking a side and hiding it.
 */
const NODES: GrahaId[] = ["rahu", "ketu"];

export function grahaState(graha: GrahaId, grahas: GrahaSet): GrahaState {
  const pos = grahas[graha];
  const dispositor = RASHIS[pos.rashi].lord;
  const surya = grahas.surya;
  const fromSurya = Math.abs(signedDiff(pos.lon, surya.lon));

  let astangata = false;
  if (graha !== "surya" && !NODES.includes(graha)) {
    const orb = COMBUSTION_ORB[graha as keyof typeof COMBUSTION_ORB];
    astangata = fromSurya < (pos.vakri ? orb.vakri : orb.direct);
  }

  const base = {
    graha,
    astangata,
    fromSurya,
    vakri: pos.vakri,
    dispositor,
  };

  if (NODES.includes(graha)) {
    return { ...base, dignity: relationship(graha, dispositor) };
  }

  const key = graha as Exclude<GrahaId, "rahu" | "ketu">;
  const ex = UCCHA[key];
  const mt = MOOLATRIKONA[key];
  const neechaRashi = (ex.rashi + 6) % 12;

  // moolatrikona is tested before exaltation, because for two grahas the two land in
  // the same rashi and the rashi is split between them:
  //   chandra  vrishabha 0-3 uccha, 4-30 moolatrikona
  //   budha    kanya 0-15 uccha, 16-20 moolatrikona, 20-30 own
  // testing uccha first would swallow the whole rashi and chandra would never be
  // moolatrikona anywhere.
  if (
    pos.rashi === mt.rashi &&
    pos.degInRashi >= mt.from &&
    pos.degInRashi < mt.to
  ) {
    return { ...base, dignity: "moolatrikona" };
  }

  if (pos.rashi === ex.rashi) {
    // budha owns his own exaltation rashi. past the moolatrikona span it is simply his
    // own rashi, not exaltation. everywhere else exaltation takes the whole rashi,
    // with the stated degree being the point of deepest exaltation.
    const ownsIt = dispositor === graha;
    if (!ownsIt || pos.degInRashi < mt.from) {
      return { ...base, dignity: "uccha", uccha: ex };
    }
  }

  if (pos.rashi === neechaRashi)
    return {
      ...base,
      dignity: "neecha",
      uccha: { rashi: neechaRashi, deg: ex.deg },
    };

  if (dispositor === graha) return { ...base, dignity: "swakshetra" };

  return { ...base, dignity: relationship(graha, dispositor) };
}

export function allStates(grahas: GrahaSet): Record<GrahaId, GrahaState> {
  const out = {} as Record<GrahaId, GrahaState>;
  for (const id of Object.keys(grahas) as GrahaId[]) {
    out[id] = grahaState(id, grahas);
  }
  return out;
}

/** sentence form, for "Guru is in its own rashi" rather than "Guru is own rashi". */
export const DIGNITY_PHRASE: Record<DignityKind, string> = {
  uccha: "is exalted",
  moolatrikona: "is in its moolatrikona",
  swakshetra: "is in its own rashi",
  mitra: "is in a friend's rashi",
  sama: "is in a neutral rashi",
  shatru: "is in an enemy's rashi",
  neecha: "is debilitated",
};

export const DIGNITY_LABEL: Record<DignityKind, string> = {
  uccha: "exalted",
  moolatrikona: "moolatrikona",
  swakshetra: "own rashi",
  mitra: "friend's rashi",
  sama: "neutral rashi",
  shatru: "enemy's rashi",
  neecha: "debilitated",
};

/** rough strength ordering, used only to sort cards. not shadbala. */
export const DIGNITY_RANK: Record<DignityKind, number> = {
  uccha: 6,
  moolatrikona: 5,
  swakshetra: 4,
  mitra: 3,
  sama: 2,
  shatru: 1,
  neecha: 0,
};

/** which rashis a graha owns. rahu and ketu own none. */
export function ownedRashis(graha: GrahaId): number[] {
  return RASHIS.filter((r) => r.lord === graha).map((r) => r.index);
}

/** the graha ruling a given bhava, under whole sign. */
export function bhavaLord(bhavaRashi: number[], bhava: number): GrahaId {
  return RASHIS[bhavaRashi[bhava - 1]].lord;
}
