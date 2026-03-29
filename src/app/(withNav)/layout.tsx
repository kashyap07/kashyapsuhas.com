import { ReactNode } from "react";

import { Wrapper } from "@components/ui";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header>
        <Wrapper className="w-full pt-12">
          <a
            className="text-accent text-5xl font-semibold"
            href="/"
            style={{ viewTransitionName: "site-title" }}
          >
            Suhas Kashyap
          </a>
        </Wrapper>
      </header>

      <main className="flex min-h-screen flex-col items-center justify-between pb-12 pt-8">
        {children}
      </main>
    </>
  );
}
