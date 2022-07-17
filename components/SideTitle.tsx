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
          "text-sideways absolute left-side-title top-64 z-0 hidden  origin-top -translate-x-1/2 -rotate-90 scale-125 transform select-none text-8xl font-bold text-gray-300 xl:block",
          className
        )}
      >
        {children}
      </span>
    </div>
  );
};

export default SideTitle;
