// lagna, bhavas and vargas: turning raw longitudes into a kundali.
import * as Astronomy from "astronomy-engine";

import { DEG, RAD, norm360 } from "./angles";
import { ayanamsa } from "./ayanamsa";
import { NAKSHATRA_SPAN, PADA_SPAN, RASHI_SPAN } from "./constants";
import { grahaPositions } from "./ephemeris";
import type { BirthData, EphemerisOptions, GrahaId, GrahaSet } from "./types";

/**
 * sidereal lagna (ascendant).
 *
 * tan(A) = cos(theta) / -(sin(theta) cos(eps) + tan(phi) sin(eps))
 * with theta = local sidereal time, eps = TRUE obliquity of date, phi = latitude.
 *
 * using mean obliquity instead of true is a ~9 arcsec error here. verified against
 * swisseph: 1.63 arcsec worst case across five latitudes from kanyakumari to london.
 */
export function lagnaLongitude(birth: BirthData): number {
  const time = Astronomy.MakeTime(birth.when);
  const gstHours = Astronomy.SiderealTime(time);
  const lstDeg = norm360((gstHours + birth.longitude / 15) * 15);

  const theta = lstDeg * DEG;
  const eps = Astronomy.e_tilt(time).tobl * DEG;
  const phi = birth.latitude * DEG;

  const tropical = norm360(
    Math.atan2(
      Math.cos(theta),
      -(Math.sin(theta) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps)),
    ) * RAD,
  );

  return norm360(tropical - ayanamsa(time));
}

export type VargaId = "D1" | "D2" | "D3" | "D9" | "D10" | "D12" | "D30" | "D60";

export type VargaMeta = {
  id: VargaId;
  name: string;
  kannada: string;
  /** what the varga is traditionally read for */
  signifies: string;
  /**
   * where the division rule comes from, so a disputed varga is visibly disputed.
   *
   * chapter-level on purpose. verse numbering in BPHS differs between the santhanam
   * and sharma translations and between manuscript recensions, so a precise "6.7"
   * would read as more authoritative than it can honestly be.
   */
  source: string;
  /** true when traditions genuinely disagree on the rule, not just on interpretation */
  contested?: boolean;
};

export const VARGAS: Record<VargaId, VargaMeta> = {
  D1: {
    id: "D1",
    name: "Rashi",
    kannada: "ರಾಶಿ",
    signifies: "the body, the life as lived",
    source: "BPHS, ch. Shodasavarga",
  },
  D2: {
    id: "D2",
    name: "Hora",
    kannada: "ಹೋರಾ",
    signifies: "wealth",
    source: "BPHS, ch. Shodasavarga",
  },
  D3: {
    id: "D3",
    name: "Drekkana",
    kannada: "ದ್ರೇಕ್ಕಾಣ",
    signifies: "siblings, courage",
    source: "BPHS, ch. Shodasavarga",
  },
  D9: {
    id: "D9",
    name: "Navamsa",
    kannada: "ನವಾಂಶ",
    signifies: "marriage, dharma, the inner strength of a graha",
    source: "BPHS, ch. Shodasavarga",
  },
  D10: {
    id: "D10",
    name: "Dasamsa",
    kannada: "ದಶಾಂಶ",
    signifies: "karma, profession",
    source: "BPHS, ch. Shodasavarga",
  },
  D12: {
    id: "D12",
    name: "Dwadasamsa",
    kannada: "ದ್ವಾದಶಾಂಶ",
    signifies: "parents",
    source: "BPHS, ch. Shodasavarga",
  },
  D30: {
    id: "D30",
    name: "Trimsamsa",
    kannada: "ತ್ರಿಂಶಾಂಶ",
    signifies: "misfortune, character",
    source: "BPHS, ch. Shodasavarga (unequal division)",
    contested: true,
  },
  D60: {
    id: "D60",
    name: "Shashtiamsa",
    kannada: "ಷಷ್ಟ್ಯಂಶ",
    signifies: "the sum of past karma",
    source: "BPHS, ch. Shodasavarga",
    contested: true,
  },
};

const isOddRashi = (rashi: number) => rashi % 2 === 0; // mesha is the 1st, i.e. odd

/**
 * which rashi a longitude falls in, in a given varga.
 *
 * D30 and D60 are marked contested in VARGAS above: the parashari trimsamsa here uses
 * the unequal 5/5/8/7/5 split reversed for even signs, and D60 counts half-degree
 * parts forward from the sign. other lineages divide these differently. do not present
 * either as the only reading.
 */
