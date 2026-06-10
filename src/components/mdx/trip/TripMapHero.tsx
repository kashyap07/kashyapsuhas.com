"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

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

// layout:
//   < xl:          nothing rendered. mobile/tablet get per-stop <StopMapBlock>.
//   xl (1280+):    fixed card in right gutter, 320 wide, 82vh tall.
//   2xl (1536+):   bigger card, 480 wide, 88vh tall.
//   centered vertically. shadow + border for a "window in the wall" feel.
export default function TripMapHero() {
  const isXl = useIsXl();
  if (!isXl) return null;

  return (
    <div className="fixed right-6 top-1/2 z-20 h-[82vh] w-[320px] -translate-y-1/2 overflow-hidden rounded-lg border border-line shadow-macos 2xl:right-10 2xl:h-[88vh] 2xl:w-[480px]">
      <TripMap />
    </div>
  );
}
