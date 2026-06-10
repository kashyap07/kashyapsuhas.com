import {
  Children,
  ReactElement,
  ReactNode,
  cloneElement,
  isValidElement,
} from "react";

export interface PhotoGridProps {
  cols?: 2 | 3;
  children: ReactNode;
}

const COLS_CLASS: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-2 md:grid-cols-3",
};

// only the bound TripPhoto (marked in the registry) gets the grid variant;
// text nodes and other elements render untouched instead of receiving a
// stray `variant` prop.
function isTripPhotoElement(
  child: ReactNode,
): child is ReactElement<{ variant?: string }> {
  return (
    isValidElement(child) &&
    typeof child.type === "function" &&
    (child.type as { isTripPhoto?: boolean }).isTripPhoto === true
  );
}

// passes `variant="grid"` down to every TripPhoto child so they render as
// square thumbnails instead of full-width figures.
export default function PhotoGrid({ cols = 3, children }: PhotoGridProps) {
  const enhanced = Children.map(children, (child) => {
    if (!isTripPhotoElement(child)) return child;
    return cloneElement(child, { variant: "grid" });
  });

  return (
    <div
      className={`not-prose my-8 grid gap-2 ${COLS_CLASS[cols] ?? COLS_CLASS[3]}`}
    >
      {enhanced}
    </div>
  );
}
