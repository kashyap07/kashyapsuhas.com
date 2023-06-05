import { MaxWidthWrapper } from '@/components/Wrapper';
import { MaxWidth } from '@/variables/sizes';
import Image from 'next/image';


export default function Home() {
  return (
    <main className="pt-20 md:px-20 md:pt-32">


      <MaxWidthWrapper maxWidth={MaxWidth.Wide}>
        <div className="flex w-full flex-col items-center justify-center">
          <div className="mx-auto mb-20 flex flex-col gap-2 md:mb-28">
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
        </div>
      </MaxWidthWrapper>
    </main>
  );
}
