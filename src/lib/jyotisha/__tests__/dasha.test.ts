import { NAKSHATRA_SPAN, VIMSHOTTARI_YEARS } from "../constants";
import {
  YEAR_LENGTHS,
  dashaAt,
  dashaBalance,
  nakshatraFraction,
  vimshottari,
} from "../dasha";
import type { GrahaId } from "../types";

const BIRTH = new Date("1990-05-01T00:30:00Z");
const DAY_MS = 86400000;
const days = (a: Date, b: Date) => (b.getTime() - a.getTime()) / DAY_MS;

describe("vimshottari balance", () => {
  it("gives a full ketu dasha at the very start of ashwini", () => {
    const b = dashaBalance(0);
    expect(b.lord).toBe("ketu");
    expect(b.years).toBeCloseTo(7, 9);
  });

  it("gives nothing left at the very end of ashwini", () => {
    const b = dashaBalance(NAKSHATRA_SPAN - 1e-9);
    expect(b.lord).toBe("ketu");
    expect(b.years).toBeLessThan(1e-8);
  });

  it("hands over to shukra at the start of bharani", () => {
    const b = dashaBalance(NAKSHATRA_SPAN);
    expect(b.lord).toBe("shukra");
    expect(b.years).toBeCloseTo(20, 9);
  });

  it("halves the balance at the midpoint of a nakshatra", () => {
    // magha is ketu's again, one full cycle on
    const magha = 9 * NAKSHATRA_SPAN;
    const b = dashaBalance(magha + NAKSHATRA_SPAN / 2);
    expect(b.lord).toBe("ketu");
    expect(b.years).toBeCloseTo(3.5, 9);
  });

  it("tracks the fraction across the whole zodiac", () => {
    expect(nakshatraFraction(0)).toBeCloseTo(0, 12);
    expect(nakshatraFraction(NAKSHATRA_SPAN / 4)).toBeCloseTo(0.25, 12);
    expect(nakshatraFraction(359.9999)).toBeGreaterThan(0.99);
  });
});

describe("vimshottari tree", () => {
  const tree = vimshottari(0, BIRTH, { depth: 3 });

  it("runs the nine mahadashas in cycle order from the birth nakshatra lord", () => {
    const lords = tree.map((p) => p.lord);
    expect(lords).toEqual([
      "ketu",
      "shukra",
      "surya",
      "chandra",
      "kuja",
      "rahu",
      "guru",
      "shani",
      "budha",
    ]);
  });

  it("spans exactly 120 solar years end to end", () => {
    const total = days(tree[0].start, tree[8].end);
    expect(total).toBeCloseTo(120 * YEAR_LENGTHS.solar, 6);
  });

  it("gives each mahadasha its traditional length", () => {
    for (const p of tree) {
      expect(days(p.start, p.end)).toBeCloseTo(
        VIMSHOTTARI_YEARS[p.lord] * YEAR_LENGTHS.solar,
        6,
      );
    }
  });

  it("starts the first mahadasha at birth when chandra is at 0 ashwini", () => {
    expect(tree[0].start.getTime()).toBe(BIRTH.getTime());
    expect(tree[0].startedBeforeBirth).toBe(true);
  });

  it("backdates the first mahadasha when chandra is mid-nakshatra", () => {
    // half of ashwini elapsed -> ketu started 3.5 years before birth
    const partial = vimshottari(NAKSHATRA_SPAN / 2, BIRTH);
    expect(partial[0].start.getTime()).toBeLessThan(BIRTH.getTime());
    expect(days(partial[0].start, BIRTH)).toBeCloseTo(
      3.5 * YEAR_LENGTHS.solar,
      6,
    );
    // and the balance still running is the other 3.5 years
    expect(days(BIRTH, partial[0].end)).toBeCloseTo(
      3.5 * YEAR_LENGTHS.solar,
      6,
    );
  });

  it("nests antardashas that tile their mahadasha exactly", () => {
    for (const maha of tree) {
      const kids = maha.children ?? [];
      expect(kids).toHaveLength(9);
      expect(kids[0].start.getTime()).toBe(maha.start.getTime());
      expect(kids[8].end.getTime()).toBe(maha.end.getTime());
      for (let i = 1; i < kids.length; i++) {
        expect(kids[i].start.getTime()).toBe(kids[i - 1].end.getTime());
      }
    }
  });

  it("starts each antardasha sequence with its own mahadasha lord", () => {
    for (const maha of tree) {
      expect(maha.children?.[0].lord).toBe(maha.lord);
    }
  });

  it("sizes an antardasha as lordYears/120 of its mahadasha", () => {
    const shukraMaha = tree.find((p) => p.lord === "shukra")!;
    const shaniAntar = shukraMaha.children!.find((p) => p.lord === "shani")!;
    const expected = 20 * (19 / 120) * YEAR_LENGTHS.solar;
    expect(days(shaniAntar.start, shaniAntar.end)).toBeCloseTo(expected, 6);
  });

  it("builds pratyantardashas at depth 3 and stops there", () => {
    const antar = tree[0].children![0];
    expect(antar.children).toHaveLength(9);
    expect(antar.children![0].children).toBeUndefined();
  });

  it("stops at antardasha by default", () => {
    const shallow = vimshottari(0, BIRTH);
    expect(shallow[0].children![0].children).toBeUndefined();
  });
});

