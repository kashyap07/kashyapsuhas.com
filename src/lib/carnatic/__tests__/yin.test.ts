import { yinDetect } from "../yin";

const SR = 48000;
const N = 2048;

function sine(freq: number, amp = 0.5): Float32Array {
  const buf = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    buf[i] = amp * Math.sin((2 * Math.PI * freq * i) / SR);
  }
  return buf;
}

// voice-ish tone: fundamental plus decaying harmonics
function harmonicTone(freq: number): Float32Array {
  const buf = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const t = (2 * Math.PI * freq * i) / SR;
    buf[i] =
      0.5 * Math.sin(t) + 0.25 * Math.sin(2 * t) + 0.12 * Math.sin(3 * t);
  }
  return buf;
}

describe("yinDetect", () => {
  it("nails a pure sine within a couple cents", () => {
    for (const f of [110, 220, 293.66, 440]) {
      const { f0, clarity } = yinDetect(sine(f), { sampleRate: SR });
      expect(Math.abs(1200 * Math.log2(f0 / f))).toBeLessThan(3);
      expect(clarity).toBeGreaterThan(0.9);
    }
  });

  it("tracks the fundamental of a harmonic tone, not a harmonic", () => {
    const { f0, clarity } = yinDetect(harmonicTone(196), { sampleRate: SR });
    expect(Math.abs(1200 * Math.log2(f0 / 196))).toBeLessThan(5);
    expect(clarity).toBeGreaterThan(0.85);
  });

  it("stays on the fundamental when the 2nd harmonic dominates", () => {
    // voices often carry more energy at h2 than h1; octave-up errors here
    // would wreck the lattice trace
    const buf = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const t = (2 * Math.PI * 220 * i) / SR;
      buf[i] =
        0.2 * Math.sin(t) + 0.5 * Math.sin(2 * t) + 0.1 * Math.sin(3 * t);
    }
    const { f0 } = yinDetect(buf, { sampleRate: SR });
    expect(Math.abs(1200 * Math.log2(f0 / 220))).toBeLessThan(10);
  });

  it("reports silence as unvoiced", () => {
    const { f0, clarity, rms } = yinDetect(new Float32Array(N), {
      sampleRate: SR,
    });
    expect(f0).toBe(0);
    expect(clarity).toBe(0);
    expect(rms).toBe(0);
  });

  it("gives noise low clarity", () => {
    const buf = new Float32Array(N);
    // deterministic lcg noise so the test cannot flake
    let seed = 1234567;
    for (let i = 0; i < N; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      buf[i] = (seed / 0x7fffffff) * 2 - 1;
    }
    const { clarity } = yinDetect(buf, { sampleRate: SR });
    expect(clarity).toBeLessThan(0.6);
  });

  it("respects the min/max f0 search range", () => {
    const { f0 } = yinDetect(sine(440), {
      sampleRate: SR,
      minF0: 100,
      maxF0: 300,
    });
    // 440 is outside the range so it cannot be reported
    expect(f0).toBeLessThan(310);
  });
});
