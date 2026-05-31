import Link from "next/link";
import { ReactNode } from "react";

import { Wrapper } from "@components/ui";

import Footer from "../Footer";
import NavLinks from "../NavLinks";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* skip link: first focusable element, hidden until focused */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-foreground focus:px-3 focus:py-2 focus:font-sans focus:text-sm focus:text-background focus:no-underline"
      >
        Skip to main content
      </a>

      <header>
        <Wrapper className="w-full pt-12">
          <Link
            className="font-display text-3xl font-bold text-accent"
            href={"/"}
          >
            Suhas Kashyap
          </Link>
          <NavLinks />
          <hr className="mt-4 border-line" />
        </Wrapper>
      </header>

      <main
        id="main"
        className="flex min-h-screen flex-col items-center justify-between pb-12 pt-8"
      >
        {children}
      </main>

      <Footer />
    </>
  );
}
