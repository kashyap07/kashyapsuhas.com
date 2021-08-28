import { useState } from "react";
import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import useIsScrolled from "../utils/useScrollPosition";
import HamburgerMenu from "../components/HamburgerMenu";
import { PinkHalo } from "../components/CSSElements";
import { DarkModeSwitch } from "react-toggle-dark-mode";

const headerNavLinks = [
  { title: "Blog", href: "/blog" },
  { title: "Work", href: "/work" },
  // { title: "Art", href: "/art" },
  // { title: "Contact", href: "/contact" },
];

const Header = () => {
  const isScrolled = useIsScrolled();
  const [isDarkMode, setDarkMode] = useState(false);

  const toggleDarkMode = (checked) => {
    setDarkMode(checked);
  };

  return (
    <header
      className={`fixed top-0 w-full bg-background bg-opacity-80 backdrop-filter backdrop-blur backdrop-saturate-200 z-50 h-16 border-b transition-all duration-500 ease-out
      ${isScrolled ? "border-opacity-100" : "border-opacity-0"}`}
    >
      <MaxWidthWrapper>
        <nav className="nav flex items-center justify-between py-4 z-50">
          <div>
            <Link href="/" passHref>
              <a
                data-element="logo"
                className="text-3xl font-fancy font-bold bg-gradient-to-r from-special-logo-start to-special-logo-end bg-clip-text text-transparent  relative group hover:bg-none select-none"
                aria-label="Home Page"
              >
                <span className="group-hover:text-red-50 transition-colors duration-500 select-none">
                  Suhas Kashyap
                </span>
                <PinkHalo className="top-1/4 md:top-2/3 left-1/3 -z-10" />
                <PinkHalo className="top-1/4 left-2/3 -z-10" />
              </a>
            </Link>
          </div>

          {/* desktop list */}
          <div className="hidden md:flex flex-row items-center gap-1">
            {headerNavLinks.map((link) => (
              <Link key={link.title} href={link.href} passHref>
                <a className="px-3 py-0.5 h-fit-content font-medium rounded-full hover:nav-button-hover">
                  {link.title}
                </a>
              </Link>
            ))}
            <DarkModeSwitch
              className="-mt-1 ml-2"
              checked={isDarkMode}
              onChange={toggleDarkMode}
            />
          </div>

          {/* Mobile list */}
          <HamburgerMenu headerNavLinks={headerNavLinks} />
        </nav>
      </MaxWidthWrapper>
    </header>
  );
};

export default Header;
