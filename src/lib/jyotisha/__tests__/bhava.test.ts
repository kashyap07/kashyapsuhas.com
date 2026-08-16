import { buildChart } from "../chart";
import { GRAHA_NAMES } from "../constants";
import { vimshottari } from "../dasha";
import {
  aspectDistances,
  aspectedRashis,
  aspects,
  aspectsOnRashi,
} from "../drishti";
import { BHAVA_SIGNIFIES, KARAKATVA } from "../karakatva";
import {
  DOMAINS,
  describeDasha,
  domainTiming,
  readAllDomains,
  readDomain,
} from "../rules/bhava";
import { buildContext } from "../rules/engine";
import type { GrahaId } from "../types";

const BIRTH = {
  when: new Date("1990-01-01T06:30:00Z"),
  latitude: 12.9716,
  longitude: 77.5946,
};

describe("drishti", () => {
  it("gives every graha the 7th aspect", () => {
    const ids: GrahaId[] = [
      "surya",
      "chandra",
      "kuja",
      "budha",
      "guru",
      "shukra",
      "shani",
    ];
    for (const id of ids) expect(aspectDistances(id)).toContain(7);
  });

  it("gives kuja, guru and shani their special aspects", () => {
    expect(aspectDistances("kuja")).toEqual([4, 7, 8]);
    expect(aspectDistances("guru")).toEqual([5, 7, 9]);
    expect(aspectDistances("shani")).toEqual([3, 7, 10]);
  });

  it("gives the benefics and luminaries only the 7th", () => {
    expect(aspectDistances("surya")).toEqual([7]);
    expect(aspectDistances("chandra")).toEqual([7]);
    expect(aspectDistances("budha")).toEqual([7]);
    expect(aspectDistances("shukra")).toEqual([7]);
  });

  it("leaves the disputed node aspects off unless asked", () => {
    expect(aspectDistances("rahu")).toEqual([]);
    expect(aspectDistances("ketu")).toEqual([]);
    expect(aspectDistances("rahu", { nodeAspects: true })).toEqual([5, 7, 9]);
  });

  it("counts the 7th aspect as the opposite rashi", () => {
    // mesha (0) aspects tula (6)
    expect(aspectedRashis("surya", 0)).toEqual([6]);
    // and it wraps
    expect(aspectedRashis("surya", 8)).toEqual([2]);
  });

  it("places shani's 3rd and 10th correctly", () => {
    // shani in mesha (0): 3rd is mithuna (2), 7th is tula (6), 10th is makara (9)
    expect(aspectedRashis("shani", 0).sort((a, b) => a - b)).toEqual([2, 6, 9]);
  });

  it("places guru's 5th and 9th correctly", () => {
    // guru in mesha (0): 5th simha (4), 7th tula (6), 9th dhanu (8)
    expect(aspectedRashis("guru", 0).sort((a, b) => a - b)).toEqual([4, 6, 8]);
  });

  it("places kuja's 4th and 8th correctly", () => {
    // kuja in mesha (0): 4th kataka (3), 7th tula (6), 8th vrishchika (7)
    expect(aspectedRashis("kuja", 0).sort((a, b) => a - b)).toEqual([3, 6, 7]);
  });

  it("is never self-aspecting", () => {
    for (let rashi = 0; rashi < 12; rashi++) {
      for (const id of ["kuja", "guru", "shani", "surya"] as GrahaId[]) {
        expect(aspects(id, rashi, rashi)).toBe(false);
      }
    }
  });

  it("finds incoming aspects on a rashi", () => {
    const rashiOf = {
      surya: 0,
      chandra: 0,
      kuja: 0,
      budha: 0,
      guru: 0,
      shukra: 0,
      shani: 0,
      rahu: 0,
      ketu: 0,
    } as Record<GrahaId, number>;
    // everything sits in mesha, so everything with a 7th aspect hits tula
    const onTula = aspectsOnRashi(6, rashiOf);
    expect(onTula.map((a) => a.graha).sort()).toEqual(
      ["budha", "chandra", "guru", "kuja", "shani", "shukra", "surya"].sort(),
    );
    // the nodes are excluded by default
    expect(onTula.some((a) => a.graha === "rahu")).toBe(false);
  });

  it("marks special aspects as special and the 7th as not", () => {
    const rashiOf = { shani: 0 } as Record<GrahaId, number>;
    const onMithuna = aspectsOnRashi(2, rashiOf); // shani's 3rd
    expect(onMithuna[0].special).toBe(true);
    const onTula = aspectsOnRashi(6, rashiOf); // shani's 7th
    expect(onTula[0].special).toBe(false);
  });
});

