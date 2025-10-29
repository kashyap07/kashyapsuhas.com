import { useCallback, useEffect, useRef, useState } from "react";

export interface AudioEngineControls {
  playSound: (soundId: string, time?: number) => void;
  setVolume: (value: number) => void;
  setPitch: (value: number) => void;
  setFilterCutoff: (value: number) => void;
  setReverbMix: (value: number) => void;
  setDrive: (value: number) => void;
  setCustomBuffer: (soundId: string, buffer: AudioBuffer) => void;
  clearCustomBuffer: (soundId: string) => void;
  isLoaded: boolean;
  getCurrentTime: () => number;
  audioContext: AudioContext | null;
}

// improved drum sound synthesis
function createDrumBuffer(
  ctx: AudioContext,
  type: string
): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  let duration = 0.5;

  // adjust duration per sound type
  if (type === "kick") duration = 0.5;
  else if (type === "snare") duration = 0.3;
  else if (type === "hihat" || type === "ride" || type === "crash") duration = 0.15;
  else if (type === "clap") duration = 0.2;
  else if (type === "tom1" || type === "tom2") duration = 0.4;
  else if (type === "cowbell") duration = 0.3;

  const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < data.length; i++) {
    const t = i / sampleRate;
    let sample = 0;

    switch (type) {
      case "kick": {
        // punchy kick with pitch sweep
        const freq = 150 * Math.exp(-t * 15);
        const env = Math.exp(-t * 6);
        sample = Math.sin(2 * Math.PI * freq * t) * env;
        // add click
        sample += (Math.random() * 2 - 1) * 0.3 * Math.exp(-t * 50);
        break;
      }

      case "snare": {
        // snare = tone + noise
        const tone = Math.sin(2 * Math.PI * 200 * t) * Math.exp(-t * 15);
        const noise = (Math.random() * 2 - 1) * Math.exp(-t * 8);
        sample = tone * 0.3 + noise * 0.7;
        break;
      }

      case "hihat": {
        // bright noise with fast decay
        const noise = (Math.random() * 2 - 1);
        const env = Math.exp(-t * 40);
        // high-pass characteristics
        sample = noise * env * 0.4;
        break;
      }

      case "clap": {
        // multiple short bursts
        const bursts = Math.floor(t * 100);
        if (bursts < 3) {
          sample = (Math.random() * 2 - 1) * Math.exp(-t * 30);
        }
        break;
      }

      case "tom1": {
        // mid tom
        const freq = 130 * Math.exp(-t * 8);
        const env = Math.exp(-t * 5);
        sample = Math.sin(2 * Math.PI * freq * t) * env;
        break;
      }

      case "tom2": {
        // low tom
        const freq = 90 * Math.exp(-t * 8);
        const env = Math.exp(-t * 5);
        sample = Math.sin(2 * Math.PI * freq * t) * env;
        break;
      }

      case "ride": {
        // metallic noise with slow decay
        const noise = (Math.random() * 2 - 1);
        const env = Math.exp(-t * 15);
        // add some tonal content
        const tone = Math.sin(2 * Math.PI * 3000 * t) * 0.2;
        sample = (noise * 0.8 + tone * 0.2) * env * 0.3;
        break;
      }

      case "crash": {
        // bright metallic noise with medium decay
        const noise = (Math.random() * 2 - 1);
        const env = Math.exp(-t * 10);
        sample = noise * env * 0.3;
        break;
      }

      case "cowbell": {
        // two-tone metallic sound
        const freq1 = 540;
        const freq2 = 800;
        const env = Math.exp(-t * 8);
        sample = (Math.sin(2 * Math.PI * freq1 * t) +
                 Math.sin(2 * Math.PI * freq2 * t)) * env * 0.5;
        break;
      }

      case "closedhat": {
        // tighter hi-hat
        const noise = (Math.random() * 2 - 1);
        const env = Math.exp(-t * 60);
        sample = noise * env * 0.35;
        break;
      }

      case "openhat": {
        // sustained hi-hat
        const noise = (Math.random() * 2 - 1);
        const env = Math.exp(-t * 8);
        sample = noise * env * 0.3;
        break;
      }

      case "rimshot": {
        // sharp metallic click
        const freq = 1000;
        const env = Math.exp(-t * 50);
        sample = Math.sin(2 * Math.PI * freq * t) * env * 0.4;
        break;
      }

      case "shaker": {
        // rattling noise
        const noise = (Math.random() * 2 - 1);
        const env = Math.exp(-t * 25);
        const rattle = Math.sin(2 * Math.PI * 200 * t) * 0.3;
        sample = (noise * 0.7 + rattle * 0.3) * env * 0.3;
        break;
      }

      case "tambourine": {
        // jingly percussion
        const noise = (Math.random() * 2 - 1);
        const jingle = Math.sin(2 * Math.PI * 2000 * t) + Math.sin(2 * Math.PI * 2500 * t);
        const env = Math.exp(-t * 15);
        sample = (noise * 0.4 + jingle * 0.6) * env * 0.25;
        break;
      }

      case "conga": {
        // mid-pitched drum
        const freq = 200 * Math.exp(-t * 12);
        const env = Math.exp(-t * 7);
        sample = Math.sin(2 * Math.PI * freq * t) * env * 0.6;
        break;
      }

      case "bongo": {
        // high-pitched drum
        const freq = 350 * Math.exp(-t * 15);
        const env = Math.exp(-t * 8);
        sample = Math.sin(2 * Math.PI * freq * t) * env * 0.5;
        break;
      }

      case "bass1": {
        // deep bass note - C2 (130.81 Hz) in C minor
        const freq = 130.81;
        const env = Math.exp(-t * 3);
        const harmonic = Math.sin(2 * Math.PI * freq * t) +
                        Math.sin(2 * Math.PI * freq * 2 * t) * 0.3;
        sample = harmonic * env * 0.7;
        break;
      }

      case "bass2": {
        // mid bass note
        const freq = 73.42; // D2
        const env = Math.exp(-t * 4);
        sample = Math.sin(2 * Math.PI * freq * t) * env * 0.8;
        break;
      }

      case "bass3": {
        // higher bass note
        const freq = 98; // G2
        const env = Math.exp(-t * 4);
        sample = Math.sin(2 * Math.PI * freq * t) * env * 0.8;
        break;
      }

      case "pluck": {
        // plucked string sound - G3 (392 Hz) in C minor
        const freq = 392;
        const env = Math.exp(-t * 10);
        const harmonics = Math.sin(2 * Math.PI * freq * t) +
                         Math.sin(2 * Math.PI * freq * 2 * t) * 0.5 +
                         Math.sin(2 * Math.PI * freq * 3 * t) * 0.25;
        sample = harmonics * env * 0.5;
        break;
      }

      case "stab": {
        // short synth stab
        const freq = 440;
        const env = Math.exp(-t * 20);
        const stab = Math.sin(2 * Math.PI * freq * t) +
                    Math.sin(2 * Math.PI * (freq * 1.5) * t) * 0.5;
        sample = stab * env * 0.5;
        break;
      }

      case "chord": {
        // major chord
        const root = 261.63; // C4
        const third = 329.63; // E4
        const fifth = 392; // G4
        const env = Math.exp(-t * 3);
        sample = (Math.sin(2 * Math.PI * root * t) +
                 Math.sin(2 * Math.PI * third * t) +
                 Math.sin(2 * Math.PI * fifth * t)) * env * 0.3;
        break;
      }

      case "vocal1": {
        // formant-like "oh" vowel - Eb4 (311.13 Hz) in C minor
        const freq = 311.13;
        const formant1 = freq * 1.3;
        const formant2 = freq * 2.6;
        const env = Math.exp(-t * 5);
        sample = (Math.sin(2 * Math.PI * freq * t) * 0.5 +
                 Math.sin(2 * Math.PI * formant1 * t) * 0.3 +
                 Math.sin(2 * Math.PI * formant2 * t) * 0.2) * env * 0.4;
        break;
      }

      case "vocal2": {
        // formant-like "ah" vowel
        const freq1 = 700;
        const freq2 = 1200;
        const env = Math.exp(-t * 6);
        sample = (Math.sin(2 * Math.PI * freq1 * t) * 0.6 +
                 Math.sin(2 * Math.PI * freq2 * t) * 0.4) * env * 0.4;
        break;
      }

      case "vocal3": {
        // formant-like "ee" vowel
        const freq1 = 270;
        const freq2 = 2300;
        const env = Math.exp(-t * 6);
        sample = (Math.sin(2 * Math.PI * freq1 * t) * 0.6 +
                 Math.sin(2 * Math.PI * freq2 * t) * 0.4) * env * 0.4;
        break;
      }

      case "fx1": {
        // downward zap from G4 to C3 - fits C minor scale
        const startFreq = 392; // G4
        const endFreq = 130.81; // C3
        const freq = startFreq - (startFreq - endFreq) * Math.min(t * 8, 1);
        const env = Math.exp(-t * 12);
        sample = Math.sin(2 * Math.PI * freq * t) * env * 0.5;
        break;
      }

      case "fx2": {
        // blip
        const freq = 800 - t * 2000;
        const env = Math.exp(-t * 30);
        sample = Math.sin(2 * Math.PI * freq * t) * env * 0.5;
        break;
      }

      case "sweep": {
        // rising sweep from C3 to G4 - fits C minor scale
        const startFreq = 130.81; // C3
        const endFreq = 392; // G4
        const freq = startFreq + (endFreq - startFreq) * Math.min(t * 6, 1);
        const env = Math.exp(-t * 5);
        sample = Math.sin(2 * Math.PI * freq * t) * env * 0.4;
        break;
      }

      default:
        sample = Math.sin(2 * Math.PI * 440 * t) * Math.exp(-t * 5);
    }

    data[i] = Math.max(-1, Math.min(1, sample));
  }

  return buffer;
}

