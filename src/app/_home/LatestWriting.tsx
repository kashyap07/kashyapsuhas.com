import Link from "next/link";

import Wrapper from "@components/ui/Wrapper";

export type PostTeaser = {
  slug: string;
  title: string;
  description: string;
  publishedDateTime: string;
};

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

// list rows match the blog index styling exactly
export default function LatestWriting({ posts }: { posts: PostTeaser[] }) {
  return (
    <Wrapper className="relative z-10">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-body-lg font-medium md:text-heading-sm">
          latest yapping
        </h2>
        <Link
          href="/blog"
          className="font-sans text-label text-muted no-underline transition-colors hover:text-accent"
        >
          all posts →
        </Link>
      </div>

      <ul className="mt-4 flex flex-col gap-1 md:mt-5">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="group -mx-3 block rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-hover active:bg-surface-subtle md:-mx-4 md:px-4 md:py-3"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-3 md:gap-4">
                  <h3 className="text-lg font-medium leading-snug transition-colors group-hover:text-accent md:text-xl">
                    {post.title}
                  </h3>
                  <time
                    dateTime={post.publishedDateTime}
                    className="shrink-0 font-sans text-sm text-muted group-hover:text-accent"
                  >
                    {dateFmt.format(new Date(post.publishedDateTime))}
                  </time>
                </div>
                {post.description && (
                  <p className="text-sm leading-relaxed text-secondary transition-colors group-hover:text-foreground md:text-base">
                    {post.description}
                  </p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Wrapper>
  );
}
