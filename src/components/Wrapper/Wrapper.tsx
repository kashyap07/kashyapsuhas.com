import clsx from "clsx";
import { ReactNode } from "react";

import { MaxWidth } from "@/variables/sizes";

export interface WrapperProps {
  children: ReactNode;
  className?: string;
  maxWidth?: MaxWidth;
}

/**
 * Wraps children and applies a maximum width based on the specified `maxWidth` prop.
 * Narrow for blogs and such
 * Wide for home page and such (that's the plan for now at least)
 *
 * @component
 * @example
 * // Usage:
 * <Wrapper maxWidth={MaxWidth.Wide}>
 *   // Content to be wrapped
 * </Wrapper>
 *
 * @param {ReactNode} props.children - The content to be wrapped.
 * @param {string} [props.className] - Additional CSS classes to be applied to the wrapper.
 * @param {MaxWidth} props.maxWidth - The maximum width to be applied. Default is MaxWidth.Narrow.
 * @returns {JSX.Element} The JSX element representing the Wrapper component.
 */
const Wrapper = ({
  children,
  className,
  maxWidth = MaxWidth.Narrow,
}: WrapperProps): JSX.Element => {
  let maxWidthClass;
  switch (maxWidth) {
    case MaxWidth.Wide:
      maxWidthClass = "max-w-7xl";
      break;
    case MaxWidth.Narrow:
      maxWidthClass = "max-w-[68rem]";
      break;
    case MaxWidth.FullWidth:
      maxWidthClass = "max-w-full";
      break;
    case MaxWidth.Screen:
      maxWidthClass = "h-screen w-screen";
      break;
    default:
      maxWidthClass = "max-w-[68rem]";
      break;
  }

  return (
    <div
      data-component="max-width-wrapper"
      className={clsx("relative mx-auto w-full px-6", maxWidthClass, className)}
    >
      {children}
    </div>
  );
};

export default Wrapper;
