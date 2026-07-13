import { MELAKARTAS, Melakarta } from "@lib/carnatic/melakarta";

export const MAX_GUESSES = 6;

// puzzle #1 on 2026-07-14, counted on the player's local calendar day
const EPOCH_UTC = Date.UTC(2026, 6, 14);

export function puzzleNumber(d: Date): number {
  const localDay = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.floor((localDay - EPOCH_UTC) / 86400000) + 1;
}

function fnv1a(s: string): number {
  let h = 0x811c9dc5;
  for (const ch of s) {
    h ^= ch.codePointAt(0)!;
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// everyone gets the same raga on the same day
export function dailyMela(d: Date): Melakarta {
  const key = `ragle|${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  return MELAKARTAS[fnv1a(key) % MELAKARTAS.length];
}

export function randomMela(exclude?: Melakarta): Melakarta {
  let m: Melakarta;
  do {
    m = MELAKARTAS[Math.floor(Math.random() * MELAKARTAS.length)];
  } while (m === exclude);
  return m;
}

// slot-by-slot: is the guess's swara exactly the answer's swara here
export function scoreGuess(guess: Melakarta, answer: Melakarta): boolean[] {
  return guess.scale.map((id, i) => id === answer.scale[i]);
}

export function shareText(
  puzzle: number | null,
  rows: boolean[][],
  won: boolean,
): string {
  const grid = rows
    .map((row) => row.map((ok) => (ok ? "🟩" : "⬜")).join(""))
    .join("\n");
  const label = puzzle === null ? "practice" : `#${puzzle}`;
  const score = won ? `${rows.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
  return `Ragle ${label} ${score}\n${grid}\nkashyapsuhas.com/goodies/ragle`;
}
