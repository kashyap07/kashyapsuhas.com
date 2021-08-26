import { CgChevronDoubleDown } from "react-icons/cg";
const ScrollDownIndicator = () => (
  <span className="flex h-20 w-full items-center justify-center absolute bottom-10 md:bottom-4">
    <CgChevronDoubleDown className="scroll-down-indicator text-4xl text-gray-700" />
  </span>
);

export { ScrollDownIndicator };
