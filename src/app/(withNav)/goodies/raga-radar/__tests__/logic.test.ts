import { MELAKARTAS, melaSemitones } from "@lib/carnatic/melakarta";

import {
  FOLD_REF_HZ,
  JI_CENTS,
  NOTE,
  NoteTracker,
  SA_STOPS,
  addPitch,
  centsFromHz,
  foldCents,
  heardCount,
  makeHistogram,
  massAround,
  pickSaHz,
  rankMelas,
  saHzFor,
  settingFromHz,
  suggestSaOffset,
  svaraMasses,
  totalMass,
} from "../logic";

// simulate a sung mela: dwell on each svara at its ji position, sa and pa
// longest like a real alapana, with a few cents of human wobble
function singMela(n: number, saHz: number) {
  const hist = makeHistogram();
  const saCents = centsFromHz(saHz);
  const mela = MELAKARTAS[n - 1];
  const dwell = [3, 1.5, 1.5, 1.5, 2.5, 1.5, 1.5]; // seconds per svara
  melaSemitones(mela).forEach((semitone, i) => {
    for (const jitter of [-8, 0, 9]) {
      addPitch(hist, saCents + JI_CENTS[semitone] + jitter, dwell[i] / 3);
    }
  });
  return hist;
}

const SA_HZ = 155.56; // d#3, deliberately far from the c4 fold anchor

describe("histogram", () => {
  it("folds negative and out-of-octave cents", () => {
    expect(foldCents(-100)).toBe(1100);
    expect(foldCents(2500)).toBe(100);
  });

  it("accumulates mass where pitches land", () => {
    const hist = makeHistogram();
    addPitch(hist, 0, 1);
    addPitch(hist, 1200, 2);
    addPitch(hist, -2400, 0.5);
    expect(totalMass(hist)).toBeCloseTo(3.5);
    expect(hist[0]).toBeCloseTo(3.5);
  });
});

describe("mela ranking", () => {
  it.each([15, 29, 8, 65])("recovers mela %i from its own svaras", (n) => {
    const hist = singMela(n, SA_HZ);
    const masses = svaraMasses(hist, foldCents(centsFromHz(SA_HZ)));
    const [top] = rankMelas(masses);
    expect(top.mela.n).toBe(n);
    expect(top.score).toBeGreaterThan(0.9);
  });

  it("scores a wrong mela below the right one", () => {
    const hist = singMela(29, SA_HZ); // shankarabharana
    const masses = svaraMasses(hist, foldCents(centsFromHz(SA_HZ)));
    const ranked = rankMelas(masses);
    const mmg = ranked.find((r) => r.mela.n === 15)!; // mayamalavagowla
    expect(mmg.score).toBeLessThan(ranked[0].score);
  });

  it("counts heard variable svaras, ignoring sa and pa", () => {
    const hist = singMela(29, SA_HZ);
    const masses = svaraMasses(hist, foldCents(centsFromHz(SA_HZ)));
    expect(heardCount(masses)).toBe(5); // a mela has 5 variable svaras
    expect(heardCount(svaraMasses(makeHistogram(), 0))).toBe(0);
  });
});

describe("sa detection", () => {
  it("finds sa from the sa+pa anchors", () => {
    const hist = singMela(29, SA_HZ);
    const suggestion = suggestSaOffset(hist);
    expect(suggestion).not.toBeNull();
    const expected = foldCents(centsFromHz(SA_HZ));
    const dist = Math.min(
      Math.abs(suggestion!.offsetCents - expected),
      1200 - Math.abs(suggestion!.offsetCents - expected),
    );
    expect(dist).toBeLessThanOrEqual(15);
  });

  it("stays quiet without enough evidence", () => {
    const hist = makeHistogram();
    addPitch(hist, 0, 1);
    expect(suggestSaOffset(hist)).toBeNull();
  });

  it("picks the octave near the bottom of the sung range", () => {
    const offset = foldCents(centsFromHz(SA_HZ));
    // singing spread over sa..upper sa around d#3
    const sung = [156, 175, 196, 233, 262, 294, 311];
    const hz = pickSaHz(offset, sung);
    expect(Math.abs(1200 * Math.log2(hz / SA_HZ))).toBeLessThan(50);
  });
});

