import Image from "next/image";

import { Wrapper } from "@components/ui";

import NavLinks from "./NavLinks";

export default function TopPC() {
  return (
    <Wrapper
      maxWidth="NARROW"
      data-locator-id="top-pc-wrapper"
      className="hidden min-h-screen w-full grid-cols-[1fr_2fr] items-center justify-between gap-10 py-20 sm:grid sm:px-4 lg:px-0"
    >
      <div className="z-10 grid grid-cols-1 gap-32">
        <div className="relative flex flex-col justify-center gap-2">
          <span className="text-3xl">Hi, I&apos;m</span>
          <h1
            className="mb-2 text-nowrap sm:text-4xl md:text-[5.5rem] md:leading-[0.9]"
            style={{ viewTransitionName: "site-title" }}
          >
            Suhas Kashyap
          </h1>
          <span className="text-3xl">Welcome to my slice of the Interwebs.</span>
        </div>

        <div className="flex flex-col justify-center">
          <NavLinks />
        </div>
      </div>

      <div className="group relative">
        <div className="relative z-10 w-full">
          <Image
            src="/kedar-bw.png"
            alt="suhas kashyap"
            height={500}
            width={500}
            quality={100}
            className="pointer-events-none relative left-12 top-24 -z-10 w-full origin-bottom-left transform object-cover"
          />
        </div>
      </div>
    </Wrapper>
  );
}
