import { Metadata } from "next";

import { SITE_URL } from "@utils/site";

export const metadata: Metadata = {
  title: "Melakarta Ragas",
  description:
    "All 72 melakarta ragas of carnatic music in their 12 chakras. Tap swaras to narrow them down, click any raga to hear its arohana and avarohana over a tamburi drone.",
  alternates: {
    canonical: `${SITE_URL}/goodies/melakarta-ragas`,
  },
  keywords: [
    "melakarta ragas",
    "72 melakarta",
    "carnatic ragas list",
    "arohana avarohana",
    "raga player",
    "identify raga by swaras",
    "carnatic music scales",
  ],
  openGraph: {
    title: "Melakarta Ragas",
    description: "all 72 melakarta ragas: filter by swara, hear them",
    images: ["/kashyapcom-og.png"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
