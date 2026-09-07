"use client";

import { useEffect, useRef } from "react";

import { preload } from "react-dom";

import { prefersReducedMotion } from "./motion";
import type { HalftoneEngine } from "./particleEngine";

// 800px wide is all the engine ever needs: it resamples down to a 660-wide
// grain grid and jitters every luminance by +-3% anyway, so a bigger source
// buys nothing you can see. the 1500px png this replaced was 2.5mb and was
// single-handedly the reason the grains took ~5s to show up on a phone.
const PORTRAIT_SRC = "/kedar-bw-800.webp";

// engine chunk and portrait bitmap both start at module evaluation rather than
// from the effect, so neither waits on hydration. on a fast link the bundle
// download gates this either way, but on a cpu-bound phone hydration is the
// long pole and this hands back whatever it was costing.
// guarded: this module is also evaluated on the server for the rsc pass.
const browser = typeof window !== "undefined";

const enginePromise = browser
  ? import("./particleEngine").then((m) => m.HalftoneEngine)
  : null;

const portraitPromise = browser
  ? new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = PORTRAIT_SRC;
    })
  : null;

// both are consumed inside the effect, but that subscribes late enough for a
// fast failure to land as an unhandled rejection first. the real handling
// (collapse the stage) still happens below
enginePromise?.catch(() => {});
portraitPromise?.catch(() => {});

// canvas behind the page, absolutely positioned and sized by the engine to
// span the document region the grains live in. being part of the scrolled
// content (not fixed) lets the browser scroll it on the compositor, so the
// portrait stays pixel-locked to the page instead of lagging behind it.
// the engine (and three.js with it) loads as a separate chunk so it stays off
// the critical path; reduced motion still gets the portrait, just placed
// instantly with no intro.
export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // the ssr'd <link rel=preload> starts the download during html parse, which
  // is earlier than any module can. same url, so it dedupes with the Image above
  preload(PORTRAIT_SRC, { as: "image", type: "image/webp" });

  useEffect(() => {
    const portraitEl = document.getElementById("portrait-anchor");
    // text anchor is optional: without it the scroll morph stays inert
    const textEl = document.getElementById("text-anchor");
    if (!canvasRef.current || !portraitEl || !enginePromise || !portraitPromise)
      return;

    let engine: HalftoneEngine | null = null;
    let cancelled = false;
    // nothing will ever paint the stage, so collapse it rather than leave a
    // portrait-sized hole in the hero. done here (imperatively, on a node
    // react renders once and never touches again) so the happy path never
    // pays for the check - asking the gpu anything up front costs a real
    // context create, which is slow on ios safari
    const collapseStage = () => {
      engine?.dispose();
      engine = null;
      portraitEl.style.display = "none";
    };
    enginePromise.then((Engine) => {
      if (cancelled || !canvasRef.current) return;
      try {
        engine = new Engine(canvasRef.current, {
          image: portraitPromise,
          portraitEl,
          textEl,
          reducedMotion: prefersReducedMotion(),
        });
        engine.init().catch(collapseStage);
      } catch {
        // no webgl: page still works as plain text, just without the portrait
        collapseStage();
      }
    }, collapseStage);

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
