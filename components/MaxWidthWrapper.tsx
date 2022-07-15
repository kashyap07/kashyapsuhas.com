import clsx from "clsx";

const WrapperBackground = ({
  children,
  className,
}: {
  children: JSX.Element;
  className?: string;
}) => {
  return (
    <div className={`h-full md:-ml-6 md:-mr-6 ${className}`}>{children}</div>
  );
};

const MaxWidthWrapper = ({
  children,
  className,
  withBg = false,
}: {
  children: JSX.Element;
  className?: string;
  withBg?: boolean;
}) => {
  return (
    <div
      data-component="max-width-wrapper"
      className={clsx(
        "max-w-full lg:max-w-wrapper mx-auto px-4 sm:px-6",
        className
      )}
    >
      {withBg ? (
        <WrapperBackground>{children}</WrapperBackground>
      ) : (
        <>{children}</>
      )}
    </div>
  );
};

export default MaxWidthWrapper;
