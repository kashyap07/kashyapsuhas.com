import { Metadata } from "next";

import { SITE_URL } from "@utils/site";

export const metadata: Metadata = {
  title: "Image Converter",
  description:
    "Convert images between HEIC, JPEG, PNG, and WebP formats directly in your browser. No uploads.",
  alternates: {
    canonical: `${SITE_URL}/tools/image-converter`,
  },
  keywords: [
    "image converter",
    "HEIC to JPEG",
    "convert HEIC",
    "WebP converter",
    "PNG to JPEG",
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
