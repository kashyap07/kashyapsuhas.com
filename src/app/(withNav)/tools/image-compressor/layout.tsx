import { Metadata } from "next";

import { SITE_URL } from "@utils/site";

export const metadata: Metadata = {
  title: "Image Compressor",
  description:
    "Compress images directly in your browser. No uploads, no servers, everything stays on your device.",
  alternates: {
    canonical: `${SITE_URL}/tools/image-compressor`,
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
