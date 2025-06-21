import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { CustomMDX, Wrapper } from '@/components/ui';
import { getBlogPosts } from '@/db/blog';
import formatDate from '@/utils/formatDate';

import type { Metadata } from "next";
export async function generateMetadata(props: {
  params: Promise<any>;
}): Promise<Metadata | undefined> {
  const params = await props.params;
  const post = getBlogPosts().find((post) => post.slug === params.slug);

  if (!post) return;

  const { publishedDateTime, title, description, heroImage } = post.metadata;

  return {
    title,
    description,
    keywords: ["Suhas Kashyap", title],
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
    alternates: {
      canonical: `https://kashyapsuhas.com/blog/${post.slug}`,
    },
  };
}

interface Props {
  params: Promise<{ slug: string }>;
}

async function Blog(props: Props) {
  const params = await props.params;
  const post = getBlogPosts().find((post) => post.slug === params.slug);
  if (!post) notFound();

  const { publishedDateTime, title, description, heroImage } = post.metadata;

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
              headline: title,
              datePublished: publishedDateTime,
              dateModified: publishedDateTime,
              description: description,
              image: heroImage,
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

export default Blog;
