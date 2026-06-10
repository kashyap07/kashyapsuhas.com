import { Children, ReactNode, cloneElement, isValidElement } from "react";

export interface PhotoGridProps {
  cols?: 2 | 3;
  children: ReactNode;
}

const COLS_CLASS: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-2 md:grid-cols-3",
};

// passes `variant="grid"` down to every TripPhoto child so they render as
// square thumbnails instead of full-width figures.
export default function PhotoGrid({ cols = 3, children }: PhotoGridProps) {
  const enhanced = Children.map(children, (child) => {
    // skip text nodes and plain dom elements; only components take variant
    if (!isValidElement(child) || typeof child.type === "string") return child;
    return cloneElement(child as React.ReactElement<{ variant?: string }>, {
      variant: "grid",
    });
  });

  return (
    <div
      className={`not-prose my-8 grid gap-2 ${COLS_CLASS[cols] ?? COLS_CLASS[3]}`}
    >
      {enhanced}
    </div>
  );
}
