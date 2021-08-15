import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";

const Header = () => {
  const headerNavLinks = [
    { title: "Blog", href: "/blog" },
    { title: "Work", href: "/work" },
    { title: "Contact", href: "/contact" },
  ];

  return (
    <header className="bg-white backdrop-filter backdrop-blur-sm">
      <MaxWidthWrapper>
        <div className="flex flex-col items-center sm:flex-row sm:justify-between pb-10 pt-4 gap-y-2 z-20">
          <div>
            <Link href="/" passHref>
              <div className="flex items-center justify-between">
                <a
                  className="text-5xl font-fancy font-bold p-1 cursor-pointer bg-gradient-to-br from-blue-900 via-headings-start to-headings-end bg-clip-text text-transparent"
                  aria-label="Home Page"
                >
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
        </div>
      </MaxWidthWrapper>

      {/* Maybe have clean, color, dark themes */}
      {/* Hamburger? */}
    </header>
  );
};

export default Header;
