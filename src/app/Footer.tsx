import Link from "next/link";

import { Wrapper } from "@components/ui";
import FooterNameCycle from "./FooterNameCycle";

const FOOTER_LINKS = [{ href: "/privacy", label: "privacy" }];

export default function Footer() {
  return (
    <footer className="mt-auto pb-10 pt-3">
      <Wrapper className="w-full">
        <hr className="mb-4 border-line" />

        <div className="flex flex-col gap-4 font-sans text-label-sm text-muted md:flex-row md:items-baseline md:justify-between md:gap-8">
          <p className="flex items-baseline gap-1.5">
            <span>© {new Date().getFullYear()}</span>
            <FooterNameCycle className="text-base text-foreground md:text-lg" />
          </p>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-3 gap-y-1">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-accent">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/contact" className="hover:text-accent">
                  contact
                </Link>
              </li>
              <li>
                <Link href="/blog/feed.xml" className="hover:text-accent">
                  rss
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </Wrapper>
    </footer>
  );
}
