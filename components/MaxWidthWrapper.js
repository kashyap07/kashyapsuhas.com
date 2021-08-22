import WrapperBackground from "./WrapperBackground";

const MaxWidthWrapper = ({
  children,
  className,
  variant = false,
  withBg = false,
  ...props
}) => {
  return (
    <div
      data-component="max-width-wrapper"
      className={
        "max-w-3xl px-4 mx-auto sm:px-6 xl:px-0 h-full " +
        `${className ? className : ""}` +
        `${variant ? " xl:max-w-5xl" : " xl:max-w-wrapper"}`
      }
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
