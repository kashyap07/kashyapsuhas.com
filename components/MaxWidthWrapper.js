const WrapperBackground = ({ children, className }) => {
  return (
    <div className={`h-full md:-ml-6 md:-mr-6 ${className}`}>{children}</div>
  );
};

const MaxWidthWrapper = ({ children, className = "", withBg = false }) => {
  return (
    <div
      data-component="max-width-wrapper"
      className={`max-w-full lg:max-w-wrapper mx-auto px-4 sm:px-6 ${className}`}
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
