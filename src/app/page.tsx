import { Metadata } from "next";
import Image from "next/image";

import NavLinks from "./NavLinks";

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
    "Suhas Kashyap Rakuten",
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
        url: "https://www.kashyapsuhas.com/kashyapcom-og.png",
        width: 1200,
        height: 630,
        alt: "Suhas Kashyap",
      },
    ],
    firstName: "Suhas",
    lastName: "Kashyap",
  },
};

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-12 text-center md:py-16">
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
              url: "https://www.kashyapsuhas.com/kashyapcom-og.png",
              width: 1200,
              height: 630,
            },
            jobTitle: "Senior Software Engineer",
            worksFor: { "@type": "Organization", name: "Rakuten" },
            description:
              "Suhas Kashyap's slice of the interwebs. See blogs, photos, reviews, tools, contact details.",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Bengaluru",
              addressCountry: "IN",
            },
            alumniOf: {
              "@type": "CollegeOrUniversity",
              name: "PES University",
            },
            sameAs: [
              "https://github.com/kashyap07",
              "https://www.linkedin.com/in/suhas-kashyap",
              "https://www.instagram.com/kashyap_07/",
              "https://twitter.com/kashyapS07",
            ],
          }),
        }}
      />

      {/* top: name + tagline + nav */}
      <header className="flex flex-col items-center">
        <h1 className="text-[2.9rem] font-bold md:text-display md:font-semibold">
          Suhas Kashyap
        </h1>
        <p className="mt-1 text-lg text-secondary md:mt-3 md:text-2xl">
          Welcome to my slice of the Interwebs.
        </p>
        <NavLinks className="mt-10 justify-center text-base md:text-2xl" />
      </header>

      {/* bottom: image. q=75 + sizes so next picks the right bucket for hero LCP */}
      <Image
        src="/kedar-bw.png"
        alt="Portrait of Suhas Kashyap"
        width={1500}
        height={1268}
        quality={75}
        priority
        sizes="(max-width: 768px) 320px, 384px"
        className="mt-12 w-80 md:mt-12 md:w-96"
      />
    </main>
  );
}
