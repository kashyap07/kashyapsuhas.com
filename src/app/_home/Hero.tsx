"use client";

import { useRef, useState, useSyncExternalStore } from "react";

import { hasWebGL } from "@lib/webgl";

import NavLinks from "../NavLinks";
import Wordmark from "./Wordmark";

// webgl support can't change within a page's life, so there's nothing to
// subscribe to; this only exists to read a client-only value without
// tripping hydration
const noSubscribe = () => () => {};

export default function Hero() {
  const [chill, setChill] = useState(false);
  const streakRef = useRef(0);
  const chillTimeoutRef = useRef<number | null>(null);
  // ssr assumes webgl, so the markup is unchanged for everyone who has it;
  // the hydration pass is what drops the stage on browsers that don't
  const webgl = useSyncExternalStore(noSubscribe, hasWebGL, () => true);

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
          {chill ? "chilllllll" : <>Welcome to my slice of the Interwebs.</>}
        </p>

        {/* roomier on mobile: bigger type + padded links for comfy tap
            targets, wraps as it needs to. separator dots hide on mobile */}
        <NavLinks
          variant="accent"
          className="mt-8 justify-center gap-x-4 px-2 text-xl md:mt-10 md:gap-x-2 md:text-2xl [&>span>span]:hidden md:[&>span>span]:inline [&_a]:inline-block [&_a]:py-1"
        />
      </header>

      {/* empty stage: the grain portrait renders itself onto the canvas exactly
          over this anchor, raining into place on load. without webgl nothing
          ever paints it, so the stage is dropped instead of reserving a
          portrait-sized hole - the hero just centres on its text */}
      {webgl && (
        <div
          id="portrait-anchor"
          aria-label="Portrait of Suhas Kashyap on a Himalayan ridge, camera in hand, rendered from thousands of grains"
          role="img"
          className="relative mt-12 aspect-[1500/1268] w-[min(82vw,520px)] md:mt-4 md:w-[540px]"
        />
      )}
    </section>
  );
}
