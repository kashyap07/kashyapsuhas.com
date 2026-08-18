"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { createPortal } from "react-dom";

// cone-cell saturation illusion. stare at the dot, one colour fatigues the
// matching cone class, then it gets pulled away and the leftover signal shows
// up as a colour your eye normally can't be shown.
// ported from dynomight's generator
// (https://dynomight.net/img/colors/generate.html), which is itself the
// Eclipse of Titan illusion.

type Mode = "shrink" | "grow";

interface Preset {
  name: string;
  inside: string;
  outside: string;
  note: string;
}

const PRESETS: Preset[] = [
  {
    name: "olo-ish",
    inside: "#ff0000",
    outside: "#008080",
    note: "red flattens your L cones, the teal comes back nuclear",
  },
  {
    name: "stygian blue",
    inside: "#ffff00",
    outside: "#000000",
    note: "a blue that is somehow also black",
  },
  {
    name: "self-luminous red",
    inside: "#00ff00",
    outside: "#ffffff",
    note: "a red that glows brighter than the white it sits on",
  },
  {
    name: "hyperbolic orange",
    inside: "#00ffff",
    outside: "#ff8000",
    note: "orange, but more orange than orange gets",
  },
];

// safari still ships the prefixed element fullscreen on ipad, and iphone
// safari ships neither (only <video> gets webkitEnterFullscreen), which is
// why the css overlay below exists.
type FsElement = HTMLDivElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};
type FsDocument = Document & { webkitFullscreenElement?: Element | null };

type WakeLockSentinelish = { release: () => Promise<void> };
type WakeLockNavigator = Navigator & {
  wakeLock?: { request: (type: "screen") => Promise<WakeLockSentinelish> };
};

// wcag-ish relative luminance, only used to keep the dot and the timer bar
// visible against whatever colours got picked
function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const n = parseInt(
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h,
    16,
  );
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const contrastOn = (hex: string) => (luminance(hex) > 0.45 ? "#000" : "#fff");

interface ConeSaturationProps {
  inside?: string;
  outside?: string;
  countdown?: number;
  duration?: number;
  mode?: Mode;
}

