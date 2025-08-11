import { Metadata } from "next";
import Link from "next/link";

import { Wrapper } from "@components/ui";

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
            reduce image size locally— without uploading to a server
          </span>
        </li>
        <li className="mt-8 flex flex-col md:justify-between">
          <span className="text-5xl font-medium md:text-8xl">
            <Link className="flex flex-col" href={"tools/image-converter"}>
              Image Converter
            </Link>
          </span>
          <span className="text-2xl text-gray-500">
            convert formats locally— without uploading to a server
          </span>
        </li>
        <li className="mt-8 flex flex-col md:justify-between">
          <span className="text-5xl font-medium md:text-8xl">
            <Link className="flex flex-col" href={"tools/background-remover"}>
              Background Remover
            </Link>
          </span>
          <span className="text-2xl text-gray-500">
            remove image background instantly and locally— without uploading to
            a server
            <br />
            experimental, uses U^2-Net— shipped as on onnx model, runs through
            wasm
          </span>
        </li>
        <li className="mt-8 flex flex-col md:justify-between">
          <span className="text-5xl font-medium md:text-8xl">
            <Link className="flex flex-col" href={"tools/text-diff"}>
              Text Diff Tool
            </Link>
          </span>
          <span className="text-2xl text-gray-500">instant text diff tool</span>
        </li>
      </ul>
    </Wrapper>
  );
}
