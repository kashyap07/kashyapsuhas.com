"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

import TripRibbon from "./TripRibbon";

const TripMap = dynamic(() => import("./TripMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-surface-subtle text-muted">
      loading map...
    </div>
  ),
});

const XL_QUERY = "(min-width: 1280px)";

// js gate, not css `hidden`: a css-hidden map would still download maplibre,
// boot a live map, and run scroll handlers on phones that never see it.
function useIsXl(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia(XL_QUERY);
      mql.addEventListener("change", cb);
      return () => mql.removeEventListener("change", cb);
    },
    () => window.matchMedia(XL_QUERY).matches,
    () => false,
  );
}

// xl+: follow-map card parked in the right gutter. it is a sticky child of the
// article, sitting in the flow where <TripMap /> is written in the mdx (just
// above the first stop), so it scrolls up into view with the prose and only
// then pins at viewport centre. that keeps it out of the intro and off the
// post's title card without any js scroll gate.
//
// the h-0 sticky parent is what travels; the card hangs off it as an absolute
// child so it costs no vertical space in the reading column and its own
// -translate-y-1/2 centres it whatever the height cap resolves to.
// width tracks the real gutter, (50vw - half the 42rem column) less margins,
// capped at 400, so it can never push past the viewport at narrow xl widths.
//
// below xl: sticky ribbon strip (svg route + car) with the same follow-map
// open underneath by default, collapsible by tap. the ribbon also ssr-renders
// (css-hidden on xl), so phones get it on first paint; `active` turns its
// listeners and map off on desktop.
export default function TripMapHero() {
  const isXl = useIsXl();
  return (
    <>
      {isXl && (
        <div className="not-prose sticky top-1/2 z-20 h-0">
          <div className="absolute left-full ml-6 h-[82vh] max-h-[620px] w-[min(400px,calc(50vw-21rem-3.5rem))] -translate-y-1/2 overflow-hidden rounded-lg border border-line 2xl:ml-32 2xl:max-h-[680px]">
            <TripMap />
          </div>
        </div>
      )}
      {/* key flips on the xl boundary so the ribbon remounts: fresh state and
          its panel's maplibre instance torn down when it goes inactive */}
      <TripRibbon key={isXl ? "xl" : "sub-xl"} active={!isXl} />
    </>
  );
}
