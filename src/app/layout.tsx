import type { Metadata, Viewport } from "next";
import {
  Fraunces,
  Inter,
  Literata,
  Tiro_Devanagari_Sanskrit,
  Tiro_Kannada,
} from "next/font/google";
import Script from "next/script";

import { SpeedInsights } from "@vercel/speed-insights/next";

import ConsoleEgg from "./ConsoleEgg";
import UmamiIdentify from "./UmamiIdentify";
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
// shippori mincho is NOT loaded via next/font: it only exposes latin subsets
// there, so the katakana glyphs were never self-hosted and the particle morph
// fell back to the system serif (fine on macos/hiragino, plain sans on android).
// instead we pull just the 9 glyphs the morph needs straight from google fonts
// via the text= param (see the <link> in the body), a single tiny @font-face.

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
      className={`dark ${fraunces.variable} ${literata.variable} ${inter.variable} ${tiroDevanagari.variable} ${tiroKannada.variable}`}
    >
      <body className="font-serif">
        {/* just the katakana the particle morph rasterizes (レス ヤップ / モア ドゥ),
            subset to those exact glyphs. react 19 hoists these into <head> */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@700&text=%E3%83%AC%E3%82%B9%E3%83%A4%E3%83%83%E3%83%97%E3%83%A2%E3%82%A2%E3%83%89%E3%82%A5&display=swap"
        />
        {children}
        <ConsoleEgg />
        <SpeedInsights />
        {process.env.NODE_ENV === "production" && (
          <>
            <Script
              defer
              src="https://cloud.umami.is/script.js"
              data-website-id="5f57cfa4-f6f0-4820-81ac-6bf61facd981"
            />
            {/* pins ?ref + utm_* from the landing url to the umami session */}
            <UmamiIdentify />
          </>
        )}
      </body>
    </html>
  );
}
