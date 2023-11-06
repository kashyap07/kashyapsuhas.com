import Image from 'next/image';
import Link from 'next/link';

import { Wrapper } from '@/components/Wrapper';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between pt-24 md:p-24">
      <Wrapper className="mb-12 md:mb-20 flex w-full flex-col items-center justify-center gap-4">
        <div className="mx-auto mb-10 flex flex-col gap-2">
          <span className="text-3xl">Hi. I&apos;m</span>
          <h1 className="mb-2 text-6xl md:text-[11rem] md:leading-[8rem] text-shadow-white-glow">
            SUHAS KASHYAP
          </h1>
          <span className="text-3xl">
            Welcome to my slice of the Interwebs.
          </span>
        </div>

        <Image
          src={"/profile_640.jpg"}
          alt="suhas kashyap image"
          height={300}
          width={300}
          priority
          className="mx-auto rounded-2xl pointer-events-none"
        />
      </Wrapper>

      <Wrapper className="mb-40 flex w-full flex-col justify-center gap-4">
        <h2 className="text-3xl">LINKS</h2>
        <ul className="flex flex-col gap-4 md:gap-8">
          <li className="flex items-center justify-between text-5xl md:text-9xl">
            <Link href={"/blog"}>BLOG</Link>
          </li>
          <li className="flex items-center justify-between text-5xl md:text-9xl">
            <Link href={"/photos"}>PHOTOS</Link>
          </li>
          <li className="flex items-center justify-between text-5xl md:text-9xl">
            <Link href={"/work"}>WORK</Link>
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
