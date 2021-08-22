const WrapperBackground = ({ children, className }) => {
  return (
    <div
      data-component="max-width-wrapper"
      className={`bg-white h-full md:-ml-6 md:-mr-6 pb-28 ${className}`}
    >
      {children}
    </div>
  );
};

export default WrapperBackground;
