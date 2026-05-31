import Link from "next/link";

import { Wrapper } from "@components/ui";
import { getBlogPosts } from "@db/blog";
import { getReviews } from "@db/reviews";

import galleryImages from "./(withNav)/photos/galleryImages";
import tools from "./(withNav)/tools/toolsList";
import FooterLiveBits from "./FooterLiveBits";
import FooterNameCycle from "./FooterNameCycle";

const FOOTER_LINKS = [{ href: "/privacy", label: "privacy" }];

// captured at build time. site is force-static so this is the deploy timestamp.
const BUILD_TIME = new Date().toISOString();

export default function Footer() {
  const posts = getBlogPosts();
  const reviews = getReviews();

  const stats: { label: string; href?: string }[] = [
    { label: `${posts.length} posts`, href: "/blog" },
    { label: `${reviews.length} reviews`, href: "/reviews" },
    { label: `${galleryImages.length} photos`, href: "/photos" },
    { label: `${tools.length} tools`, href: "/tools" },
  ];

  return (
    <footer className="mt-auto pb-10 pt-12">
      <Wrapper className="w-full">
        <hr className="mb-8 border-line" />

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

        {/* receipt: ticks up as content grows. links to corresponding sections. */}
        <p className="mt-3 font-sans text-label-sm text-subtle">
          {stats.map((s, i) => (
            <span key={s.label}>
              {i > 0 && " · "}
              {s.href ? (
                <Link href={s.href} className="hover:text-accent">
                  {s.label}
                </Link>
              ) : (
                s.label
              )}
            </span>
          ))}
          <FooterLiveBits buildTime={BUILD_TIME} />
        </p>
      </Wrapper>
    </footer>
  );
}
