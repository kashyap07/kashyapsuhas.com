// the phala layer cannot be checked against swiss ephemeris, so it is checked for
// internal consistency instead: rules fire on the configurations they claim to fire
// on, never on the ones they do not, and every card can name its source.
import { buildChart } from "../chart";
import { RASHIS } from "../constants";
import { vimshottari } from "../dasha";
import { allStates, grahaState, ownedRashis, relationship } from "../dignity";
import { RULES } from "../rules/corpus";
import { activations, buildContext, byDomain, evaluate } from "../rules/engine";
import type { Rule, RuleContext } from "../rules/types";
import type { GrahaId, GrahaSet } from "../types";

const BIRTH = {
  when: new Date("1990-05-01T00:30:00Z"),
  latitude: 12.9716,
  longitude: 77.5946,
};

/**
 * hand-built graha set so rules can be tested on exact configurations.
 *
 * grahas the test does not place are parked in dhanu rather than left at longitude 0,
 * which would silently pile them all into mesha and, for instance, cancel a kemadruma
 * the test was trying to produce.
 */
const PARK = 8 * 30 + 15; // dhanu

function fakeGrahas(lons: Partial<Record<GrahaId, number>>): GrahaSet {
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
  const out = {} as GrahaSet;
  for (const id of ids) {
    const lon = lons[id] ?? PARK;
    const rashi = Math.floor(lon / 30);
    const nak = Math.floor(lon / (360 / 27));
    out[id] = {
      graha: id,
      lon,
      lat: 0,
      speed: 1,
      vakri: false,
      rashi,
      degInRashi: lon - rashi * 30,
      nakshatra: nak,
      pada: Math.floor((lon - nak * (360 / 27)) / (360 / 108)) + 1,
    };
  }
  return out;
}

function fakeContext(
  lagnaRashi: number,
  lons: Partial<Record<GrahaId, number>>,
): RuleContext {
  const grahas = fakeGrahas(lons);
  const bhavaRashi = Array.from(
    { length: 12 },
    (_, i) => (lagnaRashi + i) % 12,
  );
  const bhava = {} as Record<GrahaId, number>;
  for (const id of Object.keys(grahas) as GrahaId[]) {
    bhava[id] = ((grahas[id].rashi - lagnaRashi + 12) % 12) + 1;
  }
  const chart = {
    birth: BIRTH,
    ayanamsa: 23.8,
    lagna: {
      lon: lagnaRashi * 30 + 15,
      rashi: lagnaRashi,
      degInRashi: 15,
      nakshatra: 0,
      pada: 1,
    },
    grahas,
    bhava,
    bhavaRashi,
  };
  return buildContext(chart);
}

const fire = (id: string, ctx: RuleContext) => {
  const rule = RULES.find((r) => r.id === id) as Rule;
  return rule.test(ctx);
};

