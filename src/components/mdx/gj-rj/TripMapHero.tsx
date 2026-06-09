"use client";

import dynamic from "next/dynamic";

import Lightbox from "./Lightbox";

const TripMap = dynamic(() => import("./TripMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-surface-subtle text-muted">
      loading map...
    </div>
  ),
});

// layout:
//   < xl:         hidden. mobile/tablet show per-stop <StopMapBlock> instead.
//   xl (1280-1535): rounded card in right gutter, 320 wide, 82vh tall.
//   ≥ 2xl (1536):  bigger card, 480 wide, 88vh tall.
//   centered vertically. shadow + border for a proper "window in the wall" feel.
//
// also mounts the lightbox once. lightbox is viewport-agnostic, sits outside the
// hidden sidebar wrapper so it works on mobile too.
export default function TripMapHero() {
  return (
    <>
      <div
        className="
          hidden
          xl:fixed xl:block xl:left-auto xl:right-6 xl:top-1/2 xl:z-20
          xl:h-[82vh] xl:w-[320px] xl:-translate-y-1/2
          xl:rounded-lg xl:border xl:border-line xl:overflow-hidden xl:shadow-macos
          2xl:right-10 2xl:h-[88vh] 2xl:w-[480px]
        "
      >
        <TripMap />
      </div>
      <Lightbox />
    </>
  );
}
