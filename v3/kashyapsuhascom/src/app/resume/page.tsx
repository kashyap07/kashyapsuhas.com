import Image from "next/image";
import Link from "next/link";

import { Wrapper } from "@/components/Wrapper";
import { MaxWidth } from "@/variables/sizes";

export default function Resume() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between pt-24 md:p-24">
      <Wrapper
        maxWidth={MaxWidth.Narrow}
        className="mb-12 md:mb-20 flex w-full flex-col items-center justify-center gap-2"
      >
        <div className="mx-auto mb-10 flex flex-col gap-2 w-full">
          <span className="text-3xl">Hello</span>
          <br />
          <span className="text-3xl">
            I currently work for Rakuten India <br className="md:hidden" />
            as Senior Software Engineer II .
            <br />
            <br className="md:hidden" />
            Based out of Bengaluru, India.
          </span>
        </div>

        <div className="mx-auto mb-10 flex flex-col gap-2 w-full">
          <span className="text-3xl">
            Shareable link for RESUME:{" "}
            <Link
              href={"https://www.kashyapsuhas.com/resume"}
              aria-label="Follow for resume"
              target="_blank"
              className="neon-flicker--primary"
            >
              kashyapsuhas.com/resume
            </Link>
          </span>
        </div>
      </Wrapper>
    </main>
  );
}
