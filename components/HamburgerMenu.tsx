import { FaHamburger } from 'react-icons/fa';
import Link from 'next/link';
import { useRef } from 'react';
import { Socials } from './Socials';
import { UrlObject } from 'url';

const HamburgerMenu = ({
  headerNavLinks,
  socialButtons,
}: {
  headerNavLinks: any;
  socialButtons: any;
}): JSX.Element => {
  const hamburger = useRef(null);

  const onLinkPress = () => {
    // @ts-ignore
    hamburger?.current?.click();
  };
  return (
    <>
      {/* Hamburger icon */}
      <input type="checkbox" ref={hamburger} className="peer hidden" id="nav-check" />
      <div className="right-1 md:hidden">
        <label className="text-black hover:text-primary" htmlFor="nav-check">
          <FaHamburger
            style={{
              transform: 'scale(1.3) translateX(-5px) translateY(-2px)',
            }}
          />
        </label>
      </div>

      {/* Hamburger menu */}
      <div
        data-component="hamburger-menu"
        className="absolute left-0 top-16 z-50 flex h-hamburger-menu w-full -translate-x-full flex-col justify-between border-r-2 bg-background transition-all duration-200 ease-in-out peer-checked:translate-x-0  md:hidden"
      >
        <div className="flex flex-col first:border-t-4">
          {headerNavLinks.map(
            (link: { title: {} | null | undefined; href: string | UrlObject }, i: number) => (
              // @ts-ignore
              <Link
                key={i}
                href={link.href}
                className="w-full border-b px-6 py-4 font-medium hover:bg-gray-50"
                onClick={onLinkPress}
              >
                {link.title}
              </Link>
            ),
          )}
        </div>
        <div className="mb-16 flex w-full justify-between px-6 py-4">
          {socialButtons && (
            <Socials list={socialButtons} className="gap-6 text-2xl text-black" altIcons />
          )}
        </div>
      </div>
    </>
  );
};

export default HamburgerMenu;
