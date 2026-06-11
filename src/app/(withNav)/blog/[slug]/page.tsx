import { type Metadata } from "next";
import { notFound } from "next/navigation";

import { CustomMDX, RelativeDate, Wrapper } from "@components/ui";
import { getBlogPosts } from "@db/blog";

export const dynamic = "force-static";

// prerender published posts at build. drafts are excluded here but still
// resolve on demand (dynamicParams defaults to true), which is what keeps
// shareable draft urls working.
export function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }));
}

const SITE_URL = "https://www.kashyapsuhas.com";

// make a relative path absolute for json-ld / og. external urls pass through.
const toAbsolute = (path: string) =>
  path.startsWith("http")
    ? path
    : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata | undefined> {
  const params = await props.params;
  const post = getBlogPosts({ includeDrafts: true }).find(
    (post) => post.slug === params.slug,
  );

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
  const post = getBlogPosts({ includeDrafts: true }).find(
    (post) => post.slug === params.slug,
  );
  if (!post) notFound();

  const { publishedDateTime, title, description, heroImage, draft } =
    post.metadata;
  const imageUrl = toAbsolute(heroImage || "/kashyapcom-og.png");

  return (
    <Wrapper className="mb-section-sm w-full md:mb-section-md">
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

        {draft && (
          <span className="mb-4 inline-block rounded border border-muted px-2 py-0.5 font-sans text-xs uppercase tracking-wider text-muted">
            Draft
          </span>
        )}

        {/* title */}
        <h1 className="title w-full text-heading-sm font-medium md:text-heading-lg">
          {post.metadata.title}
        </h1>

        {/* machine-readable date wrapping the human-friendly relative version */}
        <time
          dateTime={publishedDateTime}
          className="mb-2 mt-4 block font-sans text-sm text-muted md:text-base"
        >
          <RelativeDate date={publishedDateTime} />
        </time>
        <hr />

        {/* blog content */}
        <article className="prose prose-lg mt-8 text-pretty break-words">
          <CustomMDX
            source={post.content}
            trip={post.metadata.trip || undefined}
          />
        </article>
      </section>
    </Wrapper>
  );
}

export default Blog;
