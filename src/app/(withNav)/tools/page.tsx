import Link from "next/link";
import { Wrapper } from "@/components/Wrapper";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tools | Suhas Kashyap",
  description: "Enjoy!",
  openGraph: {
    images: ["/suhas_og.jpg"],
  },
};

export default function Tools() {
  return (
    <Wrapper className="md:mb-20w-full mb-12">
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
        <li className="flex flex-col md:justify-between mt-8">
          <span className="text-5xl font-medium md:text-8xl">
            <Link className="flex flex-col" href={"tools/image-converter"}>
              Image Converter
            </Link>
          </span>
          <span className="text-2xl text-gray-500">
            Convert images between formats (heic, jpeg, png, webp) locally in your browser
          </span>
        </li>
      </ul>
    </Wrapper>
  );
}
