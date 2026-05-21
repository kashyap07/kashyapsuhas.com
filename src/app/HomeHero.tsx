"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import cn from "@utils/cn";

import NavLinks from "./NavLinks";

// click wordmark to cycle through scripts.
// kannada: native script. sanskrit: with visarga ḥ. japanese: katakana transliteration.
// size override: japanese katakana is full-width (~1em/char) so the default
// display size overflows mobile. shrink it for that variant only.
const WORDMARK_CYCLE: { text: string; size?: string }[] = [
  { text: "Suhas Kashyap" },
  { text: "ಸುಹಾಸ್ ಕಶ್ಯಪ್" },
  { text: "सुहास कश्यपः" },
  { text: "スハース カシュヤプ", size: "text-4xl md:text-display" },
];

export default function HomeHero() {
  const [wordmarkIdx, setWordmarkIdx] = useState(0);
  const [chill, setChill] = useState(false);
  const streakRef = useRef(0);
  const chillTimeoutRef = useRef<number | null>(null);

  const cycle = () => {
    setWordmarkIdx((i) => (i + 1) % WORDMARK_CYCLE.length);
    streakRef.current += 1;
    if (streakRef.current >= 10) {
      streakRef.current = 0;
      setChill(true);
      if (chillTimeoutRef.current) window.clearTimeout(chillTimeoutRef.current);
      chillTimeoutRef.current = window.setTimeout(() => setChill(false), 2500);
    }
  };

  return (
    <section className="relative flex min-h-dvh w-full flex-col items-center justify-center px-6 py-12 text-center md:py-16">
      {/* top: name + tagline + nav */}
      <header className="flex flex-col items-center">
        {/* line-height pinned to latin variant's box so smaller variants
            (japanese) don't cause vertical layout shift on cycle */}
        <h1
          onClick={cycle}
          className={cn(
            "cursor-pointer select-none",
            "text-[2.8rem] font-bold !leading-[2.8rem]",
            "md:text-display md:font-semibold md:!leading-[5rem]",
            WORDMARK_CYCLE[wordmarkIdx].size,
          )}
          title="psst, click me"
        >
          {WORDMARK_CYCLE[wordmarkIdx].text}
        </h1>
        <p className="mt-1 text-lg text-secondary md:mt-3 md:text-2xl">
          {chill ? "chilllllll" : "Welcome to my slice of the Interwebs."}
        </p>
        <NavLinks
          variant="accent"
          className="mt-10 justify-center text-base md:text-2xl"
        />
      </header>

      {/* portrait. q=75 + sizes so next picks the right bucket for hero LCP */}
      <Image
        src="/kedar-bw.png"
        alt="Portrait of Suhas Kashyap"
        width={1500}
        height={1268}
        quality={75}
        priority
        sizes="(max-width: 768px) 320px, 384px"
        onClick={cycle}
        className="mt-12 w-80 cursor-pointer select-none md:mt-12 md:w-96"
      />
    </section>
  );
}