describe("shruti stops", () => {
  it("labels the dial with plain pitch letters like a radel pettige", () => {
    const labels = SA_STOPS.map((s) => s.label);
    expect(labels).toEqual([
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
    ]);
  });

  it("puts G at the classic 196 Hz", () => {
    expect(saHzFor({ stop: 7, octave: 0, fine: 0 })).toBeCloseTo(196, 0);
  });

  it("applies the fine knob in cents", () => {
    const sharp = saHzFor({ stop: 7, octave: 0, fine: 50 });
    expect(1200 * Math.log2(sharp / 196)).toBeCloseTo(50, 0);
  });

  it("expresses a frequency as stop + octave + fine, exactly", () => {
    // sruti-box register, dead on a stop
    expect(settingFromHz(196)).toEqual({ stop: 7, octave: 0, fine: 0 });
    // flute sa an octave above the d stop
    expect(settingFromHz(293.66)).toEqual({ stop: 2, octave: 1, fine: 0 });
    // bass voice an octave below g
    expect(settingFromHz(98)).toEqual({ stop: 7, octave: -1, fine: 0 });
    // a real box tuned a touch sharp of g comes back with its cents intact
    const off = settingFromHz(200);
    expect(off.stop).toBe(7);
    expect(off.octave).toBe(0);
    expect(off.fine).toBe(35);
    expect(saHzFor(off)).toBeCloseTo(200, 0);
  });
});

describe("note tracker", () => {
  const FRAME = 0.018; // mic frame cadence on the page
  const hzAt = (cents: number) => FOLD_REF_HZ * 2 ** (cents / 1200);

  // feed a held note with mild vibrato, syllable-style: pitch wobbles a few
  // cents around the target the way a throat does
  function hold(
    tracker: NoteTracker,
    cents: number,
    from: number,
    durSec: number,
  ) {
    for (let t = from; t < from + durSec; t += FRAME) {
      const wobble = 12 * Math.sin(2 * Math.PI * 5.5 * t);
      tracker.voiced(hzAt(cents + wobble), 1, t);
    }
    return from + durSec;
  }

  it("votes a held note about its duration, at its pitch", () => {
    const hist = makeHistogram();
    const tracker = new NoteTracker(hist);
    hold(tracker, 700, 0, 0.2);
    expect(totalMass(hist)).toBeGreaterThan(0.15);
    expect(totalMass(hist)).toBeLessThan(0.26);
    // all of it lands in the 700-cent window, none a svara away
    expect(massAround(hist, 700, 55)).toBeGreaterThan(0.7 * totalMass(hist));
    expect(massAround(hist, 600, 25)).toBe(0);
  });

  it("caps a long dwell so it cannot drown quick svaras", () => {
    const hist = makeHistogram();
    const tracker = new NoteTracker(hist);
    hold(tracker, 700, 0, 2);
    expect(totalMass(hist)).toBeLessThanOrEqual(NOTE.capSec + 0.05);
  });

  it("still counts a quick touch at normal singing speed", () => {
    const hist = makeHistogram();
    const tracker = new NoteTracker(hist);
    hold(tracker, 700, 0, 0.12);
    expect(totalMass(hist)).toBeGreaterThan(0.08);
  });

  it("ignores a blip too short to be a note", () => {
    const hist = makeHistogram();
    const tracker = new NoteTracker(hist);
    hold(tracker, 700, 0, 0.05);
    expect(totalMass(hist)).toBe(0);
  });

  it("gives a steady glide no vote", () => {
    const hist = makeHistogram();
    const tracker = new NoteTracker(hist);
    // 1200 cents in 0.8 seconds, a deliberate sweep across the octave
    for (let t = 0; t < 0.8; t += FRAME) {
      tracker.voiced(hzAt((t / 0.8) * 1200), 1, t);
    }
    expect(totalMass(hist)).toBeLessThan(0.03);
  });

  it("rides through a consonant gap without losing the note", () => {
    const hist = makeHistogram();
    const tracker = new NoteTracker(hist);
    const t = hold(tracker, 700, 0, 0.1);
    // 100ms of consonant: unvoiced frames, then the vowel resumes
    for (const dt of [0.02, 0.04, 0.06, 0.08, 0.1]) tracker.unvoiced(t + dt);
    hold(tracker, 700, t + 0.1, 0.1);
    expect(totalMass(hist)).toBeGreaterThan(0.15);
  });

  it("starts fresh after a real silence", () => {
    const hist = makeHistogram();
    const tracker = new NoteTracker(hist);
    const t = hold(tracker, 700, 0, 0.2);
    tracker.unvoiced(t + 0.3);
    // too short to be a note on its own, gets no credit from the old one
    hold(tracker, 700, t + 0.3, 0.05);
    expect(totalMass(hist)).toBeLessThan(0.26);
  });
});