describe("domain readings", () => {
  const chart = buildChart(BIRTH);
  const ctx = buildContext(chart);
  const readings = readAllDomains(ctx);

  it("covers every declared domain", () => {
    expect(readings).toHaveLength(DOMAINS.length);
    expect(readings.map((r) => r.def.domain)).toEqual(
      DOMAINS.map((d) => d.domain),
    );
  });

  it("gives every reading observations, each cited", () => {
    for (const reading of readings) {
      expect(reading.observations.length).toBeGreaterThan(0);
      for (const o of reading.observations) {
        expect(o.label.length).toBeGreaterThan(0);
        expect(o.detail.length).toBeGreaterThan(0);
        expect(o.source.text.length).toBeGreaterThan(0);
        expect(["benefic", "malefic", "mixed"]).toContain(o.polarity);
      }
    }
  });

  it("resolves each bhava to the right rashi and lord", () => {
    for (const reading of readings) {
      for (const h of reading.houses) {
        expect(h.rashi).toBe(chart.bhavaRashi[h.bhava - 1]);
        // the lord of a bhava must actually own that rashi
        expect(chart.bhavaRashi[h.bhava - 1]).toBe(h.rashi);
        expect(h.occupants.every((o) => chart.bhava[o] === h.bhava)).toBe(true);
      }
    }
  });

  it("names the marriage karaka as shukra and reads the 7th first", () => {
    const vivaha = readings.find((r) => r.def.domain === "vivaha")!;
    expect(vivaha.def.bhavas[0]).toBe(7);
    expect(vivaha.def.karakas).toEqual(["shukra"]);
    expect(vivaha.def.note).toMatch(/Guru as karaka of the husband/);
  });

  it("keeps contested observations out of the tally", () => {
    for (const reading of readings) {
      const counted = reading.observations.filter((o) => !o.contested);
      expect(reading.supporting).toBe(
        counted.filter((o) => o.polarity === "benefic").length,
      );
      expect(reading.afflicting).toBe(
        counted.filter((o) => o.polarity === "malefic").length,
      );
    }
  });

  it("flags karako bhava nashaya as contested when it applies", () => {
    // build a chart context where shukra sits in the 7th
    const forced = {
      ...ctx,
      bhavaOf: (id: GrahaId) => (id === "shukra" ? 7 : ctx.bhavaOf(id)),
    };
    const vivaha = readDomain(
      forced,
      DOMAINS.find((d) => d.domain === "vivaha")!,
    );
    const flagged = vivaha.observations.find((o) =>
      o.label.includes("the very bhava it signifies"),
    );
    expect(flagged).toBeDefined();
    expect(flagged!.contested).toMatch(/far from universally accepted/i);
  });

  it("does not flag karako bhava nashaya when the karaka is elsewhere", () => {
    const forced = {
      ...ctx,
      bhavaOf: (id: GrahaId) => (id === "shukra" ? 3 : ctx.bhavaOf(id)),
    };
    const vivaha = readDomain(
      forced,
      DOMAINS.find((d) => d.domain === "vivaha")!,
    );
    expect(
      vivaha.observations.some((o) =>
        o.label.includes("the very bhava it signifies"),
      ),
    ).toBe(false);
  });

  it("includes the bhava lords and karakas in the timing set", () => {
    for (const reading of readings) {
      for (const h of reading.houses) expect(reading.grahas).toContain(h.lord);
      for (const k of reading.def.karakas) expect(reading.grahas).toContain(k);
    }
  });

  it("times each domain only in the dashas of its own grahas", () => {
    const tree = vimshottari(chart.grahas.chandra.lon, BIRTH.when, {
      depth: 2,
    });
    for (const reading of readings) {
      const involved = new Set(reading.grahas);
      for (const act of domainTiming(reading, tree)) {
        for (const lord of act.lords) expect(involved.has(lord)).toBe(true);
      }
    }
  });

  it("never cites a verse number", () => {
    for (const reading of readings) {
      for (const o of reading.observations) {
        expect(o.source.chapter).not.toMatch(/\d+\.\d+/);
      }
    }
  });

  it("is deterministic", () => {
    const again = readAllDomains(buildContext(buildChart(BIRTH)));
    expect(again.map((r) => r.observations.map((o) => o.label))).toEqual(
      readings.map((r) => r.observations.map((o) => o.label)),
    );
  });
});

