import { Metadata } from "next";

import { SITE_URL } from "@utils/site";

export const metadata: Metadata = {
  title: "Dreamify",
  description:
    "The dreamy wedding-photo look: radial defocus around one focal zone, multi-scale glow and haze, all in linear light. Runs entirely in your browser, no uploads.",
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
