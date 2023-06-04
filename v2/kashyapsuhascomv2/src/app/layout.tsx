import './globals.css';
import { Saira_Condensed } from 'next/font/google';

const saira = Saira_Condensed({ weight: '400', subsets: ['latin'] });

export const metadata = {
  title: 'Suhas Kashyap',
  description: "Suhas Kashyap's personal website",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={saira.className}>{children}</body>
    </html>
  );
}
