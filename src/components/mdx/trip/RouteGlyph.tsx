"use client";

import { RefObject } from "react";

import type { Glyph } from "./glyph";

// presentational svg for the route glyph. the host component owns the refs
// and moves the car / extends the traveled stroke from its own scroll tick.
export default function RouteGlyph({
  glyph,
  carRef,
  traveledRef,
  className,
}: {
  glyph: Glyph;
  carRef: RefObject<SVGCircleElement | null>;
  traveledRef: RefObject<SVGPathElement | null>;
  className?: string;
}) {
  return (
    <svg
      viewBox={`-5 -5 ${glyph.width + 10} ${glyph.height + 10}`}
      className={className}
      aria-hidden
    >
      <path
        d={glyph.d}
        fill="none"
        stroke="var(--foreground)"
        opacity="0.18"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        ref={traveledRef}
        d={glyph.d}
        fill="none"
        stroke="var(--columbiaYellow)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={glyph.total}
        strokeDashoffset={glyph.total}
      />
      <circle
        ref={carRef}
        cx={glyph.start[0].toFixed(1)}
        cy={glyph.start[1].toFixed(1)}
        r="7"
        fill="#fff"
        stroke="var(--columbiaYellow)"
        strokeWidth="4"
      />
    </svg>
  );
}
