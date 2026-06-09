import { ReactNode } from "react";

import StopMapBlock from "./StopMapBlock";

interface Props {
  title: string;
  // [longitude, latitude] (GeoJSON order, NOT lat/lng). example: bangalore is
  // [77.5946, 12.9716]. omit to skip the map block for this stop.
  coord?: [number, number];
  children: ReactNode;
}

export default function Stop({ title, coord, children }: Props) {
  return (
    <section
      data-stop
      data-stop-title={title}
      data-stop-coord={coord ? coord.join(",") : ""}
      className="scroll-mt-12"
    >
      <h2>{title}</h2>
      {children}
      {coord && <StopMapBlock coord={coord} />}
    </section>
  );
}
