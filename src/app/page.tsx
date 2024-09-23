import Image from "next/image";
import Link from "next/link";

import { Wrapper } from "@/components/Wrapper";
import { MaxWidth } from "@/variables/sizes";

const BGImg = () => (
  <div className="fixed -z-10 w-lvw h-lvh overflow-hidden">
    <Image
      src="/suhas_hike.jpg"
      alt="suhas kashyap hiking"
      layout="fill"
      objectFit="cover"
      objectPosition="0% 0%"
      priority
      quality={100}
      className="transform scale-110 origin-bottom-left left-0 top-0"
    />
  </div>
);

const PreFold = () => (
  <Wrapper
    maxWidth={MaxWidth.Screen}
    className="flex justify-end flex-col py-32 min-h-lvh h-lvh"
  >
    <span className="text-2xl drop-shadow-sm">Hi. I&apos;m</span>
    <h1 className="mb-2 text-7xl">SUHAS KASHYAP</h1>
    <span className="text-2xl">Welcome to my slice of the Interwebs.</span>
  </Wrapper>
);

const PostFold = () => (
  <Wrapper
    maxWidth={MaxWidth.Screen}
    className="flex justify-end flex-col py-32 min-h-lvh h-lvh"
  >
    <h2 className="text-2xl">LINKS</h2>
    <ul className="flex flex-col gap-4">
      <li className="flex items-center justify-between text-4xl">
        <Link href={"/blog"}>BLOG</Link>
      </li>
      <li className="flex items-center justify-between text-4xl">
        <Link href={"/photos"}>PHOTOS</Link>
      </li>
      <li className="flex items-center justify-between text-4xl">
        <Link href={"/resume"}>RESUME</Link>
      </li>
      <li className="flex items-center justify-between text-4xl">
        <Link href={"/contact"}>CONTACT</Link>
      </li>
    </ul>
  </Wrapper>
);

export default function Home() {
  return (
    <main className="flex min-h-lvh h-lvh flex-col items-center justify-between text-background textShadow">
      <BGImg />
      <PreFold />
      <PostFold />
    </main>
  );
}
