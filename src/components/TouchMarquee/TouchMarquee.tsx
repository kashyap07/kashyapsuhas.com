"use client";

import { Dela_Gothic_One } from "next/font/google";

import useScreenBeingTouched from "@/hooks/useScreenBeingTouched";
import cn from "@/utils/cn";

const MARQUEE_FONT = Dela_Gothic_One({ weight: "400", subsets: ["latin"] });
const MARQUEE_TEXT = "Suhas Kashyap スハス カシャプ";

const MarqueeText = () => {
  return Array(10)
    .fill(MARQUEE_TEXT)
    .map((text: string, idx: number) => (
      <span key={idx} className="mr-10">
        {text}
      </span>
    ));
};

function TouchMarquee() {
  const isTouching = useScreenBeingTouched();

  return (
    <div
      className={MARQUEE_FONT.className}
      aria-hidden="true"
      data-component="TouchMarquee"
    >
      <div className={"pointer-events-none text-9xl"}>
        {/* yellow */}
        <div
          className={cn(
            "absolute inset-0 z-20 -rotate-12 transition-opacity duration-300",
            isTouching ? "opacity-95" : "opacity-0",
          )}
        >
          <div className="animate-marquee absolute -inset-10 mt-[200px] whitespace-nowrap text-nowrap text-columbiaYellow drop-shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
            <MarqueeText />
          </div>
        </div>

        {/* grey */}
        <div
          className={cn(
            "absolute inset-0 z-20 -rotate-12 transition-opacity duration-300",
            isTouching ? "opacity-85" : "opacity-0",
          )}
        >
          <div className="animate-marquee absolute -inset-10 mt-[320px] whitespace-nowrap text-nowrap text-[#595D68] drop-shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
            <MarqueeText />
          </div>
        </div>

        {/* white */}
        <div
          className={cn(
            "absolute inset-0 z-20 -rotate-12 transition-opacity duration-300",
            isTouching ? "opacity-65" : "opacity-0",
          )}
        >
          <div className="animate-marquee absolute -inset-10 mt-[440px] whitespace-nowrap text-nowrap text-gray-100 drop-shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
            <MarqueeText />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TouchMarquee;
