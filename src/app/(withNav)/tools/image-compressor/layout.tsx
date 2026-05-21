import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Compressor",
  description:
    "Compress images directly in your browser. No uploads, no servers, everything stays on your device.",
  alternates: {
    canonical: "https://www.kashyapsuhas.com/tools/image-compressor",
  },
  keywords: [
    "image compressor",
    "compress images online",
    "browser image compression",
    "reduce image size",
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
