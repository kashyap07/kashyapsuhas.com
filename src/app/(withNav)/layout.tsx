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
        <Wrapper className="w-full pt-12">
          <Link className="text-5xl" href={"/"}>
            Suhas Kashyap
          </Link>
        </Wrapper>
      </header>

      <main className="flex min-h-screen flex-col items-center justify-between py-12 md:py-24">
        {children}
      </main>
    </>
  );
}
