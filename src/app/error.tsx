"use client";

import Link from "next/link";

import { Wrapper } from "@components/ui";
import cn from "@utils/cn";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Wrapper className="flex h-screen max-h-screen w-full flex-col items-center justify-center gap-6 text-center">
      <h1 className="text-[10rem] font-medium leading-none">500</h1>
      <p className="text-3xl">something went wrong</p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className={cn(
            "text-2xl font-bold text-accent underline underline-offset-4",
          )}
        >
          try again
        </button>
        <Link
          href="/"
          className={cn("text-2xl font-bold text-accent")}
        >
          go home
        </Link>
      </div>
    </Wrapper>
  );
}
