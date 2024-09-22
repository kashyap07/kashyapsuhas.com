import Image from "next/image";
import Link from "next/link";

import { Wrapper } from "@/components/Wrapper";
import { MaxWidth } from "@/variables/sizes";

const BGImg = () => (
  <div className="fixed -z-10 w-full h-full overflow-hidden">
    <Image
      src="/suhas_hike.jpg"
      alt="suhas kashyap image"
      layout="fill"
      objectFit="cover"
      objectPosition="10% 50%"
      priority
      quality={100}
      className="transform scale-110"
    />
  </div>
);

const PreFold = () => (
  <Wrapper
    maxWidth={MaxWidth.Screen}
    className="flex justify-end flex-col py-24"
  >
    <span className="text-2xl drop-shadow-sm textShadow">Hi. I&apos;m</span>
    <h1 className="mb-2 text-7xl md:text-[11rem] md:leading-[8rem] textShadow">
      SUHAS KASHYAP
    </h1>
    <span className="text-2xl textShadow">
      Welcome to my slice of the Interwebs.
    </span>
  </Wrapper>
  // </div>
);

const PostFold = () => (
  <Wrapper
    maxWidth={MaxWidth.Screen}
    className="flex justify-end flex-col py-24"
  >
    <h2 className="text-2xl">LINKS</h2>
    <ul className="flex flex-col gap-4 md:gap-8">
      <li className="flex items-center justify-between text-4xl md:text-9xl">
        <Link href={"/blog"}>BLOG</Link>
      </li>
      <li className="flex items-center justify-between text-4xl md:text-9xl">
        <Link href={"/photos"}>PHOTOS</Link>
      </li>
      <li className="flex items-center justify-between text-4xl md:text-9xl">
        <Link href={"/resume"}>RESUME</Link>
      </li>
      <li className="flex items-center justify-between text-4xl md:text-9xl">
        <Link href={"/contact"}>CONTACT</Link>
      </li>
    </ul>
  </Wrapper>
);

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between md:p-24 text-background">
      <BGImg />
      <PreFold />
      <PostFold />
    </main>
  );
}
