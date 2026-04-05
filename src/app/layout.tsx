import type { Metadata } from "next";
import { Eczar } from "next/font/google";
import Script from "next/script";

import { SpeedInsights } from "@vercel/speed-insights/next";

import "./globals.css";

const eczar = Eczar({ subsets: ["latin", "devanagari"] });

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
    <html lang="en" className="dark">
      <body className={eczar.className}>
        {children}
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
