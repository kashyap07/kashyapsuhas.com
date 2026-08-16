import { Metadata } from "next";

import { SITE_URL } from "@utils/site";

export const metadata: Metadata = {
  title: "Jaataka",
  description:
    "South Indian birth chart with Lahiri ayanamsa, whole sign bhavas, mean-node Rahu and Vimshottari dasha. Computed in the browser, verified against Swiss Ephemeris.",
  alternates: {
    canonical: `${SITE_URL}/goodies/jaataka`,
  },
  keywords: [
    "jaataka",
    "janma kundali",
    "birth chart",
    "south indian chart",
    "lahiri ayanamsa",
    "vimshottari dasha",
    "jyotisha",
    "rashi nakshatra pada",
    "kannada jataka",
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
