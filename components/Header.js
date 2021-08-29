import { useState } from "react";
import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import useIsScrolled from "../utils/useScrollPosition";
import HamburgerMenu from "../components/HamburgerMenu";
import { PinkHalo } from "../components/CSSElements";
import { DarkModeSwitch } from "react-toggle-dark-mode";
import { Socials, socialsObj } from "../components/Socials";

const headerNavLinks = [
  { title: "Blog", href: "/blog" },
  { title: "Work", href: "/work" },
  // { title: "Art", href: "/art" },
  { title: "Contact", href: "/contact" },
];

const Header = () => {
  const isScrolled = useIsScrolled();
  const [isDarkMode, setDarkMode] = useState(false);

  const { twitter, github, instagram } = socialsObj;

  const toggleDarkMode = (checked) => {
    setDarkMode(checked);
  };

  const ThemeSwitcherBtn = ({ className = "" }) => (
    <DarkModeSwitch
      className={className}
      checked={isDarkMode}
      onChange={toggleDarkMode}
      sunColor="hsl(220, 12%, 40%)"
    />
  );

  return (
    <header
      className={`fixed top-0 w-full bg-background bg-opacity-80 backdrop-filter backdrop-blur backdrop-saturate-200 z-50 h-16 border-b transition-all duration-500 ease-out
      ${isScrolled ? "border-opacity-100" : "border-opacity-0"}`}
    >
      <MaxWidthWrapper>
        <nav className="nav flex items-center justify-between py-4 z-50">
          <div className="flex">
            <Link href="/" passHref>
              <a
                data-element="logo"
                className="text-3xl font-fancy font-bold bg-gradient-to-r from-special-logo-start to-special-logo-end bg-clip-text text-transparent  relative group hover:bg-none select-none mr-5"
                aria-label="Home Page"
              >
                <span className="group-hover:text-red-50 transition-colors duration-500 select-none delay-100">
                  Suhas Kashyap
                </span>
                <PinkHalo className="top-1/4 md:top-2/3 left-1/3 -z-10" />
                <PinkHalo className="top-1/4 left-2/3 -z-10" />
              </a>
            </Link>

            {/* desktop list */}
            <div className="hidden md:flex flex-row items-center">
              {headerNavLinks.map((link) => (
                <Link key={link.title} href={link.href} passHref>
                  <a className="px-2 py-0.5 text-gray-600 h-fit-content font-medium rounded-full hover:nav-button-hover">
                    {link.title}
                  </a>
                </Link>
              ))}
            </div>
          </div>

          {/* desktop visible, mobile hidden */}
          <div className="hidden md:flex items-center">
            <Socials
              list={[twitter, github, instagram]}
              className="text-xl gap-3 text-gray-600"
              altIcons
            />
            <span className="h-6 w-0 border mx-3 border-gray-300" aria-hidden />
            <ThemeSwitcherBtn />
          </div>

          {/* Mobile list */}
          <HamburgerMenu
            headerNavLinks={headerNavLinks}
            socialButtons={[twitter, github, instagram]}
            ThemeSwitcherBtn={ThemeSwitcherBtn}
          />
        </nav>
      </MaxWidthWrapper>
    </header>
  );
};

export default Header;
