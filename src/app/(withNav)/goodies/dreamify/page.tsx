"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import { Wrapper } from "@components/ui";
import cn from "@utils/cn";

import { exportBlurred } from "./exportImage";
import { type Pipeline, createPipeline } from "./gl";

// preview is capped for gpu speed; export always renders at full resolution
const PREVIEW_MAX = 2048;
const RADIUS_MAX = 150; // matches the shader's tap budget

// slider starting points, also the reset targets
const DEFAULTS = {
  radius: 25,
  bloomIntensity: 40, // percent
  bloomRadius: 150, // full-res px
  bloomThreshold: 60, // percent of linear luminance
  focusSize: 30, // focal radius, percent of the shorter image side
  falloff: 60, // ramp length, percent of the shorter image side
  cx: 0.5,
  cy: 0.45,
};

interface Loaded {
  file: File;
  fullW: number;
  fullH: number;
  prevW: number;
  prevH: number;
  scale: number; // prevW / fullW
}

const Dreamify: React.FC = () => {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [radius, setRadius] = useState(DEFAULTS.radius); // photoshop radius == sigma, full-res px
  const [bloomIntensity, setBloomIntensity] = useState(DEFAULTS.bloomIntensity);
  const [bloomRadius, setBloomRadius] = useState(DEFAULTS.bloomRadius);
  const [bloomThreshold, setBloomThreshold] = useState(DEFAULTS.bloomThreshold);
  const [focusSize, setFocusSize] = useState(DEFAULTS.focusSize);
  const [falloff, setFalloff] = useState(DEFAULTS.falloff);
  const [center, setCenter] = useState({ x: DEFAULTS.cx, y: DEFAULTS.cy });
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
  const dragging = useRef(false);
  const rafPending = useRef(false);

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

  const loadFile = useCallback(async (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("that does not look like an image file.");
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
      setCenter({ x: DEFAULTS.cx, y: DEFAULTS.cy });
      setLoaded({ file, fullW, fullH, prevW, prevH, scale });
    } catch (e) {
      setError(
        `could not load that file: ${e instanceof Error ? e.message : e}`,
      );
    }
  }, []);

  // engine params; the focal circle is resolution independent, sigmas are not
  const buildParams = useCallback(
    (scale: number) => ({
      sigmaMax: radius * scale,
      bloomSigma: bloomRadius * scale,
      bloomThreshold: bloomThreshold / 100,
      bloomIntensity: bloomIntensity / 100,
      cx: center.x,
      cy: center.y,
      focusRadius: focusSize / 100,
      feather: falloff / 100,
    }),
    [
      radius,
      bloomRadius,
      bloomThreshold,
      bloomIntensity,
      center,
      focusSize,
      falloff,
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

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!loaded || e.button !== 0) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      dragging.current = true;
      setCenter(toNorm(e));
    },
    [loaded, toNorm],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!dragging.current) return;
      setCenter(toNorm(e));
    },
    [toNorm],
  );

  const endDrag = useCallback(() => {
    dragging.current = false;
  }, []);

  // scroll over the photo resizes the focal circle; non-passive so the page
  // does not scroll underneath
  useEffect(() => {
    const canvas = glCanvasRef.current;
    if (!canvas || !loaded) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setFocusSize((s) =>
        Math.min(80, Math.max(5, Math.round(s * Math.exp(-e.deltaY * 0.002)))),
      );
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
      try {
        const blob = await exportBlurred({
          originalFile: loaded.file,
          bitmap: bitmapRef.current,
          params: buildParams(1), // full-res units
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
      if (f) loadFile(f);
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

  // guide ring geometry in displayed px (focal edge + where full blur lands)
  const guide = (() => {
    if (!loaded || !dispSize || dispSize.w === 0 || !showGuide) return null;
    const minDim = Math.min(loaded.fullW, loaded.fullH);
    const dispScale = dispSize.w / loaded.fullW;
    const r0 = (focusSize / 100) * minDim * dispScale;
    const r1 = ((focusSize + falloff) / 100) * minDim * dispScale;
    return { cx: center.x * dispSize.w, cy: center.y * dispSize.h, r0, r1 };
  })();

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
            onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
          />
        </label>
      ) : (
        <div className="mt-6 flex flex-col gap-6 lg:flex-row">
          {/* canvas + focal guide */}
          <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div className="relative overflow-hidden rounded-lg shadow-macos">
              <canvas
                ref={glCanvasRef}
                className="block max-h-[68vh] max-w-full"
                style={{ cursor: "crosshair", touchAction: "none" }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onPointerLeave={endDrag}
              />
              {guide && (
                <>
                  {/* focal edge: everything inside stays untouched */}
                  <div
                    className="pointer-events-none absolute rounded-full border border-white/90 mix-blend-difference"
                    style={{
                      left: guide.cx - guide.r0,
                      top: guide.cy - guide.r0,
                      width: guide.r0 * 2,
                      height: guide.r0 * 2,
                    }}
                  />
                  {/* falloff extent: full dreaminess from here outward */}
                  <div
                    className="pointer-events-none absolute rounded-full border border-dashed border-white/50 mix-blend-difference"
                    style={{
                      left: guide.cx - guide.r1,
                      top: guide.cy - guide.r1,
                      width: guide.r1 * 2,
                      height: guide.r1 * 2,
                    }}
                  />
                  <div
                    className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-white mix-blend-difference"
                    style={{ left: guide.cx - 3, top: guide.cy - 3 }}
                  />
                </>
              )}
            </div>

            <p className="text-center text-xs text-subtle">
              drag to place the focus, scroll or [ ] to resize, g guide, hold b
              for original
            </p>
          </div>

          {/* controls */}
          <div className="flex w-full shrink-0 flex-col gap-4 lg:w-60">
            <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-1">
              <Slider
                label="focus size"
                value={focusSize}
                min={5}
                max={80}
                step={1}
                onChange={setFocusSize}
                defaultValue={DEFAULTS.focusSize}
              />
              <Slider
                label="falloff"
                value={falloff}
                min={10}
                max={150}
                step={1}
                onChange={setFalloff}
                defaultValue={DEFAULTS.falloff}
              />
              <Slider
                label="blur radius"
                value={radius}
                min={0}
                max={RADIUS_MAX}
                step={0.5}
                onChange={setRadius}
                defaultValue={DEFAULTS.radius}
              />
              <Slider
                label="glow"
                value={bloomIntensity}
                min={0}
                max={100}
                step={1}
                onChange={setBloomIntensity}
                defaultValue={DEFAULTS.bloomIntensity}
              />
              <Slider
                label="glow spread"
                value={bloomRadius}
                min={20}
                max={400}
                step={5}
                onChange={setBloomRadius}
                defaultValue={DEFAULTS.bloomRadius}
              />
              <Slider
                label="glow threshold"
                value={bloomThreshold}
                min={20}
                max={95}
                step={1}
                onChange={setBloomThreshold}
                defaultValue={DEFAULTS.bloomThreshold}
              />
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

            <div className="mt-auto flex flex-col gap-2 pt-2">
              {error && <p className="text-sm text-danger">{error}</p>}
              <button
                className="rounded bg-accent py-2 text-sm font-medium text-foreground transition-all hover:shadow-md disabled:opacity-40"
                disabled={exporting}
                onClick={() => doExport("jpeg")}
                title="full res on your gpu, exif preserved"
              >
                {exporting ? "rendering…" : "export jpeg"}
              </button>
              <button
                className="rounded border border-line py-1.5 text-sm font-medium transition-colors hover:bg-surface-hover disabled:opacity-40"
                disabled={exporting}
                onClick={() => doExport("png")}
                title="full res on your gpu"
              >
                export png
              </button>
              <button
                className="self-center text-xs text-subtle underline-offset-2 hover:text-accent hover:underline"
                onClick={() => {
                  bitmapRef.current?.close();
                  bitmapRef.current = null;
                  setLoaded(null);
                }}
              >
                open a different photo
              </button>
            </div>
          </div>
        </div>
      )}
    </Wrapper>
  );
};

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
