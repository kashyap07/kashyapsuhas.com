const MaxWidthWrapper = ({ children, className, body = false, ...props }) => {
  return (
    <div
      className={
        "max-w-3xl px-4 mx-auto sm:px-6 xl:px-0 " +
        `${className ? className : ""}` +
        `${body ? " xl:max-w-body" : " xl:max-w-5xl"}`
      }
    >
      {children}
    </div>
  );
};

export default MaxWidthWrapper;
