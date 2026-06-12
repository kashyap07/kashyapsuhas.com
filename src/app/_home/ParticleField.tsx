"use client";

import { useEffect, useRef } from "react";

import { prefersReducedMotion } from "./motion";
import { HalftoneEngine } from "./particleEngine";

// fullscreen fixed canvas behind the page. the grain portrait lives here.
// reduced motion still gets the portrait, just placed instantly with no
// intro, loupe, or ripple.
export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const portraitEl = document.getElementById("portrait-anchor");
    // ridge anchor is optional: without it the scroll morph stays inert
    const ridgeEl = document.getElementById("ridge-anchor");
    if (!canvasRef.current || !portraitEl) return;

    let engine: HalftoneEngine | null = null;
    try {
      engine = new HalftoneEngine(canvasRef.current, {
        imageSrc: "/kedar-bw.png",
        portraitEl,
        ridgeEl,
        reducedMotion: prefersReducedMotion(),
      });
      engine.init().catch(() => engine?.dispose());
    } catch {
      // no webgl: nothing renders, the page still works as plain text
      return;
    }

    return () => engine?.dispose();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
