"use client";

import { useEffect, useRef } from "react";

import { preload } from "react-dom";

import { prefersReducedMotion } from "./motion";
import type { HalftoneEngine } from "./particleEngine";

// canvas behind the page, absolutely positioned and sized by the engine to
// span the document region the grains live in. being part of the scrolled
// content (not fixed) lets the browser scroll it on the compositor, so the
// portrait stays pixel-locked to the page instead of lagging behind it.
// the engine (and three.js with it) loads as a separate chunk after
// hydration so it stays off the critical path; reduced motion still gets
// the portrait, just placed instantly with no intro.
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
      className="pointer-events-none absolute left-0 top-0 z-0"
    />
  );
}
