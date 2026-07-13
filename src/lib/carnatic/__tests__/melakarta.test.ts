import { MELAKARTAS } from "../melakarta";
import { SVARAS } from "../pitches";

describe("melakarta scheme", () => {
  it("generates all 72, numbered and grouped into 12 chakras", () => {
    expect(MELAKARTAS).toHaveLength(72);
    expect(MELAKARTAS[0].n).toBe(1);
    expect(MELAKARTAS[71].n).toBe(72);
    expect(MELAKARTAS[5].chakra).toBe(1);
    expect(MELAKARTAS[6].chakra).toBe(2);
    expect(MELAKARTAS[71].chakra).toBe(12);
  });

  it("derives the classic scales correctly", () => {
    const scaleOf = (n: number) => MELAKARTAS[n - 1].scale;
    // spot checks against the standard tables
    expect(scaleOf(1)).toEqual(["S", "R1", "G1", "M1", "P", "D1", "N1"]);
    expect(scaleOf(8)).toEqual(["S", "R1", "G2", "M1", "P", "D1", "N2"]);
    expect(scaleOf(15)).toEqual(["S", "R1", "G3", "M1", "P", "D1", "N3"]);
    expect(scaleOf(22)).toEqual(["S", "R2", "G2", "M1", "P", "D2", "N2"]);
    expect(scaleOf(29)).toEqual(["S", "R2", "G3", "M1", "P", "D2", "N3"]);
    expect(scaleOf(36)).toEqual(["S", "R3", "G3", "M1", "P", "D3", "N3"]);
    expect(scaleOf(51)).toEqual(["S", "R1", "G3", "M2", "P", "D1", "N3"]);
    expect(scaleOf(65)).toEqual(["S", "R2", "G3", "M2", "P", "D2", "N3"]);
    expect(scaleOf(72)).toEqual(["S", "R3", "G3", "M2", "P", "D3", "N3"]);
  });

  it("uses ma1 for the first half, ma2 for the second", () => {
    for (const m of MELAKARTAS) {
      expect(m.scale[3]).toBe(m.n <= 36 ? "M1" : "M2");
    }
  });

  it("has strictly ascending pitches in every scale", () => {
    for (const m of MELAKARTAS) {
      const ratios = m.scale.map((id) => SVARAS[id].ratio);
      for (let i = 1; i < ratios.length; i++) {
        expect(ratios[i]).toBeGreaterThan(ratios[i - 1]);
      }
    }
  });

  it("has unique names and slugs", () => {
    expect(new Set(MELAKARTAS.map((m) => m.slug)).size).toBe(72);
    expect(new Set(MELAKARTAS.map((m) => m.kannada)).size).toBe(72);
  });
});
