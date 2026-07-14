import { MELAKARTAS, Melakarta } from "@lib/carnatic/melakarta";
import { SONGS, Song } from "@lib/carnatic/songs";

export const MAX_GUESSES = 3;

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

const dateKey = (d: Date) =>
  `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

// everyone gets the same raga on the same day
export function dailyMela(d: Date): Melakarta {
  return MELAKARTAS[fnv1a(`raagle|${dateKey(d)}`) % MELAKARTAS.length];
}

// and the same tune to hear it in, drawn independently of the raga
export function dailySong(d: Date): Song {
  return SONGS[fnv1a(`raagle-song|${dateKey(d)}`) % SONGS.length];
}

export function randomMela(exclude?: Melakarta): Melakarta {
  let m: Melakarta;
  do {
    m = MELAKARTAS[Math.floor(Math.random() * MELAKARTAS.length)];
  } while (m === exclude);
  return m;
}

export function randomSong(): Song {
  return SONGS[Math.floor(Math.random() * SONGS.length)];
}

// sa and pa sit in every melakarta, they carry no signal
export const FIXED_SLOTS = new Set([0, 4]);

// slot-by-slot: is the guess's swara exactly the answer's swara here
export function scoreGuess(guess: Melakarta, answer: Melakarta): boolean[] {
  return guess.scale.map((id, i) => id === answer.scale[i]);
}

// the scored slots as emoji rows, shown on the end screen and in shares
export function gridText(rows: boolean[][]): string {
  return rows
    .map((row) =>
      row
        .filter((_, i) => !FIXED_SLOTS.has(i))
        .map((ok) => (ok ? "🟩" : "🟥"))
        .join(""),
    )
    .join("\n");
}

export function shareText(
  date: string | null, // null for practice rounds
  rows: boolean[][],
  won: boolean,
): string {
  const label = date ?? "practice";
  const score = won
    ? `got it in ${rows.length}/${MAX_GUESSES}`
    : `X/${MAX_GUESSES}, it slipped away`;
  return `Raagle ${label}\n\n${score}\n\n${gridText(rows)}\n\nhttps://kashyapsuhas.com/goodies/raagle`;
}
