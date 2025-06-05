import type { Metadata } from "next";
import "./globals.css";

import { Eczar } from "next/font/google";
import Script from "next/script";

const eczar = Eczar({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://kashyapsuhas.com"),
  title: "Suhas Kashyap",
  description: "Suhas Kashyap's personal website",
  keywords: [
    "Suhas",
    "Kashyap",
    "Suhas Kashyap",
    "blog",
    "photos",
    "tools",
  ],
  alternates: {
    canonical: "https://kashyapsuhas.com/",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <Script
        src="https://cdn.jsdelivr.net/npm/heic2any/dist/heic2any.min.js"
        strategy="beforeInteractive"
      />
      <body className={eczar.className}>{children}</body>
    </html>
  );
}
