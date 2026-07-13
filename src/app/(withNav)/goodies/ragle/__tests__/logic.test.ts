import { MELAKARTAS } from "@lib/carnatic/melakarta";

import {
  MAX_GUESSES,
  dailyMela,
  puzzleNumber,
  scoreGuess,
  shareText,
} from "../logic";

describe("ragle logic", () => {
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
      true, true, true, true, true, true, true,
    ]);
    expect(scoreGuess(kamavardhini, mayamalavagowla)).toEqual([
      true, true, true, false, true, true, true,
    ]);
  });

  it("builds wordle-style share text", () => {
    const text = shareText(3, [[true, false, true]], true);
    expect(text).toContain(`Ragle #3 1/${MAX_GUESSES}`);
    expect(text).toContain("🟩⬜🟩");
    const lost = shareText(null, [[false]], false);
    expect(lost).toContain(`Ragle practice X/${MAX_GUESSES}`);
  });
});
