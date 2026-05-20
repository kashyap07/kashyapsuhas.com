import Link from "next/link";
import { ReactNode } from "react";

import { Wrapper } from "@components/ui";

import NavLinks from "../NavLinks";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header>
        <Wrapper className="w-full pt-12">
          <Link
            className="font-display text-accent text-3xl font-semibold"
            href={"/"}
          >
            Suhas Kashyap
          </Link>
          <NavLinks />
          <hr className="mt-4 border-line" />
        </Wrapper>
      </header>

      <main className="flex min-h-screen flex-col items-center justify-between pb-12 pt-8">
        {children}
      </main>
    </>
  );
}
