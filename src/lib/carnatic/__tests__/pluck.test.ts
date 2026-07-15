import {
  ksString,
  mulberry32,
  renderPluck,
  renderReverbImpulse,
  renderTanpuraCycle,
} from "../pluck";

// these are the ears of this suite: we can't listen to the output in ci, so
// we assert the properties that make it sound right — pitch, decay, loop seam

const rms = (x: Float32Array, from: number, to: number) => {
  let s = 0;
  for (let i = from; i < to; i++) s += x[i] * x[i];
  return Math.sqrt(s / (to - from));
};

// autocorrelation over a mid-signal window, searching ±6% around the
// expected lag, with parabolic interpolation for sub-sample accuracy
const estimatePeriod = (
  x: Float32Array,
  sampleRate: number,
  fGuess: number,
) => {
  const start = Math.round(0.3 * sampleRate);
  const winLen = Math.round(0.4 * sampleRate);
  const p0 = sampleRate / fGuess;
  const lo = Math.max(2, Math.floor(p0 * 0.94));
  const hi = Math.ceil(p0 * 1.06);
  const ac: number[] = [];
  for (let lag = lo; lag <= hi; lag++) {
    let s = 0;
    for (let i = start; i < start + winLen; i++) s += x[i] * x[i + lag];
    ac.push(s);
  }
  let best = 0;
  for (let i = 1; i < ac.length; i++) if (ac[i] > ac[best]) best = i;
  let lag = lo + best;
  if (best > 0 && best < ac.length - 1) {
    const [y1, y2, y3] = [ac[best - 1], ac[best], ac[best + 1]];
    lag += (y1 - y3) / (2 * (y1 - 2 * y2 + y3));
  }
  return lag;
};

const SR = 48000;

describe("renderPluck", () => {
  const pluck = renderPluck({ freq: 293.66, sampleRate: SR, seed: 1 });

  it("is non-silent and numerically sane", () => {
    let peak = 0;
    let finite = true;
    for (const v of pluck) {
      if (!Number.isFinite(v)) finite = false;
      peak = Math.max(peak, Math.abs(v));
    }
    expect(finite).toBe(true);
    expect(peak).toBeGreaterThan(0.2);
    expect(peak).toBeLessThanOrEqual(1);
  });

  it("decays like a plucked string", () => {
    const w = Math.round(0.2 * SR);
    const head = rms(pluck, 0, w);
    const tail = rms(pluck, pluck.length - w, pluck.length);
    expect(head).toBeGreaterThan(10 * tail);
  });

  it("is deterministic per seed and varies across seeds", () => {
    const a = renderPluck({ freq: 440, sampleRate: SR, seed: 5 });
    const b = renderPluck({ freq: 440, sampleRate: SR, seed: 5 });
    const c = renderPluck({ freq: 440, sampleRate: SR, seed: 6 });
    let same = 0;
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
      same = Math.max(same, Math.abs(a[i] - b[i]));
      diff = Math.max(diff, Math.abs(a[i] - c[i]));
    }
    expect(same).toBe(0);
    expect(diff).toBeGreaterThan(0.01);
  });
});

describe("ksString tuning", () => {
  // mandra sa, sa, prati madhyama, and tara ni at the very top — the last has
  // a ~40-sample period, where fractional-delay tuning either works or doesn't
  const freqs = [146.83, 293.66, (293.66 * 45) / 32, 1101.2];
  for (const sr of [44100, 48000]) {
    for (const f of freqs) {
      it(`hits ${f.toFixed(1)}hz at ${sr}`, () => {
        const y = ksString(f, sr, Math.round(1.2 * sr), {
          t60: 1.3,
          brightness: 0.55,
          pickPos: 0.14,
          rand: mulberry32(3),
        });
        const est = estimatePeriod(y, sr, f);
        const want = sr / f;
        expect(Math.abs(est - want) / want).toBeLessThan(0.005);
      });
    }
  }
});

describe("ksString long decay", () => {
  // regression guard: an expansive nonlinearity in the loop turns long-ring
  // strings into limit cycles that buzz forever instead of fading
  it("still decays at tanpura ring times", () => {
    const sr = 44100;
    const y = ksString(146.83, sr, sr * 5, {
      t60: 5,
      brightness: 0.7,
      pickPos: 0.1,
      rand: mulberry32(3),
    });
    const head = rms(y, 0, Math.round(0.5 * sr));
    const tail = rms(y, sr * 4.5, sr * 5);
    expect(head).toBeGreaterThan(20 * tail);
  });
});

describe("renderTanpuraCycle", () => {
  const sr = 44100;
  const cycle = renderTanpuraCycle({
    saHz: 293.66,
    secondRatio: 1.5,
    sampleRate: sr,
  });

  it("rings through the whole cycle with no dead air", () => {
    // the quietest stretch, right before a pluck, sits around 0.005 rms;
    // a broken ring-wrap would leave near-zero (~1e-4) windows instead
    for (let s = 0; s + sr <= cycle.length; s += sr) {
      expect(rms(cycle, s, s + sr)).toBeGreaterThan(0.003);
    }
  });

  it("loops without a seam", () => {
    const deltas = new Float32Array(cycle.length - 1);
    for (let i = 1; i < cycle.length; i++) {
      deltas[i - 1] = Math.abs(cycle[i] - cycle[i - 1]);
    }
    const sorted = deltas.slice().sort();
    const p999 = sorted[Math.floor(sorted.length * 0.999)];
    const seam = Math.abs(cycle[0] - cycle[cycle.length - 1]);
    expect(seam).toBeLessThanOrEqual(p999);
  });

  it("has no dc offset", () => {
    let mean = 0;
    for (const v of cycle) mean += v;
    expect(Math.abs(mean / cycle.length)).toBeLessThan(1e-3);
  });

  it("handles a missing second string", () => {
    const solo = renderTanpuraCycle({
      saHz: 293.66,
      secondRatio: null,
      sampleRate: sr,
      cycleSeconds: 4,
    });
    expect(rms(solo, 0, solo.length)).toBeGreaterThan(0.005);
  });
});

describe("renderReverbImpulse", () => {
  const [l, r] = renderReverbImpulse(SR);

  it("decays", () => {
    const w = Math.round(0.1 * SR);
    expect(rms(l, 0, w)).toBeGreaterThan(5 * rms(l, l.length - w, l.length));
  });

  it("has decorrelated channels", () => {
    let diff = 0;
    for (let i = 0; i < l.length; i++) {
      diff = Math.max(diff, Math.abs(l[i] - r[i]));
    }
    expect(diff).toBeGreaterThan(0.01);
  });
});
