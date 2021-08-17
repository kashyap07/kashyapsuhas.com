const MaxWidthWrapper = ({ children, className, ...props }) => {
  // FIXME: classname if not defined comes out as undefined
  return (
    <div
      className={`max-w-3xl xl:max-w-5xl px-4 mx-auto sm:px-6 xl:px-0 ${className}`}
    >
      {children}
    </div>
  );
};

export default MaxWidthWrapper;