export function ConeSaturation({
  inside = "#ff0000",
  outside = "#008080",
  countdown: countdownSec = 60,
  duration: durationSec = 30,
  mode: animMode = "shrink",
}: ConeSaturationProps) {
  // only the colours move at runtime, via the presets. timings come from props
  const [insideColor, setInsideColor] = useState(inside);
  const [outsideColor, setOutsideColor] = useState(outside);

  // bumping this remounts the svg, which restarts the SMIL animations
  const [runId, setRunId] = useState(0);
  const [done, setDone] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // css-only stand-in for browsers with no element fullscreen (iphone safari)
  const [faux, setFaux] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wakeLockRef = useRef<WakeLockSentinelish | null>(null);

  const running = runId > 0 && !done;
  const immersive = isFullscreen || faux;

  useEffect(() => {
    const sync = () => {
      const d = document as FsDocument;
      setIsFullscreen(
        Boolean(d.fullscreenElement ?? d.webkitFullscreenElement),
      );
    };
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
    };
  }, []);

  useEffect(() => () => clearTimeout(timerRef.current ?? undefined), []);

  // the run is 90s of not touching anything, so ios would happily auto-lock
  // mid-stare. wake lock drops itself when the tab hides, hence the re-ask.
  useEffect(() => {
    if (!running) return;
    let cancelled = false;

    const acquire = async () => {
      if (wakeLockRef.current) return;
      try {
        const lock = await (navigator as WakeLockNavigator).wakeLock?.request(
          "screen",
        );
        if (!lock) return;
        if (cancelled) void lock.release().catch(() => {});
        else wakeLockRef.current = lock;
      } catch {
        // unsupported or refused. the illusion still works, screen may dim
      }
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") void acquire();
    };

    void acquire();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      void wakeLockRef.current?.release().catch(() => {});
      wakeLockRef.current = null;
    };
  }, [running]);

  // faux fullscreen has no browser chrome to escape with, so lock the page
  // behind it and wire up esc ourselves
  useEffect(() => {
    if (!faux) return;
    const html = document.documentElement;
    const prevHtml = html.style.overflow;
    const prevBody = document.body.style.overflow;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFaux(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
      window.removeEventListener("keydown", onKey);
    };
  }, [faux]);

  const start = useCallback(() => {
    clearTimeout(timerRef.current ?? undefined);
    setDone(false);
    setRunId((n) => n + 1);
    timerRef.current = setTimeout(
      () => setDone(true),
      (countdownSec + durationSec) * 1000,
    );
  }, [countdownSec, durationSec]);

  const goFullscreen = useCallback(() => {
    const el = stageRef.current as FsElement | null;
    if (!el) return;
    const req = el.requestFullscreen ?? el.webkitRequestFullscreen;
    if (req) {
      // the unprefixed one returns a promise that can still reject
      Promise.resolve(req.call(el)).catch(() => setFaux(true));
    } else {
      setFaux(true);
    }
    start();
  }, [start]);

  const applyPreset = (p: Preset) => {
    setInsideColor(p.inside);
    setOutsideColor(p.outside);
    setDone(false);
    setRunId(0);
  };

  // radius is in viewBox units. 400 of 1600 = a quarter of the frame
  const r0 = 400;
  const dotColor = contrastOn(running || !done ? insideColor : outsideColor);
  const barColor = contrastOn(outsideColor);
  const exitColor = contrastOn(outsideColor);

  const stage = (
    <div
      ref={stageRef}
      className={
        immersive
          ? "relative h-full w-full"
          : "relative aspect-square w-full overflow-hidden rounded-lg"
      }
      style={{ backgroundColor: outsideColor }}
    >
      {/* "meet", not "slice". on a wide fullscreen screen slice scales the
          square viewBox to cover the WIDTH, which blows the disc up to ~95%
          of the screen height and leaves almost no outside colour for the
          rim to flood into. meet fits the square to the short side and the
          stage's own background fills the letterbox in the same colour. */}
      <svg
        key={runId}
        viewBox="0 0 1600 1600"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full"
      >
        <rect x="0" y="0" width="1600" height="1600" fill={outsideColor} />
        <circle cx="800" cy="800" r={r0} fill={insideColor}>
          {runId > 0 && (
            <animate
              attributeName="r"
              from={r0}
              to={animMode === "shrink" ? 0 : 1200}
              begin={`${countdownSec}s`}
              dur={`${durationSec}s`}
              fill="freeze"
            />
          )}
        </circle>

        {/* fixation dot. this is the whole trick, do not look away from it */}
        <rect x="796" y="796" width="8" height="8" fill={dotColor} />
      </svg>

      {/* countdown bar, collapses to nothing. its own svg pinned to the left
          edge so it hugs the real edge instead of the letterboxed one */}
      {runId > 0 && (
        <svg
          key={`bar-${runId}`}
          viewBox="0 0 20 1600"
          preserveAspectRatio="none"
          className="absolute inset-y-0 left-0 h-full w-3"
        >
          <rect x="0" y="0" width="20" height="1600" fill={barColor}>
            <animate
              attributeName="y"
              from="0"
              to="800"
              dur={`${countdownSec}s`}
              fill="freeze"
            />
            <animate
              attributeName="height"
              from="1600"
              to="0"
              dur={`${countdownSec}s`}
              fill="freeze"
            />
          </rect>
        </svg>
      )}

      {runId === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/45 p-6 text-center">
          <p className="max-w-xs text-sm text-white">
            Stare at the dot in the middle <br />
            (takes a minute),
            <br /> don&apos;t move your head or your eyes, <br />
            blinking is ok tho.
          </p>
          <button
            onClick={start}
            className="rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:shadow-md"
          >
            start
          </button>
          <button
            onClick={goFullscreen}
            className="text-sm text-white/80 underline underline-offset-4 hover:text-white"
          >
            go fullscreen
          </button>
        </div>
      )}

      {done && (
        <div className="absolute inset-x-0 bottom-0 flex justify-center p-4">
          <button
            onClick={start}
            className="rounded bg-black/60 px-4 py-2 text-sm font-medium text-white"
          >
            again
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="not-prose my-8 rounded-lg border border-line p-4 md:p-6">
      {faux ? (
        // hold the page height so nothing jumps when the overlay closes
        <div className="aspect-square w-full rounded-lg bg-surface-subtle" />
      ) : (
        stage
      )}

      {faux &&
        createPortal(
          <div
            role="dialog"
            aria-label="cone saturation illusion, fullscreen"
            className="fixed inset-0 z-50 touch-none overscroll-none"
            style={{ backgroundColor: outsideColor }}
          >
            {stage}
            {/* kept dim on purpose, bright chrome in the corner of your eye
                works against the whole illusion */}
            <button
              onClick={() => setFaux(false)}
              style={{ color: exitColor }}
              className="absolute right-3 top-3 z-10 rounded px-3 py-1.5 font-sans text-label-sm opacity-40 transition-opacity hover:opacity-100"
            >
              exit
            </button>
          </div>,
          document.body,
        )}

      {!immersive && (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {PRESETS.map((p) => {
              const active =
                p.inside === insideColor && p.outside === outsideColor;
              return (
                <button
                  key={p.name}
                  onClick={() => applyPreset(p)}
                  title={p.note}
                  className={`flex items-center gap-2 rounded border px-3 py-1.5 font-sans text-label ${
                    active
                      ? "border-accent ring-1 ring-accent"
                      : "border-line bg-surface-subtle hover:bg-surface-hover"
                  }`}
                >
                  <span className="flex">
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: p.inside }}
                    />
                    <span
                      className="-ml-1 inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: p.outside }}
                    />
                  </span>
                  {p.name}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={start}
              className="rounded bg-accent px-4 py-2 font-sans text-label font-medium text-white hover:shadow-md"
            >
              {runId === 0 ? "start" : "restart"}
            </button>
            <button
              onClick={goFullscreen}
              className="rounded border border-line px-4 py-2 font-sans text-label hover:bg-surface-hover"
            >
              fullscreen
            </button>
          </div>

          <p className="mt-3 font-sans text-label-sm text-muted">
            Based on{" "}
            <a
              href="https://dynomight.net/img/colors/generate.html"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-accent"
            >
              dynomight&apos;s cone saturation generator
            </a>
            . Try at max brightness.
          </p>
        </>
      )}
    </div>
  );
}
