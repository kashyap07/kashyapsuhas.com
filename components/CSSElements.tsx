import clsx from 'clsx';
import useIsScrolled from '../utils/useIsScrolled';
import { CgChevronDoubleDown } from 'react-icons/cg';

const ScrollDownIndicatorIcon = ({ className }: { className?: string }) => (
  <span
    className={clsx('absolute bottom-14 flex h-20 w-full items-center justify-center', className)}
  >
    <CgChevronDoubleDown className="scroll-down-indicator text-4xl text-black " />
  </span>
);

const ScrollDownIndicator = () => {
  const isScrolled = useIsScrolled();

  if (isScrolled) {
    return <ScrollDownIndicatorIcon className="opacity-0 transition-opacity duration-500" />;
  } else return <ScrollDownIndicatorIcon className="opacity-100" />;
};

const HaloElem = ({ className }: { className?: string }) => (
  <div
    className={clsx(
      'absolute h-24 w-40 -translate-x-1/2 -translate-y-1/2 -skew-y-12 transform rounded-3xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-90',
      className,
    )}
  />
);
const PinkHalo = ({ className }: { className?: string }) => (
  <HaloElem data-component="pink-halo" className={clsx('pink-halo', className)} />
);
const RedHalo = ({ className }: { className?: string }) => (
  <HaloElem data-component="red-halo" className={clsx('red-halo', className)} />
);
const TealHalo = ({ className }: { className?: string }) => (
  <HaloElem data-component="teal-halo" className={clsx('teal-halo', className)} />
);

// hmm need to figure out ts better
const TealHaloLogo = ({ className, ...rest }: { className: string }) => {
  return <span className={clsx('teal-halo -skew-y-12 rounded-3xl blur-xl', className)} {...rest} />;
};

export { ScrollDownIndicator, PinkHalo, TealHalo, RedHalo, TealHaloLogo };
