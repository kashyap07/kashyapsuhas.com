"use client";

import { useState } from "react";

import katex from "katex";
import "katex/dist/katex.min.css";

import { expectedScore } from "./elo";

// normal distribution PDF
function normalPDF(x: number, mean: number, stdDev: number): number {
  const exp = -0.5 * ((x - mean) / stdDev) ** 2;
  return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exp);
}

export function EloVisualizer() {
  const [ratingA, setRatingA] = useState(1750);
  const [ratingB, setRatingB] = useState(1850);

  const stdDev = 200;
  const expected = expectedScore(ratingA, ratingB);
  const diff = ratingA - ratingB;

  // chart bounds
  const xMin = Math.min(ratingA, ratingB) - 500;
  const xMax = Math.max(ratingA, ratingB) + 500;

  // svg layout
  const width = 600;
  const height = 260;
  const padLeft = 10;
  const padRight = 10;
  const padTop = 10;
  const padBottom = 40;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const maxPDF = normalPDF(0, 0, stdDev);

  const xScale = (x: number) => padLeft + ((x - xMin) / (xMax - xMin)) * plotW;
  const yScale = (y: number) => padTop + plotH - (y / (maxPDF * 1.15)) * plotH;

  // generate SVG path for a bell curve
  function bellPath(mean: number): string {
    const numPoints = 200;
    const step = (xMax - xMin) / numPoints;
    const parts: string[] = [];
    for (let i = 0; i <= numPoints; i++) {
      const x = xMin + i * step;
      const y = normalPDF(x, mean, stdDev);
      parts.push(
        `${i === 0 ? "M" : "L"}${xScale(x).toFixed(1)},${yScale(y).toFixed(1)}`,
      );
    }
    // close along baseline
    parts.push(`L${xScale(xMax).toFixed(1)},${yScale(0).toFixed(1)}`);
    parts.push(`L${xScale(xMin).toFixed(1)},${yScale(0).toFixed(1)}`);
    parts.push("Z");
    return parts.join(" ");
  }

  // x axis ticks every 100
  const tickStep = 100;
  const firstTick = Math.ceil(xMin / tickStep) * tickStep;
  const ticks: number[] = [];
  for (let t = firstTick; t <= xMax; t += tickStep) {
    ticks.push(t);
  }

  // katex formulas with actual values
  const diffVal = ratingB - ratingA;
  const formulaHTML = katex.renderToString(
    `E_A = \\frac{1}{1 + 10^{\\,\\frac{${diffVal}}{400}}}`,
    { displayMode: true, throwOnError: false },
  );

  const resultHTML = katex.renderToString(`E_A = ${expected.toFixed(6)}`, {
    displayMode: false,
    throwOnError: false,
  });

  return (
    <div className="not-prose my-8 rounded-lg border border-gray-200 p-4 md:p-6">
      {/* sliders */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm">
            <span className="inline-block h-3 w-3 rounded-full bg-blue-500" />
            Player A
          </label>
          <input
            type="range"
            min={800}
            max={2400}
            value={ratingA}
            onChange={(e) => setRatingA(Number(e.target.value))}
            className="w-full"
          />
          <input
            type="number"
            min={800}
            max={2400}
            value={ratingA}
            onChange={(e) => setRatingA(Number(e.target.value))}
            className="mt-2 w-full rounded border border-gray-300 px-3 py-2 text-center font-mono"
          />
        </div>
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm">
            <span className="inline-block h-3 w-3 rounded-full bg-red-400" />
            Player B
          </label>
          <input
            type="range"
            min={800}
            max={2400}
            value={ratingB}
            onChange={(e) => setRatingB(Number(e.target.value))}
            className="w-full"
          />
          <input
            type="number"
            min={800}
            max={2400}
            value={ratingB}
            onChange={(e) => setRatingB(Number(e.target.value))}
            className="mt-2 w-full rounded border border-gray-300 px-3 py-2 text-center font-mono"
          />
        </div>
      </div>

      {/* summary */}
      <div className="mt-3 text-center text-sm text-gray-500">
        {Math.abs(diff)} point difference
      </div>

      {/* svg chart */}
      <div className="mt-4 overflow-hidden rounded border border-gray-100 bg-white">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
          {/* player B curve (behind) */}
          <path
            d={bellPath(ratingB)}
            fill="rgba(248, 113, 113, 0.4)"
            stroke="rgba(248, 113, 113, 0.8)"
            strokeWidth="1.5"
          />
          {/* player A curve (in front) */}
          <path
            d={bellPath(ratingA)}
            fill="rgba(59, 130, 246, 0.4)"
            stroke="rgba(59, 130, 246, 0.8)"
            strokeWidth="1.5"
          />

          {/* x axis */}
          <line
            x1={padLeft}
            y1={yScale(0)}
            x2={width - padRight}
            y2={yScale(0)}
            stroke="#9ca3af"
            strokeWidth="1"
          />

          {/* x axis ticks */}
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={xScale(t)}
                y1={yScale(0)}
                x2={xScale(t)}
                y2={yScale(0) + 5}
                stroke="#9ca3af"
                strokeWidth="1"
              />
              <text
                x={xScale(t)}
                y={yScale(0) + 18}
                textAnchor="middle"
                fontSize="11"
                fill="#6b7280"
              >
                {t}
              </text>
            </g>
          ))}

          {/* x axis label */}
          <text
            x={width / 2}
            y={height - 5}
            textAnchor="middle"
            fontSize="12"
            fill="#6b7280"
          >
            Rating
          </text>
        </svg>
      </div>

      {/* formula with substituted values */}
      <div
        className="mt-4 overflow-x-auto text-center"
        dangerouslySetInnerHTML={{ __html: formulaHTML }}
      />

      {/* result */}
      <div className="mt-2 rounded-lg bg-gray-50 px-4 py-3 text-center">
        <span dangerouslySetInnerHTML={{ __html: resultHTML }} />
        <div className="mt-1 text-lg text-gray-600">
          Player A wins ~{(expected * 100).toFixed(1)}% of the time /{" "}
          {expected >= 0.5
            ? `(~${Math.round(expected * 10)} wins in every 10 games)`
            : `(~1 win in every ${Math.round(1 / expected)} games)`}
        </div>
      </div>
    </div>
  );
}
