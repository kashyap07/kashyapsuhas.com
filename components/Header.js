import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import useScrollPosition from "../utils/useScrollPosition";
import { FaHamburger } from "react-icons/fa";

const headerNavLinks = [
  { title: "Blog", href: "/blog" },
  { title: "Work", href: "/work" },
  { title: "Art", href: "/art" },
  { title: "Contact", href: "/contact" },
];

const Hamburger = () => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    fillRule="evenodd"
    clipRule="evenodd"
    className="fill-current text-gray-900 hover:fill-current hover:text-secondary"
  >
    <path d="M23 19c.37 1.981-.544 3.99-3 4-4.611.019-11.389 0-16 0-2.492 0-3.348-1.976-3-4h22zm-.465-1c-.007 0-21.142-.002-21.17-.006-.764-.068-1.365-.711-1.365-1.494s.601-1.426 1.365-1.494c.028-.004 2.116-.006 2.116-.006 2.37.017 2.852 2.006 4.019 2 1.167-.006 1.781-1.976 3.965-2h11.07c.812.019 1.465.684 1.465 1.5s-.653 1.481-1.465 1.5zm-2.07-7h2.07c.812.019 1.465.684 1.465 1.5s-.653 1.481-1.465 1.5c-.007 0-21.142-.002-21.17-.006-.764-.068-1.365-.711-1.365-1.494s.601-1.426 1.365-1.494c.028-.004 11.116-.006 11.116-.006 2.37.017 2.852 2.006 4.019 2 1.167-.006 1.781-1.976 3.965-2zm2.535-1h-22c0-3.989 4.377-8 11-8s11 4.011 11 8zm-11.5-4c.276 0 .5.224.5.5s-.224.5-.5.5-.5-.224-.5-.5.224-.5.5-.5zm4 0c.276 0 .5.224.5.5s-.224.5-.5.5-.5-.224-.5-.5.224-.5.5-.5zm4 0c.276 0 .5.224.5.5s-.224.5-.5.5-.5-.224-.5-.5.224-.5.5-.5zm-12 0c.276 0 .5.224.5.5s-.224.5-.5.5-.5-.224-.5-.5.224-.5.5-.5zm-2-1c.276 0 .5.224.5.5s-.224.5-.5.5-.5-.224-.5-.5.224-.5.5-.5zm3-1c.276 0 .5.224.5.5s-.224.5-.5.5-.5-.224-.5-.5.224-.5.5-.5zm6 0c.276 0 .5.224.5.5s-.224.5-.5.5-.5-.224-.5-.5.224-.5.5-.5zm3 0c.276 0 .5.224.5.5s-.224.5-.5.5-.5-.224-.5-.5.224-.5.5-.5zm-6-1c.276 0 .5.224.5.5s-.224.5-.5.5-.5-.224-.5-.5.224-.5.5-.5z" />
  </svg>
);

const Header = () => {
  const scrollPosition = useScrollPosition();

  return (
    <header
      className={`fixed top-0 w-full bg-background bg-opacity-50 backdrop-filter backdrop-blur-sm z-50 h-16 ${
        scrollPosition > 0 && "border-b"
      }`}
    >
      <MaxWidthWrapper>
        <div className="nav flex items-center justify-between py-4 gap-y-2 z-70">
          <div>
            <Link href="/" passHref>
              <div className="flex md:items-center justify-between">
                <a
                  className="text-3xl font-fancy font-bold bg-gradient-to-r from-indigo-700 to-special-teal bg-clip-text text-transparent"
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
