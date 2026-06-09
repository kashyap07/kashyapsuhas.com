import { Children, cloneElement, isValidElement, ReactNode } from "react";

interface Props {
  cols?: 2 | 3;
  children: ReactNode;
}

const COLS_CLASS = {
  2: "grid-cols-2",
  3: "grid-cols-2 md:grid-cols-3",
};

// passes `variant="grid"` down to every TripPhoto child so they render as
// square thumbnails instead of full-width figures.
export default function PhotoGrid({ cols = 3, children }: Props) {
  const enhanced = Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    // safe cast: we only override variant; existing props are preserved.
    return cloneElement(child as React.ReactElement<{ variant?: string }>, {
      variant: "grid",
    });
  });

  return (
    <div className={`not-prose my-8 grid gap-2 ${COLS_CLASS[cols]}`}>
      {enhanced}
    </div>
  );
}
