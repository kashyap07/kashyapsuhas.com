import clsx from "clsx";
import useIsScrolled from "../utils/useIsScrolled";
import { CgChevronDoubleDown } from "react-icons/cg";

const ScrollDownIndicatorIcon = ({ className }: { className?: string }) => (
  <span
    className={clsx(
      "flex h-20 w-full items-center justify-center absolute bottom-14",
      className
    )}
  >
    <CgChevronDoubleDown className="text-4xl text-gray-700 scroll-down-indicator dark:text-gray-400" />
  </span>
);

const ScrollDownIndicator = () => {
  const isScrolled = useIsScrolled();

  if (isScrolled) {
    return (
      <ScrollDownIndicatorIcon className="transition-opacity duration-500 opacity-0" />
    );
  } else return <ScrollDownIndicatorIcon className="opacity-100" />;
};

const HaloElem = ({ className }: { className?: string }) => (
  <div
    className={clsx(
      "absolute w-40 h-24 rounded-3xl transform -translate-x-1/2 -translate-y-1/2 -skew-y-12 blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500",
      className
    )}
  />
);
const PinkHalo = ({ className }: { className?: string }) => (
  <HaloElem
    data-component="pink-halo"
    className={clsx("pink-halo", className)}
  />
);
const RedHalo = ({ className }: { className?: string }) => (
  <HaloElem data-component="red-halo" className={clsx("red-halo", className)} />
);
const TealHalo = ({ className }: { className?: string }) => (
  <HaloElem
    data-component="teal-halo"
    className={clsx("teal-halo", className)}
  />
);

export { ScrollDownIndicator, PinkHalo, TealHalo, RedHalo };