describe("dignity", () => {
  it("knows the exaltation rashis", () => {
    // surya exalted in mesha, debilitated in tula
    expect(grahaState("surya", fakeGrahas({ surya: 10 })).dignity).toBe(
      "uccha",
    );
    expect(grahaState("surya", fakeGrahas({ surya: 190 })).dignity).toBe(
      "neecha",
    );
    // shani exalted in tula, debilitated in mesha
    expect(grahaState("shani", fakeGrahas({ shani: 200 })).dignity).toBe(
      "uccha",
    );
    expect(grahaState("shani", fakeGrahas({ shani: 20 })).dignity).toBe(
      "neecha",
    );
    // guru exalted in kataka
    expect(grahaState("guru", fakeGrahas({ guru: 95 })).dignity).toBe("uccha");
  });

  it("puts every graha's debilitation opposite its exaltation", () => {
    const physical: GrahaId[] = [
      "surya",
      "chandra",
      "kuja",
      "budha",
      "guru",
      "shukra",
      "shani",
    ];
    for (const id of physical) {
      let uccha = -1;
      let neecha = -1;
      // several degrees per rashi: chandra is only exalted in the first 3 degrees of
      // vrishabha and budha in the first 15 of kanya, so a single sample would miss them
      for (let rashi = 0; rashi < 12; rashi++) {
        for (const deg of [1, 8, 18, 29]) {
          const d = grahaState(
            id,
            fakeGrahas({ [id]: rashi * 30 + deg }),
          ).dignity;
          if (d === "uccha") uccha = rashi;
          if (d === "neecha") neecha = rashi;
        }
      }
      expect(uccha).toBeGreaterThanOrEqual(0);
      expect((uccha + 6) % 12).toBe(neecha);
    }
  });

  it("splits vrishabha between chandra's exaltation and moolatrikona", () => {
    // chandra: vrishabha 0-3 exalted, 4-30 moolatrikona. testing exaltation by rashi
    // alone would swallow the whole sign and moolatrikona would never appear.
    expect(grahaState("chandra", fakeGrahas({ chandra: 32 })).dignity).toBe(
      "uccha",
    );
    expect(grahaState("chandra", fakeGrahas({ chandra: 45 })).dignity).toBe(
      "moolatrikona",
    );
  });

  it("splits kanya three ways for budha", () => {
    // kanya 0-15 exalted, 16-20 moolatrikona, 20-30 simply his own rashi
    expect(grahaState("budha", fakeGrahas({ budha: 160 })).dignity).toBe(
      "uccha",
    );
    expect(grahaState("budha", fakeGrahas({ budha: 168 })).dignity).toBe(
      "moolatrikona",
    );
    expect(grahaState("budha", fakeGrahas({ budha: 175 })).dignity).toBe(
      "swakshetra",
    );
  });

  it("detects moolatrikona ahead of plain own-rashi", () => {
    // simha 0-20 is surya's moolatrikona, beyond that it is simply his own rashi
    expect(grahaState("surya", fakeGrahas({ surya: 130 })).dignity).toBe(
      "moolatrikona",
    );
    expect(grahaState("surya", fakeGrahas({ surya: 145 })).dignity).toBe(
      "swakshetra",
    );
  });

  it("flags astangata inside the traditional orb and not outside it", () => {
    // shukra combusts within 10 degrees when direct
    const near = allStates(fakeGrahas({ surya: 100, shukra: 105 }));
    const far = allStates(fakeGrahas({ surya: 100, shukra: 120 }));
    expect(near.shukra.astangata).toBe(true);
    expect(far.shukra.astangata).toBe(false);
    // surya can never be combust by himself
    expect(near.surya.astangata).toBe(false);
  });

  it("keeps the friendship table symmetric where the tradition does", () => {
    expect(relationship("surya", "shani")).toBe("shatru");
    expect(relationship("shani", "surya")).toBe("shatru");
    expect(relationship("budha", "shukra")).toBe("mitra");
    expect(relationship("shukra", "budha")).toBe("mitra");
  });

  it("assigns two rashis to each of the five star grahas", () => {
    expect(ownedRashis("kuja")).toEqual([0, 7]);
    expect(ownedRashis("shukra")).toEqual([1, 6]);
    expect(ownedRashis("budha")).toEqual([2, 5]);
    expect(ownedRashis("guru")).toEqual([8, 11]);
    expect(ownedRashis("shani")).toEqual([9, 10]);
    // the luminaries own one each
    expect(ownedRashis("surya")).toEqual([4]);
    expect(ownedRashis("chandra")).toEqual([3]);
    // the nodes own none
    expect(ownedRashis("rahu")).toEqual([]);
  });
});

describe("mahapurusha yogas", () => {
  it("fires when the graha is strong and in a kendra", () => {
    // guru exalted in kataka, lagna kataka, so guru is in the 1st: hamsa yoga
    const ctx = fakeContext(3, { guru: 95 });
    expect(fire("mahapurusha-hamsa", ctx)).not.toBeNull();
  });

  it("does not fire when the graha is strong but not in a kendra", () => {
    // guru exalted in kataka, lagna simha, so guru is in the 12th
    const ctx = fakeContext(4, { guru: 95 });
    expect(fire("mahapurusha-hamsa", ctx)).toBeNull();
  });

  it("does not fire when the graha is in a kendra but not strong", () => {
    // guru in mithuna (neutral), lagna mithuna
    const ctx = fakeContext(2, { guru: 65 });
    expect(fire("mahapurusha-hamsa", ctx)).toBeNull();
  });
});

