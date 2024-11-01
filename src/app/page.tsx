import Image from "next/image";
import Link from "next/link";

import { Wrapper } from "@/components/Wrapper";
import { MaxWidth } from "@/variables/sizes";
import { TouchMarquee } from "@/components/TouchMarquee";

const TopSP = () => {
  return (
    <div className="sm:hidden">
      <Wrapper
        maxWidth={MaxWidth.FullWidth}
        className="group flex h-screen min-h-[880px] max-h-[1200px] px-0 sm:hidden"
      >
        <div className="relative">
          <div className="absolute aspect-[1/2] w-screen overflow-hidden sm:hidden">
            <Image
              src="/suhas_hike.jpg"
              alt="suhas kashyap hiking"
              fill={true}
              sizes=""
              priority
              className="imageMask_SP top-0 z-10 origin-bottom-left transform object-cover pointer-events-none"
            />
          </div>

          <div className="absolute aspect-[1/2] w-screen overflow-hidden sm:hidden">
            <Image
              src="/suhas_hike_nobg.png"
              alt="suhas kashyap hiking"
              fill={true}
              sizes=""
              // priority
              quality={100}
              className="imageMask_SP top-0 z-30 origin-bottom-left transform object-cover pointer-events-none"
            />
          </div>

          {/* cursor is a god */}
          <TouchMarquee />
        </div>

        <Wrapper
          maxWidth={MaxWidth.Narrow}
          className="relative flex flex-col justify-end py-40"
        >
          <div className="relative z-40 flex flex-col justify-center gap-2">
            <span className="text-3xl">Hi, I&apos;m</span>
            <h1 className="mb-2 text-[3.2rem] leading-[0.9]">
              Suhas Kashyap
            </h1>
            <span className="text-2xl">
              Welcome to my slice of the Interwebs.
            </span>
          </div>
        </Wrapper>
      </Wrapper>

      <Wrapper
        maxWidth={MaxWidth.Narrow}
        className="flex flex-col justify-center pb-32"
      >
        <ul className="flex flex-col gap-2">
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
};

const TopPC = () => (
  <Wrapper
    maxWidth={MaxWidth.Narrow}
    className="hidden min-h-screen w-full grid-cols-2 items-center justify-between gap-10 py-20 sm:grid sm:px-4 lg:px-0"
  >
    <div className="z-10 grid grid-cols-1 gap-32">
      <div className="relative flex flex-col justify-center gap-2">
        <span className="text-3xl">Hi, I&apos;m</span>
        <h1 className="mb-2 text-nowrap sm:text-4xl md:text-[5.5rem] md:leading-[0.9]">
          Suhas Kashyap
        </h1>
        <span className="text-3xl">Welcome to my slice of the Interwebs.</span>
      </div>

      <div className="flex flex-col justify-center">
        {/* <h2 className="mb-2 text-2xl">Links</h2> */}
        <ul className="flex flex-col gap-2">
          <li className="text-4xl">
            <Link href={"/blog"}>Blog</Link>
          </li>
          <li className="text-4xl">
            <Link href={"/photos"}>Photos</Link>
          </li>
          <li className="text-4xl">
            <Link href={"/resume"}>Resume</Link>
          </li>
          <li className="text-4xl">
            <Link href={"/contact"}>Contact</Link>
          </li>
        </ul>
      </div>
    </div>

    <div className="group relative">
      {/* Marquee background */}
      <div className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 -rotate-12 group-hover:opacity-100">
        <div className="absolute inset-0">
          <div className="animate-marquee absolute -inset-10 -mt-10 whitespace-nowrap text-nowrap text-[14rem] text-[#fecb47] drop-shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
            {Array(20)
              .fill("SUHAS KASHYAP")
              .map((text, i) => (
                <span key={i} className="mr-10">
                  {text}
                </span>
              ))}
          </div>
        </div>
      </div>

      <div className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 -rotate-12 group-hover:opacity-55">
        <div className="absolute inset-0">
          <div className="animate-marquee absolute -inset-10 mt-[140px] whitespace-nowrap text-nowrap text-[14rem] text-[#595D68] drop-shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
            {Array(20)
              .fill("SUHAS KASHYAP")
              .map((text, i) => (
                <span key={i} className="mr-10">
                  {text}
                </span>
              ))}
          </div>
        </div>
      </div>

      <div className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 -rotate-12 group-hover:opacity-20">
        <div className="absolute inset-0">
          <div className="animate-marquee absolute -inset-10 mt-[320px] whitespace-nowrap text-nowrap text-[14rem] text-gray-100 drop-shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
            {Array(20)
              .fill("SUHAS KASHYAP")
              .map((text, i) => (
                <span key={i} className="mr-10">
                  {text}
                </span>
              ))}
          </div>
        </div>
      </div>

      <div className="relative z-10">
        {/* Image */}
        <Image
          src="/suhas_nobg.png"
          alt="suhas kashyap hiking"
          height={500}
          width={500}
          sizes=""
          priority
          quality={100}
          className="imageMask_PC relative top-0 z-10 origin-bottom-left transform object-cover drop-shadow-xl"
        />
      </div>
    </div>
  </Wrapper>
);

export default function Home() {
  return (
    <main className="max-w-screen overflow-hidden font-semibold">
      <TopSP />
      <TopPC />
    </main>
  );
}
