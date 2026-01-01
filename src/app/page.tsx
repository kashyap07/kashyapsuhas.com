import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { TouchMarquee, Wrapper } from "@components/ui";

export const metadata: Metadata = {
  title: "Suhas Kashyap",
  description:
    "Suhas Kashyap's slice of the interwebs. See blogs, photos, reviews, tools, contact details.",
  keywords: [
    "Suhas Kashyap",
    "Kashyap Suhas",
    "Suhas",
    "Kashyap",
    "Suhas Kashyap blog",
    "Suhas Kashyap developer",
    "Suhas Kashyap software engineer",
    "Suhas Kashyap frontend dev",
    "kashyapsuhas",
    "kashyap07",
    "Suhas Kashyap portfolio",
    "Suhas Kashyap website",
    "blog",
    "photos",
    "tools",
    "reviews",
  ],
  authors: [{ name: "Suhas Kashyap", url: "https://www.kashyapsuhas.com" }],
  creator: "Suhas Kashyap",
  publisher: "Suhas Kashyap",
  alternates: {
    canonical: "https://www.kashyapsuhas.com/",
  },
  openGraph: {
    type: "profile",
    title: "Suhas Kashyap",
    description:
      "Suhas Kashyap's slice of the interwebs. See blogs, photos, reviews, tools, contact details.",
    url: "https://www.kashyapsuhas.com",
    siteName: "Suhas Kashyap",
    locale: "en_US",
    images: [
      {
        url: "https://www.kashyapsuhas.com/suhas_og.jpg",
        width: 1200,
        height: 630,
        alt: "Suhas Kashyap - Software Dev",
      },
    ],
    firstName: "Suhas",
    lastName: "Kashyap",
    username: "kashyap07",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
            alt="suhas kashyap"
            fill={true}
            priority
            className="imageMask_SP pointer-events-none z-10 object-cover"
            data-locator-id="top-sp-doubleimage-profile-base"
          />

          <Image
            src="/suhas_hike_nobg.png"
            alt="suhas kashyap"
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
        <div className="z-40 m-0 flex flex-col justify-center gap-2">
          <span className="text-3xl">Hi, I&apos;m</span>
          <h1 className="mb-2 text-nowrap text-5xl leading-[0.9]">
            Suhas Kashyap
          </h1>
          <span className="text-2xl">
            Welcome to my slice of the Interwebs.
          </span>
        </div>
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
    className="hidden min-h-screen w-full grid-cols-[1fr_2.2fr] items-center justify-between gap-10 py-20 sm:grid sm:px-4 lg:px-0"
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
      <div className="relative -z-10 w-full">
        <Image
          src="/kedar-bw-3.png"
          alt="suhas kashyap"
          height={500}
          width={500}
          priority
          quality={100}
          className="pointer-events-none relative left-12 top-24 -z-10 w-full origin-bottom-left transform object-cover"
        />
      </div>
    </div>
    {/* END top pc right side */}
  </Wrapper>
);

export default function Home() {
  return (
    <main className="max-w-screen select-none overflow-hidden font-semibold">
      {/* Person Schema */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "@id": "https://www.kashyapsuhas.com/#person",
            name: "Suhas Kashyap",
            alternateName: ["Kashyap Suhas", "Suhas", "Kashyap"],
            url: "https://www.kashyapsuhas.com",
            image: {
              "@type": "ImageObject",
              url: "https://www.kashyapsuhas.com/suhas_og.jpg",
              width: 1200,
              height: 630,
            },
            jobTitle: "Software Dev",
            description:
              "Suhas Kashyap's slice of the interwebs. See blogs, photos, reviews, tools, contact details.",
            email: "mantles_arbours_00@icloud.com",
            sameAs: [
              "https://github.com/kashyap07",
              "https://www.linkedin.com/in/suhas-kashyap",
              "https://www.instagram.com/kashyap_07/",
            ],
            knowsAbout: [
              "Software Engineering",
              "Web Development",
              "JavaScript",
              "TypeScript",
              "React",
              "Next.js",
              "Image Processing",
              "Frontend Development",
            ],
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": "https://www.kashyapsuhas.com",
            },
          }),
        }}
      />

      {/* WebSite Schema */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "@id": "https://www.kashyapsuhas.com/#website",
            url: "https://www.kashyapsuhas.com",
            name: "Suhas Kashyap",
            description:
              "Suhas Kashyap's slice of the interwebs. See blogs, photos, reviews, tools, contact details.",
            author: {
              "@id": "https://www.kashyapsuhas.com/#person",
            },
            publisher: {
              "@id": "https://www.kashyapsuhas.com/#person",
            },
            inLanguage: "en-US",
          }),
        }}
      />

      <TopSP />
      <TopPC />
    </main>
  );
}
