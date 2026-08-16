"use client";

import { GRAHA_NAMES, RASHIS } from "@lib/jyotisha/constants";
import type { GrahaId } from "@lib/jyotisha/types";

// the south indian chart is a fixed grid: the rashis never move, only the grahas do.
// meena sits top left and they run clockwise. this is the format a kannada jataka is
// written in, and the fixedness is the point: you learn where a rashi lives and read
// the chart by shape.
//
// [col, row] is 1-indexed to match css grid lines.
const CELLS: { rashi: number; col: number; row: number }[] = [
  { rashi: 11, col: 1, row: 1 }, // meena
  { rashi: 0, col: 2, row: 1 }, // mesha
  { rashi: 1, col: 3, row: 1 }, // vrishabha
  { rashi: 2, col: 4, row: 1 }, // mithuna
  { rashi: 3, col: 4, row: 2 }, // kataka
  { rashi: 4, col: 4, row: 3 }, // simha
  { rashi: 5, col: 4, row: 4 }, // kanya
  { rashi: 6, col: 3, row: 4 }, // tula
  { rashi: 7, col: 2, row: 4 }, // vrishchika
  { rashi: 8, col: 1, row: 4 }, // dhanu
  { rashi: 9, col: 1, row: 3 }, // makara
  { rashi: 10, col: 1, row: 2 }, // kumbha
];

export type ChartOccupant = {
  id: GrahaId;
  vakri: boolean;
};

type Props = {
  lagnaRashi: number;
  occupants: Map<number, ChartOccupant[]>;
  /** shown in the middle of the chart */
  centre?: React.ReactNode;
};

export default function SouthIndianChart({
  lagnaRashi,
  occupants,
  centre,
}: Props) {
  return (
    <div className="grid aspect-square w-full grid-cols-4 grid-rows-4 overflow-hidden rounded-lg border border-line">
      {CELLS.map(({ rashi, col, row }) => {
        const isLagna = rashi === lagnaRashi;
        const here = occupants.get(rashi) ?? [];
        return (
          <div
            key={rashi}
            style={{ gridColumn: col, gridRow: row }}
            className={`flex flex-col gap-1 border border-line-subtle p-1.5 md:p-2 ${
              isLagna ? "bg-accent/10" : ""
            }`}
          >
            <span className="flex items-baseline gap-1 font-sans text-[10px] uppercase tracking-wider text-subtle md:text-label-sm">
              {RASHIS[rashi].name}
              {isLagna && (
                <span className="font-medium normal-case text-accent">La</span>
              )}
            </span>
            <div className="flex flex-wrap gap-x-1.5 gap-y-0.5">
              {here.map(({ id, vakri }) => (
                <span
                  key={id}
                  title={GRAHA_NAMES[id].name}
                  className="text-xs font-medium md:text-sm"
                >
                  {GRAHA_NAMES[id].short}
                  {vakri && <span className="text-danger">˚</span>}
                </span>
              ))}
            </div>
          </div>
        );
      })}

      <div
        style={{ gridColumn: "2 / span 2", gridRow: "2 / span 2" }}
        className="flex flex-col items-center justify-center gap-1 border border-line-subtle p-2 text-center"
      >
        {centre}
      </div>
    </div>
  );
}
