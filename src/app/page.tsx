import Image from "next/image";
import Link from "next/link";

import { Wrapper } from "@/components/Wrapper";
import { MaxWidth } from "@/variables/sizes";
import { useEffect, useState } from "react";

export const metadata = {
  title: "Suhas Kashyap",
  description: "Welcome to Suhas Kashyap's slice of the interwebs.",
};

const BGImg = () => (
  <div className="fixed">
    <div className="h-svh w-lvw overflow-hidden md:left-0 md:w-full">
      <Image
        src="/suhas_hike_2.jpg"
        alt="suhas kashyap hiking"
        fill={true}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority
        quality={100}
        className="imageMask top-0 origin-bottom-left transform object-cover md:absolute md:!left-1/2 md:max-w-[40rem] md:-translate-x-1/2"
      />
    </div>

    <div className="navbarHeight fixed w-lvw overflow-hidden bg-black" />
  </div>
);

const PreFold = () => (
  <section>
    <Wrapper
      maxWidth={MaxWidth.Narrow}
      className="textShadow relative flex h-lvh min-h-lvh flex-col justify-end py-32"
    >
      <span className="text-2xl drop-shadow-sm">Hi. I&apos;m</span>
      <h1 className="mb-2 text-7xl leading-[0.9]">Suhas Kashyap</h1>
      <span className="mb-2 text-2xl">
        Welcome to my slice of the Interwebs.
      </span>
    </Wrapper>
  </section>
);

const PostFold = () => (
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
);

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between font-semibold">
      <BGImg />
      <PreFold />
      <PostFold />
    </main>
  );
}
