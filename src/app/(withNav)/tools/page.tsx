import { Metadata } from "next";
import Link from "next/link";

import { Wrapper } from "@/components/Wrapper";

export const metadata: Metadata = {
  title: "Tools | Suhas Kashyap",
  description:
    "Bunch of tools that work directly in the browser without having to upload to any server. Enjoy!",
  openGraph: {
    images: ["/suhas_og.jpg"],
  },
};

export default function Tools() {
  return (
    <Wrapper className="mb-12 w-full md:mb-20">
      <ul className="flex flex-col">
        <li className="flex flex-col md:justify-between">
          <span className="text-5xl font-medium md:text-8xl">
            <Link className="flex flex-col" href={"tools/image-compressor"}>
              Image Compressor
            </Link>
          </span>
          <span className="text-2xl text-gray-500">
            Reduce image size locally without uploading to a server
          </span>
        </li>
        <li className="mt-8 flex flex-col md:justify-between">
          <span className="text-5xl font-medium md:text-8xl">
            <Link className="flex flex-col" href={"tools/image-converter"}>
              Image Converter
            </Link>
          </span>
          <span className="text-2xl text-gray-500">
            Convert images between formats (heic, jpeg, png, webp) locally in
            your browser
          </span>
        </li>
        <li className="mt-8 flex flex-col md:justify-between">
          <span className="text-5xl font-medium md:text-8xl">
            <Link className="flex flex-col" href={"tools/text-diff"}>
              Text Diff Tool
            </Link>
          </span>
          <span className="text-2xl text-gray-500">
            Compare two blocks of text and see the differences highlighted
            instantly
          </span>
        </li>
        <li className="mt-8 flex flex-col md:justify-between">
          <span className="text-5xl font-medium md:text-8xl">
            <Link className="flex flex-col" href={"tools/background-remover"}>
              EXPERIMENTAL WIP Background Remover
            </Link>
          </span>
          <span className="text-2xl text-gray-500">
            Remove image backgrounds instantly in your browser using AI
            (U^2-Netp, fully client-side)
          </span>
        </li>
      </ul>
    </Wrapper>
  );
}