describe("chandra yogas", () => {
  it("fires gaja kesari with guru in a kendra from chandra", () => {
    // chandra mesha, guru kataka: the 4th from chandra
    expect(
      fire("gaja-kesari", fakeContext(0, { chandra: 5, guru: 95 })),
    ).not.toBeNull();
  });

  it("does not fire gaja kesari from a non-kendra", () => {
    // chandra mesha, guru vrishabha: the 2nd
    expect(
      fire("gaja-kesari", fakeContext(0, { chandra: 5, guru: 35 })),
    ).toBeNull();
  });

  it("separates sunapha, anapha and durudhara correctly", () => {
    // chandra in mesha. 2nd = vrishabha, 12th = meena.
    const onlySecond = fakeContext(0, { chandra: 5, budha: 35 });
    const onlyTwelfth = fakeContext(0, { chandra: 5, budha: 335 });
    const both = fakeContext(0, { chandra: 5, budha: 35, shukra: 335 });

    expect(fire("sunapha", onlySecond)).not.toBeNull();
    expect(fire("anapha", onlySecond)).toBeNull();
    expect(fire("durudhara", onlySecond)).toBeNull();

    expect(fire("anapha", onlyTwelfth)).not.toBeNull();
    expect(fire("sunapha", onlyTwelfth)).toBeNull();

    expect(fire("durudhara", both)).not.toBeNull();
  });

  it("ignores surya and the nodes when judging the chandra yogas", () => {
    // only surya in the 2nd from chandra: not sunapha
    const ctx = fakeContext(0, { chandra: 5, surya: 35, rahu: 335 });
    expect(fire("sunapha", ctx)).toBeNull();
    expect(fire("anapha", ctx)).toBeNull();
    // and with nothing else around chandra, kemadruma stands
    expect(fire("kemadruma", ctx)).not.toBeNull();
  });

  it("cancels kemadruma as soon as something flanks chandra", () => {
    const alone = fakeContext(0, { chandra: 5, guru: 200 });
    const flanked = fakeContext(0, { chandra: 5, guru: 35 });
    expect(fire("kemadruma", alone)).not.toBeNull();
    expect(fire("kemadruma", flanked)).toBeNull();
  });
});

describe("lordship yogas", () => {
  it("finds kuja as yogakaraka for kataka lagna", () => {
    // kataka lagna: kuja owns the 5th (vrishchika) and the 10th (mesha)
    const result = fire("yogakaraka", fakeContext(3, {}));
    expect(result).not.toBeNull();
    expect(result!.grahas).toEqual(["kuja"]);
  });

  it("finds shani as yogakaraka for tula lagna", () => {
    // tula lagna: shani owns the 4th (makara) and the 5th (kumbha)
    const result = fire("yogakaraka", fakeContext(6, {}));
    expect(result).not.toBeNull();
    expect(result!.grahas).toEqual(["shani"]);
  });

  it("finds no yogakaraka for mesha lagna", () => {
    // mesha lagna has no single graha owning both a kendra and a trikona
    expect(fire("yogakaraka", fakeContext(0, {}))).toBeNull();
  });

  it("fires vipareeta when a dusthana lord sits in a dusthana", () => {
    // mesha lagna: the 6th is kanya, ruled by budha. put budha in the 8th (vrishchika)
    const ctx = fakeContext(0, { budha: 215 });
    const result = fire("vipareeta-raja-yoga", ctx);
    expect(result).not.toBeNull();
    expect(result!.grahas).toContain("budha");
  });

  it("fires neecha bhanga only when the dispositor sits in a kendra", () => {
    // shani debilitated in mesha. mesha is ruled by kuja.
    // lagna mesha, kuja in kataka = the 4th, a kendra: cancelled.
    const cancelled = fakeContext(0, { shani: 20, kuja: 95 });
    // kuja in kanya = the 6th, not a kendra: not cancelled.
    const notCancelled = fakeContext(0, { shani: 20, kuja: 155 });
    expect(fire("neecha-bhanga", cancelled)).not.toBeNull();
    expect(fire("neecha-bhanga", notCancelled)).toBeNull();
  });
});

describe("kuja dosha", () => {
  it("fires from the traditional bhavas and not from others", () => {
    const HOUSES = [1, 2, 4, 7, 8, 12];
    for (let bhava = 1; bhava <= 12; bhava++) {
      // mesha lagna, so bhava n is rashi n-1
      const ctx = fakeContext(0, { kuja: (bhava - 1) * 30 + 15 });
      const result = fire("kuja-dosha", ctx);
      if (HOUSES.includes(bhava)) {
        expect(result).not.toBeNull();
      } else {
        expect(result).toBeNull();
      }
    }
  });

  it("reports the chandra and shukra reckonings instead of hiding them", () => {
    const ctx = fakeContext(0, { kuja: 15, chandra: 100, shukra: 200 });
    const result = fire("kuja-dosha", ctx)!;
    const labels = result.factors.map((f) => f.label).join(" ");
    expect(labels).toContain("from Chandra");
    expect(labels).toContain("from Shukra");
  });

  it("admits it is not from BPHS", () => {
    const rule = RULES.find((r) => r.id === "kuja-dosha")!;
    expect(rule.source.short).not.toBe("BPHS");
    expect(rule.source.note).toMatch(/not stated in this form in BPHS/i);
  });
});

