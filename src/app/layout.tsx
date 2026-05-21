import type { Metadata } from "next";
import {
  Fraunces,
  Inter,
  Literata,
  Noto_Serif_Devanagari,
  Noto_Serif_JP,
  Noto_Serif_Kannada,
} from "next/font/google";
import Script from "next/script";

import { SpeedInsights } from "@vercel/speed-insights/next";

import ConsoleEgg from "./ConsoleEgg";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});
const literata = Literata({
  subsets: ["latin"],
  variable: "--font-literata",
});
const notoSerifDevanagari = Noto_Serif_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-noto-serif-devanagari",
});
const notoSerifKannada = Noto_Serif_Kannada({
  subsets: ["kannada"],
  variable: "--font-noto-serif-kannada",
});
const notoSerifJP = Noto_Serif_JP({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-noto-serif-jp",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.kashyapsuhas.com",
  ),
  title: {
    default: "Suhas Kashyap",
    template: "%s | Suhas Kashyap",
  },
  description:
    "Suhas Kashyap's slice of the interwebs. See blogs, photos, reviews, tools, contact details.",
  openGraph: {
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
  },
};

// favicon is added automatically by nextjs
// @see: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons#image-files-ico-jpg-png

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${fraunces.variable} ${literata.variable} ${inter.variable} ${notoSerifDevanagari.variable} ${notoSerifKannada.variable} ${notoSerifJP.variable}`}
    >
      <body className="font-serif">
        {children}
        <ConsoleEgg />
        <SpeedInsights />
        {process.env.NODE_ENV === "production" && (
          <Script
            defer
            src="https://cloud.umami.is/script.js"
            data-website-id="5f57cfa4-f6f0-4820-81ac-6bf61facd981"
          />
        )}
      </body>
    </html>
  );
}