describe("year length convention", () => {
  it("changes period boundaries enough to matter", () => {
    const solar = vimshottari(0, BIRTH, { year: "solar" });
    const savana = vimshottari(0, BIRTH, { year: "savana" });
    // shukra's 20 year dasha: 365.25 vs 360 day years is over 100 days of drift by
    // the end of it, which is the difference between a prediction landing and not
    const drift = Math.abs(days(savana[1].end, solar[1].end));
    expect(drift).toBeGreaterThan(100);
  });

  it("keeps solar and tropical within a day over a full mahadasha", () => {
    const solar = vimshottari(0, BIRTH, { year: "solar" });
    const tropical = vimshottari(0, BIRTH, { year: "tropical" });
    expect(Math.abs(days(tropical[1].end, solar[1].end))).toBeLessThan(1);
  });
});

describe("dashaAt", () => {
  const tree = vimshottari(0, BIRTH, { depth: 3 });

  it("returns the nested stack running at a moment", () => {
    const stack = dashaAt(tree, new Date("1995-06-15T00:00:00Z"));
    expect(stack).toHaveLength(3);
    expect(stack[0].level).toBe(1);
    expect(stack[1].level).toBe(2);
    expect(stack[2].level).toBe(3);
    // each level must sit inside its parent
    for (let i = 1; i < stack.length; i++) {
      expect(stack[i].start.getTime()).toBeGreaterThanOrEqual(
        stack[i - 1].start.getTime(),
      );
      expect(stack[i].end.getTime()).toBeLessThanOrEqual(
        stack[i - 1].end.getTime(),
      );
    }
  });

  it("finds ketu running at birth for a 0 ashwini chandra", () => {
    const stack = dashaAt(tree, BIRTH);
    expect(stack[0].lord).toBe("ketu");
  });

  it("returns nothing outside the computed span", () => {
    expect(dashaAt(tree, new Date("1900-01-01T00:00:00Z"))).toEqual([]);
    expect(dashaAt(tree, new Date("2200-01-01T00:00:00Z"))).toEqual([]);
  });

  it("covers every instant in the span with no gaps", () => {
    // walk a few hundred sample points and confirm something is always running
    const span = tree[8].end.getTime() - tree[0].start.getTime();
    for (let i = 0; i < 300; i++) {
      const t = new Date(tree[0].start.getTime() + (span * i) / 300);
      const stack = dashaAt(tree, t);
      expect(stack).toHaveLength(3);
    }
  });
});

describe("every nakshatra lord appears three times", () => {
  it("cycles ketu through budha exactly three times over 27", () => {
    const counts = new Map<GrahaId, number>();
    for (let n = 0; n < 27; n++) {
      const b = dashaBalance(n * NAKSHATRA_SPAN);
      counts.set(b.lord, (counts.get(b.lord) ?? 0) + 1);
    }
    expect(counts.size).toBe(9);
    for (const c of counts.values()) expect(c).toBe(3);
  });
});
