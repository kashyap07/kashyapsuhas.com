import { MELAKARTAS } from "../melakarta";
import { notationPlayable, parseNotation } from "../notation";
import { SVARAS, svaraFreq } from "../pitches";
import { SONGS } from "../songs";

describe("parseNotation", () => {
  it("reads notes, extensions and octaves", () => {
    const notes = parseNotation("G ; ; R | ; S s S'");
    expect(notes).toEqual([
      { degree: 2, octave: 0, units: 3, restBefore: 0 },
      { degree: 1, octave: 0, units: 2, restBefore: 0 },
      { degree: 0, octave: 0, units: 1, restBefore: 0 },
      { degree: 0, octave: -1, units: 1, restBefore: 0 },
      { degree: 0, octave: 1, units: 1, restBefore: 0 },
    ]);
  });

  it("splits clustered letters across one unit", () => {
    const [p, r] = parseNotation("PR");
    expect(p).toMatchObject({ degree: 4, units: 0.5 });
    expect(r).toMatchObject({ degree: 1, units: 0.5 });
  });

  it("turns leading extensions and underscores into rests", () => {
    const notes = parseNotation(", , _ S R");
    expect(notes[0]).toMatchObject({ degree: 0, restBefore: 3 });
    expect(notes[1]).toMatchObject({ degree: 1, restBefore: 0 });
  });

  it("ignores barlines and rejects junk", () => {
    expect(parseNotation("S | R || G")).toHaveLength(3);
    expect(() => parseNotation("S X R")).toThrow(/bad notation token/);
  });
});

describe("notationPlayable", () => {
  it("renders the same line in each raga's own swaras", () => {
    const mayamalavagowla = MELAKARTAS[14]; // r1
    const shankarabharana = MELAKARTAS[28]; // r2
    const [inMmg] = notationPlayable("R", mayamalavagowla);
    const [inSb] = notationPlayable("R", shankarabharana);
    expect(inMmg.freq).toBeCloseTo(svaraFreq("R1", 0));
    expect(inSb.freq).toBeCloseTo(svaraFreq("R2", 0));
  });

  it("drops mandra notes an octave and lifts tara ones", () => {
    const [low, mid, high] = notationPlayable("n N N'", MELAKARTAS[28]);
    expect(mid.freq).toBeCloseTo(svaraFreq("N3", 0));
    expect(low.freq).toBeCloseTo(mid.freq / 2);
    expect(high.freq).toBeCloseTo(mid.freq * 2);
  });
});

describe("songs", () => {
  it("every excerpt parses", () => {
    for (const song of SONGS) {
      expect(() => parseNotation(song.notation)).not.toThrow();
    }
  });

  it("every excerpt voices ri ga ma da ni, or a slot is unguessable", () => {
    for (const song of SONGS) {
      const degrees = new Set(
        parseNotation(song.notation).map((n) => n.degree),
      );
      for (const degree of [1, 2, 3, 5, 6]) {
        expect({ song: song.slug, degree, has: degrees.has(degree) }).toEqual({
          song: song.slug,
          degree,
          has: true,
        });
      }
    }
  });

  it("points each song at a real home mela", () => {
    for (const song of SONGS) {
      const home = MELAKARTAS[song.homeMela - 1];
      expect(home).toBeDefined();
      // sanity: the notation stays inside the 7 degrees
      for (const n of parseNotation(song.notation)) {
        expect(home.scale[n.degree]).toBeDefined();
        expect(SVARAS[home.scale[n.degree]]).toBeDefined();
      }
    }
  });
});
