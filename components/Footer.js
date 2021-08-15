import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";

const Footer = ({ className }) => {
  return (
    <footer className={`relative bg-white ${className}`}>
      <div className="h-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 163"
          className="transform -translate-y-footer wave-seperator-crop"
        >
          <path
            fill="white"
            fillOpacity="1"
            d="M0 151C313 184 493 74 652 107C797 139 827 167 992 134C1144 106 1169 18 1440 32L1440 160 0 160Z"
          ></path>
        </svg>
      </div>
      <MaxWidthWrapper>
        <div className="flex flex-col sm:flex-row sm:justify-between pb-10 mt-4 gap-y-2 z-20">
          <div className="font-bold text-xl">
            Hello Good Day. Nandini Milk is the secret of my energy.
          </div>
        </div>
      </MaxWidthWrapper>

      {/* Maybe have clean, color, dark themes */}
      {/* Hamburger? */}
    </footer>
  );
};

export default Footer;