export function useAudioEngine(): AudioEngineControls {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const convolverRef = useRef<ConvolverNode | null>(null);
  const reverbGainRef = useRef<GainNode | null>(null);
  const dryGainRef = useRef<GainNode | null>(null);
  const audioBuffersRef = useRef<Record<string, AudioBuffer>>({});
  const customBuffersRef = useRef<Record<string, AudioBuffer>>({});
  const pitchShiftRef = useRef<number>(0);
  const driveRef = useRef<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const initAudio = async () => {
      try {
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;

        // create audio nodes
        const masterGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        const convolver = ctx.createConvolver();
        const reverbGain = ctx.createGain();
        const dryGain = ctx.createGain();

        // configure filter (low-pass)
        filter.type = "lowpass";
        filter.frequency.value = 20000;
        filter.Q.value = 1;

        // create simple reverb impulse
        const reverbLength = ctx.sampleRate * 2;
        const reverbBuffer = ctx.createBuffer(2, reverbLength, ctx.sampleRate);
        for (let channel = 0; channel < 2; channel++) {
          const data = reverbBuffer.getChannelData(channel);
          for (let i = 0; i < reverbLength; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.5));
          }
        }
        convolver.buffer = reverbBuffer;

        // set initial gains
        masterGain.gain.value = 1.0; // always 100%
        reverbGain.gain.value = 0;
        dryGain.gain.value = 1;

        // connect: source → filter → dry/reverb → master → destination
        filter.connect(dryGain);
        filter.connect(convolver);
        convolver.connect(reverbGain);
        dryGain.connect(masterGain);
        reverbGain.connect(masterGain);
        masterGain.connect(ctx.destination);

        masterGainRef.current = masterGain;
        filterRef.current = filter;
        convolverRef.current = convolver;
        reverbGainRef.current = reverbGain;
        dryGainRef.current = dryGain;

        // generate all sounds
        const soundTypes = [
          "kick", "snare", "hihat", "clap", "tom1", "tom2", "ride", "crash", "cowbell",
          "closedhat", "openhat", "rimshot", "shaker", "tambourine", "conga", "bongo",
          "bass1", "bass2", "bass3", "pluck", "stab", "chord",
          "vocal1", "vocal2", "vocal3", "fx1", "fx2", "sweep"
        ];

        for (const type of soundTypes) {
          const buffer = createDrumBuffer(ctx, type);
          audioBuffersRef.current[type] = buffer;
        }

        setIsLoaded(true);
      } catch (error) {
        console.error("Failed to initialize audio:", error);
      }
    };

    initAudio();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playSound = useCallback((soundId: string, time?: number) => {
    const ctx = audioContextRef.current;
    // use custom buffer if available, otherwise use default
    const buffer = customBuffersRef.current[soundId] || audioBuffersRef.current[soundId];
    const filter = filterRef.current;

    if (!ctx || !buffer || !filter) return;

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // apply pitch shift
    const pitchRatio = Math.pow(2, pitchShiftRef.current / 12);
    source.playbackRate.value = pitchRatio;

    // apply drive/distortion with waveshaper
    if (driveRef.current > 0) {
      const waveshaper = ctx.createWaveShaper();
      const amount = driveRef.current * 100;
      const samples = 44100;
      const curve = new Float32Array(samples);
      const deg = Math.PI / 180;

      for (let i = 0; i < samples; i++) {
        const x = (i * 2) / samples - 1;
        curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
      }

      waveshaper.curve = curve;
      waveshaper.oversample = '4x';

      source.connect(waveshaper);
      waveshaper.connect(filter);
    } else {
      source.connect(filter);
    }

    const startTime = time !== undefined ? time : ctx.currentTime;
    source.start(startTime);
  }, []);

  const setVolume = useCallback((value: number) => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.setValueAtTime(
        value,
        audioContextRef.current?.currentTime || 0
      );
    }
  }, []);

  const setPitch = useCallback((semitones: number) => {
    pitchShiftRef.current = semitones;
  }, []);

  const setFilterCutoff = useCallback((value: number) => {
    if (filterRef.current && audioContextRef.current) {
      const minFreq = 100;
      const maxFreq = 20000;
      const freq = minFreq * Math.pow(maxFreq / minFreq, value);
      filterRef.current.frequency.setValueAtTime(
        freq,
        audioContextRef.current.currentTime
      );
    }
  }, []);

  const setReverbMix = useCallback((value: number) => {
    if (reverbGainRef.current && dryGainRef.current && audioContextRef.current) {
      const time = audioContextRef.current.currentTime;
      reverbGainRef.current.gain.setValueAtTime(value * 0.5, time);
      dryGainRef.current.gain.setValueAtTime(1 - value * 0.3, time);
    }
  }, []);

  const getCurrentTime = useCallback(() => {
    return audioContextRef.current?.currentTime || 0;
  }, []);

  const setDrive = useCallback((value: number) => {
    driveRef.current = value;
  }, []);

  const setCustomBuffer = useCallback((soundId: string, buffer: AudioBuffer) => {
    customBuffersRef.current[soundId] = buffer;
  }, []);

  const clearCustomBuffer = useCallback((soundId: string) => {
    delete customBuffersRef.current[soundId];
  }, []);

  return {
    playSound,
    setVolume,
    setPitch,
    setFilterCutoff,
    setReverbMix,
    setDrive,
    setCustomBuffer,
    clearCustomBuffer,
    isLoaded,
    getCurrentTime,
    audioContext: audioContextRef.current,
  };
}
