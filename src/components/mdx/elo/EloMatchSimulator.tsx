"use client";

import { useState } from "react";

import { expectedScore, newRating } from "./elo";

interface MatchEntry {
  match: number;
  rating: number;
  outcome: "W" | "L";
}

const STARTING_RATING = 1000;

export function EloMatchSimulator() {
  const [currentRating, setCurrentRating] = useState(STARTING_RATING);
  const [opponentRating, setOpponentRating] = useState(1200);
  const [history, setHistory] = useState<MatchEntry[]>([]);

  const startRating = history.length > 0 ? history[0].rating : currentRating;

  // calculate expected deltas for win/loss
  const expected = expectedScore(currentRating, opponentRating);
  const ratingIfWin = newRating(currentRating, expected, 1);
  const ratingIfLoss = newRating(currentRating, expected, 0);
  const deltaWin = ratingIfWin - currentRating;
  const deltaLoss = ratingIfLoss - currentRating;

  function playMatch(actual: number, label: "W" | "L") {
    const expected = expectedScore(currentRating, opponentRating);
    const next = newRating(currentRating, expected, actual);
    setHistory((prev) => [
      ...prev,
      { match: prev.length + 1, rating: next, outcome: label },
    ]);
    setCurrentRating(next);
  }

  function reset() {
    setHistory([]);
    setCurrentRating(STARTING_RATING);
  }

  // chart data: all match ratings
  const points = history.length > 0 ? history : [];

  // svg dimensions
  const chartW = 400;
  const chartH = 200;
  const padX = 45;
  const padY = 20;
  const plotW = chartW - padX - 10;
  const plotH = chartH - padY * 2;

  // y range - dynamic with padding
  const ratings =
    points.length > 0 ? points.map((p) => p.rating) : [currentRating];
  const dataMin = Math.min(...ratings, startRating);
  const dataMax = Math.max(...ratings, startRating);
  const padding = 200;
  const minR = Math.max(0, Math.floor((dataMin - padding) / 100) * 100);
  const maxR = Math.min(3000, Math.ceil((dataMax + padding) / 100) * 100);
  const rangeR = maxR - minR || 100;

  // x scale: match number 1 to N (left to right)
  const maxMatch = points.length > 0 ? points.length : 1;
  const xScale = (match: number) =>
    padX + ((match - 1) / (maxMatch - 1 || 1)) * plotW;
  const yScale = (r: number) => padY + plotH - ((r - minR) / rangeR) * plotH;

  const polylinePoints =
    points.length > 0
      ? points.map((p) => `${xScale(p.match)},${yScale(p.rating)}`).join(" ")
      : "";

  // y axis ticks - every 100
  const tickStep = 100;
  const firstTick = Math.ceil(minR / tickStep) * tickStep;
  const yTicks: number[] = [];
  for (let t = firstTick; t <= maxR; t += tickStep) {
    yTicks.push(t);
  }

  return (
    <div className="not-prose my-8 rounded-lg border border-gray-200 p-4 md:p-6">
      <h3 className="mb-4 text-lg font-medium">Match Simulator</h3>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-gray-600">
            Current rating
          </label>
          <input
            type="number"
            min={400}
            max={3000}
            value={currentRating}
            onChange={(e) => {
              setCurrentRating(Number(e.target.value));
              setHistory([]);
            }}
            className="mt-2 w-full rounded border border-gray-300 px-3 py-2 text-center font-mono"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-gray-600">
            Opponent rating
          </label>
          <input
            type="number"
            min={400}
            max={3000}
            value={opponentRating}
            onChange={(e) => setOpponentRating(Number(e.target.value))}
            className="mt-2 w-full rounded border border-gray-300 px-3 py-2 text-center font-mono"
          />
        </div>
      </div>

      {/* action buttons */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => playMatch(1, "W")}
          className="flex items-center gap-2 rounded bg-green-600 px-4 py-2 text-sm font-medium text-white no-underline transition-colors hover:bg-green-700"
        >
          <span>Win</span>
          <span className="font-mono text-xs opacity-90">+{deltaWin}</span>
        </button>
        <button
          onClick={() => playMatch(0, "L")}
          className="flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white no-underline transition-colors hover:bg-red-700"
        >
          <span>Loss</span>
          <span className="font-mono text-xs opacity-90">{deltaLoss}</span>
        </button>
        <button
          onClick={reset}
          className="ml-auto rounded border border-gray-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100"
        >
          Reset
        </button>
      </div>

      {/* svg chart */}
      <div className="mt-4 w-full overflow-hidden rounded border border-gray-100 bg-gray-50">
        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full">
          {/* y axis ticks and labels */}
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={padX}
                y1={yScale(tick)}
                x2={chartW - 10}
                y2={yScale(tick)}
                stroke="#e5e7eb"
                strokeWidth="0.5"
              />
              <text
                x={padX - 4}
                y={yScale(tick) + 3}
                textAnchor="end"
                fontSize="9"
                fill="#6b7280"
              >
                {tick}
              </text>
            </g>
          ))}

          {/* dashed start line */}
          <line
            x1={padX}
            y1={yScale(startRating)}
            x2={chartW - 10}
            y2={yScale(startRating)}
            stroke="#f0a044"
            strokeWidth="1"
            strokeDasharray="4 3"
            opacity="0.6"
          />

          {/* rating line */}
          {points.length > 0 && (
            <polyline
              points={polylinePoints}
              fill="none"
              stroke="#f0a044"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          )}

          {/* data points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={xScale(p.match)}
              cy={yScale(p.rating)}
              r="3"
              fill="#f0a044"
              stroke="white"
              strokeWidth="1"
            />
          ))}
        </svg>
      </div>

      {/* match log */}
      {history.length > 0 && (
        <div className="mt-3">
          <div className="mb-1 text-xs text-gray-500">
            Started at {startRating}, now {currentRating} (
            {currentRating >= startRating ? "+" : ""}
            {currentRating - startRating})
          </div>
          <div className="flex flex-wrap gap-1 font-mono text-sm">
            {history.map((h, i) => (
              <span
                key={i}
                className={
                  h.outcome === "W" ? "text-green-600" : "text-red-600"
                }
              >
                {h.outcome}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
