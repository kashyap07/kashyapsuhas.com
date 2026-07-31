"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { ChevronDown } from "lucide-react";

const TripMap = dynamic(() => import("./TripMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-surface-subtle font-sans text-sm text-muted">
      loading map...
    </div>
  ),
});

// slim sticky strip for < xl: just the toggle for the real follow-map, which
// sits open underneath by default (one shared maplibre instance, kept alive
// across collapse/expand). tapping the strip toggles the map panel.
export default function TripRibbon({ active }: { active: boolean }) {
  const [open, setOpen] = useState(true);

  // crossing into xl (rotate/resize) remounts this via a key in the host, which
  // resets all state and drops the panel's live maplibre instance, so no
  // reset effect is needed here.

  return (
    <div className="not-prose sticky top-0 z-30 -mx-6 shadow-sm md:mx-0 xl:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="toggle trip map"
        className="flex w-full items-center justify-end border-b border-line bg-background px-4 py-2"
      >
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-accent py-1 pl-2.5 pr-1.5 font-sans text-xs font-medium text-black">
          map
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      <div
        className={`overflow-hidden bg-surface-subtle transition-[height] duration-300 ${
          open ? "h-[20vh] border-b border-line" : "h-0"
        }`}
      >
        {/* map mounts as soon as the ribbon is live and stays mounted while
            collapsed, so closing and reopening never reboots maplibre */}
        {active && (
          <div className="h-[20vh] w-full">
            <TripMap cooperative />
          </div>
        )}
      </div>
    </div>
  );
}
