import { Metadata } from "next";
import Link from "next/link";

import { Wrapper } from "@components/ui";

export const metadata: Metadata = {
  title: "Tools | Suhas Kashyap",
  description:
    "Bunch of tools that work directly in the browser without having to upload to any server. Enjoy!",
  openGraph: {
    images: ["/kashyapcom-og.png"],
  },
};

const tools = [
  {
    name: "Image Compressor",
    description: "reduce image size by percentage",
    href: "tools/image-compressor",
  },
  {
    name: "Image Converter",
    description: "convert image heic ↔ jpeg",
    href: "tools/image-converter",
  },
  {
    name: "Background Remover",
    description: "remove image background instantly — runs locally via wasm",
    href: "tools/background-remover",
  },
  {
    name: "Panchanga",
    description: "sankalpa mantra elements for hindu rituals",
    href: "tools/panchanga",
  },
];

export default function Tools() {
  return (
    <Wrapper className="mb-section-sm w-full md:mb-section-md">
      <ul className="flex flex-col gap-2 md:gap-6">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href} className="group">
            <li className="flex flex-row-reverse items-baseline gap-2 md:flex-row md:items-end md:justify-between">
              <span className="flex-grow text-body-lg font-medium md:text-heading-sm">
                {tool.name}
              </span>
              <span className="min-w-20 text-base text-secondary group-hover:font-medium group-hover:text-accent md:min-w-fit md:text-lg">
                {tool.description}
              </span>
            </li>
          </Link>
        ))}
      </ul>
    </Wrapper>
  );
}
