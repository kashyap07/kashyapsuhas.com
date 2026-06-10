// [longitude, latitude] - geojson order, NOT lat/lng
export type Coord = [number, number];

export type Photo = {
  src: string;
  width: number;
  height: number;
  takenAt: string | null;
  sizeKB: number;
};

export type Waypoint = {
  id: string;
  name: string;
  coord: Coord;
  // exact index into the route polyline, emitted by build-trip-route. stops
  // anchor here directly, no nearest-point matching.
  polyIdx: number;
};

export type TripRoute = {
  waypoints: Waypoint[];
  distance_km: number;
  duration_h: number;
  polyline: Coord[];
};

export type TripData = {
  photos: Photo[];
  route: TripRoute;
};
