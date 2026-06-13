import type { Metadata, Viewport } from "next";
import {
  Fraunces,
  Inter,
  Literata,
  Shippori_Mincho,
  Tiro_Devanagari_Sanskrit,
  Tiro_Kannada,
} from "next/font/google";
import Script from "next/script";

import { SpeedInsights } from "@vercel/speed-insights/next";

import ConsoleEgg from "./ConsoleEgg";
import "./globals.css";

// opsz: high-contrast display cut at heading sizes (auto optical sizing).
// WONK (max, 0-1) + SOFT (max, 0-100) set via font-variation-settings in globals.css
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["WONK", "SOFT"],
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});
const literata = Literata({
  subsets: ["latin"],
  variable: "--font-literata",
});
// non-latin scripts for the wordmark easter egg. preload: false so they don't
// block first paint, they only load when user clicks to cycle.
const tiroDevanagari = Tiro_Devanagari_Sanskrit({
  weight: "400",
  subsets: ["devanagari"],
  variable: "--font-tiro-devanagari",
  preload: false,
});
const tiroKannada = Tiro_Kannada({
  weight: "400",
  subsets: ["kannada"],
  variable: "--font-tiro-kannada",
  preload: false,
});
const shipporiMincho = Shippori_Mincho({
  weight: ["400", "500", "700"],
  // japanese is the whole point: the particle morph rasterizes katakana with
  // this face. with latin-only the glyphs were never self-hosted, so it fell
  // back to the system serif (looked ok on macos/hiragino, plain sans on
  // android). unicode-range keeps the actual download to just the katakana block
  subsets: ["latin", "japanese"],
  variable: "--font-shippori-mincho",
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

// light-only site. colour-scheme tells the browser to render form controls,
// scrollbars, and the page background in light mode. theme-color tints
// mobile browser chrome to match the page background.
export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#ffffff",
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
      className={`dark ${fraunces.variable} ${literata.variable} ${inter.variable} ${tiroDevanagari.variable} ${tiroKannada.variable} ${shipporiMincho.variable}`}
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
