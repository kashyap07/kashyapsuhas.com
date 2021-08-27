import { useEffect, useState } from "react";

const useIsScrolled = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updatePosition = () => {
      if (!isScrolled) setIsScrolled(window.pageYOffset > 0);
      else setIsScrolled(window.pageYOffset == 0);
    };
    window.addEventListener("scroll", updatePosition, { passive: true });
    updatePosition();
    return () => window.removeEventListener("scroll", updatePosition);
  }, [isScrolled]);

  return isScrolled;
};

export default useIsScrolled;