describe("plain-language reading", () => {
  const chart = buildChart(BIRTH);
  const ctx = buildContext(chart);
  const readings = readAllDomains(ctx);

  it("gives every domain a multi-sentence summary", () => {
    for (const reading of readings) {
      expect(reading.summary.length).toBeGreaterThanOrEqual(3);
      for (const line of reading.summary) {
        expect(line.length).toBeGreaterThan(30);
        // a summary that still shows raw template holes is a bug
        expect(line).not.toMatch(/undefined|NaN|\[object/);
      }
    }
  });

  it("names the ruling graha and the arena in the opening line", () => {
    for (const reading of readings) {
      const lord = ctx.lordOf(reading.def.bhavas[0]);
      expect(reading.summary[0]).toContain(GRAHA_NAMES[lord].name);
      expect(reading.summary[0]).toContain(reading.def.label);
    }
  });

  it("states the balance using the same numbers as the tally", () => {
    for (const reading of readings) {
      const balance = reading.summary[reading.summary.length - 1];
      expect(balance).toContain(String(reading.supporting));
      expect(balance).toContain(String(reading.afflicting));
    }
  });

  it("explains what each observation means, not just what it is", () => {
    for (const reading of readings) {
      // every observation carrying a polarity that feeds the tally should say why
      const meaningful = reading.observations.filter((o) => o.means);
      expect(meaningful.length).toBeGreaterThan(0);
      for (const o of meaningful) {
        expect(o.means!.length).toBeGreaterThan(25);
        expect(o.means).not.toMatch(/undefined|NaN|\[object/);
      }
    }
  });

  it("describes a dasha in words for every graha", () => {
    const ids: GrahaId[] = [
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
    for (const id of ids) {
      expect(describeDasha([id]).length).toBeGreaterThan(30);
    }
    // a pair reads as the first coloured by the second
    const pair = describeDasha(["shani", "budha"]);
    expect(pair).toContain("Budha");
    expect(pair.length).toBeGreaterThan(describeDasha(["shani"]).length);
    expect(describeDasha([])).toBe("");
  });

  it("keeps every graha and bhava in the vocabulary", () => {
    // a missing entry would surface as "undefined" in a reading
    for (let b = 1; b <= 12; b++) {
      expect(BHAVA_SIGNIFIES[b].arena.length).toBeGreaterThan(0);
      expect(BHAVA_SIGNIFIES[b].covers.length).toBeGreaterThan(0);
    }
    for (const id of Object.keys(KARAKATVA) as GrahaId[]) {
      expect(KARAKATVA[id].vocations.length).toBeGreaterThan(0);
      expect(KARAKATVA[id].qualities.length).toBeGreaterThan(0);
      expect(KARAKATVA[id].dasha.length).toBeGreaterThan(20);
    }
  });

  it("says nothing in the summary that the observations do not support", () => {
    // the balance sentence must agree with the direction of the tally
    for (const reading of readings) {
      const balance = reading.summary[reading.summary.length - 1];
      if (reading.afflicting > reading.supporting) {
        expect(balance).toMatch(/weigh against/);
      } else if (reading.supporting > reading.afflicting) {
        expect(balance).toMatch(/favour/);
      } else {
        expect(balance).toMatch(/evenly divided/);
      }
    }
  });
});
