import { MELAKARTAS } from "@lib/carnatic/melakarta";
import { SONGS } from "@lib/carnatic/songs";

import {
  MAX_GUESSES,
  dailyMela,
  dailySong,
  puzzleNumber,
  scoreGuess,
  shareText,
} from "../logic";

describe("raagle logic", () => {
  it("numbers puzzles from the epoch", () => {
    expect(puzzleNumber(new Date(2026, 6, 14, 9, 30))).toBe(1);
    expect(puzzleNumber(new Date(2026, 6, 15, 0, 0))).toBe(2);
    expect(puzzleNumber(new Date(2026, 7, 14))).toBe(32);
  });

  it("picks the same daily raga for any time on the same day", () => {
    const morning = dailyMela(new Date(2026, 6, 20, 6, 0));
    const night = dailyMela(new Date(2026, 6, 20, 23, 59));
    expect(morning).toBe(night);
    expect(dailyMela(new Date(2026, 6, 21))).toBeDefined();
  });

  it("picks the same daily tune all day, from the song pool", () => {
    const morning = dailySong(new Date(2026, 6, 20, 6, 0));
    const night = dailySong(new Date(2026, 6, 20, 23, 59));
    expect(morning).toBe(night);
    expect(SONGS).toContain(morning);
  });

  it("scores sa and pa as always correct", () => {
    for (const guess of [MELAKARTAS[0], MELAKARTAS[35], MELAKARTAS[71]]) {
      const score = scoreGuess(guess, MELAKARTAS[14]);
      expect(score[0]).toBe(true); // sa
      expect(score[4]).toBe(true); // pa
    }
  });

  it("scores exact and partial matches", () => {
    const mayamalavagowla = MELAKARTAS[14]; // s r1 g3 m1 p d1 n3
    const kamavardhini = MELAKARTAS[50]; // s r1 g3 m2 p d1 n3
    expect(scoreGuess(mayamalavagowla, mayamalavagowla)).toEqual([
      true,
      true,
      true,
      true,
      true,
      true,
      true,
    ]);
    expect(scoreGuess(kamavardhini, mayamalavagowla)).toEqual([
      true,
      true,
      true,
      false,
      true,
      true,
      true,
    ]);
  });

  it("builds share text without the fixed sa and pa", () => {
    const text = shareText(
      "14 Jul 2026",
      [[true, true, false, true, true, false, true]],
      true,
    );
    expect(text).toContain("Raagle 14 Jul 2026");
    expect(text).toContain(`got it in 1/${MAX_GUESSES}`);
    // slots 0 and 4 dropped, five scored slots remain
    expect(text).toContain("🟩🟥🟩🟥🟩");
    expect(text).toContain("https://kashyapsuhas.com/goodies/raagle");
    const lost = shareText(
      null,
      [[true, false, false, false, true, false, false]],
      false,
    );
    expect(lost).toContain("Raagle practice");
    expect(lost).toContain(`X/${MAX_GUESSES}`);
    expect(lost).toContain("🟥🟥🟥🟥🟥");
  });
});
