import { FaHamburger } from "react-icons/fa";
import Link from "next/link";
import { useRef } from "react";
import { Socials } from "../components/Socials";

const HamburgerMenu = ({ headerNavLinks, socialButtons, ThemeSwitcherBtn }) => {
  const hamburger = useRef(null);

  const onLinkPress = () => {
    hamburger.current.click();
  };
  return (
    <>
      {/* Hamburger icon */}
      <input
        type="checkbox"
        ref={hamburger}
        className="hidden peer"
        id="nav-check"
      />
      <div className="md:hidden right-1">
        <label className="text-gray-600 hover:text-primary" htmlFor="nav-check">
          <FaHamburger
            style={{
              transform: "scale(1.3) translateX(-5px) translateY(-2px)",
            }}
          />
        </label>
      </div>

      {/* Hamburger menu */}
      <div
        data-component="hamburger-menu"
        className="flex flex-col justify-between md:hidden absolute top-16 left-0 bg-background dark:bg-gray-900 h-hamburger-menu w-full border-r-2 dark:border-gray-800 -translate-x-full peer-checked:translate-x-0 transition-all duration-200 ease-in-out z-50"
      >
        <div className="flex flex-col first:border-t-4 dark:first:border-gray-800">
          {headerNavLinks.map((link) => (
            <Link key={link.title} href={link.href}>
              <a
                className="px-6 py-4 w-full font-medium border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={onLinkPress}
              >
                {link.title}
              </a>
            </Link>
          ))}
        </div>
        <div className="flex justify-between px-6 py-4 w-full mb-16">
          {socialButtons && (
            <Socials
              list={socialButtons}
              className="text-2xl gap-6 text-gray-600"
              altIcons
            />
          )}
          <span className="transform scale-125">
            <ThemeSwitcherBtn />
          </span>
        </div>
      </div>
    </>
  );
};

export default HamburgerMenu;
