import Image from "next/image";
import Link from "next/link";

import { Wrapper } from "@/components/Wrapper";
import { MaxWidth } from "@/variables/sizes";

export const metadata = {
  title: "Suhas Kashyap",
  description: "Welcome to Suhas Kashyap's slice of the interwebs.",
};

const BGImg = () => (
  <div className="stuff absolute h-svh w-lvw overflow-hidden md:left-0 md:w-full">
    <Image
      src="/suhas_hike.jpg"
      alt="suhas kashyap hiking"
      layout="fill"
      objectFit="cover"
      objectPosition="0% 0%"
      priority
      quality={100}
      className="imageMask top-0 origin-bottom-left scale-[1.15] transform md:absolute md:!left-1/2 md:max-w-[40rem] md:-translate-x-1/2 md:scale-100"
    />
  </div>
);

const PreFold = () => (
  <section>
    <BGImg />

    <Wrapper
      maxWidth={MaxWidth.Narrow}
      className="textShadow relative flex h-lvh min-h-lvh flex-col justify-end py-32"
    >
      <span className="text-2xl drop-shadow-sm">Hi. I&apos;m</span>
      <h1 className="mb-2 text-7xl leading-[0.9]">Suhas Kashyap</h1>
      <span className="mb-6 text-2xl">
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
    <main className="flex h-lvh min-h-lvh flex-col items-center justify-between font-semibold">
      <PreFold />
      <PostFold />
    </main>
  );
}
