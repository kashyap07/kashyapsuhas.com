import { type Metadata } from "next";
import { notFound } from "next/navigation";

import { CustomMDX, RelativeDate, Wrapper } from "@components/ui";
import { getBlogPost, getBlogPosts } from "@db/blog";
import { SITE_URL } from "@utils/site";

export const dynamic = "force-static";

// prerender published posts at build. drafts are excluded here but still
// resolve on demand (dynamicParams defaults to true), which is what keeps
// shareable draft urls working.
export function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }));
}

// make a relative path absolute for json-ld / og. external urls pass through.
const toAbsolute = (path: string) =>
  path.startsWith("http")
    ? path
    : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata | undefined> {
  const params = await props.params;
  const post = getBlogPost(params.slug, { includeDrafts: true });

  if (!post) return;

  const { publishedDateTime, title, description, draft } = post.metadata;

  return {
    title,
    description,
    keywords: ["Suhas Kashyap", title],
    // drafts must not get indexed even if the url leaks
    ...(draft && { robots: { index: false, follow: false } }),
    // og image comes from the opengraph-image.tsx file convention, which
    // overrides anything set here
    openGraph: {
      title: `${title}`,
      description,
      type: "article",
      publishedTime: publishedDateTime,
      authors: "Suhas Kashyap",
      url: `${SITE_URL}/blog/${post.slug}`,
    },
    alternates: {
      canonical: `${SITE_URL}/blog/${post.slug}`,
    },
  };
}

interface Props {
  params: Promise<{ slug: string }>;
}

async function Blog(props: Props) {
  const params = await props.params;
  const post = getBlogPost(params.slug, { includeDrafts: true });
  if (!post) notFound();

  const { publishedDateTime, title, description, heroImage, draft, trip } =
    post.metadata;
  const imageUrl = toAbsolute(heroImage || "/kashyapcom-og.png");

  return (
    <Wrapper maxWidth="WIDE" className="mb-section-sm w-full md:mb-section-md">
      <section>
        {/* structured data */}
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: title,
              datePublished: publishedDateTime,
              description: description,
              image: {
                "@type": "ImageObject",
                url: imageUrl,
              },
              url: `${SITE_URL}/blog/${post.slug}`,
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": `${SITE_URL}/blog/${post.slug}`,
              },
              author: {
                "@type": "Person",
                "@id": `${SITE_URL}/#person`,
                name: "Suhas Kashyap",
                url: SITE_URL,
              },
              publisher: {
                "@type": "Person",
                "@id": `${SITE_URL}/#person`,
                name: "Suhas Kashyap",
              },
            }),
          }}
        />

        {/* hero card, uses full WIDE width (same treatment as review titles).
            on mobile it bleeds past the wrapper's px-6 so the title gets the
            whole screen width instead of page padding + card padding */}
        <div className="-mx-6 rounded-none bg-surface-subtle p-6 md:mx-0 md:rounded-lg md:p-10">
          {draft && (
            <span className="mb-4 inline-block rounded border border-muted px-2 py-0.5 font-sans text-xs uppercase tracking-wider text-muted">
              Draft
            </span>
          )}

          {/* title */}
          <h1 className="w-full text-pretty text-heading-sm font-medium md:text-heading-lg">
            {post.metadata.title}
          </h1>

          {/* machine-readable date wrapping the human-friendly relative version */}
          <time
            dateTime={publishedDateTime}
            className="mt-3 block font-sans text-sm text-muted md:text-base"
          >
            <RelativeDate date={publishedDateTime} />
          </time>
        </div>

        {/* blog content, constrained back to DEFAULT reading width. the width
            lives on this div, not the article: globals.css sets
            .prose { max-width: none } after the utilities layer, so a
            max-w-* on .prose itself would lose the cascade */}
        <div className="mx-auto max-w-2xl">
          <article className="prose mt-8 break-words md:prose-lg md:mt-14">
            <CustomMDX source={post.content} trip={trip || undefined} />
          </article>
        </div>
      </section>
    </Wrapper>
  );
}

export default Blog;
