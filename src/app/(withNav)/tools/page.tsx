import { Metadata } from "next";
import Link from "next/link";

import { Wrapper } from "@components/ui";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Tools",
  description:
    "Free browser-based tools by Suhas Kashyap: image compressor, image converter, background remover, panchanga. Everything runs locally, no uploads.",
  alternates: {
    canonical: "https://www.kashyapsuhas.com/tools",
  },
  keywords: [
    "Suhas Kashyap tools",
    "browser tools",
    "image compressor",
    "image converter",
    "background remover",
    "panchanga",
  ],
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
    description: "remove image background entirely on your browser",
    href: "tools/background-remover",
  },
  {
    name: "Panchanga",
    description: "sankalpa mantra elements",
    href: "tools/panchanga",
  },
];

export default function Tools() {
  return (
    <Wrapper className="mb-section-sm w-full md:mb-section-md">
      <h1 className="mb-8 text-heading-md font-medium md:text-heading-lg">
        Tools
      </h1>
      <ul className="flex flex-col gap-6 md:gap-8">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href} className="group">
            <li className="flex flex-col gap-1">
              <span className="text-xl font-medium group-hover:text-accent md:text-2xl">
                {tool.name}
              </span>
              <span className="text-base text-secondary md:text-lg">
                {tool.description}
              </span>
            </li>
          </Link>
        ))}
      </ul>
    </Wrapper>
  );
}
