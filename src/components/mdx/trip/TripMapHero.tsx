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

// xl+: fixed follow-map card in the right gutter (320 wide, 480 at 2xl).
// below xl: sticky ribbon strip (svg route + car) with the same follow-map
// open underneath by default, collapsible by tap. the ribbon also ssr-renders
// (css-hidden on xl), so phones get it on first paint; `active` turns its
// listeners and map off on desktop.
export default function TripMapHero() {
  const isXl = useIsXl();
  return (
    <>
      {isXl && (
        <div className="fixed right-6 top-1/2 z-20 h-[82vh] w-[320px] -translate-y-1/2 overflow-hidden rounded-lg border border-line 2xl:right-10 2xl:h-[88vh] 2xl:w-[480px]">
          <TripMap />
        </div>
      )}
      {/* key flips on the xl boundary so the ribbon remounts: fresh state and
          its panel's maplibre instance torn down when it goes inactive */}
      <TripRibbon key={isXl ? "xl" : "sub-xl"} active={!isXl} />
    </>
  );
}
