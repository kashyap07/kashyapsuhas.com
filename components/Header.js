import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";

const Header = () => {
  const headerNavLinks = [
    { title: "Blog", href: "/blog" },
    { title: "Work", href: "/work" },
    { title: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 bg-background bg-opacity-50 backdrop-filter backdrop-blur-xl z-50">
      <MaxWidthWrapper>
        <div className="flex flex-col items-center sm:flex-row sm:justify-between py-4 gap-y-2 z-50">
          <div>
            <Link href="/" passHref>
              <div className="flex items-center justify-between">
                <a className="logo" aria-label="Home Page">
                  Suhas Kashyap
                </a>
              </div>
            </Link>
          </div>
          <div className="items-center">
            <div className="flex gap-2">
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

        {/* <div className="drawer py-4 z-20">
          <input
            id="hamburger-menu"
            type="checkbox"
            className="drawer-toggle"
          />
          <div className="flex flex-col drawer-content">
            <div className="w-full navbar p-0">
              <div className="flex-1">
                <Link href="/" passHref>
                  <div className="flex items-center justify-between">
                    <a className="logo" aria-label="Home Page">
                      Suhas Kashyap
                    </a>
                  </div>
                </Link>
              </div>

              <div className="flex-none hidden lg:block">
                <ul className="menu horizontal gap-2">
                  {headerNavLinks.map((link) => (
                    <Link key={link.title} href={link.href} passHref>
                      <li>
                        <a className="px-5 py-0.5 border rounded-full text-gray-900">
                          {link.title}
                        </a>
                      </li>
                    </Link>
                  ))}
                </ul>
              </div>

              <div className="flex-none lg:hidden">
                <label
                  htmlFor="hamburger-menu"
                  className="btn btn-square btn-ghost"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="inline-block w-6 h-6 stroke-current"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    ></path>
                  </svg>
                </label>
              </div>
            </div>
          </div>

          <div className="drawer-side">
            <label htmlFor="hamburger-menu" className="drawer-overlay"></label>
            <ul className="menu overflow-y-auto w-80 bg-base-100">
              {headerNavLinks.map((link) => (
                <Link key={link.title} href={link.href} passHref>
                  <li>
                    <a className="px-5 py-0.5 border rounded-full text-gray-900">
                      {link.title}
                    </a>
                  </li>
                </Link>
              ))}
            </ul>
          </div>
        </div> */}
      </MaxWidthWrapper>

      {/* Maybe have clean, color, dark themes */}
      {/* Hamburger? */}
    </header>
  );
};

export default Header;
