import { ReactNode } from "react";

import cn from "@utils/cn";

interface Props {
  children: ReactNode;
  className?: string;
  maxWidth?: "DEFAULT" | "WIDE" | "BREAKOUT";
}

/**
 * wraps children and applies one of the three site-wide width modes.
 *
 * DEFAULT  → max-w-2xl, ~65ch, cozy reading. used by most pages and the header.
 * WIDE     → max-w-4xl, for grids/galleries (reviews, photos, interactive tools).
 * BREAKOUT → w-screen, no padding. for full-bleed escape (modals, hero).
 */
const Wrapper = ({ children, className, maxWidth = "DEFAULT" }: Props) => {
  let maxWidthClass;
  switch (maxWidth) {
    case "DEFAULT":
      maxWidthClass = "max-w-2xl";
      break;
    case "WIDE":
      maxWidthClass = "max-w-4xl";
      break;
    case "BREAKOUT":
      maxWidthClass = "w-screen px-0";
      break;
    default:
      maxWidthClass = "max-w-2xl";
      break;
  }

  return (
    <section
      data-component="max-width-wrapper"
      className={cn(
        "relative mx-auto w-full px-6 md:px-0",
        maxWidthClass,
        className,
      )}
    >
      {children}
    </section>
  );
};

export default Wrapper;
