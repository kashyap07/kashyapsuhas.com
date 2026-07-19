"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import { Wrapper } from "@components/ui";
import cn from "@utils/cn";

import { exportBlurred } from "./exportImage";
import { type Pipeline, createPipeline } from "./gl";
import {
  clearPhoto,
  loadPhoto,
  readSettings,
  savePhoto,
  writeSettings,
} from "./store";

// preview is capped for gpu speed; export renders at full resolution on
// desktop, capped on phone-class gpus (see EXPORT_CAP_PX)
const PREVIEW_MAX = 2048;
const RADIUS_MAX = 150; // matches the shader's tap budget

// ios safari jettisons (and reloads) the page when gpu memory spikes, and the
// export path peaks around 45 bytes/px. 12mp keeps a typical iphone photo at
// true full res while staying inside webkit's budget; 24/48mp shots downscale.
// ipados reports itself as MacIntel, hence the touch-points check.
const CONSTRAINED_GPU =
  typeof navigator !== "undefined" &&
  (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
const EXPORT_CAP_PX = 12e6;

// slider starting points, also the reset targets
const DEFAULTS = {
  radius: 25,
  bloomIntensity: 40, // percent
  bloomRadius: 150, // full-res px
  bloomThreshold: 60, // percent of linear luminance
  glowWarmth: 0, // percent; grading lives in lightroom, so off by default
  haze: 10, // percent; a whisper of milky air
  focusSize: 30, // focal radius, percent of the shorter image side
  falloff: 60, // ramp length, percent of the shorter image side
  stretch: 100, // focal width/height, percent; 100 = circle
  tilt: 0, // ellipse rotation, degrees clockwise; symmetric at +-90
  cx: 0.5,
  cy: 0.45,
};

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

// restored settings come from localStorage, so trust nothing
const num = (v: number | undefined, d: number, lo: number, hi: number) =>
  typeof v === "number" && Number.isFinite(v) ? clamp(v, lo, hi) : d;

// wraps at +-90, where the ellipse is symmetric, so no visual jump
const wrapTilt = (t: number) =>
  Math.round((((((t + 90) % 180) + 180) % 180) - 90) * 10) / 10;

interface Loaded {
  file: File;
  fullW: number;
  fullH: number;
  prevW: number;
  prevH: number;
  scale: number; // prevW / fullW
}

const Dreamify: React.FC = () => {
  // settings survive reloads; the photo itself is restored from indexeddb
  // in an effect below
  const [saved] = useState(() => readSettings());

  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [radius, setRadius] = useState(
    num(saved?.radius, DEFAULTS.radius, 0, RADIUS_MAX),
  );
  const [bloomIntensity, setBloomIntensity] = useState(
    num(saved?.bloomIntensity, DEFAULTS.bloomIntensity, 0, 100),
  );
  const [bloomRadius, setBloomRadius] = useState(
    num(saved?.bloomRadius, DEFAULTS.bloomRadius, 20, 400),
  );
  const [bloomThreshold, setBloomThreshold] = useState(
    num(saved?.bloomThreshold, DEFAULTS.bloomThreshold, 20, 95),
  );
  const [glowWarmth, setGlowWarmth] = useState(
    num(saved?.glowWarmth, DEFAULTS.glowWarmth, 0, 100),
  );
  const [haze, setHaze] = useState(num(saved?.haze, DEFAULTS.haze, 0, 100));
  const [focusSize, setFocusSize] = useState(
    num(saved?.focusSize, DEFAULTS.focusSize, 5, 80),
  );
  const [falloff, setFalloff] = useState(
    num(saved?.falloff, DEFAULTS.falloff, 10, 150),
  );
  const [stretch, setStretch] = useState(
    num(saved?.stretch, DEFAULTS.stretch, 50, 200),
  );
  const [tilt, setTilt] = useState(num(saved?.tilt, DEFAULTS.tilt, -90, 90));
  const [center, setCenter] = useState({
    x: num(saved?.cx, DEFAULTS.cx, 0, 1),
    y: num(saved?.cy, DEFAULTS.cy, 0, 1),
  });
  const [activeControl, setActiveControl] = useState("radius");
  const [showGuide, setShowGuide] = useState(true);
  const [dispSize, setDispSize] = useState<{ w: number; h: number } | null>(
    null,
  );
  const [showOriginal, setShowOriginal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const glCanvasRef = useRef<HTMLCanvasElement>(null);
  const srcCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const bitmapRef = useRef<ImageBitmap | null>(null); // full-res, kept for export
  const pipelineRef = useRef<Pipeline | null>(null);
  const rafPending = useRef(false);

  // touch interaction state: drag to place, pinch to resize, twist to tilt,
  // long-press to peek at the original
  const dragging = useRef(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gestureRef = useRef<{
    dist: number;
    angle: number;
    focus: number;
    tilt: number;
  } | null>(null);
  const lpTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const peeking = useRef(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const blockDrag = useRef(false); // finger left over from a pinch must not drag

  // latest compare state for the rAF render, which closes over nothing else
  const liveOriginal = useRef(false);
  liveOriginal.current = showOriginal;

  const requestRender = useCallback(() => {
    if (rafPending.current) return;
    rafPending.current = true;
    requestAnimationFrame(() => {
      rafPending.current = false;
      pipelineRef.current?.render({ showOriginal: liveOriginal.current });
    });
  }, []);

  const loadFile = useCallback(
    async (
      file: File,
      opts?: { resetCenter?: boolean; persist?: boolean; quiet?: boolean },
    ) => {
      setError(null);
      if (!file.type.startsWith("image/")) {
        if (!opts?.quiet) setError("that does not look like an image file.");
        return;
      }
      try {
        const bmp = await createImageBitmap(file, {
          imageOrientation: "from-image",
        });
        const fullW = bmp.width;
        const fullH = bmp.height;
        const scale = Math.min(1, PREVIEW_MAX / Math.max(fullW, fullH));
        const prevW = Math.max(1, Math.round(fullW * scale));
        const prevH = Math.max(1, Math.round(fullH * scale));

        const src = document.createElement("canvas");
        src.width = prevW;
        src.height = prevH;
        const sctx = src.getContext("2d")!;
        sctx.imageSmoothingQuality = "high";
        sctx.drawImage(bmp, 0, 0, prevW, prevH);

        bitmapRef.current?.close();
        bitmapRef.current = bmp;
        srcCanvasRef.current = src;
        if (opts?.resetCenter !== false) {
          setCenter({ x: DEFAULTS.cx, y: DEFAULTS.cy });
        }
        if (opts?.persist !== false) void savePhoto(file);
        setLoaded({ file, fullW, fullH, prevW, prevH, scale });
      } catch (e) {
        if (opts?.quiet) {
          void clearPhoto(); // stored photo is unreadable, drop it
        } else {
          setError(
            `could not load that file: ${e instanceof Error ? e.message : e}`,
          );
        }
      }
    },
    [],
  );

  // auto-restore the last photo after accidental reloads and back-buttons;
  // slider state came back through the initializers above
  useEffect(() => {
    let cancelled = false;
    void loadPhoto().then((f) => {
      if (f && !cancelled && !bitmapRef.current) {
        void loadFile(f, { resetCenter: false, persist: false, quiet: true });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [loadFile]);

  // persist settings, debounced so slider drags do not hammer localStorage
  useEffect(() => {
    const t = setTimeout(() => {
      writeSettings({
        radius,
        bloomIntensity,
        bloomRadius,
        bloomThreshold,
        glowWarmth,
        haze,
        focusSize,
        falloff,
        stretch,
        tilt,
        cx: center.x,
        cy: center.y,
      });
    }, 300);
    return () => clearTimeout(t);
  }, [
    radius,
    bloomIntensity,
    bloomRadius,
    bloomThreshold,
    glowWarmth,
    haze,
    focusSize,
    falloff,
    stretch,
    tilt,
    center,
  ]);

  // engine params; the focal zone is resolution independent, sigmas are not
  const buildParams = useCallback(
    (scale: number) => ({
      sigmaMax: radius * scale,
      bloomSigma: bloomRadius * scale,
      bloomThreshold: bloomThreshold / 100,
      bloomIntensity: bloomIntensity / 100,
      warmth: glowWarmth / 100,
      // full-slider haze screens 35% of the blurred frame back, plenty milky
      haze: (haze / 100) * 0.35,
      cx: center.x,
      cy: center.y,
      focusRadius: focusSize / 100,
      feather: falloff / 100,
      aspect: stretch / 100,
      angle: (tilt * Math.PI) / 180,
    }),
    [
      radius,
      bloomRadius,
      bloomThreshold,
      bloomIntensity,
      glowWarmth,
      haze,
      center,
      focusSize,
      falloff,
      stretch,
      tilt,
    ],
  );

  // (re)build the gl pipeline whenever a new image loads
  useEffect(() => {
    if (!loaded || !glCanvasRef.current || !srcCanvasRef.current) return;
    pipelineRef.current?.destroy();
    try {
      const p = createPipeline(glCanvasRef.current, srcCanvasRef.current);
      pipelineRef.current = p;
      p.setParams(buildParams(loaded.scale));
      p.render({ showOriginal });
    } catch (e) {
      setError(`webgl setup failed: ${e instanceof Error ? e.message : e}`);
    }
    return () => {
      pipelineRef.current?.destroy();
      pipelineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  // push parameter changes into the engine
  useEffect(() => {
    if (!loaded || !pipelineRef.current) return;
    pipelineRef.current.setParams(buildParams(loaded.scale));
    requestRender();
  }, [loaded, buildParams, requestRender]);

  useEffect(() => {
    requestRender();
  }, [showOriginal, requestRender]);

  // free the retained bitmap on unmount
  useEffect(() => () => bitmapRef.current?.close(), []);

  // track the canvas's displayed size for the guide overlay; the canvas only
  // gets real dimensions once the pipeline sets them, after first render
  useEffect(() => {
    const canvas = glCanvasRef.current;
    if (!canvas || !loaded) return;
    const ro = new ResizeObserver(() => {
      const r = canvas.getBoundingClientRect();
      setDispSize({ w: r.width, h: r.height });
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [loaded]);

  // pointer -> normalized image coords, clamped
  const toNorm = useCallback((e: { clientX: number; clientY: number }) => {
    const rect = glCanvasRef.current!.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height)),
    };
  }, []);

  const clearLp = () => {
    if (lpTimer.current) {
      clearTimeout(lpTimer.current);
      lpTimer.current = null;
    }
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!loaded) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // pointer already gone (released mid-dispatch); track it anyway
    }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2) {
      // second finger starts a pinch/twist; whatever the first was doing ends
      clearLp();
      if (peeking.current) {
        peeking.current = false;
        setShowOriginal(false);
      }
      dragging.current = false;
      blockDrag.current = true;
      const [p1, p2] = [...pointers.current.values()];
      gestureRef.current = {
        dist: Math.max(1, Math.hypot(p2.x - p1.x, p2.y - p1.y)),
        angle: (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI,
        focus: focusSize,
        tilt,
      };
      return;
    }
    if (pointers.current.size !== 1) return;

    if (e.pointerType === "mouse") {
      if (e.button !== 0) return;
      dragging.current = true;
      setCenter(toNorm(e));
    } else {
      // touch: place on drag or quick tap, long-press peeks at the original
      touchStart.current = { x: e.clientX, y: e.clientY };
      lpTimer.current = setTimeout(() => {
        lpTimer.current = null;
        peeking.current = true;
        setShowOriginal(true);
      }, 450);
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (gestureRef.current && pointers.current.size >= 2) {
      const g = gestureRef.current;
      const [p1, p2] = [...pointers.current.values()];
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const angle = (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;
      setFocusSize(clamp(Math.round(g.focus * (dist / g.dist)), 5, 80));
      setTilt(wrapTilt(g.tilt + angle - g.angle));
      return;
    }
    if (blockDrag.current || peeking.current) return;
    if (dragging.current) {
      setCenter(toNorm(e));
      return;
    }
    if (touchStart.current) {
      const moved = Math.hypot(
        e.clientX - touchStart.current.x,
        e.clientY - touchStart.current.y,
      );
      // slop before a press becomes a drag, so long-press can still fire
      if (moved > 8) {
        clearLp();
        dragging.current = true;
        setCenter(toNorm(e));
      }
    }
  };

  const onPointerEnd = (e: React.PointerEvent<HTMLCanvasElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) gestureRef.current = null;
    if (pointers.current.size === 0) {
      const wasPeek = peeking.current;
      const wasDrag = dragging.current;
      const wasTouchPress = touchStart.current !== null;
      const wasBlocked = blockDrag.current;
      clearLp();
      peeking.current = false;
      dragging.current = false;
      touchStart.current = null;
      blockDrag.current = false;
      if (wasPeek) {
        setShowOriginal(false);
      } else if (
        e.type === "pointerup" &&
        wasTouchPress &&
        !wasDrag &&
        !wasBlocked
      ) {
        setCenter(toNorm(e)); // quick tap places the focus
      }
    }
  };

  // scroll over the photo resizes the focal zone, shift-scroll tilts it;
  // non-passive so the page does not scroll underneath
  useEffect(() => {
    const canvas = glCanvasRef.current;
    if (!canvas || !loaded) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      // macos remaps shift+vertical scroll onto deltaX
      const d = e.deltaY !== 0 ? e.deltaY : e.deltaX;
      if (e.shiftKey) {
        setTilt((t) => wrapTilt(t + d * 0.15));
      } else {
        setFocusSize((s) =>
          Math.min(80, Math.max(5, Math.round(s * Math.exp(-d * 0.002)))),
        );
      }
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, [loaded]);

  // keys: [ ] focal size, g guide, hold b for original
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement && e.target.type !== "range")
        return;
      if (e.key === "[") {
        setFocusSize((s) => Math.max(5, Math.round(s / 1.15)));
      } else if (e.key === "]") {
        setFocusSize((s) => Math.min(80, Math.round(s * 1.15)));
      } else if (e.key.toLowerCase() === "g") {
        setShowGuide((v) => !v);
      } else if (e.key.toLowerCase() === "b") {
        setShowOriginal(true);
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "b") setShowOriginal(false);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  const doExport = useCallback(
    async (format: "jpeg" | "png") => {
      if (!loaded || !bitmapRef.current) return;
      setExporting(true);
      setError(null);

      // phone gpus: cap the export size, otherwise webkit kills the page
      let source: ImageBitmap | HTMLCanvasElement = bitmapRef.current;
      let exportScale = 1;
      const px = loaded.fullW * loaded.fullH;
      if (CONSTRAINED_GPU && px > EXPORT_CAP_PX) {
        exportScale = Math.sqrt(EXPORT_CAP_PX / px);
        const c = document.createElement("canvas");
        c.width = Math.max(1, Math.round(loaded.fullW * exportScale));
        c.height = Math.max(1, Math.round(loaded.fullH * exportScale));
        const ctx = c.getContext("2d")!;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(bitmapRef.current, 0, 0, c.width, c.height);
        source = c;
      }

      // free the preview's gpu memory for the duration; rebuilt below
      pipelineRef.current?.destroy();
      pipelineRef.current = null;

      try {
        const blob = await exportBlurred({
          originalFile: loaded.file,
          source,
          params: buildParams(exportScale),
          format,
        });
        const a = document.createElement("a");
        const base = loaded.file.name.replace(/\.[^.]+$/, "");
        a.href = URL.createObjectURL(blob);
        a.download = `${base}-dreamy.${format === "jpeg" ? "jpg" : "png"}`;
        a.click();
        URL.revokeObjectURL(a.href);
      } catch (e) {
        setError(`export failed: ${e instanceof Error ? e.message : e}`);
      } finally {
        try {
          if (glCanvasRef.current && srcCanvasRef.current) {
            const p = createPipeline(glCanvasRef.current, srcCanvasRef.current);
            p.setParams(buildParams(loaded.scale));
            p.render({ showOriginal: liveOriginal.current });
            pipelineRef.current = p;
          }
        } catch {
          // preview rebuild is best effort; the export itself succeeded
        }
        setExporting(false);
      }
    },
    [loaded, buildParams],
  );

  // drag and drop over the whole page
  useEffect(() => {
    const over = (e: DragEvent) => {
      e.preventDefault();
      setDragOver(true);
    };
    const leave = () => setDragOver(false);
    const drop = (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer?.files?.[0];
      if (f) void loadFile(f);
    };
    window.addEventListener("dragover", over);
    window.addEventListener("dragleave", leave);
    window.addEventListener("drop", drop);
    return () => {
      window.removeEventListener("dragover", over);
      window.removeEventListener("dragleave", leave);
      window.removeEventListener("drop", drop);
    };
  }, [loadFile]);

  const openDifferent = () => {
    bitmapRef.current?.close();
    bitmapRef.current = null;
    void clearPhoto();
    setLoaded(null);
  };

  const exportCapped =
    CONSTRAINED_GPU && !!loaded && loaded.fullW * loaded.fullH > EXPORT_CAP_PX;

  // guide ring geometry in displayed px (focal edge + where full blur lands);
  // stretch turns the rings into ellipses, wider than tall above 100
  const guide = (() => {
    if (!loaded || !dispSize || dispSize.w === 0 || !showGuide) return null;
    const minDim = Math.min(loaded.fullW, loaded.fullH);
    const dispScale = dispSize.w / loaded.fullW;
    const ax = stretch / 100;
    const r0 = (focusSize / 100) * minDim * dispScale;
    const r1 = ((focusSize + falloff) / 100) * minDim * dispScale;
    return {
      cx: center.x * dispSize.w,
      cy: center.y * dispSize.h,
      r0x: r0 * ax,
      r0y: r0,
      r1x: r1 * ax,
      r1y: r1,
    };
  })();

  // one list drives both the desktop sidebar and the mobile chip strip
  const controls = [
    { key: "focusSize", label: "focus size", chip: "focus", value: focusSize, set: setFocusSize, min: 5, max: 80, step: 1, def: DEFAULTS.focusSize },
    { key: "stretch", label: "stretch", chip: "stretch", value: stretch, set: setStretch, min: 50, max: 200, step: 1, def: DEFAULTS.stretch },
    { key: "tilt", label: "tilt", chip: "tilt", value: tilt, set: setTilt, min: -90, max: 90, step: 1, def: DEFAULTS.tilt },
    { key: "falloff", label: "falloff", chip: "falloff", value: falloff, set: setFalloff, min: 10, max: 150, step: 1, def: DEFAULTS.falloff },
    { key: "radius", label: "blur radius", chip: "blur", value: radius, set: setRadius, min: 0, max: RADIUS_MAX, step: 0.5, def: DEFAULTS.radius },
    { key: "glow", label: "glow", chip: "glow", value: bloomIntensity, set: setBloomIntensity, min: 0, max: 100, step: 1, def: DEFAULTS.bloomIntensity },
    { key: "spread", label: "glow spread", chip: "spread", value: bloomRadius, set: setBloomRadius, min: 20, max: 400, step: 5, def: DEFAULTS.bloomRadius },
    { key: "threshold", label: "glow threshold", chip: "thresh", value: bloomThreshold, set: setBloomThreshold, min: 20, max: 95, step: 1, def: DEFAULTS.bloomThreshold },
    { key: "warmth", label: "glow warmth", chip: "warmth", value: glowWarmth, set: setGlowWarmth, min: 0, max: 100, step: 1, def: DEFAULTS.glowWarmth },
    { key: "haze", label: "haze", chip: "haze", value: haze, set: setHaze, min: 0, max: 100, step: 1, def: DEFAULTS.haze },
  ];
  const active = controls.find((c) => c.key === activeControl) ?? controls[4];

  return (
    <Wrapper maxWidth="WIDE" className="mb-section-sm w-full md:mb-section-md">
      <h1 className="text-heading-md font-medium md:text-heading-lg">
        Dreamify
      </h1>

      {!loaded ? (
        <label
          className={cn(
            "mt-6 flex h-72 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed transition-colors",
            dragOver
              ? "border-accent bg-surface-hover"
              : "border-line bg-surface-subtle",
          )}
        >
          <span className="text-body-lg font-medium">drop a photo here</span>
          <span className="text-sm text-muted">
            or click to choose one, it stays on your device
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) =>
              e.target.files?.[0] && void loadFile(e.target.files[0])
            }
          />
        </label>
      ) : (
        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:gap-6">
          {/* canvas + focal guide */}
          <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div className="relative overflow-hidden rounded-lg shadow-macos">
              <canvas
                ref={glCanvasRef}
                className="block max-h-[52vh] max-w-full select-none lg:max-h-[68vh]"
                style={{
                  cursor: "crosshair",
                  touchAction: "none",
                  WebkitTouchCallout: "none",
                }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerEnd}
                onPointerCancel={onPointerEnd}
              />
              {guide && (
                <>
                  {/* focal edge: everything inside stays untouched */}
                  <div
                    className="pointer-events-none absolute rounded-[50%] border border-white/90 mix-blend-difference"
                    style={{
                      left: guide.cx - guide.r0x,
                      top: guide.cy - guide.r0y,
                      width: guide.r0x * 2,
                      height: guide.r0y * 2,
                      transform: `rotate(${tilt}deg)`,
                    }}
                  />
                  {/* falloff extent: full dreaminess from here outward */}
                  <div
                    className="pointer-events-none absolute rounded-[50%] border border-dashed border-white/50 mix-blend-difference"
                    style={{
                      left: guide.cx - guide.r1x,
                      top: guide.cy - guide.r1y,
                      width: guide.r1x * 2,
                      height: guide.r1y * 2,
                      transform: `rotate(${tilt}deg)`,
                    }}
                  />
                  <div
                    className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-white mix-blend-difference"
                    style={{ left: guide.cx - 3, top: guide.cy - 3 }}
                  />
                </>
              )}
            </div>

            <p className="hidden text-center text-xs text-subtle lg:block">
              drag to place the focus, scroll or [ ] to resize, shift-scroll to
              tilt, g guide, hold b for original
            </p>
            <p className="text-center text-xs text-subtle lg:hidden">
              drag places the focus, pinch resizes, twist tilts, hold shows the
              original
            </p>
          </div>

          {/* desktop sidebar */}
          <div className="hidden w-60 shrink-0 flex-col gap-4 lg:flex">
            <div className="grid grid-cols-1 gap-y-3">
              {controls.map((c) => (
                <Slider
                  key={c.key}
                  label={c.label}
                  value={c.value}
                  min={c.min}
                  max={c.max}
                  step={c.step}
                  onChange={c.set}
                  defaultValue={c.def}
                />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Btn
                active={showGuide}
                onClick={() => setShowGuide((v) => !v)}
                title="g"
              >
                guide
              </Btn>
              <Btn
                active={showOriginal}
                onPointerDown={() => setShowOriginal(true)}
                onPointerUp={() => setShowOriginal(false)}
                onPointerLeave={() => setShowOriginal(false)}
                title="or hold b"
              >
                original
              </Btn>
            </div>

            <ExportControls
              className="mt-auto pt-2"
              exporting={exporting}
              capped={exportCapped}
              error={error}
              onExport={doExport}
              onNew={openDifferent}
            />
          </div>

          {/* mobile: one big slider + a chip strip, photo stays on screen */}
          <div className="flex flex-col gap-3 lg:hidden">
            <Slider
              key={active.key}
              label={active.label}
              value={active.value}
              min={active.min}
              max={active.max}
              step={active.step}
              onChange={active.set}
              defaultValue={active.def}
            />
            <div className="flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {controls.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setActiveControl(c.key)}
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-1 text-xs transition-colors",
                    c.key === active.key
                      ? "border-accent bg-accent text-foreground"
                      : "border-line bg-surface text-secondary",
                  )}
                >
                  {c.chip}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Btn active={showGuide} onClick={() => setShowGuide((v) => !v)}>
                guide
              </Btn>
              <Btn
                active={showOriginal}
                onPointerDown={() => setShowOriginal(true)}
                onPointerUp={() => setShowOriginal(false)}
                onPointerLeave={() => setShowOriginal(false)}
              >
                original
              </Btn>
            </div>

            <ExportControls
              exporting={exporting}
              capped={exportCapped}
              error={error}
              onExport={doExport}
              onNew={openDifferent}
            />
          </div>
        </div>
      )}
    </Wrapper>
  );
};

function ExportControls(props: {
  exporting: boolean;
  capped: boolean;
  error: string | null;
  onExport: (format: "jpeg" | "png") => void;
  onNew: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", props.className)}>
      {props.error && <p className="text-sm text-danger">{props.error}</p>}
      <button
        className="rounded bg-accent py-2 text-sm font-medium text-foreground transition-all hover:shadow-md disabled:opacity-40"
        disabled={props.exporting}
        onClick={() => props.onExport("jpeg")}
        title={
          props.capped
            ? "capped at ~12mp on this device's gpu, exif preserved"
            : "full res on your gpu, exif preserved"
        }
      >
        {props.exporting ? "rendering…" : "export jpeg"}
      </button>
      <button
        className="rounded border border-line py-1.5 text-sm font-medium transition-colors hover:bg-surface-hover disabled:opacity-40"
        disabled={props.exporting}
        onClick={() => props.onExport("png")}
        title={
          props.capped
            ? "capped at ~12mp on this device's gpu"
            : "full res on your gpu"
        }
      >
        export png
      </button>
      <button
        className="self-center text-xs text-subtle underline-offset-2 hover:text-accent hover:underline"
        onClick={props.onNew}
      >
        open a different photo
      </button>
    </div>
  );
}

function Btn({
  active,
  children,
  ...rest
}: {
  active?: boolean;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={cn(
        "rounded border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        active
          ? "border-accent bg-accent text-foreground"
          : "border-line bg-surface text-secondary hover:bg-surface-hover",
      )}
    >
      {children}
    </button>
  );
}

function Slider(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  defaultValue?: number;
}) {
  const canReset =
    props.defaultValue !== undefined && props.value !== props.defaultValue;
  const reset = () =>
    props.defaultValue !== undefined && props.onChange(props.defaultValue);
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-baseline justify-between gap-2 text-xs">
        <span className="font-medium uppercase tracking-wide text-muted">
          {props.label}
        </span>
        <span className="flex items-baseline gap-1.5">
          {canReset && (
            <button
              type="button"
              // preventDefault so the wrapping label doesn't also grab focus
              onClick={(e) => {
                e.preventDefault();
                reset();
              }}
              className="leading-none text-subtle transition-colors hover:text-accent"
              title={`reset to ${props.defaultValue}`}
              aria-label={`reset ${props.label}`}
            >
              ↺
            </button>
          )}
          <span className="tabular-nums text-secondary">{props.value}</span>
        </span>
      </span>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
        onDoubleClick={reset}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-line-subtle"
        style={{ appearance: "none" }}
      />
    </label>
  );
}

export default Dreamify;
