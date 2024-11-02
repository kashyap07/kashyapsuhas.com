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

  const { creation_date, author, title, description, hero_image } =
    post.metadata;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Suhas Kashyap`,
      description,
      type: "article",
      publishedTime: creation_date,
      authors: author,
      url: `https://kashyapsuhas.com/blog/${post.slug}`,
      images: [
        {
          url: hero_image,
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
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: post.metadata.title,
              datePublished: post.metadata.creation_date,
              dateModified: post.metadata.creation_date,
              description: post.metadata.description,
              image: post.metadata.hero_image,
              url: `https://kashyapsuhas.com/blog/${post.slug}`,
              author: {
                "@type": "Person",
                name: post.metadata.author,
              },
            }),
          }}
        />
        <h1 className="title w-full text-6xl font-medium md:text-8xl">
          {post.metadata.title}
        </h1>
        <Suspense fallback={<p className="h-5" />}>
          <p className="my-4 text-2xl">
            {formatDate(post.metadata.creation_date)}
          </p>
        </Suspense>
        <hr />

        <article className="prose prose-2xl text-pretty break-words">
          <CustomMDX source={post.content} />
        </article>
      </section>
    </Wrapper>
  );
}