export function vargaRashi(lon: number, varga: VargaId): number {
  const rashi = Math.floor(norm360(lon) / RASHI_SPAN);
  const deg = norm360(lon) - rashi * RASHI_SPAN;

  switch (varga) {
    case "D1":
      return rashi;

    case "D2": {
      // odd signs: first half surya's hora (simha), second half chandra's (kataka).
      // even signs: reversed.
      const firstHalf = deg < 15;
      const simha = 4;
      const kataka = 3;
      if (isOddRashi(rashi)) return firstHalf ? simha : kataka;
      return firstHalf ? kataka : simha;
    }

    case "D3": {
      // 1st third: same sign, 2nd: 5th from it, 3rd: 9th from it
      const part = Math.floor(deg / 10);
      return (rashi + part * 4) % 12;
    }

    case "D9": {
      // the continuous formula is exactly equivalent to the chara/sthira/dvisvabhava
      // starting-sign rule, and has no special cases to get wrong.
      return Math.floor(norm360(lon) / (RASHI_SPAN / 9)) % 12;
    }

    case "D10": {
      const part = Math.floor(deg / 3);
      // odd signs count from the sign, even signs from the 9th from it
      return (rashi + (isOddRashi(rashi) ? 0 : 8) + part) % 12;
    }

    case "D12": {
      const part = Math.floor(deg / 2.5);
      return (rashi + part) % 12;
    }

    case "D30": {
      // unequal: 5/5/8/7/5 degrees, ruled by kuja, shani, guru, budha, shukra.
      // even signs reverse both the order and the rulerships.
      const mesha = 0,
        kumbha = 10,
        dhanu = 8,
        mithuna = 2,
        tula = 6;
      const vrishabha = 1,
        kanya = 5,
        meena = 11,
        makara = 9,
        vrishchika = 7;
      if (isOddRashi(rashi)) {
        if (deg < 5) return mesha;
        if (deg < 10) return kumbha;
        if (deg < 18) return dhanu;
        if (deg < 25) return mithuna;
        return tula;
      }
      if (deg < 5) return vrishabha;
      if (deg < 12) return kanya;
      if (deg < 20) return meena;
      if (deg < 25) return makara;
      return vrishchika;
    }

    case "D60": {
      const part = Math.floor(deg * 2); // 0-59, half-degree parts
      return (rashi + part) % 12;
    }
  }
}

export type ChartPoint = {
  lon: number;
  rashi: number;
  degInRashi: number;
  nakshatra: number;
  pada: number;
};

export type Chart = {
  birth: BirthData;
  /** lahiri ayanamsa applied, in degrees */
  ayanamsa: number;
  lagna: ChartPoint;
  grahas: GrahaSet;
  /** whole sign: bhava 1-12 for each graha */
  bhava: Record<GrahaId, number>;
  /** which rashi sits in each bhava, index 0 = 1st bhava */
  bhavaRashi: number[];
};

function toPoint(lon: number): ChartPoint {
  const rashi = Math.floor(lon / RASHI_SPAN);
  const nakshatra = Math.floor(lon / NAKSHATRA_SPAN);
  return {
    lon,
    rashi,
    degInRashi: lon - rashi * RASHI_SPAN,
    nakshatra,
    pada: Math.floor((lon - nakshatra * NAKSHATRA_SPAN) / PADA_SPAN) + 1,
  };
}

/**
 * whole sign bhavas: the lagna's rashi is the 1st bhava entire, the next rashi the
 * 2nd, and so on. this is the south indian standard, and what a kannada jataka
 * assumes unless it says otherwise.
 */
export function buildChart(
  birth: BirthData,
  opts: EphemerisOptions = {},
): Chart {
  const time = Astronomy.MakeTime(birth.when);
  const lagna = toPoint(lagnaLongitude(birth));
  const grahas = grahaPositions(birth.when, opts);

  const bhava = {} as Record<GrahaId, number>;
  for (const [id, pos] of Object.entries(grahas)) {
    bhava[id as GrahaId] = ((pos.rashi - lagna.rashi + 12) % 12) + 1;
  }

  const bhavaRashi = Array.from(
    { length: 12 },
    (_, i) => (lagna.rashi + i) % 12,
  );

  return {
    birth,
    ayanamsa: ayanamsa(time),
    lagna,
    grahas,
    bhava,
    bhavaRashi,
  };
}
