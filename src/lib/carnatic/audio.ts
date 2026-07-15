// tiny web audio raga instrument: karplus-strong veena over a plucked
// tanpura drone. the strings themselves are rendered offline in pluck.ts;
// this file just schedules buffers and shapes them live.
import { renderPluck, renderReverbImpulse, renderTanpuraCycle } from "./pluck";

export const BEAT = 0.42; // seconds

// anything with a pitch, a length, and an index for ui highlighting
export type PlayableNote = {
  freq: number;
  beats: number;
  restBefore: number; // beats of silence before this note
  idx: number;
};

export type Scheduled = {
  sched: { start: number; end: number; idx: number }[];
  now: () => number;
};

export class RagaPlayer {
  private ctx: AudioContext | null = null;
  private melodyBus: GainNode | null = null;
  private droneBus: GainNode | null = null;
  private droneSrcs: AudioScheduledSourceNode[] = [];
  private doneTimer: ReturnType<typeof setTimeout> | null = null;
  // per-play gain node + its sources, so stop can kill them for real
  private voice: GainNode | null = null;
  private voiceNodes: AudioScheduledSourceNode[] = [];
  // rendered plucks, keyed by pitch + attack variant
  private plucks = new Map<string, AudioBuffer>();
  private tanpura: { key: string; buf: AudioBuffer } | null = null;

  private ensure(): AudioContext {
    if (this.ctx) return this.ctx;
    const ctx = new AudioContext();

    // a small dark room from a generated impulse, so the plucks have air
    // around them without the distinct repeats a slap delay would give
    const [l, r] = renderReverbImpulse(ctx.sampleRate);
    const ir = ctx.createBuffer(2, l.length, ctx.sampleRate);
    ir.copyToChannel(l, 0);
    ir.copyToChannel(r, 1);
    const verb = ctx.createConvolver();
    verb.buffer = ir;
    const wet = ctx.createGain();
    wet.gain.value = 0.14;
    verb.connect(wet).connect(ctx.destination);

    // veena body: two gentle resonant bumps, then trim the string fizz
    const body1 = ctx.createBiquadFilter();
    body1.type = "peaking";
    body1.frequency.value = 210;
    body1.gain.value = 3.5;
    body1.Q.value = 1.1;
    const body2 = ctx.createBiquadFilter();
    body2.type = "peaking";
    body2.frequency.value = 700;
    body2.gain.value = 2.5;
    body2.Q.value = 2;
    const shelf = ctx.createBiquadFilter();
    shelf.type = "highshelf";
    shelf.frequency.value = 3800;
    shelf.gain.value = -2;

    this.melodyBus = ctx.createGain();
    this.melodyBus.connect(body1).connect(body2).connect(shelf);
    shelf.connect(ctx.destination);
    shelf.connect(verb);

    this.droneBus = ctx.createGain();
    this.droneBus.connect(ctx.destination);
    this.droneBus.connect(verb);

    this.ctx = ctx;
    return ctx;
  }

  startDrone(saHz: number, secondRatio: number | null) {
    const ctx = this.ensure();
    // safari can hand back a suspended context even inside a user gesture
    void ctx.resume();
    if (this.droneSrcs.length) return;

    const key = `${saHz}|${secondRatio ?? ""}|${ctx.sampleRate}`;
    if (this.tanpura?.key !== key) {
      const data = renderTanpuraCycle({
        saHz,
        secondRatio,
        sampleRate: ctx.sampleRate,
      });
      const buf = ctx.createBuffer(1, data.length, ctx.sampleRate);
      buf.copyToChannel(data, 0);
      this.tanpura = { key, buf };
    }

    const t = ctx.currentTime;
    this.droneBus!.gain.cancelScheduledValues(t);
    this.droneBus!.gain.setValueAtTime(0.0001, t);
    this.droneBus!.gain.exponentialRampToValueAtTime(1, t + 2);

    const src = ctx.createBufferSource();
    src.buffer = this.tanpura.buf;
    src.loop = true;
    src.connect(this.droneBus!);
    // drop in mid-cycle so it doesn't always open on the same pluck
    src.start(t, Math.random() * this.tanpura.buf.duration);
    this.droneSrcs.push(src);
  }

