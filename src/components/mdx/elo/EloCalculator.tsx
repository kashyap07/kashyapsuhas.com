"use client";

import { useState } from "react";

import katex from "katex";
import "katex/dist/katex.min.css";

import { expectedScore, newRating } from "./elo";

export function EloCalculator() {
  const [playerRating, setPlayerRating] = useState(1750);
  const [opponentRating, setOpponentRating] = useState(1600);
  const kFactor = 32;

  const expected = expectedScore(playerRating, opponentRating);
  const newRatingWin = newRating(playerRating, expected, 1, kFactor);
  const newRatingLoss = newRating(playerRating, expected, 0, kFactor);

  const deltaWin = newRatingWin - playerRating;
  const deltaLoss = newRatingLoss - playerRating;

  // step 1: expected score formula with values
  const diff = opponentRating - playerRating;
  const step1HTML = katex.renderToString(
    `E = \\frac{1}{1 + 10^{\\frac{${diff}}{400}}} = ${expected.toFixed(3)}`,
    { displayMode: false, throwOnError: false },
  );

  // step 2: win outcome
  const step2WinHTML = katex.renderToString(
    `R' = ${playerRating} + ${kFactor} \\times (1 - ${expected.toFixed(3)}) = ${newRatingWin}`,
    { displayMode: false, throwOnError: false },
  );

  // step 3: loss outcome
  const step2LossHTML = katex.renderToString(
    `R' = ${playerRating} + ${kFactor} \\times (0 - ${expected.toFixed(3)}) = ${newRatingLoss}`,
    { displayMode: false, throwOnError: false },
  );

  return (
    <div className="not-prose my-8 rounded-lg border border-gray-200 p-4 md:p-6">
      {/* input fields */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-gray-600">
            Your rating
          </label>
          <input
            type="number"
            min={400}
            max={3000}
            value={playerRating}
            onChange={(e) => setPlayerRating(Number(e.target.value))}
            className="mt-2 w-full rounded border border-gray-300 px-3 py-2 text-center font-mono"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-600">
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

      {/* step 1: expected score */}
      <div className="mt-6">
        <div className="mb-2 text-sm font-medium text-gray-700">
          Step 1: Calculate expected score
        </div>
        <div className="rounded-lg bg-blue-50 px-4 py-3">
          <div
            className="text-center"
            dangerouslySetInnerHTML={{ __html: step1HTML }}
          />
          <div className="mt-2 text-center text-sm text-gray-600">
            You're expected to win {(expected * 100).toFixed(1)}% of the time
          </div>
        </div>
      </div>

      {/* step 2: outcomes */}
      <div className="mt-6">
        <div className="mb-2 text-sm font-medium text-gray-700">
          Step 2: Update rating based on outcome
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {/* win */}
          <div className="rounded-lg border-2 border-green-200 bg-green-50 px-4 py-3">
            <div className="mb-1 text-xs font-medium uppercase tracking-wide text-green-700">
              If you win (S = 1)
            </div>
            <div
              className="mb-2 overflow-x-auto text-sm"
              dangerouslySetInnerHTML={{ __html: step2WinHTML }}
            />
            <div className="flex items-baseline justify-between border-t border-green-200 pt-2">
              <span className="text-sm text-gray-600">New rating:</span>
              <span className="font-mono text-lg font-medium text-green-700">
                {newRatingWin}
              </span>
            </div>
            <div className="mt-1 text-right">
              <span
                className={`font-mono text-sm font-medium ${
                  deltaWin >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {deltaWin >= 0 ? "+" : ""}
                {deltaWin}
              </span>
            </div>
          </div>

          {/* loss */}
          <div className="rounded-lg border-2 border-red-200 bg-red-50 px-4 py-3">
            <div className="mb-1 text-xs font-medium uppercase tracking-wide text-red-700">
              If you lose (S = 0)
            </div>
            <div
              className="mb-2 overflow-x-auto text-sm"
              dangerouslySetInnerHTML={{ __html: step2LossHTML }}
            />
            <div className="flex items-baseline justify-between border-t border-red-200 pt-2">
              <span className="text-sm text-gray-600">New rating:</span>
              <span className="font-mono text-lg font-medium text-red-700">
                {newRatingLoss}
              </span>
            </div>
            <div className="mt-1 text-right">
              <span
                className={`font-mono text-sm font-medium ${
                  deltaLoss >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {deltaLoss >= 0 ? "+" : ""}
                {deltaLoss}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
