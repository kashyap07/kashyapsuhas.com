import { Metadata } from "next";
import Link from "next/link";

import { Wrapper } from "@components/ui";

import tools from "./toolsList";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Tools",
  description:
    "Bunch of tools that work directly in the browser without having to upload to any server. Enjoy!",
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

export default function Tools() {
  return (
    <Wrapper className="mb-section-sm w-full md:mb-section-md">
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
