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
    <Wrapper className="flex min-h-[50vh] flex-col items-center justify-center gap-6 text-center">
      <p className="text-3xl">something went wrong</p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className={cn(
            "text-2xl font-bold text-columbiaYellow underline underline-offset-4",
          )}
        >
          try again
        </button>
        <Link
          href="/"
          className={cn("text-2xl font-bold text-columbiaYellow")}
        >
          go home
        </Link>
      </div>
    </Wrapper>
  );
}
