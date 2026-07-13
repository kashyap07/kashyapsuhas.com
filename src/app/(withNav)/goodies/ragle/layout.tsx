import { Metadata } from "next";

import { SITE_URL } from "@utils/site";

export const metadata: Metadata = {
  title: "Ragle",
  description:
    "A daily raga guessing game. Hear a mystery melakarta raga, guess it in six tries, get wordle-style feedback on your swaras.",
  alternates: {
    canonical: `${SITE_URL}/goodies/ragle`,
  },
  keywords: [
    "ragle",
    "raga guessing game",
    "daily raga puzzle",
    "carnatic music game",
    "melakarta quiz",
    "wordle for ragas",
  ],
  openGraph: {
    title: "Ragle",
    description: "guess the raga from its sound, daily",
    images: ["/kashyapcom-og.png"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
