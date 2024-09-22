import type { Metadata } from "next";
import "./globals.css";

import { Saira_Condensed } from "next/font/google";
import { Michroma } from "next/font/google";
import { Eczar } from "next/font/google";

const saira = Saira_Condensed({ weight: "400", subsets: ["latin"] });
const michroma = Michroma({ weight: "400", subsets: ["latin"] });
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
