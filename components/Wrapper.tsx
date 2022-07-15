const Wrapper = ({ children }: { children: JSX.Element }) => {
  return (
    <div className="max-w-3xl xl:max-w-5xl px-4 mx-auto sm:px-6 xl:px-0">
      <div className="flex flex-col justify-between h-screen ">{children}</div>
    </div>
  );
};

export default Wrapper;
