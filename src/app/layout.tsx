import type { Metadata } from "next";
import { Eczar } from "next/font/google";

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
    </html>
  );
}
