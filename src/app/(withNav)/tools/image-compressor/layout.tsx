import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Compressor",
  description:
    "Compress images directly in your browser. No uploads, no servers. Reduce image size by percentage.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
