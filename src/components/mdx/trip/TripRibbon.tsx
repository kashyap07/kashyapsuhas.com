"use client";

import dynamic from "next/dynamic";

const TripMap = dynamic(() => import("./TripMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-surface-subtle font-sans text-sm text-muted">
      loading map...
    </div>
  ),
});

// sticky follow-map panel for < xl, always open. crossing into xl
// (rotate/resize) remounts this via a key in the host, which drops the live
// maplibre instance.
export default function TripRibbon({ active }: { active: boolean }) {
  return (
    <div className="not-prose sticky top-0 z-30 -mx-6 h-[20vh] border-b border-line bg-surface-subtle shadow-sm md:mx-0 xl:hidden">
      {active && <TripMap cooperative />}
    </div>
  );
}
