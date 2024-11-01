import type { Metadata } from "next";
import "./globals.css";

import { Eczar } from "next/font/google";

const eczar = Eczar({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Suhas Kashyap",
  description: "Suhas Kashyap's personal website",
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
