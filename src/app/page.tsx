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
    className="relative mb-0 flex h-screen flex-col gap-24 sm:hidden"
  >
    {/* START top sp pre-fold */}
    {/* all this nonsense because ios 26 safari has dvh at half the navbar wtf */}
    <Wrapper
      maxWidth="FULL_SCREEN_WIDTH"
      className="group pointer-events-none relative mb-0 flex h-screen flex-col"
    >
      {/* START profile image bg */}
      <div
        data-locator-id="top-sp-doubleimage-wrapper"
        className="relative h-[95%]"
      >
        <div className="absolute -top-8 aspect-[1/2] w-screen overflow-hidden bg-white">
          <Image
            src="/kedar-sp-2.jpg"
            alt="suhas kashyap"
            fill={true}
            quality={50}
            className="imageMask_SP pointer-events-none object-cover"
            data-locator-id="top-sp-doubleimage-profile-base"
          />

          <Image
            src="/kedar-sp-2-no-bg.png"
            alt="suhas kashyap"
            aria-hidden="true"
            fill={true}
            quality={100}
            className="imageMask_SP-2 pointer-events-none z-50 object-cover"
            data-locator-id="top-sp-doubleimage-profile-nobg"
          />
        </div>

        <TouchMarquee />
      </div>
      {/* END profile image bg */}

      <section
        data-locator-id="top-sp-bottom-bar"
        className="h-[5%] w-screen bg-none"
      ></section>
    </Wrapper>
    <Wrapper
      maxWidth="NARROW"
      className="absolute top-[4.5rem] flex flex-col text-right"
    >
      <div className="z-40 m-0 flex flex-col justify-center">
        <span className="text-3xl">Hi, I&apos;m</span>
        <h1 className="-mt-2 mb-2 text-nowrap text-5xl leading-tight">
          Suhas Kashyap
        </h1>
        <span className="text-2xl leading-tight">
          Welcome to my <br />
          slice of the Interwebs.
        </span>
      </div>
    </Wrapper>
    <Wrapper
      maxWidth="NARROW"
      className="absolute bottom-[36%] z-40 flex w-full translate-y-1/2 flex-col text-right"
    >
      <div className="grid w-full self-end rounded bg-white/35 p-4">
        <NavLinks />
      </div>
    </Wrapper>
  </Wrapper>
);

const TopPC = () => (
  <Wrapper
    maxWidth="NARROW"
    data-locator-id="top-pc-wrapper"
    className="hidden min-h-screen w-full grid-cols-[1fr_2fr] items-center justify-between gap-10 py-20 sm:grid sm:px-4 lg:px-0"
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
      <div className="relative z-10 w-full">
        <Image
          src="/kedar-bw.png"
          alt="suhas kashyap"
          height={500}
          width={500}
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
      {/* person schema */}
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

      {/* website schema */}
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
