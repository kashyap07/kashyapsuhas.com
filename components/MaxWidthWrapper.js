const MaxWidthWrapper = ({ children }) => {
  return (
    <div className="max-w-3xl xl:max-w-5xl px-4 mx-auto sm:px-6 xl:px-0">
      {children}
    </div>
  );
};

export default MaxWidthWrapper;
