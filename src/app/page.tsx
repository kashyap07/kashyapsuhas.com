import Image from "next/image";
import Link from "next/link";

import { Wrapper } from "@/components/Wrapper";
import { MaxWidth } from "@/variables/sizes";

export const metadata = {
  title: "Suhas Kashyap",
  description: "Welcome to Suhas Kashyap's slice of the interwebs.",
};

const PreFold_SP = () => (
  <div className="sm:hidden">
    <Wrapper
      maxWidth={MaxWidth.FullWidth}
      className="flex h-screen min-h-[880px] px-0 sm:hidden"
    >
      {/* SP bg image begin */}
      <div className="absolute aspect-[1/2] w-screen overflow-hidden sm:hidden">
        <Image
          src="/suhas_hike.jpg"
          alt="suhas kashyap hiking"
          fill={true}
          sizes=""
          priority
          quality={100}
          className="imageMask_SP top-0 origin-bottom-left transform object-cover"
        />
      </div>
      {/* SP bg image end */}

      <Wrapper
        maxWidth={MaxWidth.Narrow}
        className="relative flex flex-col justify-end py-32"
      >
        <span className="text-2xl drop-shadow-sm">Hi. I&apos;m</span>
        <h1 className="mb-2 text-7xl leading-[0.9]">Suhas Kashyap</h1>
        <span className="mb-8 text-2xl">
          Welcome to my slice of the Interwebs.
        </span>
      </Wrapper>
    </Wrapper>

    <Wrapper
      maxWidth={MaxWidth.Narrow}
      className="flex flex-col justify-center pb-32"
    >
      <h2 className="text-2xl">Links</h2>
      <ul className="flex flex-col gap-4">
        <li className="flex items-center justify-between text-4xl">
          <Link href={"/blog"}>Blog</Link>
        </li>
        <li className="flex items-center justify-between text-4xl">
          <Link href={"/photos"}>Photos</Link>
        </li>
        <li className="flex items-center justify-between text-4xl">
          <Link href={"/resume"}>Resume</Link>
        </li>
        <li className="flex items-center justify-between text-4xl">
          <Link href={"/contact"}>Contact</Link>
        </li>
      </ul>
    </Wrapper>
  </div>
);

const PreFold_PC = () => (
  <Wrapper
    maxWidth={MaxWidth.Narrow}
    className="hidden h-screen w-full items-center justify-between px-0 py-32 sm:flex"
  >
    <div className="flex flex-col gap-36">
      <div className="relative flex flex-col justify-center">
        <span className="text-2xl drop-shadow-sm">Hi. I&apos;m</span>
        <h1 className="mb-2 text-7xl leading-[0.9]">Suhas Kashyap</h1>
        <span className="mb-8 text-2xl">
          Welcome to my slice of the Interwebs.
        </span>
      </div>

      <div className="flex flex-col justify-center">
        <h2 className="mb-2 text-2xl">Links</h2>
        <ul className="flex flex-col gap-4">
          <li className="flex items-center justify-between text-4xl">
            <Link href={"/blog"}>Blog</Link>
          </li>
          <li className="flex items-center justify-between text-4xl">
            <Link href={"/photos"}>Photos</Link>
          </li>
          <li className="flex items-center justify-between text-4xl">
            <Link href={"/resume"}>Resume</Link>
          </li>
          <li className="flex items-center justify-between text-4xl">
            <Link href={"/contact"}>Contact</Link>
          </li>
        </ul>
      </div>
    </div>

    <div className="">
      <Image
        src="/suhas_nobg.png"
        alt="suhas kashyap hiking"
        height={500}
        width={500}
        sizes=""
        priority
        quality={100}
        className="imageMask_PC top-0 origin-bottom-left transform object-cover"
      />
    </div>
  </Wrapper>
);

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between font-semibold">
      <PreFold_SP />
      <PreFold_PC />
    </main>
  );
}
