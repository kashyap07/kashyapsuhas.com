import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { TouchMarquee, Wrapper } from '@/components/ui';

export const metadata: Metadata = {
  metadataBase: new URL("https://kashyapsuhas.com"),
  title: "Suhas Kashyap",
  description:
    "Suhas Kashyap's personal website. See blogs, photos, reviews, tools, contact details.",
  keywords: ["Suhas", "Kashyap", "Suhas Kashyap", "blog", "photos", "tools"],
  alternates: {
    canonical: "https://kashyapsuhas.com/",
  },
  openGraph: {
    images: ["/suhas_og.jpg"],
  },
};

const NavLinks = () => (
  <ul className="flex flex-col gap-3 text-4xl">
    <li>
      <Link href={"/blog"}>Blog</Link>
    </li>
    <li>
      <Link href={"/photos"}>Photos</Link>
    </li>
    <li>
      <Link href={"/reviews"}>Reviews</Link>
    </li>
    <li>
      <Link href={"/tools"}>Tools</Link>
    </li>
    <li>
      <Link href={"/contact"}>Contact</Link>
    </li>
  </ul>
);

const TopSP = () => (
  <Wrapper
    maxWidth="FULL_SCREEN_WIDTH"
    data-locator-id="top-sp-wrapper"
    className="relative flex flex-col gap-24 sm:hidden"
  >
    {/* START top sp pre-fold */}
    <Wrapper
      maxWidth="FULL_SCREEN_WIDTH"
      className="group pointer-events-none relative flex h-svh"
    >
      {/* START profile image bg */}
      <div data-locator-id="top-sp-doubleimage-wrapper" className="relative">
        <div className="absolute aspect-[1/2] w-screen overflow-hidden">
          <Image
            src="/suhas_hike.jpg"
            alt="suhas kashyap hiking"
            fill={true}
            priority
            className="imageMask_SP pointer-events-none z-10 object-cover"
            data-locator-id="top-sp-doubleimage-profile-base"
          />

          <Image
            src="/suhas_hike_nobg.png"
            alt="suhas kashyap hiking, but without background"
            aria-hidden="true"
            fill={true}
            quality={100}
            className="imageMask_SP pointer-events-none z-30 object-cover"
            data-locator-id="top-sp-doubleimage-profile-nobg"
          />
        </div>

        <TouchMarquee />
      </div>
      {/* END profile image bg */}

      {/* START pre-fold text */}
      <Wrapper className="absolute bottom-4 flex flex-col justify-end">
        <h1 className="z-40 m-0 flex flex-col justify-center gap-2">
          <span className="text-3xl">Hi, I&apos;m</span>
          <span className="mb-2 text-5xl leading-[0.9]">Suhas Kashyap</span>
          <span className="text-2xl">
            Welcome to my slice of the Interwebs.
          </span>
        </h1>
      </Wrapper>
      {/* END pre-fold text */}
    </Wrapper>
    {/* END top sp pre-fold */}

    {/* START navlinks */}
    <Wrapper
      data-locator-id="top-sp-navlinks"
      maxWidth="NARROW"
      className="flex flex-col justify-center pb-32"
    >
      <NavLinks />
    </Wrapper>
    {/* END navlinks */}
  </Wrapper>
);

const TopPC = () => (
  <Wrapper
    maxWidth="NARROW"
    data-locator-id="top-pc-wrapper"
    className="hidden min-h-screen w-full grid-cols-2 items-center justify-between gap-10 py-20 sm:grid sm:px-4 lg:px-0"
  >
    {/* START top pc left side */}
    <div className="z-10 grid grid-cols-1 gap-32">
      <div className="relative flex flex-col justify-center gap-2">
        <span className="text-3xl">Hi, I&apos;m</span>
        <h1 className="mb-2 text-nowrap sm:text-4xl md:text-[5.5rem] md:leading-[0.9]">
          Suhas Kashyap
        </h1>
        <span className="text-3xl">Welcome to my slice of the Interwebs.</span>
      </div>

      <div className="flex flex-col justify-center">
        <NavLinks />
      </div>
    </div>
    {/* END top pc left side */}

    {/* START top pc right side */}
    <div className="group relative">
      <div className="relative z-10 translate-x-6">
        <Image
          src="/suhas_nobg.png"
          alt="suhas kashyap hiking"
          height={500}
          width={500}
          priority
          quality={100}
          className="imageMask_PC pointer-events-none relative top-0 z-10 origin-bottom-left transform object-cover drop-shadow-xl"
        />
      </div>
    </div>
    {/* END top pc right side */}
  </Wrapper>
);

export default function Home() {
  return (
    <main className="max-w-screen select-none overflow-hidden font-semibold">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            url: "https://kashyapsuhas.com",
            description:
              "Suhas Kashyap's personal website. See blogs, photos, reviews, tools, contact details.",
            name: "Suhas Kashyap",
            image: "/suhas_og.jpg",
          }),
        }}
      />
      <TopSP />
      <TopPC />
    </main>
  );
}
