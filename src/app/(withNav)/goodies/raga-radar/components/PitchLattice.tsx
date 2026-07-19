// scrolling pitch trace over the svara lattice. horizontal lines sit at
// just-intonation svarasthana positions, the sung pitch snakes across them.
// canvas, redrawn per frame; the trace ref is mutated by the mic loop
import { RefObject, useEffect, useRef } from "react";

import { POSITIONS } from "@lib/carnatic/pitches";

import { JI_CENTS } from "../logic";

export type TracePoint = {
  t: number; // performance.now() ms
  cents: number; // relative to sa, unfolded
  clarity: number;
};

const WINDOW_MS = 10000;
const SUB = ["", "₁", "₂", "₃"] as const;

const LABELS = POSITIONS.map((p) =>
  p.svaras.map((s) => s.kannada + SUB[s.variant]).join("/"),
);

const COLORS = {
  grid: "#e5e7eb",
  pa: "#cbd5e1",
  sa: "#f0a044",
  label: "#94a3b8",
  trace: "#1e293b",
};

type Props = {
  trace: RefObject<TracePoint[]>;
  className?: string;
};

export default function PitchLattice({ trace, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // eased view range in cents, follows the singing
  const viewRef = useRef({ lo: -150, hi: 1350 });

  useEffect(() => {
    let raf = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      const ctx = canvas.getContext("2d")!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const now = performance.now();
      const points = trace.current;
      // drop what scrolled off, keep the ref bounded
      let firstLive = 0;
      while (
        firstLive < points.length &&
        points[firstLive].t < now - WINDOW_MS - 2000
      ) {
        firstLive++;
      }
      if (firstLive > 0) points.splice(0, firstLive);

      // aim the view at the sung range, keep at least ~a sixth of headroom
      let lo = Infinity;
      let hi = -Infinity;
      for (const p of points) {
        if (p.cents < lo) lo = p.cents;
        if (p.cents > hi) hi = p.cents;
      }
      let target = { lo: -150, hi: 1350 };
      if (lo !== Infinity) {
        target = { lo: lo - 180, hi: hi + 180 };
        const span = target.hi - target.lo;
        if (span < 900) {
          const pad = (900 - span) / 2;
          target = { lo: target.lo - pad, hi: target.hi + pad };
        }
        target.lo = Math.max(target.lo, -1700);
        target.hi = Math.min(target.hi, 2900);
      }
      const view = viewRef.current;
      view.lo += (target.lo - view.lo) * 0.06;
      view.hi += (target.hi - view.hi) * 0.06;

      const y = (cents: number) =>
        h - ((cents - view.lo) / (view.hi - view.lo)) * h;
      const x = (t: number) => w - ((now - t) / WINDOW_MS) * w;

      // svara lines across visible octaves, labels hug the left edge
      ctx.font =
        '11px ui-sans-serif, system-ui, "Noto Sans Kannada", sans-serif';
      ctx.textBaseline = "middle";
      for (let k = -2; k <= 2; k++) {
        for (let i = 0; i < 12; i++) {
          const c = JI_CENTS[i] + 1200 * k;
          if (c < view.lo - 50 || c > view.hi + 50) continue;
          const yy = y(c);
          const isSa = i === 0;
          const isPa = i === 7;
          ctx.strokeStyle = isSa ? COLORS.sa : isPa ? COLORS.pa : COLORS.grid;
          ctx.lineWidth = isSa ? 1.5 : 1;
          ctx.beginPath();
          ctx.moveTo(34, yy);
          ctx.lineTo(w, yy);
          ctx.stroke();

          ctx.fillStyle = isSa ? COLORS.sa : COLORS.label;
          ctx.fillText(LABELS[i], 2, yy);
          // carnatic octave dots: above for tara, below for mandra
          const textW = ctx.measureText(LABELS[i]).width;
          for (let d = 0; d < Math.abs(k); d++) {
            ctx.beginPath();
            ctx.arc(
              2 + textW / 2 + (d - (Math.abs(k) - 1) / 2) * 6,
              yy + (k > 0 ? -9 : 9),
              1.4,
              0,
              Math.PI * 2,
            );
            ctx.fill();
          }
        }
      }

      // the trace itself, segmented at silences, faded by clarity
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.strokeStyle = COLORS.trace;
      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1];
        const b = points[i];
        if (b.t - a.t > 120 || b.t < now - WINDOW_MS) continue;
        ctx.globalAlpha = Math.min(1, b.clarity) * 0.85;
        ctx.beginPath();
        ctx.moveTo(x(a.t), y(a.cents));
        ctx.lineTo(x(b.t), y(b.cents));
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // live dot on the newest point
      const lastPoint = points[points.length - 1];
      if (lastPoint && now - lastPoint.t < 250) {
        ctx.fillStyle = COLORS.sa;
        ctx.beginPath();
        ctx.arc(x(lastPoint.t), y(lastPoint.cents), 4, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [trace]);

  return <canvas ref={canvasRef} className={className} />;
}
