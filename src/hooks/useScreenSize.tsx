import { useEffect, useState } from "react";

// null = mobile
// sm = tablet
// xl = pc

// WIP

type ScreenSizeType = null | "sm" | "xl";

const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState<ScreenSizeType>(null);

  useEffect(() => {
    window.addEventListener("resize", () => {
      console.log(window.innerHeight, window.innerWidth);
    });
  }, []);
};

export default useScreenSize;
