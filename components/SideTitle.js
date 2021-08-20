const SideTitle = ({ children, className }) => {
  return (
    <span className="absolute hidden xl:block text-9xl font-extrabold text-gray-300 left-2p top-35vh p origin-top transform -rotate-90 -translate-x-1/2 scale-110 z-0 text-sideways">
      {children}
    </span>
  );
};

export default SideTitle;
