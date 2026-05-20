import { Metadata } from "next";
import Link from "next/link";

import { Wrapper } from "@components/ui";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Suhas Kashyap",
};

const work = [
  { name: "mail", handle: "kashyapsuhas07@gmail.com", href: "mailto:kashyapsuhas07@gmail.com" },
  { name: "LinkedIn", handle: "/in/suhas-kashyap", href: "https://www.linkedin.com/in/suhas-kashyap/" },
  { name: "GitHub", handle: "@kashyap07", href: "https://github.com/kashyap07" },
];

const socials = [
  { name: "𝕏", handle: "@kashyapS07", href: "https://twitter.com/kashyapS07" },
  { name: "Instagram", handle: "@kashyap_07", href: "https://www.instagram.com/kashyap_07" },
  { name: "Facebook", handle: "@kashyapsuhas07", href: "https://www.facebook.com/kashyapsuhas07" },
  { name: "YouTube", handle: "@SuhasKashyap07", href: "https://www.youtube.com/c/SuhasKashyap07" },
  { name: "reddit", handle: "?", href: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
];

interface Item {
  name: string;
  handle: string;
  href: string;
}

const Row = ({ item }: { item: Item }) => (
  <Link key={item.href} href={item.href} className="group">
    <li className="flex items-baseline justify-between gap-4">
      <span className="text-xl font-medium md:text-2xl">{item.name}</span>
      <span className="shrink-0 font-sans text-sm text-muted group-hover:font-medium group-hover:text-accent md:text-base">
        {item.handle}
      </span>
    </li>
  </Link>
);

export default function Contact() {
  return (
    <Wrapper className="mb-section-sm flex w-full flex-col gap-10 md:mb-section-md md:gap-14">
      <section className="flex flex-col gap-3">
        <h2 className="font-sans text-xs uppercase tracking-wider text-muted">WORK</h2>
        <ul className="flex flex-col gap-2 md:gap-3">
          {work.map((item) => (
            <Row key={item.href} item={item} />
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-sans text-xs uppercase tracking-wider text-muted">SOCIALS</h2>
        <ul className="flex flex-col gap-2 md:gap-3">
          {socials.map((item) => (
            <Row key={item.href} item={item} />
          ))}
        </ul>
      </section>
    </Wrapper>
  );
}
