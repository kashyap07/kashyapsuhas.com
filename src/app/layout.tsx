import type { Metadata, Viewport } from "next";
import {
  Fraunces,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  Noto_Sans_Devanagari,
  Noto_Sans_Kannada,
  Noto_Serif_Devanagari,
  Noto_Serif_Kannada,
} from "next/font/google";
import Script from "next/script";

import { SpeedInsights } from "@vercel/speed-insights/next";

import { SITE_URL } from "@utils/site";

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
// body text and ui chrome, one family for both. not variable on google fonts,
// so only the weights in use: 400 prose, 500 ui labels, 600 strong. next/font
// crosses weights with styles, so italic comes in all three
const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
});
// code, everywhere: fenced blocks, inline chips, the font-mono numbers in the
// goodies. plex mono is the sibling of the plex sans body, so it carries editorial
// weight rather than ide neutrality, which is what the warm code surface wants.
// two weights, not the whole family: blocks render at 400 and the goodies pair
// font-mono with font-medium. no italic, github-light-default never sets one.
// preload: false on purpose. most pages have no code on them, and next/font's
// size-adjusted fallback keeps the swap from shifting the block when it lands.
const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  preload: false,
});
// non-latin scripts for the wordmark easter egg. preload: false so they don't
// block first paint, they only load when user clicks to cycle.
const notoSerifDevanagari = Noto_Serif_Devanagari({
  weight: ["400", "700"],
  subsets: ["devanagari"],
  variable: "--font-noto-devanagari",
  preload: false,
});
const notoSerifKannada = Noto_Serif_Kannada({
  weight: ["400", "700"],
  subsets: ["kannada"],
  variable: "--font-noto-kannada",
  preload: false,
});
// kannada + devanagari in body text (recipes, vachanas, panchanga, jaataka,
// carnatic). sans cuts so they match plex sans instead of mixing in serif.
// preload: false, unicode-range means they only download on pages that use them
const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-noto-sans-devanagari",
  preload: false,
});
const notoSansKannada = Noto_Sans_Kannada({
  subsets: ["kannada"],
  variable: "--font-noto-sans-kannada",
  preload: false,
});
// shippori mincho is NOT loaded via next/font: it only exposes latin subsets
// there, so the katakana glyphs were never self-hosted and the particle morph
// fell back to the system serif (fine on macos/hiragino, plain sans on android).
// instead we pull just the 9 glyphs the morph needs straight from google fonts
// via the text= param (see the <link> in the body), a single tiny @font-face.

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Suhas Kashyap",
    template: "%s | Suhas Kashyap",
  },
  description:
    "Suhas Kashyap's slice of the interwebs. See blogs, photos, reviews, goodies, contact details.",
  openGraph: {
    siteName: "Suhas Kashyap",
    locale: "en_US",
    images: [
      {
        url: `${SITE_URL}/kashyapcom-og.png`,
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
      className={`${fraunces.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} ${notoSerifDevanagari.variable} ${notoSerifKannada.variable} ${notoSansDevanagari.variable} ${notoSansKannada.variable}`}
    >
      <body className="font-sans">
        {/* just the katakana the particle morph rasterizes (レス ヤップ / モア ドゥ),
            subset to those exact glyphs. react 19 hoists these into <head> */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* app router root layout is the document-level place for this link;
            no-page-custom-font is a pages-router (_document) heuristic that
            doesn't apply here. self-hosting via next/font isn't an option:
            next/font/google only exposes Shippori Mincho's latin subset, so the
            katakana glyphs the particle morph rasterizes wouldn't be included. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
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
