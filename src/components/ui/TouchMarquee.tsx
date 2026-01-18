"use client";

import { Dela_Gothic_One } from "next/font/google";
import { useEffect, useState } from "react";

import useScreenBeingTouched from "@hooks/useScreenBeingTouched";
import cn from "@utils/cn";

const MARQUEE_FONT = Dela_Gothic_One({ weight: "400", subsets: ["latin"] });
const MARQUEE_TEXT = "スハス カシャプ";

// duplicate content for seamless infinite loop
const MarqueeContent = () => (
  <>
    {Array(6)
      .fill(MARQUEE_TEXT)
      .map((text: string, idx: number) => (
        <span key={idx} className="mx-6">
          {text}
        </span>
      ))}
  </>
);

function TouchMarquee() {
  const isTouching = useScreenBeingTouched();

  const isVisible = isTouching;

  return (
    <div
      className={MARQUEE_FONT.className}
      aria-hidden="true"
      data-component="TouchMarquee"
    >
      <div className="pointer-events-none text-9xl">
        {/* yellow */}
        <div
          className={cn(
            "absolute inset-0 z-20 -rotate-12 overflow-visible transition-opacity duration-200",
            isVisible ? "opacity-65" : "opacity-0",
          )}
        >
          <div className="animate-marquee absolute -left-10 mt-[300px] flex w-max whitespace-nowrap text-columbiaYellow drop-shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
            <MarqueeContent />
            <MarqueeContent />
          </div>
        </div>

        {/* white */}
        <div
          className={cn(
            "absolute inset-0 z-20 -rotate-12 overflow-visible transition-opacity duration-200",
            isVisible ? "opacity-65" : "opacity-0",
          )}
        >
          <div className="animate-marquee absolute -left-10 mt-[440px] flex w-max whitespace-nowrap text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
            <MarqueeContent />
            <MarqueeContent />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TouchMarquee;
