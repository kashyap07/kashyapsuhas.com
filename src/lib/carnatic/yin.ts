// yin pitch detector (de cheveigné & kawahara 2002). feed a time-domain
// frame, get f0 in hz plus a 0..1 clarity score. plain typed-array math,
// fast enough to run per animation frame on 2048 samples.

export type PitchFrame = {
  f0: number; // hz, 0 when unvoiced
  clarity: number; // 0..1, how periodic the frame looked
  rms: number;
};

export type YinOptions = {
  sampleRate: number;
  minF0?: number;
  maxF0?: number;
  threshold?: number; // cmndf dip threshold, lower = stricter
};

export function yinDetect(
  frame: Float32Array,
  { sampleRate, minF0 = 70, maxF0 = 1000, threshold = 0.15 }: YinOptions,
): PitchFrame {
  const n = frame.length;
  const w = n >> 1; // correlation window, half the frame

  let sumSq = 0;
  for (let i = 0; i < n; i++) sumSq += frame[i] * frame[i];
  const rms = Math.sqrt(sumSq / n);
  if (rms < 1e-4) return { f0: 0, clarity: 0, rms };

  const tauMin = Math.max(2, Math.floor(sampleRate / maxF0));
  const tauMax = Math.min(w, Math.ceil(sampleRate / minF0));
  if (tauMin >= tauMax) return { f0: 0, clarity: 0, rms };

  // squared difference per lag
  const d = new Float32Array(tauMax);
  for (let tau = 1; tau < tauMax; tau++) {
    let acc = 0;
    for (let i = 0; i < w; i++) {
      const diff = frame[i] - frame[i + tau];
      acc += diff * diff;
    }
    d[tau] = acc;
  }

  // cumulative-mean-normalized difference
  const cmndf = new Float32Array(tauMax);
  cmndf[0] = 1;
  let running = 0;
  for (let tau = 1; tau < tauMax; tau++) {
    running += d[tau];
    cmndf[tau] = running > 0 ? (d[tau] * tau) / running : 1;
  }

  // first dip under threshold, ridden down to its local minimum
  let tau = -1;
  for (let t = tauMin; t < tauMax; t++) {
    if (cmndf[t] < threshold) {
      while (t + 1 < tauMax && cmndf[t + 1] < cmndf[t]) t++;
      tau = t;
      break;
    }
  }
  // no dip: fall back to the global minimum, clarity will reflect the miss
  if (tau === -1) {
    let best = tauMin;
    for (let t = tauMin + 1; t < tauMax; t++) {
      if (cmndf[t] < cmndf[best]) best = t;
    }
    tau = best;
  }

  // parabolic interpolation for sub-sample lag, on the RAW difference d.
  // the paper (step 5) is explicit: interpolating the normalized curve
  // biases the period short, i.e. every estimate reads slightly sharp
  let refined = tau;
  if (tau > 1 && tau < tauMax - 1) {
    const a = d[tau - 1];
    const b = d[tau];
    const c = d[tau + 1];
    const denom = a - 2 * b + c;
    if (Math.abs(denom) > 1e-12) refined = tau + (a - c) / (2 * denom);
  }

  const clarity = Math.max(0, Math.min(1, 1 - cmndf[tau]));
  return { f0: sampleRate / refined, clarity, rms };
}
