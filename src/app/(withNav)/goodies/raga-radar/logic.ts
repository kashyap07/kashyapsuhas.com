// pure math for raga radar: fold sung pitches into a one-octave histogram,
// read svarasthana masses off it, rank the 72 melakartas, and hunt for sa.
// mass is measured in "seconds of confident sound" (weight = clarity * dt).
import { MELAKARTAS, Melakarta, melaSemitones } from "@lib/carnatic/melakarta";
import { POSITIONS } from "@lib/carnatic/pitches";

// internal fold anchor, c4. sa can sit anywhere relative to it
export const FOLD_REF_HZ = 261.6256;

export const BINS = 240; // 5-cent bins across one octave
const BIN_CENTS = 1200 / BINS;

// just-intonation cents of the 12 svarasthanas above sa. enharmonic pairs
// (r2/g1 etc.) share a ratio, so the first svara at each position suffices
export const JI_CENTS: number[] = POSITIONS.map(
  (p) => 1200 * Math.log2(p.svaras[0].ratio),
);

export const centsFromHz = (hz: number, ref = FOLD_REF_HZ) =>
  1200 * Math.log2(hz / ref);

export const foldCents = (c: number) => ((c % 1200) + 1200) % 1200;

export const makeHistogram = () => new Float32Array(BINS);

export function addPitch(hist: Float32Array, cents: number, weight: number) {
  hist[Math.round(foldCents(cents) / BIN_CENTS) % BINS] += weight;
}

export const totalMass = (hist: Float32Array) =>
  hist.reduce((a, b) => a + b, 0);

// circular distance between two folded cent values
const wrapDist = (a: number, b: number) => {
  const d = Math.abs(foldCents(a) - foldCents(b));
  return Math.min(d, 1200 - d);
};

// triangular-weighted mass in a window around a folded position
export function massAround(
  hist: Float32Array,
  centerCents: number,
  halfWidth: number,
) {
  let acc = 0;
  const bins = Math.ceil(halfWidth / BIN_CENTS);
  const centerBin = foldCents(centerCents) / BIN_CENTS;
  for (let k = -bins; k <= bins; k++) {
    const bin = (((Math.round(centerBin) + k) % BINS) + BINS) % BINS;
    const dist = wrapDist(bin * BIN_CENTS, centerCents);
    const w = Math.max(0, 1 - dist / halfWidth);
    acc += hist[bin] * w;
  }
  return acc;
}

// mass at each of the 12 svarasthanas, given where sa sits in the fold.
// 55-cent half-window: wide enough to catch drone-tempered singing,
// narrow enough that a gamaka passing between svaras counts for little
export const svaraMasses = (hist: Float32Array, saOffsetCents: number) =>
  JI_CENTS.map((c) => massAround(hist, saOffsetCents + c, 55));

// sa and pa live in every melakarta, so only the other ten positions vote
const VARIABLE = [1, 2, 3, 4, 5, 6, 8, 9, 10, 11];

export const variableMass = (masses: number[]) =>
  VARIABLE.reduce((a, s) => a + masses[s], 0);

// how many distinct variable svaras carry real weight
export function heardCount(masses: number[]) {
  const total = variableMass(masses);
  if (total <= 0) return 0;
  return VARIABLE.filter((s) => masses[s] > 0.08 * total).length;
}

export type MelaRank = { mela: Melakarta; score: number };

// in-scale mass minus a penalty for mass on foreign svaras, normalized.
// ties are real: until enough svaras are heard, several melas fit equally
export function rankMelas(masses: number[]): MelaRank[] {
  const total = variableMass(masses);
  const ranked = MELAKARTAS.map((mela) => {
    if (total <= 0) return { mela, score: 0 };
    const scale = new Set(melaSemitones(mela));
    let inScale = 0;
    for (const s of VARIABLE) if (scale.has(s)) inScale += masses[s];
    const score = (inScale - 1.25 * (total - inScale)) / total;
    return { mela, score: Math.max(0, score) };
  });
  return ranked.sort((a, b) => b.score - a.score || a.mela.n - b.mela.n);
}

// voiced-frame gates shared by the page and the pipeline tests: quiet or
// unpitched frames carry no information
export const GATES = { minClarity: 0.75, minRms: 0.003 };

// per-frame voting starved normal-speed singing: every consonant between
// syllables broke the voiced stream, and short holds never earned mass
// against long sa/pa dwells. instead, group frames into notes (pitch staying
// inside a band around the note's median) and let every note vote a similar
// amount of mass, whether it was a long dwell or a quick touch
export const NOTE = {
  tolCents: 60, // in-band tolerance around the note's reference pitch
  minSec: 0.075, // shortest hold that counts as a note, ~4 frames
  capSec: 0.35, // per-note vote cap, long dwells don't drown quick svaras
  maxGapSec: 0.15, // unvoiced gap ridden through: consonants, breath clicks
  // median deviation allowed at anchor time. vibrato spreads ~0.7x its
  // amplitude, a steady glide spreads ~a quarter of the span it covered:
  // 20 admits ±25c vibrato and rejects sweeps down to ~1100 cents/sec
  maxSpread: 20,
};

type NoteFrame = { cents: number; w: number; dt: number };

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[s.length >> 1];
};

export class NoteTracker {
  private pending: NoteFrame[] = []; // frames of the current note, unvoted
  private cents: number[] = []; // pre-anchor pitches, the band reference
  private durSec = 0;
  private votedSec = 0;
  private anchor: number | null = null;
  private lastT: number | null = null;

  constructor(private hist: Float32Array) {}

