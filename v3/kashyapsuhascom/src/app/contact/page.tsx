import Image from "next/image";
import Link from "next/link";

import { Wrapper } from "@/components/Wrapper";
import { MaxWidth } from "@/variables/sizes";

export default function Contact() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between pt-24 md:p-24">
      <Wrapper
        maxWidth={MaxWidth.Narrow}
        className="mb-12 md:mb-20 flex w-full flex-col md:flex-row items-center justify-center gap-4"
      >
        <div className="mx-auto mb-10 flex flex-col gap-2 content-between w-full">
          {/* <h1 className="mb-2 text-6xl md:text-[11rem] md:leading-[8rem] text-shadow-white-glow">
            CONTACT
          </h1> */}
          <span className="text-3xl">Well hello there</span>
          <br />
          <span className="text-3xl">
            I currently work for Rakuten India
            <br />
            as Senior Software Engineer II
          </span>
        </div>

        <a className="" href="/" target="_blank" rel="noopener noreferrer">
          <Image
            src={"/profile_nobg.png"}
            alt="suhas kashyap image"
            height={300}
            width={300}
            priority
            className="mx-auto rounded-2xl pointer-events-none"
          />
        </a>
      </Wrapper>

      <Wrapper
        maxWidth={MaxWidth.Narrow}
        className="mb-40 flex w-full flex-col justify-center gap-4"
      >
        <h2 className="text-3xl">LINKS</h2>
        <ul className="flex flex-col gap-4 md:gap-8">
          <li className="flex items-center justify-between text-5xl md:text-9xl">
            <Link href={"/blog"}>BLOG</Link>
          </li>
          <li className="flex items-center justify-between text-5xl md:text-9xl">
            <Link href={"/photos"}>PHOTOS</Link>
          </li>
          <li className="flex items-center justify-between text-5xl md:text-9xl">
            <Link href={"/resume"}>RESUME</Link>
          </li>
          <li className="flex items-center justify-between text-5xl md:text-9xl">
            <Link href={"/contact"}>CONTACT</Link>
          </li>
        </ul>
      </Wrapper>
    </main>
  );
}

{
  /* <code className="font-mono font-bold">src/app/page.tsx</code> */
}
