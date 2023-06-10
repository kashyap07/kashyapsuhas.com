import { MaxWidthWrapper } from '@/components/Wrapper';
import { MaxWidth } from '@/variables/sizes';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="pt-20 md:px-20 md:pt-24">
      <MaxWidthWrapper
        maxWidth={MaxWidth.Wide}
        className="mb-20 flex w-full flex-col items-center justify-center"
      >
        <div className="mx-auto mb-10 flex flex-col gap-2">
          <span className="text-3xl">Hi. I&apos;m</span>
          <h1 className="mb-2 text-6xl md:text-[11rem] md:leading-[8rem]">SUHAS KASHYAP</h1>
          <span className="text-3xl">Welcome to my slice of the Interwebs.</span>
        </div>

        <Image
          src={'/profile_640.jpg'}
          alt="suhas kashyap image"
          height={300}
          width={300}
          priority={true}
          className="mx-auto rounded-2xl"
        />
      </MaxWidthWrapper>

      <MaxWidthWrapper
        maxWidth={MaxWidth.Narrow}
        className="mb-40 flex w-full flex-col justify-center"
      >
        <h2 className="text-3xl">LINKS</h2>
        <ul>
          <li className="flex h-40 items-center justify-between text-9xl">
            <Link href={'/blog'}>BLOG</Link>
          </li>
          <li className="flex h-40 items-center justify-between text-9xl">
            <Link href={'/resume'}>RESUME</Link>
          </li>
          <li className="flex h-40 items-center justify-between text-9xl">
            <Link href={'/contact'}>CONTACT</Link>
          </li>
        </ul>
      </MaxWidthWrapper>
    </main>
  );
}
