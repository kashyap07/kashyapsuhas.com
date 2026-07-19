// end-to-end check on synthesized continuous singing: harmonic-rich voice,
// vibrato on held notes, slides between them, processed exactly the way the
// page does it (yin per hop, gates, note-tracked accumulation)
import { MELAKARTAS, melaSemitones } from "@lib/carnatic/melakarta";
import { yinDetect } from "@lib/carnatic/yin";

import {
  GATES,
  JI_CENTS,
  NoteTracker,
  centsFromHz,
  foldCents,
  heardCount,
  makeHistogram,
  rankMelas,
  suggestSaOffset,
  svaraMasses,
} from "../logic";

const SR = 44100;
const WIN = 2048;
const HOP = 512;

type Tempo = {
  hold: number; // seconds sat on each svara
  glide: number; // seconds sliding to the next
  gap: number; // silence before each note, the consonant of the syllable
};

// a leisurely alapana-style pace and a normal sarale-varase pace with
// syllable gaps, the case that starved the old per-frame accumulator
const SLOW: Tempo = { hold: 0.32, glide: 0.08, gap: 0 };
const FAST: Tempo = { hold: 0.16, glide: 0.05, gap: 0.06 };

// sing a mela's aroha + avaroha the way a throat does it: each svara held
// with vibrato, connected by glides, tone rich in harmonics
function singMela(n: number, saHz: number, tempo: Tempo): Float32Array {
  const semis = melaSemitones(MELAKARTAS[n - 1]);
  const up = [...semis.map((s) => JI_CENTS[s]), 1200];
  const seq = [...up, ...[...up].reverse().slice(1)];
  const gapSamples = Math.round(tempo.gap * SR);
  const noteSamples = Math.round((tempo.hold + tempo.glide) * SR);
  const buf = new Float32Array(seq.length * (gapSamples + noteSamples));
  let phase = 0;
  let idx = 0;
  let prevCents = seq[0];
  for (const target of seq) {
    idx += gapSamples; // consonant: the voice cuts out briefly
    for (let i = 0; i < noteSamples; i++) {
      const t = i / SR;
      const cents =
        t < tempo.glide
          ? prevCents + (target - prevCents) * (t / tempo.glide)
          : target + 15 * Math.sin(2 * Math.PI * 5.5 * (idx / SR));
      const f = saHz * 2 ** (cents / 1200);
      phase += (2 * Math.PI * f) / SR;
      buf[idx++] =
        0.4 * Math.sin(phase) +
        0.2 * Math.sin(2 * phase) +
        0.1 * Math.sin(3 * phase) +
        0.05 * Math.sin(4 * phase);
    }
    prevCents = target;
  }
  return buf;
}

function runPipeline(buf: Float32Array): Float32Array {
  const hist = makeHistogram();
  const tracker = new NoteTracker(hist);
  for (let i = 0; i + WIN <= buf.length; i += HOP) {
    const p = yinDetect(buf.subarray(i, i + WIN), {
      sampleRate: SR,
      minF0: 70,
      maxF0: 1200,
    });
    if (p.f0 > 0 && p.clarity > GATES.minClarity && p.rms > GATES.minRms) {
      tracker.voiced(p.f0, p.clarity, i / SR);
    } else {
      tracker.unvoiced(i / SR);
    }
  }
  return hist;
}

const SA_HZ = 146.83; // d, a common male shruti

describe("full pipeline on synthesized singing", () => {
  it.each([15, 65])("recovers mela %i from unhurried audio", (n) => {
    const hist = runPipeline(singMela(n, SA_HZ, SLOW));
    const saOffset = foldCents(centsFromHz(SA_HZ));
    const masses = svaraMasses(hist, saOffset);

    expect(heardCount(masses)).toBe(5);
    const [top] = rankMelas(masses);
    expect(top.mela.n).toBe(n);
    expect(top.score).toBeGreaterThan(0.8);
  });

  it.each([15, 29])(
    "recovers mela %i sung at normal speed with syllable gaps",
    (n) => {
      const hist = runPipeline(singMela(n, SA_HZ, FAST));
      const saOffset = foldCents(centsFromHz(SA_HZ));
      const masses = svaraMasses(hist, saOffset);

      expect(heardCount(masses)).toBe(5);
      const [top] = rankMelas(masses);
      expect(top.mela.n).toBe(n);
      expect(top.score).toBeGreaterThan(0.8);
    },
  );

  it("recovers mayamalavagowla sung against an off-stop shruti once sa is corrected", () => {
    // a box (or a voice) tuned 45 cents sharp of the g stop: enough for
    // r1 and d1 to start reading as r2 and d2 if sa is assumed at 196
    const trueSa = 196 * 2 ** (45 / 1200);
    const hist = runPipeline(singMela(15, trueSa, SLOW));
    const wrong = rankMelas(svaraMasses(hist, foldCents(centsFromHz(196))));
    const rightOffset = foldCents(centsFromHz(trueSa));
    const right = rankMelas(svaraMasses(hist, rightOffset));

    expect(right[0].mela.n).toBe(15);
    expect(right[0].score).toBeGreaterThan(wrong[0].score);

    // and the sa hunter reports the true offset, so the ui can offer the fix
    const suggestion = suggestSaOffset(hist)!;
    const diff = Math.abs(suggestion.offsetCents - rightOffset);
    expect(Math.min(diff, 1200 - diff)).toBeLessThanOrEqual(20);
  });

  it("finds sa from the audio alone", () => {
    const hist = runPipeline(singMela(29, SA_HZ, SLOW));
    const suggestion = suggestSaOffset(hist);
    expect(suggestion).not.toBeNull();
    const expected = foldCents(centsFromHz(SA_HZ));
    const diff = Math.abs(suggestion!.offsetCents - expected);
    expect(Math.min(diff, 1200 - diff)).toBeLessThanOrEqual(20);
  });
});
