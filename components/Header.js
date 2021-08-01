import { useState } from "react";
import Link from "next/link";

const Header = () => {
  const headerNavLinks = [
    { title: "Blog", href: "/blog" },
    { title: "Work", href: "/work" },
    { title: "Contact", href: "/contact" },
  ];

  const [navShow, setNavShow] = useState(false);

  const onToggleNav = () => {
    setNavShow((status) => {
      if (status) {
        document.body.style.overflow = "auto";
      } else {
        // Prevent scrolling
        document.body.style.overflow = "hidden";
      }
      return !status;
    });
  };

  return (
    <header className="flex flex-col sm:flex-row sm:justify-between py-10 gap-y-2">
      <div>
        <Link href="/" passHref>
          <div className="flex items-center justify-between">
            <a
              className="text-2xl font-bold cursor-pointer"
              aria-label="Home Page"
            >
              {/* logo? */}
              Suhas Kashyap
            </a>
          </div>
        </Link>
      </div>
      <div className="items-center">
        <div className="flex gap-2">
          {headerNavLinks.map((link) => (
            <Link key={link.title} href={link.href} passHref>
              <a className="px-5 py-0.5 border rounded-full text-gray-900">
                {link.title}
              </a>
            </Link>
          ))}
        </div>
      </div>

      {/* Maybe have clean, color, dark themes */}
      {/* Hamburger? */}
    </header>
  );
};

export default Header;
