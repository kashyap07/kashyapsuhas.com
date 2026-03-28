import Image from "next/image";

import { TouchMarquee, Wrapper } from "@components/ui";

import NavLinks from "./NavLinks";

export default function TopSP() {
  return (
    <Wrapper
      maxWidth="FULL_SCREEN_WIDTH"
      data-locator-id="top-sp-wrapper"
      className="relative mb-0 flex h-screen flex-col gap-24 sm:hidden"
    >
      {/* all this nonsense because ios 26 safari has dvh at half the navbar wtf */}
      <Wrapper
        maxWidth="FULL_SCREEN_WIDTH"
        className="group pointer-events-none relative mb-0 flex h-screen flex-col"
      >
        <div
          data-locator-id="top-sp-doubleimage-wrapper"
          className="relative h-[95%]"
        >
          <div className="absolute -top-8 aspect-[1/2] w-screen overflow-hidden bg-white">
            <Image
              src="/kedar-sp-2.jpg"
              alt="suhas kashyap"
              fill={true}
              quality={50}
              className="imageMask_SP pointer-events-none object-cover"
              data-locator-id="top-sp-doubleimage-profile-base"
            />

            <Image
              src="/kedar-sp-2-no-bg.png"
              alt="suhas kashyap"
              aria-hidden="true"
              fill={true}
              quality={100}
              className="imageMask_SP-2 pointer-events-none z-50 object-cover"
              data-locator-id="top-sp-doubleimage-profile-nobg"
            />
          </div>

          <TouchMarquee />
        </div>

        <section
          data-locator-id="top-sp-bottom-bar"
          className="h-[5%] w-screen bg-none"
        ></section>
      </Wrapper>
      <Wrapper
        maxWidth="NARROW"
        className="absolute top-[4.5rem] flex flex-col text-right"
      >
        <div className="z-40 m-0 flex flex-col justify-center">
          <span className="text-3xl">Hi, I&apos;m</span>
          <h1 className="-mt-2 mb-2 text-nowrap text-5xl leading-tight">
            Suhas Kashyap
          </h1>
          <span className="text-2xl leading-tight">
            Welcome to my slice
            <br />
            of the Interwebs
          </span>
        </div>
      </Wrapper>
      <Wrapper
        maxWidth="NARROW"
        className="absolute bottom-[36%] z-40 flex w-full translate-y-1/2 flex-col text-right"
      >
        <div className="grid w-full self-end rounded bg-white/35 p-4">
          <NavLinks />
        </div>
      </Wrapper>
    </Wrapper>
  );
}
