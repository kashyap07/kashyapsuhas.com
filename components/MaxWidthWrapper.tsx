import clsx from 'clsx';

const WrapperBackground = ({
  children,
  className,
}: {
  children: JSX.Element | JSX.Element[];
  className?: string;
}) => {
  return <div className={`h-full md:-ml-6 md:-mr-6 ${className}`}>{children}</div>;
};

const MaxWidthWrapper = ({
  children,
  className,
  withBg = false,
}: {
  children: JSX.Element | JSX.Element[];
  className?: string;
  withBg?: boolean;
}) => {
  return (
    <div
      data-component="max-width-wrapper"
      className={clsx('mx-auto max-w-full px-4 sm:px-6 lg:max-w-wrapper', className)}
    >
      {withBg ? <WrapperBackground>{children}</WrapperBackground> : <>{children}</>}
    </div>
  );
};

export default MaxWidthWrapper;
