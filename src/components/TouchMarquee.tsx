"use client"

import React from "react";

export const TouchMarquee = () => {
  const [isTouching, setIsTouching] = React.useState(false);

  React.useEffect(() => {
    const handleTouchStart = () => setIsTouching(true);
    const handleTouchEnd = () => setIsTouching(false);

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, []);

  return (
    <div className="pointer-events-none">
      <div className={`absolute inset-0 z-20 transition-opacity duration-300 -rotate-12 ${isTouching ? 'opacity-95' : 'opacity-0'}`}>
        <div className="absolute inset-0">
          <div className="animate-marquee_SP absolute -inset-10 mt-[200px] whitespace-nowrap text-nowrap text-9xl text-[#fecb47] drop-shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
            {Array(20)
              .fill("SUHAS KASHYAP")
              .map((text, i) => (
                <span key={i} className="mr-10">
                  {text}
                </span>
              ))}
          </div>
        </div>
      </div>

      <div className={`absolute inset-0 z-20 transition-opacity duration-300 -rotate-12 ${isTouching ? 'opacity-85' : 'opacity-0'}`}>
        <div className="absolute inset-0">
          <div className="animate-marquee_SP absolute -inset-10 mt-[320px] whitespace-nowrap text-nowrap text-9xl text-[#595D68] drop-shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
            {Array(20)
              .fill("SUHAS KASHYAP")
              .map((text, i) => (
                <span key={i} className="mr-10">
                  {text}
                </span>
              ))}
          </div>
        </div>
      </div>

      <div className={`absolute inset-0 z-20 transition-opacity duration-300 -rotate-12 ${isTouching ? 'opacity-65' : 'opacity-0'}`}>
        <div className="absolute inset-0">
          <div className="animate-marquee_SP absolute -inset-10 mt-[440px] whitespace-nowrap text-nowrap text-9xl text-gray-100 drop-shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
            {Array(20)
              .fill("SUHAS KASHYAP")
              .map((text, i) => (
                <span key={i} className="mr-10">
                  {text}
                </span>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 