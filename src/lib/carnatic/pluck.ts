// karplus-strong plucked strings, rendered offline in plain ts. web audio's
// live delay-node feedback loops bottom out at one render quantum (128
// samples), which caps a string loop at ~345hz — rendering into buffers
// sidesteps that, and pure functions mean jest can "hear" the output.

// melody pluck defaults; every knob here is meant to be tuned by ear
const PLUCK_SECONDS = 1.6; // ring length
const PLUCK_T60 = 1.3; // seconds to fade 60db
const PLUCK_BRIGHTNESS = 0.55; // excitation lowpass, 0 dull .. 1 glassy
const PLUCK_PICK_POS = 0.14; // pluck point along the string, near the bridge
const PLUCK_JVARI = 0.06; // bridge-buzz waveshaping, a hint of it
const PLUCK_DETUNE = 0.0013; // second string offset, ~2 cents of chorus

// tanpura strings ring long and buzz hard against the flat jvari bridge
const TANPURA_T60 = 5;
const TANPURA_BRIGHTNESS = 0.7;
const TANPURA_PICK_POS = 0.1;
const TANPURA_JVARI = 0.25;
const TANPURA_LEVEL = 0.11; // overall drone loudness
const TANPURA_ONSETS = [0, 0.24, 0.49, 0.73]; // pluck spots in the cycle

// in-loop cubic soft-saturation. odd and compressive, so it only ever bleeds
// energy — an asymmetric term here pumps the loop into a limit cycle that
// never decays (found the hard way; see the buzz() note below)
const LOOP_SAT = 0.08;

// deterministic prng so renders are reproducible and testable
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type StringOpts = {
  t60: number;
  brightness: number;
  pickPos: number;
  rand: () => number;
};

// one karplus-strong string: a noise burst circulating through a damped,
// precisely tuned feedback loop
export function ksString(
  freq: number,
  sampleRate: number,
  len: number,
  o: StringOpts,
): Float32Array<ArrayBuffer> {
  const P = sampleRate / freq; // loop period in samples

  // loop delay budget: N + 0.5 (damping average) + frac (allpass) = P
  const target = P - 0.5;
  const N = Math.max(2, Math.floor(target - 1e-6));
  const frac = target - N;
  const C = (1 - frac) / (1 + frac); // jaffe-smith fractional tuning allpass
  const rho = Math.pow(1e-3, P / (o.t60 * sampleRate)); // per-period loop gain

  // excitation: one period of noise, softened like a fingertip pick, then
  // combed by where along the string it's plucked
  const exc = new Float32Array(N);
  for (let i = 0; i < N; i++) exc[i] = o.rand() * 2 - 1;
  const soft = 0.25 + 0.6 * o.brightness;
  for (let pass = 0; pass < 2; pass++) {
    let e = 0;
    for (let i = 0; i < N; i++) {
      e += soft * (exc[i] - e);
      exc[i] = e;
    }
  }
  const k = Math.max(1, Math.round(o.pickPos * N));
  for (let i = N - 1; i >= k; i--) exc[i] -= 0.9 * exc[i - k];
  let peak = 0;
  for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(exc[i]));
  if (peak > 0) for (let i = 0; i < N; i++) exc[i] *= 0.9 / peak;

  const dl = exc; // the delay line is the excitation, read circularly
  const y = new Float32Array(len);
  let ix = 0;
  let prev = 0; // damping filter state
  let apX = 0; // tuning allpass state
  let apY = 0;
  for (let n = 0; n < len; n++) {
    const out = dl[ix];
    y[n] = out;
    // two-point average: highs die first, rho sets the fundamental's decay
    const lp = rho * 0.5 * (out + prev);
    prev = out;
    const ap = C * lp + apX - C * apY;
    apX = lp;
    apY = ap;
    // gentle compression while loud, linear once quiet: the tone blooms
    const sat = ap - LOOP_SAT * ap * ap * ap;
    dl[ix] = sat < -1 ? -1 : sat > 1 ? 1 : sat; // never hit, pure insurance
    ix++;
    if (ix === N) ix = 0;
  }
  return y;
}

// jvari bridge buzz: asymmetric waveshaping done on the rendered signal —
// inside the loop the even term pumps energy and the string never decays.
// the x^2 rectification leaves an envelope-shaped dc ridge, so a gentle
// one-pole highpass sheds it.
function buzz(x: Float32Array, amount: number, sampleRate: number) {
  if (!amount) return;
  const a = 1 - Math.exp((-2 * Math.PI * 30) / sampleRate);
  let lp = 0;
  for (let i = 0; i < x.length; i++) {
    const v = x[i] + amount * x[i] * x[i];
    lp += a * (v - lp);
    x[i] = v - lp;
  }
}

export type PluckOpts = {
  freq: number;
  sampleRate: number;
  seconds?: number;
  t60?: number;
  brightness?: number;
  pickPos?: number;
  jvari?: number;
  detune?: number;
  seed?: number;
};

