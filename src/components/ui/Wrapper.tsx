import { ReactNode } from 'react';

import cn from '@/utils/cn';

interface Props {
  children: ReactNode;
  className?: string;
  maxWidth?: "NARROW" | "WIDE" | "FULL_WIDTH" | "FULL_SCREEN_WIDTH";
}

/**
 * wraps children and applies a maximum width based on the specified `maxWidth` prop.
 * narrow for blogs and such
 * wide for home page and such (that's the plan for now at least)
 */
const Wrapper = ({ children, className, maxWidth = "NARROW" }: Props) => {
  let maxWidthClass;
  switch (maxWidth) {
    case "WIDE":
      maxWidthClass = "max-w-7xl";
      break;
    case "NARROW":
      maxWidthClass = "max-w-5xl";
      break;
    case "FULL_WIDTH":
      maxWidthClass = "max-w-full";
      break;
    case "FULL_SCREEN_WIDTH":
      maxWidthClass = "w-screen px-0";
      break;
    default:
      maxWidthClass = "max-w-5xl";
      break;
  }

  return (
    <section
      data-component="max-width-wrapper"
      className={cn("relative mx-auto w-full px-6", maxWidthClass, className)}
    >
      {children}
    </section>
  );
};

export default Wrapper;
