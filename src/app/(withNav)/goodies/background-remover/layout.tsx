import { Metadata } from "next";

import { SITE_URL } from "@utils/site";

export const metadata: Metadata = {
  title: "AI Background Remover",
  description:
    "Remove image backgrounds instantly using AI. Runs entirely in your browser with U2-Net via WebAssembly, no uploads.",
  alternates: {
    canonical: `${SITE_URL}/goodies/background-remover`,
  },
  keywords: [
    "background remover",
    "remove background AI",
    "browser background remover",
    "U2-Net",
    "image background removal",
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
