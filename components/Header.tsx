import { useState, useEffect } from "react";
import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import useIsScrolled from "../utils/useScrollPosition";
import HamburgerMenu from "./HamburgerMenu";
import { PinkHalo } from "./CSSElements";
import { Socials, socialsObj } from "./Socials";

const headerNavLinks = [
  { title: "BLOG", href: "/blog" },
  { title: "WORK", href: "/work" },
  { title: "CONTACT", href: "/contact" },
];

const Header = () => {
  const isScrolled = useIsScrolled();

  const { twitter, github, instagram } = socialsObj;

  return (
    <header
      className={`fixed top-0 z-50 h-16 w-full border-b bg-black bg-opacity-80 backdrop-blur backdrop-saturate-200 backdrop-filter transition-all duration-500 ease-out
      ${isScrolled ? "border-opacity-100" : "border-opacity-0"}`}
    >
      <MaxWidthWrapper>
        <nav className="nav z-50 flex items-center justify-between py-4">
          <div className="flex">
            <Link href="/" passHref>
              <a
                data-element="logo"
                className="group relative select-none bg-primary bg-clip-text pr-1 font-fancy text-3xl font-bold tracking-tight text-transparent hover:bg-none"
                aria-label="Home Page"
              >
                <span className="select-none transition-colors delay-100 duration-500 group-hover:text-red-50">
                  Suhas Kashyap
                </span>
                <PinkHalo className="top-0 left-1/3 -z-10" />
                <PinkHalo className="top-1/4 left-2/3 -z-10" />
              </a>
            </Link>

            {/* desktop list */}
            <div className="ml-3 hidden flex-row items-center md:flex">
              {headerNavLinks.map((link) => (
                <Link key={link.title} href={link.href} passHref>
                  <a className="hover:nav-button-hover h-fit-content rounded-full  px-1.5 py-0.5 font-semibold text-white">
                    {link.title}
                  </a>
                </Link>
              ))}
            </div>
          </div>

          {/* desktop visible, mobile hidden */}
          <div className="hidden items-center md:flex">
            <Socials
              list={[twitter, github, instagram]}
              className="gap-3 text-xl text-white"
              altIcons
            />
            {/* <span className="mx-3 h-6 w-0 border border-gray-100" aria-hidden /> */}
          </div>

          {/* Mobile list */}
          <HamburgerMenu
            headerNavLinks={headerNavLinks}
            socialButtons={[twitter, github, instagram]}
          />
        </nav>
      </MaxWidthWrapper>
    </header>
  );
};

export default Header;
