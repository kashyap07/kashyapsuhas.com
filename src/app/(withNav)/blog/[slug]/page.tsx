import type { Metadata } from "next";
import { Suspense, cache } from "react";
import { notFound } from "next/navigation";
import CustomMDX from "@/components/Mdx";
import { getBlogPosts } from "@/db/blog";
import { Wrapper } from "@/components/Wrapper";
import formatDate from "@/utils/formatDate";

export async function generateMetadata({
  params,
}: {
  params: any;
}): Promise<Metadata | undefined> {
  const post = getBlogPosts().find((post) => post.slug === params.slug);

  if (!post) return;

  const { publishedDateTime, title, description, heroImage } = post.metadata;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Suhas Kashyap`,
      description,
      type: "article",
      publishedTime: publishedDateTime,
      authors: "Suhas Kashyap",
      url: `https://kashyapsuhas.com/blog/${post.slug}`,
      images: [
        {
          url: heroImage,
        },
      ],
    },
  };
}

export default function Blog({ params }: { params: { slug: string } }) {
  let post = getBlogPosts().find((post) => post.slug === params.slug);

  if (!post) notFound();

  return (
    <Wrapper className="mb-12 w-full md:mb-20">
      <section>
        {/* structured data */}
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: post.metadata.title,
              datePublished: post.metadata.publishedDateTime,
              dateModified: post.metadata.publishedDateTime,
              description: post.metadata.description,
              image: post.metadata.heroImage,
              url: `https://kashyapsuhas.com/blog/${post.slug}`,
              author: {
                "@type": "Person",
                name: "Suhas Kashyap",
                url: "https://www.kashyapsuhas.com",
              },
            }),
          }}
        />

        {/* title */}
        <h1 className="title w-full text-6xl font-medium md:text-8xl">
          {post.metadata.title}
        </h1>

        {/* time since creation */}
        <Suspense fallback={<p className="h-5" />}>
          <p className="mb-2 mt-4 text-2xl">
            {formatDate(post.metadata.publishedDateTime)}
          </p>
        </Suspense>
        <hr />

        {/* blog content */}
        <article className="prose prose-2xl mt-8 text-pretty break-words">
          <CustomMDX source={post.content} />
        </article>
      </section>
    </Wrapper>
  );
}