  stopDrone() {
    if (!this.ctx || !this.droneBus) return;
    this.droneBus.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.3);
    const srcs = this.droneSrcs;
    this.droneSrcs = [];
    setTimeout(() => {
      for (const s of srcs) {
        try {
          s.stop();
        } catch {
          // already stopped
        }
      }
    }, 1500);
  }

  get droneRunning() {
    return this.droneSrcs.length > 0;
  }

  async play(notes: PlayableNote[], onDone: () => void): Promise<Scheduled> {
    const ctx = this.ensure();
    await ctx.resume();
    this.stopMelody();

    this.voice = ctx.createGain();
    this.voice.connect(this.melodyBus!);

    const t0 = ctx.currentTime;
    let t = t0 + 0.2;
    let prevFreq: number | null = null;
    // flip attack variants per play, so replays don't repeat identically
    const flip = Math.random() < 0.5 ? 1 : 0;
    const sched: Scheduled["sched"] = [];
    for (const n of notes) {
      t += n.restBefore * BEAT;
      const dur = n.beats * BEAT;
      this.pluckNote(n.freq, t, dur, prevFreq, (n.idx & 1) ^ flip);
      sched.push({ start: t, end: t + dur, idx: n.idx });
      prevFreq = n.freq;
      t += dur;
    }

    this.doneTimer = setTimeout(onDone, (t - t0 + 0.6) * 1000);
    return { sched, now: () => ctx.currentTime };
  }

  stopMelody() {
    if (this.doneTimer) {
      clearTimeout(this.doneTimer);
      this.doneTimer = null;
    }
    if (!this.ctx || !this.voice) return;
    // fade this play's voice to avoid a click, then kill its sources
    const voice = this.voice;
    const nodes = this.voiceNodes;
    this.voice = null;
    this.voiceNodes = [];
    voice.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.05);
    setTimeout(() => {
      for (const n of nodes) {
        try {
          n.stop();
        } catch {
          // already stopped
        }
      }
      voice.disconnect();
    }, 400);
  }

  dispose() {
    this.stopMelody();
    this.plucks.clear();
    this.tanpura = null;
    this.ctx?.close();
    this.ctx = null;
  }

  private pluckBuffer(freq: number, variant: number): AudioBuffer {
    const ctx = this.ctx!;
    const key = `${freq.toFixed(1)}v${variant}`;
    const hit = this.plucks.get(key);
    if (hit) return hit;
    const data = renderPluck({
      freq,
      sampleRate: ctx.sampleRate,
      seed: Math.round(freq * 100) * 31 + variant,
    });
    const buf = ctx.createBuffer(1, data.length, ctx.sampleRate);
    buf.copyToChannel(data, 0);
    // maps iterate in insertion order, so this is a crude fifo cap (~48
    // buffers of ~1.6s mono ≈ 15mb worst case)
    if (this.plucks.size >= 48) {
      this.plucks.delete(this.plucks.keys().next().value!);
    }
    this.plucks.set(key, buf);
    return buf;
  }

  private pluckNote(
    freq: number,
    t: number,
    dur: number,
    prevFreq: number | null,
    variant: number,
  ) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.pluckBuffer(freq, variant);

    // gamaka glide: the buffer is at target pitch, bend in from the previous
    // note via playback rate. wide leaps just get plucked clean.
    if (prevFreq && prevFreq !== freq) {
      const ratio = prevFreq / freq;
      if (ratio > 1 / 1.6 && ratio < 1.6) {
        const glide = Math.min(0.09, dur * 0.35);
        src.playbackRate.setValueAtTime(ratio, t);
        src.playbackRate.exponentialRampToValueAtTime(1, t + glide);
      }
    }

    // vibrato blooms late, only on held notes
    if (dur > BEAT * 1.5) {
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 5.2;
      const depth = ctx.createGain();
      depth.gain.setValueAtTime(0, t);
      depth.gain.linearRampToValueAtTime(0.008, t + dur * 0.7);
      lfo.connect(depth).connect(src.playbackRate);
      lfo.start(t);
      lfo.stop(t + dur + 1);
      this.voiceNodes.push(lfo);
    }

    // the buffer carries the attack and the natural ring; the gain just sets
    // pick strength and finger-damps a moment after the written duration
    const g = ctx.createGain();
    const level = 0.5 * (0.85 + 0.3 * Math.random());
    g.gain.setValueAtTime(level, t);
    g.gain.setTargetAtTime(0.0001, t + dur, 0.18);
    src.connect(g).connect(this.voice!);
    src.start(t);
    src.stop(t + dur + 1);
    this.voiceNodes.push(src);
  }
}
