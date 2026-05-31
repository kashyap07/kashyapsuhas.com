"use client";

import { useState } from "react";

import cn from "@utils/cn";

// matches the home wordmark cycle.
const CYCLE: { text: string; lang: string }[] = [
  { text: "Suhas Kashyap", lang: "en" },
  { text: "ಸುಹಾಸ್ ಕಶ್ಯಪ್", lang: "kn" },
  { text: "सुहास कश्यपः", lang: "sa-Deva" },
  { text: "スハース カシュヤプ", lang: "ja" },
];

interface Props {
  className?: string;
}

export default function FooterNameCycle({ className }: Props) {
  const [idx, setIdx] = useState(0);
  const cycle = () => setIdx((i) => (i + 1) % CYCLE.length);
  const current = CYCLE[idx];

  return (
    <button
      type="button"
      onClick={cycle}
      lang={current.lang}
      title="psst, click me"
      aria-label="Suhas Kashyap. Click to cycle through scripts."
      className={cn(
        "cursor-pointer select-none bg-transparent font-display hover:text-accent",
        className,
      )}
    >
      {current.text}
    </button>
  );
}
