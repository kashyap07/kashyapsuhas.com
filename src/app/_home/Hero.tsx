"use client";

import { useRef, useState } from "react";

import NavLinks from "../NavLinks";
import Wordmark from "./Wordmark";

export default function Hero() {
  const [chill, setChill] = useState(false);
  const streakRef = useRef(0);
  const chillTimeoutRef = useRef<number | null>(null);

  // ten rapid clicks on the name and the site asks you to relax
  const onWordmarkCycle = () => {
    streakRef.current += 1;
    if (streakRef.current >= 10) {
      streakRef.current = 0;
      setChill(true);
      if (chillTimeoutRef.current) window.clearTimeout(chillTimeoutRef.current);
      chillTimeoutRef.current = window.setTimeout(() => setChill(false), 2500);
    }
  };

  return (
    <section className="relative z-10 flex min-h-svh w-full flex-col items-center justify-center px-6 py-12 text-center md:py-16">
      <header className="flex flex-col items-center">
        <Wordmark onCycle={onWordmarkCycle} />

        <p className="mt-1 text-lg text-secondary md:mt-3 md:text-2xl">
          {chill ? (
            "chilllllll"
          ) : (
            <>
              Welcome to my{" "}
              <span className="relative inline-block">
                slice
                <svg
                  aria-hidden
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                  className="absolute -bottom-1.5 left-0 h-2.5 w-full overflow-visible"
                >
                  {/* hand-drawn marker swipe */}
                  <path
                    d="M3 7 C 22 3.5, 46 8.5, 70 5.5 S 94 4.5, 97 6"
                    fill="none"
                    stroke="var(--columbiaYellow)"
                    strokeWidth={3}
                    strokeLinecap="round"
                  />
                </svg>
              </span>{" "}
              of the Interwebs.
            </>
          )}
        </p>

        {/* roomier on mobile: bigger type + padded links for comfy tap
            targets, wraps as it needs to. separator dots hide on mobile */}
        <NavLinks
          variant="accent"
          className="mt-8 justify-center gap-x-4 px-2 text-xl md:mt-10 md:gap-x-2 md:text-2xl [&>span>span]:hidden md:[&>span>span]:inline [&_a]:inline-block [&_a]:py-1"
        />
      </header>

      {/* empty stage: the grain portrait renders itself onto the canvas exactly
          over this anchor, raining into place on load */}
      <div
        id="portrait-anchor"
        aria-label="Portrait of Suhas Kashyap on a Himalayan ridge, camera in hand, rendered from thousands of grains"
        role="img"
        className="relative mt-12 aspect-[1500/1268] w-[min(82vw,520px)] md:mt-4 md:w-[540px]"
      />
    </section>
  );
}
