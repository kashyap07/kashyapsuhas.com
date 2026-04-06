import { Metadata } from "next";

import TopPC from "./TopPC";
import TopSP from "./TopSP";

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
    <main className="max-w-screen overflow-hidden font-semibold">
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
            worksFor: {
              "@type": "Organization",
              name: "Rakuten",
            },
            description:
              "Suhas Kashyap's slice of the interwebs. See blogs, photos, reviews, tools, contact details.",
            email: "mantles_arbours_00@icloud.com",
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
