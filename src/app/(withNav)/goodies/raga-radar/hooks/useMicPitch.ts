// mic to pitch frames: getusermedia -> analyser -> yin on a raf loop.
// ~50hz analysis is plenty for a scrolling trace and costs a few ms a frame
import { useCallback, useEffect, useRef, useState } from "react";

import { PitchFrame, yinDetect } from "@lib/carnatic/yin";

export type MicState = "idle" | "starting" | "listening" | "denied" | "error";

export function useMicPitch(
  onFrame: (frame: PitchFrame, tMs: number, dtSec: number) => void,
) {
  const [state, setState] = useState<MicState>("idle");

  // keep the callback fresh without restarting the audio graph
  const onFrameRef = useRef(onFrame);
  useEffect(() => {
    onFrameRef.current = onFrame;
  });

  const ctxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef(0);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    void ctxRef.current?.close();
    ctxRef.current = null;
    setState("idle");
  }, []);

  const start = useCallback(async () => {
    if (ctxRef.current) return;
    setState("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        // echo cancellation ON: it subtracts our own tamburi from the mic,
        // otherwise the drone is polyphony that wrecks the pitch tracker.
        // agc/ns stay off: agc squashes dynamics, ns eats soft gamakas
        audio: {
          echoCancellation: true,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      const ctx = new AudioContext();
      await ctx.resume();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      ctx.createMediaStreamSource(stream).connect(analyser);
      streamRef.current = stream;
      ctxRef.current = ctx;

      const buf = new Float32Array(analyser.fftSize);
      let last = 0;
      const loop = (t: number) => {
        rafRef.current = requestAnimationFrame(loop);
        if (t - last < 18) return;
        const dt = last ? Math.min((t - last) / 1000, 0.1) : 0.02;
        last = t;
        analyser.getFloatTimeDomainData(buf);
        const frame = yinDetect(buf, {
          sampleRate: ctx.sampleRate,
          minF0: 70,
          maxF0: 1200,
        });
        onFrameRef.current(frame, t, dt);
      };
      rafRef.current = requestAnimationFrame(loop);
      setState("listening");
    } catch (e) {
      setState(
        e instanceof DOMException &&
          (e.name === "NotAllowedError" || e.name === "SecurityError")
          ? "denied"
          : "error",
      );
    }
  }, []);

  useEffect(() => stop, [stop]);

  return { state, start, stop };
}
