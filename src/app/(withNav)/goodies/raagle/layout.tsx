import { Metadata } from "next";

import { SITE_URL } from "@utils/site";

export const metadata: Metadata = {
  title: "Raagle",
  description:
    "A daily raga guessing game. Hear a familiar varna sung in a mystery melakarta raga, find its swaras on the keyboard, guess it in four tries.",
  alternates: {
    canonical: `${SITE_URL}/goodies/raagle`,
  },
  keywords: [
    "raagle",
    "ragle",
    "raga guessing game",
    "daily raga puzzle",
    "carnatic music game",
    "melakarta quiz",
    "wordle for ragas",
  ],
  openGraph: {
    title: "Raagle",
    description:
      "Guess the mystery Mēḷakartā raaga hiding in a familiar varna, daily",
    images: ["/kashyapcom-og.png"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