  voiced(f0: number, clarity: number, tSec: number) {
    if (this.lastT !== null && tSec - this.lastT > NOTE.maxGapSec) {
      this.flush();
      this.lastT = null;
    }
    const dt = this.lastT === null ? 0.02 : Math.min(tSec - this.lastT, 0.04);
    this.lastT = tSec;

    const c = centsFromHz(f0);
    const ref = this.anchor ?? (this.cents.length ? median(this.cents) : c);
    if (this.cents.length && Math.abs(c - ref) > NOTE.tolCents) this.flush();

    this.pending.push({ cents: c, w: clarity * dt, dt });
    this.durSec += dt;
    if (this.anchor === null) {
      this.cents.push(c);
      // a coherent stretch long enough to be a note anchors it; a glide
      // stays spread out and never anchors, so it never votes
      if (this.durSec >= NOTE.minSec) {
        const m = median(this.cents);
        const spread = median(this.cents.map((x) => Math.abs(x - m)));
        if (spread <= NOTE.maxSpread) this.anchor = m;
      }
    }
    if (this.anchor !== null) {
      while (this.pending.length && this.votedSec < NOTE.capSec) {
        const f = this.pending.shift()!;
        addPitch(this.hist, f.cents, f.w);
        this.votedSec += f.dt;
      }
      this.pending.length = 0;
    }
  }

  unvoiced(tSec: number) {
    if (this.lastT !== null && tSec - this.lastT > NOTE.maxGapSec) {
      this.flush();
      this.lastT = null;
    }
  }

  private flush() {
    this.pending.length = 0;
    this.cents.length = 0;
    this.durSec = 0;
    this.votedSec = 0;
    this.anchor = null;
  }
}

// sa detection: every melakarta anchors on sa and pa, so slide a sa+pa
// template around the octave and keep the offset that captures the most mass
export function suggestSaOffset(
  hist: Float32Array,
): { offsetCents: number; strength: number } | null {
  const total = totalMass(hist);
  if (total < 2) return null; // under ~2s of stable sound, too early
  let bestOffset = 0;
  let bestScore = -1;
  for (let o = 0; o < 1200; o += 5) {
    const score =
      massAround(hist, o, 35) + 0.8 * massAround(hist, o + JI_CENTS[7], 35);
    if (score > bestScore) {
      bestScore = score;
      bestOffset = o;
    }
  }
  const strength = bestScore / total;
  return strength > 0.18 ? { offsetCents: bestOffset, strength } : null;
}

// choose the octave for a suggested sa: singers live mostly above their sa,
// so aim the candidate at the low end of the sung range
export function pickSaHz(offsetCents: number, sungHz: number[]): number {
  const sorted = [...sungHz].sort((a, b) => a - b);
  const low = sorted[Math.floor(sorted.length * 0.15)] ?? FOLD_REF_HZ;
  let best = FOLD_REF_HZ;
  let bestDist = Infinity;
  for (let k = -3; k <= 2; k++) {
    const hz = FOLD_REF_HZ * 2 ** (offsetCents / 1200 + k);
    const dist = Math.abs(Math.log2(hz / low));
    if (dist < bestDist) {
      bestDist = dist;
      best = hz;
    }
  }
  return best;
}

// nearest svarasthana to a sung pitch, with the signed deviation in cents
export function nearestSvara(cents: number): {
  semitone: number;
  dev: number;
} {
  const folded = foldCents(cents);
  let best = 0;
  let bestDev = Infinity;
  JI_CENTS.forEach((c, i) => {
    let d = folded - c;
    if (d > 600) d -= 1200;
    if (d < -600) d += 1200;
    if (Math.abs(d) < Math.abs(bestDev)) {
      bestDev = d;
      best = i;
    }
  });
  return { semitone: best, dev: bestDev };
}

// shruti dial like a radel pettige: plain pitch letters c through b, in the
// sruti-box register (c = 130.8 hz, so g lands on the classic 196)
const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

const C_HZ = 130.8128;

export type SaStop = {
  idx: number; // 0..11, semitones above c
  label: string; // "C#"
  baseHz: number;
};

export const SA_STOPS: SaStop[] = NOTE_NAMES.map((label, idx) => ({
  idx,
  label,
  baseHz: C_HZ * 2 ** (idx / 12),
}));

// a pettige has one register; the octave switch covers bass voices and
// instruments like the flute that sit an octave off it. fine is the little
// tuning knob in cents: a real box (or a real voice) rarely sits exactly on
// a dial stop, and a few tens of cents of mismatch misreads every svara
export type SaSetting = { stop: number; octave: -1 | 0 | 1; fine: number };

export const saHzFor = ({ stop, octave, fine }: SaSetting) =>
  SA_STOPS[stop].baseHz * 2 ** (octave + fine / 1200);

// express a frequency as dial position + fine knob, matching it exactly
export function settingFromHz(hz: number): SaSetting {
  let stop = 0;
  let octave: SaSetting["octave"] = 0;
  let bestDist = Infinity;
  for (const s of SA_STOPS) {
    for (const o of [-1, 0, 1] as const) {
      const dist = Math.abs(Math.log2((s.baseHz * 2 ** o) / hz));
      if (dist < bestDist) {
        bestDist = dist;
        stop = s.idx;
        octave = o;
      }
    }
  }
  // "|| 0" normalizes the -0 that Math.round hands back for tiny negatives
  const fine =
    Math.round(1200 * Math.log2(hz / (SA_STOPS[stop].baseHz * 2 ** octave))) ||
    0;
  return { stop, octave, fine: Math.max(-50, Math.min(50, fine)) };
}
