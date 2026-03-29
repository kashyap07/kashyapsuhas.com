import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Compressor",
  description:
    "Compress images directly in your browser. Does not upload to my server",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
