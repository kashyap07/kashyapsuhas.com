"use client";

import { useEffect, useRef } from "react";

import { preload } from "react-dom";

import { prefersReducedMotion } from "./motion";
import type { HalftoneEngine } from "./particleEngine";

// fullscreen fixed canvas behind the page. the grain portrait lives here.
// the engine (and three.js with it) loads as a separate chunk after
// hydration so it stays off the critical path; reduced motion still gets
// the portrait, just placed instantly with no intro, brush, or ripple.
export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // kick the portrait download off before the engine chunk arrives
  preload("/kedar-bw.png", { as: "image" });

  useEffect(() => {
    const portraitEl = document.getElementById("portrait-anchor");
    // text anchor is optional: without it the scroll morph stays inert
    const textEl = document.getElementById("text-anchor");
    if (!canvasRef.current || !portraitEl) return;

    let engine: HalftoneEngine | null = null;
    let cancelled = false;
    import("./particleEngine").then(({ HalftoneEngine: Engine }) => {
      if (cancelled || !canvasRef.current) return;
      try {
        engine = new Engine(canvasRef.current, {
          imageSrc: "/kedar-bw.png",
          portraitEl,
          textEl,
          reducedMotion: prefersReducedMotion(),
        });
        engine.init().catch(() => engine?.dispose());
      } catch {
        // no webgl: nothing renders, the page still works as plain text
      }
    });

    return () => {
      cancelled = true;
      engine?.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
