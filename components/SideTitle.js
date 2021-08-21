const SideTitle = ({ children, className }) => {
  return (
    <span className="absolute hidden xl:block text-8xl font-extrabold text-gray-400 left-side-title top-35vh origin-top transform -rotate-90 -translate-x-1/2 scale-125 z-0 text-sideways">
      {children}
    </span>
  );
};

export default SideTitle;
