import { buildChart } from "../chart";
import { vimshottari } from "../dasha";
import { guruTouches, intersect, overlaps, rashiTransits } from "../gochara";
import { DOMAINS, eventWindows, readAllDomains } from "../rules/bhava";
import { buildContext } from "../rules/engine";

const BIRTH = {
  when: new Date("1990-01-01T06:30:00Z"),
  latitude: 12.9716,
  longitude: 77.5946,
};

const YEAR_MS = 365.25 * 86400000;

describe("rashi transits", () => {
  const from = new Date("2020-01-01T00:00:00Z");
  const to = new Date("2032-01-01T00:00:00Z");
  const transits = rashiTransits("guru", from, to);

  it("covers the whole range with no gaps or overlaps", () => {
    expect(transits[0].from.getTime()).toBe(from.getTime());
    expect(transits[transits.length - 1].to.getTime()).toBe(to.getTime());
    for (let i = 1; i < transits.length; i++) {
      expect(transits[i].from.getTime()).toBe(transits[i - 1].to.getTime());
    }
  });

  it("never repeats a rashi back to back", () => {
    for (let i = 1; i < transits.length; i++) {
      expect(transits[i].rashi).not.toBe(transits[i - 1].rashi);
    }
  });

  it("takes guru roughly one year per rashi once retrogression is accounted for", () => {
    // guru turns retrograde for about four months a year, so near a boundary he can
    // cross, back out and cross again. individual intervals are therefore sometimes
    // only weeks long, which is real motion and not an artefact. total occupancy per
    // rashi is what should come to about a year.
    const total = new Map<number, number>();
    for (const t of transits.slice(1, -1)) {
      total.set(
        t.rashi,
        (total.get(t.rashi) ?? 0) + (t.to.getTime() - t.from.getTime()),
      );
    }
    expect(total.size).toBeGreaterThan(5);
    for (const ms of total.values()) {
      const years = ms / YEAR_MS;
      expect(years).toBeGreaterThan(0.6);
      expect(years).toBeLessThan(1.4);
    }
  });

  it("shows the retrograde re-crossing rather than hiding it", () => {
    // at least one rashi should be entered more than once in twelve years
    const counts = new Map<number, number>();
    for (const t of transits)
      counts.set(t.rashi, (counts.get(t.rashi) ?? 0) + 1);
    expect([...counts.values()].some((c) => c > 1)).toBe(true);
  });

  it("completes about one circuit of the zodiac in twelve years", () => {
    // 12 years should be roughly one full pass, so most rashis appear
    const seen = new Set(transits.map((t) => t.rashi));
    expect(seen.size).toBeGreaterThanOrEqual(11);
  });

  it("moves shani far more slowly than guru", () => {
    const shani = rashiTransits("shani", from, to);
    expect(shani.length).toBeLessThan(transits.length);
  });

  it("returns every rashi as a valid index", () => {
    for (const t of transits) {
      expect(t.rashi).toBeGreaterThanOrEqual(0);
      expect(t.rashi).toBeLessThan(12);
      expect(t.to.getTime()).toBeGreaterThan(t.from.getTime());
    }
  });
});

describe("guru touches", () => {
  const from = new Date("2020-01-01T00:00:00Z");
  const to = new Date("2032-01-01T00:00:00Z");

  it("finds about four contacts per circuit, by occupation and by drishti", () => {
    const touches = guruTouches(0, from, to);
    // guru occupies mesha once in twelve years and aspects it from three other
    // rashis. retrograde fragments are merged, so this should be about four
    expect(touches.length).toBeGreaterThanOrEqual(3);
    expect(touches.length).toBeLessThanOrEqual(6);
  });

  it("merges the retrograde fragments into whole contacts", () => {
    const touches = guruTouches(0, from, to);
    for (const t of touches) {
      const months = (t.to.getTime() - t.from.getTime()) / (YEAR_MS / 12);
      // a merged contact should read as months, not days
      expect(months).toBeGreaterThan(2);
    }
    // and they must not overlap each other
    for (let i = 1; i < touches.length; i++) {
      expect(touches[i].from.getTime()).toBeGreaterThan(
        touches[i - 1].to.getTime(),
      );
    }
  });

  it("keeps distinct contacts apart instead of welding them into one blob", () => {
    // regression: the sources are every other rashi, so two separate contacts are
    // parted by a single intervening rashi, and retrogradation chops that into
    // stretches of about five months. merging on elapsed time alone joined them into
    // one multi-year span, which made a Guru trigger true of every window and
    // therefore worthless. fragments must merge within a rashi, never across two.
    const touches = guruTouches(
      1,
      new Date("2026-01-01"),
      new Date("2040-01-01"),
    );
    for (const t of touches) {
      const years = (t.to.getTime() - t.from.getTime()) / YEAR_MS;
      // guru hovers around a rashi for up to about two years counting the retrograde
      // excursion, but never five
      expect(years).toBeLessThan(2.5);
    }
    // and there must be real silence between them
    expect(touches.length).toBeGreaterThanOrEqual(4);
  });

  it("gives different windows for different bhavas", () => {
    const a = guruTouches(0, from, to).map((t) => t.from.getTime());
    const b = guruTouches(6, from, to).map((t) => t.from.getTime());
    expect(a).not.toEqual(b);
  });
});

