// client-only: composes into "use client" pages (needs onClick handlers)
import { POSITIONS, SVARAS, Svara } from "@lib/carnatic/pitches";

// key id 12 = the high sa, one octave above key 0
export const UPPER_SA = 12;

const SUB = ["", "₁", "₂", "₃"] as const;

type Key = { id: number; svaras: Svara[]; upper: boolean };

const KEYS: Key[] = [
  ...POSITIONS.map((p) => ({ id: p.semitone, svaras: p.svaras, upper: false })),
  { id: UPPER_SA, svaras: [SVARAS.S], upper: true },
];

type Props = {
  selected: Set<number>; // pressed keys (filter)
  locked?: Set<number>; // always-on keys (sa, pa, high sa)
  active?: number | null; // key currently sounding, it jumps
  onTap: (id: number) => void;
};

// the 12 svarasthanas plus the high sa as tappable keys,
// enharmonic names share a key
export default function SvaraKeyboard({
  selected,
  locked,
  active,
  onTap,
}: Props) {
  return (
    <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-7 md:grid-cols-[repeat(13,minmax(0,1fr))]">
      {KEYS.map((key) => {
        const isLocked = locked?.has(key.id) ?? false;
        const isSelected = selected.has(key.id) || isLocked;
        const isActive = active === key.id;
        return (
          <button
            key={key.id}
            onClick={() => onTap(key.id)}
            title={isLocked ? "every melakarta has this swara" : undefined}
            className={`flex flex-col items-center gap-0.5 rounded-md border px-1 py-2 transition-all duration-150 ${
              isActive ? "-translate-y-1" : ""
            } ${
              isSelected
                ? "border-accent bg-accent text-black"
                : isActive
                  ? "border-accent bg-surface-subtle text-accent"
                  : "border-line text-secondary hover:border-accent hover:text-accent"
            } ${isLocked && !isActive ? "opacity-60" : ""}`}
          >
            <span className="h-2 font-sans text-[10px] leading-none">
              {key.upper ? "•" : " "}
            </span>
            <span className="font-display text-lg leading-tight md:text-xl">
              {key.svaras.map((s) => s.kannada + SUB[s.variant]).join("/")}
            </span>
            <span className="font-sans text-[11px] leading-tight">
              {key.svaras.map((s) => s.latin).join(" ")}
            </span>
          </button>
        );
      })}
    </div>
  );
}
