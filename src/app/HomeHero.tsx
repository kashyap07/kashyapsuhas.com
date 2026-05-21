"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import NavLinks from "./NavLinks";

// click wordmark to cycle through scripts.
// kannada: native script. sanskrit: with visarga ḥ. japanese: katakana transliteration.
const WORDMARK_CYCLE = [
  "Suhas Kashyap",
  "ಸುಹಾಸ್ ಕಶ್ಯಪ್",
  "सुहास कश्यपः",
  "スハース カシュヤプ",
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
        <h1
          onClick={cycle}
          className="cursor-pointer select-none text-[2.9rem] font-bold md:text-display md:font-semibold"
          title="psst, click me"
        >
          {WORDMARK_CYCLE[wordmarkIdx]}
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