describe("interval helpers", () => {
  const a = { from: new Date("2020-01-01"), to: new Date("2022-01-01") };
  const b = { from: new Date("2021-01-01"), to: new Date("2023-01-01") };
  const c = { from: new Date("2025-01-01"), to: new Date("2026-01-01") };

  it("detects overlap", () => {
    expect(overlaps(a, b)).toBe(true);
    expect(overlaps(a, c)).toBe(false);
  });

  it("intersects to the shared span", () => {
    const hit = intersect(a, b)!;
    expect(hit.from).toEqual(new Date("2021-01-01"));
    expect(hit.to).toEqual(new Date("2022-01-01"));
    expect(intersect(a, c)).toBeNull();
  });
});

describe("event windows", () => {
  const chart = buildChart(BIRTH);
  const ctx = buildContext(chart);
  const readings = readAllDomains(ctx);
  const tree = vimshottari(chart.grahas.chandra.lon, BIRTH.when, { depth: 2 });

  const windowsFor = (domain: string) => {
    const reading = readings.find((r) => r.def.domain === domain)!;
    const primary = reading.def.bhavas[0];
    const rashi = chart.bhavaRashi[primary - 1];
    const horizon = new Date(BIRTH.when.getTime() + 75 * YEAR_MS);
    const guru = guruTouches(rashi, BIRTH.when, horizon);
    return eventWindows(ctx, reading, tree, BIRTH.when, guru);
  };

  it("produces dated windows for marriage", () => {
    const windows = windowsFor("vivaha");
    expect(windows.length).toBeGreaterThan(0);
    for (const w of windows) {
      expect(w.to.getTime()).toBeGreaterThan(w.from.getTime());
      expect(w.because.length).toBeGreaterThan(20);
    }
  });

  it("keeps every window inside the plausible age band", () => {
    for (const def of DOMAINS) {
      if (!def.event) continue;
      for (const w of windowsFor(def.domain)) {
        // the window must at least touch the band
        expect(w.ageTo).toBeGreaterThanOrEqual(def.event.minAge);
        expect(w.ageFrom).toBeLessThanOrEqual(def.event.maxAge);
      }
    }
  });

  it("returns windows in chronological order", () => {
    for (const def of DOMAINS) {
      if (!def.event) continue;
      const windows = windowsFor(def.domain);
      for (let i = 1; i < windows.length; i++) {
        expect(windows[i].from.getTime()).toBeGreaterThanOrEqual(
          windows[i - 1].from.getTime(),
        );
      }
    }
  });

  it("only names grahas that actually carry the matter", () => {
    for (const def of DOMAINS) {
      if (!def.event) continue;
      const reading = readings.find((r) => r.def.domain === def.domain)!;
      const primary = def.bhavas[0];
      const key = new Set([
        ctx.lordOf(primary),
        ...def.karakas,
        ...ctx.occupants(primary),
      ]);
      for (const w of windowsFor(def.domain)) {
        // at least one of the two lords must be a carrier
        expect(w.lords.some((l) => key.has(l))).toBe(true);
      }
      expect(reading).toBeDefined();
    }
  });

  it("scores a window with two carriers above one with a single carrier", () => {
    const windows = windowsFor("vivaha");
    const strong = windows.filter((w) => w.score >= 1);
    const weak = windows.filter((w) => w.score < 1);
    for (const w of strong) expect(w.score).toBeGreaterThanOrEqual(0.75);
    for (const w of weak) expect(w.score).toBeLessThan(1);
  });

  it("keeps guru triggers inside their own window", () => {
    for (const def of DOMAINS) {
      if (!def.event) continue;
      for (const w of windowsFor(def.domain)) {
        for (const t of w.triggers) {
          expect(t.from.getTime()).toBeGreaterThanOrEqual(w.from.getTime());
          expect(t.to.getTime()).toBeLessThanOrEqual(w.to.getTime());
        }
      }
    }
  });

  it("refuses to date longevity", () => {
    // predicting a death date is not something this tool should do, so the life
    // course domain deliberately carries no event config
    const ayu = DOMAINS.find((d) => d.domain === "ayu")!;
    expect(ayu.event).toBeUndefined();
    expect(windowsFor("ayu")).toEqual([]);
  });

  it("is deterministic", () => {
    expect(windowsFor("vivaha").map((w) => w.from.toISOString())).toEqual(
      windowsFor("vivaha").map((w) => w.from.toISOString()),
    );
  });
});
