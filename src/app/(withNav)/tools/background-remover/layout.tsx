import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Background Remover",
  description:
    "Remove image backgrounds instantly using AI. Runs entirely in your browser with U2-Net via WebAssembly, no uploads.",
  alternates: {
    canonical: "https://www.kashyapsuhas.com/tools/background-remover",
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
