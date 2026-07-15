// tiny web audio raga instrument: breathy flute lead over a tamburi-ish drone

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
  private wave: PeriodicWave | null = null;
  private noise: AudioBuffer | null = null;
  private melodyBus: GainNode | null = null;
  private droneBus: GainNode | null = null;
  private droneOscs: OscillatorNode[] = [];
  private doneTimer: ReturnType<typeof setTimeout> | null = null;
  // per-play gain node + its sources, so stop can kill them for real
  private voice: GainNode | null = null;
  private voiceNodes: AudioScheduledSourceNode[] = [];

  private ensure(): AudioContext {
    if (this.ctx) return this.ctx;
    const ctx = new AudioContext();

    // flute-ish tone: strong fundamental, a touch of 2nd and 3rd harmonic
    this.wave = ctx.createPeriodicWave(
      new Float32Array([0, 0, 0, 0]),
      new Float32Array([0, 1, 0.22, 0.06]),
    );

    // shared noise buffer for breath
    const n = ctx.sampleRate;
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
    this.noise = buf;

    // gentle echo so the flute has some air around it
    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0.28;
    const damp = ctx.createBiquadFilter();
    damp.type = "lowpass";
    damp.frequency.value = 2400;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.3;
    delay.connect(damp).connect(feedback).connect(delay);
    const wet = ctx.createGain();
    wet.gain.value = 0.16;
    delay.connect(wet).connect(ctx.destination);

    this.melodyBus = ctx.createGain();
    this.melodyBus.connect(ctx.destination);
    this.melodyBus.connect(delay);

    this.droneBus = ctx.createGain();
    this.droneBus.connect(ctx.destination);

    this.ctx = ctx;
    return ctx;
  }

  startDrone(saHz: number, secondRatio: number | null) {
    const ctx = this.ensure();
    // safari can hand back a suspended context even inside a user gesture
    void ctx.resume();
    if (this.droneOscs.length) return;

    const pitches = [
      { f: saHz / 2, g: 0.05 },
      ...(secondRatio ? [{ f: (saHz / 2) * secondRatio, g: 0.038 }] : []),
      { f: saHz, g: 0.02 },
    ];

    const t = ctx.currentTime;
    this.droneBus!.gain.cancelScheduledValues(t);
    this.droneBus!.gain.setValueAtTime(0.0001, t);
    this.droneBus!.gain.exponentialRampToValueAtTime(1, t + 2);

    for (const { f, g } of pitches) {
      for (const detune of [-4, 4]) {
        const osc = ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.value = f;
        osc.detune.value = detune;

        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 1000;
        lp.Q.value = 0.5;

        // slow filter drift gives the drone its shimmer
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.07 + Math.random() * 0.05;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 300;
        lfo.connect(lfoGain).connect(lp.frequency);
        lfo.start();

        const gain = ctx.createGain();
        gain.gain.value = g / 2;
        osc.connect(lp).connect(gain).connect(this.droneBus!);
        osc.start();
        this.droneOscs.push(osc, lfo);
      }
    }
  }

  stopDrone() {
    if (!this.ctx || !this.droneBus) return;
    this.droneBus.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.3);
    const oscs = this.droneOscs;
    this.droneOscs = [];
    setTimeout(() => {
      for (const o of oscs) {
        try {
          o.stop();
        } catch {
          // already stopped
        }
      }
    }, 1500);
  }

  get droneRunning() {
    return this.droneOscs.length > 0;
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
    const sched: Scheduled["sched"] = [];
    for (const n of notes) {
      t += n.restBefore * BEAT;
      const dur = n.beats * BEAT;
      this.fluteNote(n.freq, t, dur, prevFreq);
      sched.push({ start: t, end: t + dur, idx: n.idx });
      prevFreq = n.freq;
      t += dur;
    }

    this.doneTimer = setTimeout(onDone, (t - t0 + 0.4) * 1000);
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
    this.ctx?.close();
    this.ctx = null;
  }

  private fluteNote(
    freq: number,
    t: number,
    dur: number,
    prevFreq: number | null,
  ) {
    const ctx = this.ctx!;

    const osc = ctx.createOscillator();
    osc.setPeriodicWave(this.wave!);
    // glide in from the previous note, gamaka style
    if (prevFreq && prevFreq !== freq) {
      const glide = Math.min(0.1, dur * 0.3);
      osc.frequency.setValueAtTime(prevFreq, t);
      osc.frequency.exponentialRampToValueAtTime(freq, t + glide);
    } else {
      osc.frequency.setValueAtTime(freq, t);
    }

    // vibrato blooms late, only on held notes
    if (dur > BEAT * 1.5) {
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 5.2;
      const depth = ctx.createGain();
      depth.gain.setValueAtTime(0, t);
      depth.gain.linearRampToValueAtTime(freq * 0.008, t + dur * 0.7);
      lfo.connect(depth).connect(osc.frequency);
      lfo.start(t);
      lfo.stop(t + dur + 0.3);
      this.voiceNodes.push(lfo);
    }

    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.exponentialRampToValueAtTime(0.26, t + 0.05);
    amp.gain.setTargetAtTime(0.2, t + 0.08, 0.12);
    amp.gain.setTargetAtTime(0.0001, t + dur - 0.06, 0.045);
    osc.connect(amp).connect(this.voice!);
    osc.start(t);
    osc.stop(t + dur + 0.3);
    this.voiceNodes.push(osc);

    // breath: a soft chiff at the attack, faint hiss through the note
    const noise = ctx.createBufferSource();
    noise.buffer = this.noise!;
    noise.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = freq * 2.5;
    bp.Q.value = 1.5;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.05, t);
    ng.gain.exponentialRampToValueAtTime(0.006, t + 0.1);
    ng.gain.setTargetAtTime(0.0001, t + dur - 0.05, 0.03);
    noise.connect(bp).connect(ng).connect(this.voice!);
    noise.start(t);
    noise.stop(t + dur + 0.1);
    this.voiceNodes.push(noise);
  }
}
