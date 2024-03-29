import type { Metadata } from "next";
import './globals.css';

import { Saira_Condensed } from 'next/font/google';

const saira = Saira_Condensed({ weight: "400", subsets: ["latin"] });

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
      <body className={saira.className}>{children}</body>
    </html>
  );
}
