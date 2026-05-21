import Link from "next/link";

import { Wrapper } from "@components/ui";
import { getBlogPosts } from "@db/blog";

export const dynamic = "force-static";

export const metadata = {
  title: "Kashyap's Blog",
  description: "Kashyap's Blog.",
  alternates: {
    canonical: "https://www.kashyapsuhas.com/blog",
    types: {
      "application/rss+xml": "https://www.kashyapsuhas.com/blog/feed.xml",
    },
  },
  keywords: ["Suhas Kashyap", "blog", "writing", "essays"],
};

const splitPostsByYear = (posts: ReturnType<typeof getBlogPosts>) => {
  const groups: (typeof posts)[] = [];
  let currentYear: number | null = null;

  for (const post of posts) {
    const year = new Date(post.metadata.publishedDateTime).getFullYear();
    if (year !== currentYear) {
      groups.push([]);
      currentYear = year;
    }
    groups[groups.length - 1].push(post);
  }

  return groups;
};

function Blog() {
  const blogPosts = getBlogPosts();
  const blogPostsByYear = splitPostsByYear(blogPosts);

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

  return (
    <Wrapper className="mb-section-sm w-full md:mb-section-md">
      <ul className="flex flex-col gap-8 md:gap-10">
        {blogPostsByYear.map((postsForYear, groupIdx) => {
          const year = new Date(
            postsForYear[0].metadata.publishedDateTime,
          ).getFullYear();
          return (
            <li key={groupIdx} className="flex flex-col gap-3">
              <h2 className="font-sans text-xs uppercase tracking-wider text-muted">
                {year}
              </h2>
              <ul className="flex flex-col gap-1">
                {postsForYear.map((post) => {
                  const description = post.metadata.description?.trim();
                  return (
                    <Link
                      key={post.slug}
                      className="group -mx-3 block rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-hover active:bg-surface-subtle md:-mx-4 md:px-4 md:py-3"
                      href={`/blog/${post.slug}`}
                    >
                      <li className="flex flex-col gap-1">
                        <div className="flex items-baseline justify-between gap-3 md:gap-4">
                          <h3 className="text-lg font-medium leading-snug transition-colors group-hover:text-accent md:text-xl">
                            {post.metadata.title}
                          </h3>
                          <span className="shrink-0 font-sans text-sm text-muted group-hover:text-accent">
                            {formatter.format(
                              new Date(post.metadata.publishedDateTime),
                            )}
                          </span>
                        </div>
                        {description && (
                          <p className="text-sm leading-relaxed text-secondary transition-colors group-hover:text-foreground md:text-base">
                            {description}
                          </p>
                        )}
                      </li>
                    </Link>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </Wrapper>
  );
}

export default Blog;
