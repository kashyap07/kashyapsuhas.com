// movable swara notation: written once in scale degrees, rendered in any
// melakarta. uppercase = madhya sthayi, lowercase = mandra, trailing ' = tara.
// "," or ";" extends the previous note by a unit, "_" rests one unit, barlines
// are visual only. letters inside one token split a single unit ("PR" = half
// each), space-separated tokens get a unit each.
import type { PlayableNote } from "./audio";
import type { Melakarta } from "./melakarta";
import { SA_HZ, svaraFreq } from "./pitches";

// s r g m p d n
const DEGREES = "srgmpdn";

export type NotationNote = {
  degree: number; // 0 = sa .. 6 = ni
  octave: -1 | 0 | 1;
  units: number;
  restBefore: number; // units of silence before this note
};

const BARLINE = /^\|+$/;
const EXTEND = /^[,;]+$/;
const REST = /^_+$/;
const NOTE = /^(?:[SRGMPDNsrgmpdn]'?)+$/;

export function parseNotation(src: string): NotationNote[] {
  const notes: NotationNote[] = [];
  let rest = 0;
  for (const token of src.trim().split(/\s+/)) {
    if (token.length === 0 || BARLINE.test(token)) continue;
    if (REST.test(token)) {
      rest += token.length;
      continue;
    }
    if (EXTEND.test(token)) {
      // a leading extension has nothing to hold, it is silence
      const last = notes[notes.length - 1];
      if (last && rest === 0) last.units += token.length;
      else rest += token.length;
      continue;
    }
    if (!NOTE.test(token)) {
      throw new Error(`bad notation token "${token}"`);
    }
    const letters = token.match(/[SRGMPDNsrgmpdn]'?/g)!;
    for (const letter of letters) {
      const tara = letter.endsWith("'");
      const ch = letter[0];
      const lower = ch === ch.toLowerCase();
      notes.push({
        degree: DEGREES.indexOf(ch.toLowerCase()),
        octave: tara ? 1 : lower ? -1 : 0,
        units: 1 / letters.length,
        restBefore: rest,
      });
      rest = 0;
    }
  }
  return notes;
}

// how long one notation unit lasts, in player beats
export const UNIT_BEATS = 0.75;

// the same written line, sung in whichever melakarta you hand it
export function notationPlayable(
  src: string,
  m: Melakarta,
  saHz = SA_HZ,
): PlayableNote[] {
  return parseNotation(src).map((n, i) => ({
    freq: svaraFreq(m.scale[n.degree], n.octave, saHz),
    beats: n.units * UNIT_BEATS,
    restBefore: n.restBefore * UNIT_BEATS,
    idx: i,
  }));
}
