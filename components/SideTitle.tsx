import clsx from "clsx";

const SideTitle = ({
  children,
  className,
}: {
  children: any;
  className?: string;
}) => {
  return (
    <div data-component="side-title">
      <span
        className={clsx(
          "absolute hidden xl:block text-8xl font-extrabold text-gray-100 dark:text-gray-800 left-side-title top-64 origin-top transform -rotate-90 -translate-x-1/2 scale-125 z-0 text-sideways select-none",
          className
        )}
      >
        {children}
      </span>
    </div>
  );
};

export default SideTitle;
