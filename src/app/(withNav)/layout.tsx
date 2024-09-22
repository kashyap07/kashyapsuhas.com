import Link from "next/link";

import { Wrapper } from "@/components/Wrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header>
        <Wrapper className="pt-12 w-full">
          <Link className="text-5xl" href={"/"}>
            SUHAS KASHYAP
          </Link>
        </Wrapper>
      </header>

      <main className="flex min-h-screen flex-col items-center justify-between py-12 md:py-24">
        {children}
      </main>
    </>
  );
}
