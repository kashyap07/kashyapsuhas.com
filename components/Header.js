import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import useIsScrolled from "../utils/useScrollPosition";
import { FaHamburger } from "react-icons/fa";

const headerNavLinks = [
  { title: "Blog", href: "/blog" },
  { title: "Work", href: "/work" },
  { title: "Art", href: "/art" },
  { title: "Contact", href: "/contact" },
];

const Header = () => {
  const isScrolled = useIsScrolled();

  return (
    <header
      className={`fixed top-0 w-full bg-background bg-opacity-80 backdrop-filter backdrop-blur backdrop-saturate-200 z-50 h-16 border-b transition-all duration-500 ease-out
      ${isScrolled ? "border-opacity-100" : "border-opacity-0"}`}
    >
      <MaxWidthWrapper>
        <div className="nav flex items-center justify-between py-4 gap-y-2 z-70">
          <div>
            <Link href="/" passHref>
              <div className="flex md:items-center justify-between">
                <a
                  className="text-3xl font-fancy font-bold bg-gradient-to-r from-indigo-600 via-pink-500 to-special-teal bg-clip-text text-transparent"
                  aria-label="Home Page"
                >
                  Suhas Kashyap
                </a>
              </div>
            </Link>
          </div>

          <input type="checkbox" className="hidden" id="nav-check" />
          <div className="md:hidden right-1">
            <label
              className="text-gray-900 hover:text-secondary"
              htmlFor="nav-check"
            >
              <FaHamburger
                style={{
                  transform: "scale(1.3) translateX(-5px) translateY(-2px)",
                }}
              />
            </label>
          </div>

          {/* on click close */}
          <div className="mobile-menu">
            <div className="flex flex-col md:flex-row gap-2">
              {headerNavLinks.map((link) => (
                <Link key={link.title} href={link.href} passHref>
                  <a className="px-5 py-0.5 border rounded-lg text-gray-900">
                    {link.title}
                  </a>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </header>
  );
};

export default Header;
