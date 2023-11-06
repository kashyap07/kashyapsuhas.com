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
 * <Wrapper maxWidth={MaxWidth.Narrow}>
 *   // Content to be wrapped
 * </Wrapper>
 *
 * @param {ReactNode} props.children - The content to be wrapped.
 * @param {string} [props.className] - Additional CSS classes to be applied to the wrapper.
 * @param {MaxWidth} props.maxWidth - The maximum width to be applied. Default is MaxWidth.Wide.
 * @returns {JSX.Element} The JSX element representing the Wrapper component.
 */
const Wrapper = ({
  children,
  className,
  maxWidth = MaxWidth.Wide,
}: WrapperProps): JSX.Element => {
  return (
    <div
      data-component="max-width-wrapper"
      className={clsx(
        "relative mx-auto w-full px-6",
        maxWidth === MaxWidth.Wide ? "max-w-6xl" : "max-w-5xl",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Wrapper;