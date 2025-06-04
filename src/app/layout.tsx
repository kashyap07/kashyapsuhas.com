import type { Metadata } from "next";
import "./globals.css";

import { Eczar } from "next/font/google";

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
      <head>
        <script src="https://cdn.jsdelivr.net/npm/heic2any/dist/heic2any.min.js"></script>
      </head>
      <body className={eczar.className}>{children}</body>
    </html>
  );
}
