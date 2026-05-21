import Link from "next/link";

import { Wrapper } from "@components/ui";

export const metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <Wrapper className="flex h-screen max-h-screen w-full flex-col items-center justify-center gap-2 text-center">
      <h1 className="flex flex-col gap-0 text-9xl font-medium">
        <span>404</span>
      </h1>
      <Link
        href="/"
        className="text-xl font-medium text-accent hover:opacity-75 md:text-5xl"
      >
        you&apos;re lost. go home.
      </Link>
    </Wrapper>
  );
}