// a veena pluck: two slightly detuned strings, peak-normalized to 0.5
export function renderPluck(opts: PluckOpts): Float32Array<ArrayBuffer> {
  const {
    freq,
    sampleRate,
    seconds = PLUCK_SECONDS,
    t60 = PLUCK_T60,
    brightness = PLUCK_BRIGHTNESS,
    pickPos = PLUCK_PICK_POS,
    jvari = PLUCK_JVARI,
    detune = PLUCK_DETUNE,
    seed = 1,
  } = opts;
  const rand = mulberry32(seed);
  const len = Math.round(seconds * sampleRate);
  // seeded brightness wobble so cached variants pick a little differently
  const bright = brightness + 0.08 * (rand() - 0.5);
  const shared = { t60, brightness: bright, pickPos, rand };
  const s1 = ksString(freq * (1 - detune / 2), sampleRate, len, shared);
  const s2 = ksString(freq * (1 + detune / 2), sampleRate, len, shared);
  buzz(s1, jvari, sampleRate);
  buzz(s2, jvari, sampleRate);
  const out = new Float32Array(len);
  let peak = 0;
  for (let i = 0; i < len; i++) {
    out[i] = 0.62 * s1[i] + 0.38 * s2[i];
    peak = Math.max(peak, Math.abs(out[i]));
  }
  const g = peak > 0 ? 0.5 / peak : 0;
  for (let i = 0; i < len; i++) out[i] *= g;
  return out;
}

export type TanpuraOpts = {
  saHz: number;
  secondRatio: number | null; // pa string ratio; null means one more sa
  sampleRate: number;
  cycleSeconds?: number;
  seed?: number;
};

// one full tanpura cycle, pa-sa-sa-SA̱, meant to loop forever. every pluck is
// added modulo the cycle length so the decay tails wrap around the loop point
// and loop=true has no seam by construction.
export function renderTanpuraCycle(
  opts: TanpuraOpts,
): Float32Array<ArrayBuffer> {
  const { saHz, secondRatio, sampleRate, cycleSeconds = 8, seed = 7 } = opts;
  const rand = mulberry32(seed);
  const len = Math.round(cycleSeconds * sampleRate);
  const cycle = new Float32Array(len);

  const strings = [
    { f: secondRatio ? (saHz / 2) * secondRatio : saHz, g: 0.85 },
    { f: saHz, g: 1 },
    { f: saHz, g: 0.95 },
    { f: saHz / 2, g: 1 },
  ];

  const ringLen = Math.round(Math.min(6, cycleSeconds) * sampleRate);
  strings.forEach(({ f, g }, i) => {
    // a deterministic ±40ms of lilt; identical every cycle, so still seamless
    const onset = Math.round(
      (TANPURA_ONSETS[i] * cycleSeconds + 0.08 * (rand() - 0.5)) * sampleRate,
    );
    // main string plus a whisper of a detuned twin for shimmer
    for (const [df, dg] of [
      [f, g],
      [f * 1.001, g * 0.35],
    ] as const) {
      const s = ksString(df, sampleRate, ringLen, {
        t60: TANPURA_T60,
        brightness: TANPURA_BRIGHTNESS + 0.1 * (rand() - 0.5),
        pickPos: TANPURA_PICK_POS,
        rand,
      });
      buzz(s, TANPURA_JVARI, sampleRate);
      let ix = ((onset % len) + len) % len;
      for (let n = 0; n < ringLen; n++) {
        cycle[ix] += dg * s[n];
        ix++;
        if (ix === len) ix = 0;
      }
    }
  });

  // gentle lowpass to sit it behind the melody, run twice around the loop so
  // the filter state is warm at sample zero and the seam stays continuous
  const a = 1 - Math.exp((-2 * Math.PI * 5000) / sampleRate);
  let y = 0;
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < len; i++) {
      y += a * (cycle[i] - y);
      if (pass) cycle[i] = y;
    }
  }

  let mean = 0;
  for (let i = 0; i < len; i++) mean += cycle[i];
  mean /= len;
  let peak = 0;
  for (let i = 0; i < len; i++) {
    cycle[i] -= mean;
    peak = Math.max(peak, Math.abs(cycle[i]));
  }
  const g = peak > 0 ? TANPURA_LEVEL / peak : 0;
  for (let i = 0; i < len; i++) cycle[i] *= g;
  return cycle;
}

// stereo exponential-decay noise burst for the convolver: a small dark room
// whose tail dims as it fades
export function renderReverbImpulse(
  sampleRate: number,
  seconds = 1.1,
  t60 = 0.9,
  seed = 1,
): [Float32Array<ArrayBuffer>, Float32Array<ArrayBuffer>] {
  const len = Math.round(seconds * sampleRate);
  const decay = Math.log(0.001) / (t60 * sampleRate);
  const make = (chSeed: number) => {
    const rand = mulberry32(chSeed);
    const out = new Float32Array(len);
    let lp = 0;
    for (let i = 0; i < len; i++) {
      const fc = 7000 * Math.pow(1500 / 7000, i / len);
      const c = 1 - Math.exp((-2 * Math.PI * fc) / sampleRate);
      lp += c * (rand() * 2 - 1 - lp);
      out[i] = lp * Math.exp(decay * i);
    }
    return out;
  };
  return [make(seed), make(seed + 7919)];
}
