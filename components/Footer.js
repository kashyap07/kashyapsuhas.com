import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";

const Footer = () => {
  const FooterNavLinks = [
    { title: "Blog", href: "/blog" },
    { title: "Work", href: "/work" },
    { title: "Contact", href: "/contact" },
  ];

  return (
    <footer className="relative bg-white">
      <div className="h-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 160"
          className="transform -translate-y-footer"
        >
          <path
            fill="white"
            fillOpacity="1"
            d="M0 33C17 64 112 75 151 70C284 60 404.011-23.041 568.842 14.249C698.546 34.245 927 151 1119 154C1236 146 1315 73 1440 120L1440 160 0 160Z"
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
