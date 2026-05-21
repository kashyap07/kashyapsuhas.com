import Link from "next/link";

import { Wrapper } from "@components/ui";
import { getBlogPosts } from "@db/blog";

export const dynamic = "force-static";

export const metadata = {
  title: "Blog",
  description:
    "Notes from Suhas Kashyap on software, photography, food, games and life.",
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
  });

  return (
    <Wrapper className="mb-section-sm w-full md:mb-section-md">
      <h1 className="mb-8 text-heading-md font-medium md:text-heading-lg">
        Blog
      </h1>
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
              <ul className="flex flex-col gap-2 md:gap-3">
                {postsForYear.map((post) => (
                  <Link
                    key={post.slug}
                    className="group"
                    href={`/blog/${post.slug}`}
                  >
                    <li className="flex items-baseline justify-between gap-4">
                      <span className="text-lg font-medium group-hover:text-accent md:text-xl">
                        {post.metadata.title}
                      </span>

                      <span className="shrink-0 font-sans text-sm text-muted group-hover:text-accent md:text-base">
                        {formatter.format(
                          new Date(post.metadata.publishedDateTime),
                        )}
                      </span>
                    </li>
                  </Link>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </Wrapper>
  );
}

export default Blog;
