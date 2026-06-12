import { Metadata } from "next";

import { getBlogPosts } from "@db/blog";
import { getReviews } from "@db/reviews";

import Hero from "./_home/Hero";
import LatestWriting from "./_home/LatestWriting";
import ParticleField from "./_home/ParticleField";
import RecentlyReviewed from "./_home/RecentlyReviewed";

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
  const posts = getBlogPosts()
    .slice(0, 3)
    .map((p) => ({
      slug: p.slug,
      title: p.metadata.title,
      description: p.metadata.description,
      publishedDateTime: p.metadata.publishedDateTime,
    }));
  const reviews = getReviews().slice(0, 3);

  return (
    <main className="relative flex flex-col">
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

      <ParticleField />
      <Hero />

      {/* the portrait grains condense into vertical katakana here:
          レス ヤップ / モア ドゥ, "less yap, more do" */}
      <div
        id="text-anchor"
        role="img"
        aria-label="レスヤップ モアドゥ, less yap more do, written vertically in katakana"
        className="relative z-10 mx-auto mt-[8vh] aspect-[5/8] w-[min(58vw,300px)]"
      />

      <div className="mt-16 md:mt-24">
        <LatestWriting posts={posts} />
      </div>

      <div className="mt-section-sm md:mt-section-md">
        <RecentlyReviewed reviews={reviews} />
      </div>

      <div className="pb-page-bottom" />
    </main>
  );
}
