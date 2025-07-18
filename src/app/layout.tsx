import './globals.css';

import { Eczar } from 'next/font/google';
import Script from 'next/script';

const eczar = Eczar({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={eczar.className}>
        <Script
          src="https://cdn.jsdelivr.net/npm/heic2any/dist/heic2any.min.js"
          strategy="beforeInteractive"
        />
        {children}
      </body>
    </html>
  );
}
