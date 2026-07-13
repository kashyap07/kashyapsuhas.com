// the 12 svarasthanas under 16 names (ri2/ga1, ri3/ga2, da2/ni1, da3/ni2
// share pitches). just-intonation ratios, sweeter against a drone than 12-tet.
export type SvaraId =
  | "S"
  | "R1"
  | "R2"
  | "R3"
  | "G1"
  | "G2"
  | "G3"
  | "M1"
  | "M2"
  | "P"
  | "D1"
  | "D2"
  | "D3"
  | "N1"
  | "N2"
  | "N3";

export type Svara = {
  id: SvaraId;
  ratio: number;
  semitone: number; // 0 to 11 above sa, enharmonic names share one
  latin: string; // "sa", "ri₂" ...
  kannada: string; // "ಸ", "ರಿ" ...
  variant: 0 | 1 | 2 | 3; // 0 = invariant (sa, pa)
};

const sv = (
  id: SvaraId,
  ratio: number,
  semitone: number,
  latin: string,
  kannada: string,
  variant: 0 | 1 | 2 | 3,
): Svara => ({ id, ratio, semitone, latin, kannada, variant });

export const SVARAS: Record<SvaraId, Svara> = {
  S: sv("S", 1, 0, "sa", "ಸ", 0),
  R1: sv("R1", 16 / 15, 1, "ri₁", "ರಿ", 1),
  R2: sv("R2", 9 / 8, 2, "ri₂", "ರಿ", 2),
  R3: sv("R3", 6 / 5, 3, "ri₃", "ರಿ", 3),
  G1: sv("G1", 9 / 8, 2, "ga₁", "ಗ", 1),
  G2: sv("G2", 6 / 5, 3, "ga₂", "ಗ", 2),
  G3: sv("G3", 5 / 4, 4, "ga₃", "ಗ", 3),
  M1: sv("M1", 4 / 3, 5, "ma₁", "ಮ", 1),
  M2: sv("M2", 45 / 32, 6, "ma₂", "ಮ", 2),
  P: sv("P", 3 / 2, 7, "pa", "ಪ", 0),
  D1: sv("D1", 8 / 5, 8, "da₁", "ದ", 1),
  D2: sv("D2", 5 / 3, 9, "da₂", "ದ", 2),
  D3: sv("D3", 9 / 5, 10, "da₃", "ದ", 3),
  N1: sv("N1", 5 / 3, 9, "ni₁", "ನಿ", 1),
  N2: sv("N2", 9 / 5, 10, "ni₂", "ನಿ", 2),
  N3: sv("N3", 15 / 8, 11, "ni₃", "ನಿ", 3),
};

// the 12 keyboard positions, enharmonic names grouped
export type KeyPosition = { semitone: number; svaras: Svara[] };

export const POSITIONS: KeyPosition[] = Array.from({ length: 12 }, (_, s) => ({
  semitone: s,
  svaras: Object.values(SVARAS).filter((v) => v.semitone === s),
}));

// melody sa. d4-ish sits nicely in a flute register
export const SA_HZ = 293.66;

export const svaraFreq = (id: SvaraId, octave: number, saHz = SA_HZ) =>
  saHz * SVARAS[id].ratio * 2 ** octave;
