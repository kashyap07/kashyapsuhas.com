"use client";

import { useState } from "react";

import cn from "@utils/cn";

// click wordmark to cycle through scripts.
// kannada: native script. sanskrit: with visarga ḥ. japanese: katakana transliteration.
// size override: japanese katakana is full-width (~1em/char) so the default
// display size overflows mobile. shrink it for that variant only.
// lang per variant so screen readers pronounce non-en text correctly (wcag 3.1.2).
const WORDMARK_CYCLE: { text: string; lang: string; size?: string }[] = [
  { text: "Suhas Kashyap", lang: "en" },
  { text: "ಸುಹಾಸ್ ಕಶ್ಯಪ್", lang: "kn" },
  { text: "सुहास कश्यपः", lang: "sa-Deva" },
  { text: "スハース カシュヤプ", lang: "ja", size: "text-4xl md:text-display" },
];

export default function Wordmark({ onCycle }: { onCycle?: () => void }) {
  const [idx, setIdx] = useState(0);

  const cycle = () => {
    onCycle?.();
    setIdx((i) => (i + 1) % WORDMARK_CYCLE.length);
  };

  return (
    // line-height pinned to latin variant's box so smaller variants
    // (japanese) don't cause vertical layout shift on cycle
    <h1>
      <button
        type="button"
        onClick={cycle}
        lang={WORDMARK_CYCLE[idx].lang}
        aria-label="Suhas Kashyap. Click to cycle name through different scripts."
        title="psst, click me"
        className={cn(
          "cursor-pointer select-none bg-transparent",
          "text-[2.8rem] font-bold !leading-[2.8rem]",
          "md:mt-10 md:text-display md:font-semibold md:!leading-[5rem]",
          WORDMARK_CYCLE[idx].size,
        )}
      >
        {WORDMARK_CYCLE[idx].text}
      </button>
    </h1>
  );
}
