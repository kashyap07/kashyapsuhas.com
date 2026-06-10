import { ReactNode } from "react";

import slugify from "@utils/slugify";

import StopMapBlock from "./StopMapBlock";
import type { TripRoute } from "./types";

export interface StopProps {
  title: string;
  // waypoint id from content/trips/<slug>/waypoints.json. resolves to a
  // coord + exact polyline index, so stops anchor to the route without any
  // nearest-point guessing. omit to skip the map block for this stop.
  waypoint?: string;
  children: ReactNode;
}

function UnknownWaypoint({ id }: { id: string }) {
  return (
    <span className="my-4 block rounded border border-line bg-surface-subtle p-4 font-sans text-sm text-danger">
      unknown waypoint: <code>{id}</code>. add it to waypoints.json and run{" "}
      <code>npm run build-trip-route</code>.
    </span>
  );
}

export default function Stop({
  route,
  title,
  waypoint,
  children,
}: StopProps & { route: TripRoute }) {
  // same id + anchor markup as mdx h2s, so stops deep-link like any heading
  const slug = slugify(title);
  const wp = waypoint
    ? route.waypoints.find((w) => w.id === waypoint)
    : undefined;

  return (
    <section
      data-stop
      data-stop-coord={wp ? wp.coord.join(",") : ""}
      data-stop-idx={wp ? wp.polyIdx : ""}
      className="scroll-mt-12"
    >
      <h2 id={slug}>
        <a href={`#${slug}`} className="anchor" />
        {title}
      </h2>
      {waypoint && !wp && <UnknownWaypoint id={waypoint} />}
      {children}
      {wp && <StopMapBlock coord={wp.coord} />}
    </section>
  );
}
