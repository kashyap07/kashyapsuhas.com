export type StopKind =
  | "start"
  | "end"
  | "temple"
  | "food"
  | "road"
  | "viewpoint"
  | "encounter"
  | "pitstop"
  | "mishap";

export type Photo = {
  src: string;
  width: number;
  height: number;
  lat: number | null;
  lng: number | null;
  takenAt: string | null;
  sizeKB: number;
};
