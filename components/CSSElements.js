import { CgChevronDoubleDown } from "react-icons/cg";
import useIsScrolled from "../utils/useIsScrolled";

const ScrollDownIndicatorIcon = ({ className }) => (
  <span
    className={`flex h-20 w-full items-center justify-center absolute bottom-14 ${className}`}
  >
    <CgChevronDoubleDown className="scroll-down-indicator text-4xl text-gray-700" />
  </span>
);

const ScrollDownIndicator = () => {
  const isScrolled = useIsScrolled();

  if (isScrolled) {
    return (
      <ScrollDownIndicatorIcon className="opacity-0 transition-opacity duration-500" />
    );
  } else return <ScrollDownIndicatorIcon className="opacity-100" />;
};

export { ScrollDownIndicator };
