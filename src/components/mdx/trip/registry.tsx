// per-trip data lives in content/trips/<slug>/. a post opts in with
// `trip: <slug>` frontmatter; CustomMDX then binds these components to that
// trip's manifests. adding a travelogue = new content/trips/<slug>/ data
// (via the scripts) + one entry here.
import type { MDXComponents } from "mdx/types";

import gjRjPhotos from "../../../../content/trips/gj-rj/photos.json";
import gjRjRoute from "../../../../content/trips/gj-rj/route.json";
import gjRjWaypoints from "../../../../content/trips/gj-rj/waypoints.json";
import PhotoGrid from "./PhotoGrid";
import Stop, { type StopProps } from "./Stop";
import TripMapHero from "./TripMapHero";
import TripPhoto, { type TripPhotoProps } from "./TripPhoto";
import type { Photo, TripData, TripRoute } from "./types";

const trips: Record<string, TripData> = {
  "gj-rj": {
    photos: gjRjPhotos as Photo[],
    route: gjRjRoute as unknown as TripRoute,
  },
};

// waypoints.json is the builder INPUT; route.json is the artifact the maps
// actually render. editing waypoints without re-running build-trip-route
// silently shows stale coords, so flag the drift in the server console.
const sourceWaypoints: Record<string, unknown> = {
  "gj-rj": gjRjWaypoints,
};

const warnedStale = new Set<string>();

export function getTrip(slug: string): TripData | null {
  const trip = trips[slug] ?? null;
  if (trip && !warnedStale.has(slug)) {
    warnedStale.add(slug);
    const built = JSON.stringify(
      trip.route.waypoints.map(({ id, name, coord }) => ({ id, name, coord })),
    );
    if (built !== JSON.stringify(sourceWaypoints[slug])) {
      console.warn(
        `[trip:${slug}] waypoints.json changed since route.json was built. re-run: npm run build-trip-route -- ${slug}`,
      );
    }
  }
  return trip;
}

export function bindTripComponents(trip: TripData): MDXComponents {
  const BoundTripPhoto = (props: TripPhotoProps) => (
    <TripPhoto photos={trip.photos} {...props} />
  );
  const BoundStop = (props: StopProps) => (
    <Stop route={trip.route} {...props} />
  );
  return {
    TripMap: TripMapHero,
    Stop: BoundStop,
    PhotoGrid,
    TripPhoto: BoundTripPhoto,
  };
}
