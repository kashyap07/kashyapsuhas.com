import { useState } from "react";
import Link from "next/link";

const Header = () => {
  const headerNavLinks = [
    { title: "Blog", href: "/blog" },
    { title: "Work", href: "/work" },
    { title: "Contact", href: "/contact" },
  ];

  return (
    <header className="flex flex-col sm:flex-row sm:justify-between py-10 gap-y-2">
      <div>
        <Link href="/" passHref>
          <div className="flex items-center justify-between">
            <a
              className="text-2xl font-bold cursor-pointer bg-gradient-to-br from-blue-900 via-headings-start to-headings-end bg-clip-text text-transparent"
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