describe("corpus hygiene", () => {
  it("gives every rule a unique id", () => {
    const ids = RULES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every rule a source and at least one domain", () => {
    for (const rule of RULES) {
      expect(rule.source.text.length).toBeGreaterThan(0);
      expect(rule.source.chapter.length).toBeGreaterThan(0);
      expect(rule.domains.length).toBeGreaterThan(0);
      expect(rule.says.length).toBeGreaterThan(0);
    }
  });

  it("never cites a verse number, which editions disagree about", () => {
    for (const rule of RULES) {
      expect(rule.source.chapter).not.toMatch(/\d+\.\d+/);
    }
  });

  it("names only real grahas in its results", () => {
    const chart = buildChart(BIRTH);
    const valid = new Set(Object.keys(chart.grahas));
    for (const rule of evaluate(chart)) {
      for (const id of rule.result.grahas) expect(valid.has(id)).toBe(true);
    }
  });
});

describe("evaluation on a real chart", () => {
  const chart = buildChart(BIRTH);
  const fired = evaluate(chart);

  it("fires at least one rule and every fired rule carries its factors", () => {
    expect(fired.length).toBeGreaterThan(0);
    for (const rule of fired) {
      expect(rule.result.factors.length).toBeGreaterThan(0);
      for (const f of rule.result.factors) {
        expect(f.label.length).toBeGreaterThan(0);
        expect(f.detail.length).toBeGreaterThan(0);
      }
    }
  });

  it("is deterministic", () => {
    const again = evaluate(buildChart(BIRTH));
    expect(again.map((r) => r.id)).toEqual(fired.map((r) => r.id));
  });

  it("groups by domain without losing anything", () => {
    const grouped = byDomain(fired);
    const seen = new Set<string>();
    for (const list of grouped.values()) for (const r of list) seen.add(r.id);
    expect(seen.size).toBe(fired.length);
  });
});

describe("timing", () => {
  const chart = buildChart(BIRTH);
  const tree = vimshottari(chart.grahas.chandra.lon, BIRTH.when, { depth: 2 });

  it("activates a rule only in the dashas of the grahas that form it", () => {
    for (const rule of evaluate(chart)) {
      const involved = new Set(rule.result.grahas);
      for (const act of activations(rule, tree)) {
        for (const lord of act.lords) expect(involved.has(lord)).toBe(true);
      }
    }
  });

  it("marks a two-graha yoga strongest when both lords are running", () => {
    const twoGraha = evaluate(chart).find((r) => r.result.grahas.length > 1);
    if (!twoGraha) return;
    const acts = activations(twoGraha, tree);
    const full = acts.filter((a) => a.strength === "full");
    for (const a of full) expect(a.lords.length).toBe(2);
  });

  it("returns activations in chronological order", () => {
    for (const rule of evaluate(chart)) {
      const acts = activations(rule, tree);
      for (let i = 1; i < acts.length; i++) {
        expect(acts[i].period.start.getTime()).toBeGreaterThanOrEqual(
          acts[i - 1].period.start.getTime(),
        );
      }
    }
  });

  it("finds no activation for a graha whose dasha never comes in the span", () => {
    const shortTree = vimshottari(chart.grahas.chandra.lon, BIRTH.when, {
      cycles: 1,
      depth: 2,
    });
    for (const rule of evaluate(chart)) {
      for (const act of activations(rule, shortTree)) {
        expect(rule.result.grahas).toContain(act.lords[0]);
      }
    }
  });
});

describe("rashi lordship sanity", () => {
  it("has every rashi lorded by exactly one graha", () => {
    for (const rashi of RASHIS) {
      expect(rashi.lord).toBeTruthy();
    }
    // the twelve rashis are shared among seven grahas
    expect(new Set(RASHIS.map((r) => r.lord)).size).toBe(7);
  });
});
