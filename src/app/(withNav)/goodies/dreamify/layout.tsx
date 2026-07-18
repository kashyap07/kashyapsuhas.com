import { Metadata } from "next";

import { SITE_URL } from "@utils/site";

export const metadata: Metadata = {
  title: "Dreamify",
  description:
    "The dreamy wedding-photo look: graduated gaussian defocus brushed on like a layer mask plus diffusion-filter highlight bloom, in linear light. Runs entirely in your browser, no uploads.",
  alternates: {
    canonical: `${SITE_URL}/goodies/dreamify`,
  },
  keywords: [
    "dreamy photo effect",
    "diffusion filter effect",
    "highlight bloom",
    "gaussian blur",
    "photoshop gaussian blur",
    "selective blur",
    "joseph radhik style",
    "browser photo editor",
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
