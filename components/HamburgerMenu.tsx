import { FaHamburger } from "react-icons/fa";
import Link from "next/link";
import { useRef } from "react";
import { Socials } from "./Socials";
import { UrlObject } from "url";

const HamburgerMenu = ({
  headerNavLinks,
  socialButtons,
  ThemeSwitcherBtn,
}: {
  headerNavLinks: any;
  socialButtons: any;
  ThemeSwitcherBtn: any;
}): JSX.Element => {
  const hamburger = useRef(null);

  const onLinkPress = () => {
    // @ts-ignore
    hamburger?.current?.click();
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
        className="absolute left-0 z-50 flex flex-col justify-between w-full transition-all duration-200 ease-in-out -translate-x-full border-r-2 md:hidden top-16 bg-background dark:bg-gray-900 h-hamburger-menu dark:border-gray-800 peer-checked:translate-x-0"
      >
        <div className="flex flex-col first:border-t-4 dark:first:border-gray-800">
          {headerNavLinks.map(
            (link: {
              title: {} | null | undefined;
              href: string | UrlObject;
            }) => (
              // @ts-ignore
              <Link key={link.title} href={link.href}>
                <a
                  className="w-full px-6 py-4 font-medium border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={onLinkPress}
                >
                  {link.title}
                </a>
              </Link>
            )
          )}
        </div>
        <div className="flex justify-between w-full px-6 py-4 mb-16">
          {socialButtons && (
            <Socials
              list={socialButtons}
              className="gap-6 text-2xl text-gray-600"
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
