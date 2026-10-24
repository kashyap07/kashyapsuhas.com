import { Metadata } from "next";

import { SITE_URL } from "@utils/site";

export const metadata: Metadata = {
  title: "Raga Radar",
  description:
    "Sing into the mic and watch your pitch draw itself on the svara lattice while the radar names the melakarta raga, live, entirely in your browser.",
  alternates: {
    canonical: `${SITE_URL}/goodies/raga-radar`,
  },
  keywords: [
    "raga radar",
    "raga detector",
    "identify raga from singing",
    "carnatic pitch tracker",
    "melakarta finder",
    "shruti trainer",
    "swara lattice",
    "carnatic music tool",
  ],
  openGraph: {
    title: "Raga Radar",
    description:
      "Sing, watch your pitch on the svara lattice, and let it name the Mēḷakartā live",
    images: ["/kashyapcom-og.png"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
