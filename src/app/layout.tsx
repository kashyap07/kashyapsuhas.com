import type { Metadata } from "next";
import { Eczar } from "next/font/google";
import Script from "next/script";

import "./globals.css";

const eczar = Eczar({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.kashyapsuhas.com",
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={eczar.className}>{children}</body>
      <Script
        defer
        src="https://cloud.umami.is/script.js"
        data-website-id="5f57cfa4-f6f0-4820-81ac-6bf61facd981"
      />
    </html>
  );
}
