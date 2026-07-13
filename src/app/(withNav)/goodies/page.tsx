import { Metadata } from "next";
import Link from "next/link";

import { Wrapper } from "@components/ui";
import { SITE_URL } from "@utils/site";

import goodies from "./goodiesList";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Goodies",
  description:
    "A bunch of goodies that work directly in the browser without uploading anything to a server. Enjoy!",
  alternates: {
    canonical: `${SITE_URL}/goodies`,
  },
  keywords: [
    "Suhas Kashyap goodies",
    "browser goodies",
    "image compressor",
    "image converter",
    "background remover",
    "panchanga",
  ],
  openGraph: {
    images: ["/kashyapcom-og.png"],
  },
};

export default function Goodies() {
  return (
    <Wrapper className="mb-section-sm w-full md:mb-section-md">
      <ul className="flex flex-col gap-6 md:gap-8">
        {goodies.map((goodie) => (
          <Link key={goodie.href} href={goodie.href} className="group">
            <li className="flex flex-col gap-1">
              <span className="text-xl font-medium group-hover:text-accent md:text-2xl">
                {goodie.name}
              </span>
              <span className="text-base text-secondary md:text-lg">
                {goodie.description}
              </span>
            </li>
          </Link>
        ))}
      </ul>
    </Wrapper>
  );
}
