import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { type BlogPosting, type WithContext } from "schema-dts";

import { StructuredData } from "@components/StructuredData";
import { CustomMDX, Wrapper } from "@components/ui";
import { getBlogPosts } from "@db/blog";
import formatDate from "@utils/formatDate";

export const dynamic = "force-static";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
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

  const { publishedDateTime, title, description, heroImage, categories } =
    post.metadata;

  const articleUrl = `https://kashyapsuhas.com/blog/${post.slug}`;
  const wordCount = post.content.split(/\s+/).length;

  const structuredData: WithContext<BlogPosting> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: description,
    image: {
      "@type": "ImageObject",
      url: heroImage,
    },
    datePublished: publishedDateTime,
    dateModified: publishedDateTime,
    author: {
      "@type": "Person",
      name: "Suhas Kashyap",
      url: "https://kashyapsuhas.com",
      image: {
        "@type": "ImageObject",
        url: "https://kashyapsuhas.com/suhas_og.jpg",
      },
    },
    publisher: {
      "@type": "Organization",
      name: "Suhas Kashyap",
      url: "https://kashyapsuhas.com",
      logo: {
        "@type": "ImageObject",
        url: "https://kashyapsuhas.com/suhas_og.jpg",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    url: articleUrl,
    wordCount: wordCount,
    keywords: categories,
    inLanguage: "en-US",
  };

  return (
    <Wrapper className="mb-12 w-full md:mb-20">
      <section>
        <StructuredData data={structuredData} />

        {/* title */}
        <h1 className="title w-full text-4xl font-medium md:text-8xl">
          {post.metadata.title}
        </h1>

        {/* time since creation */}
        <Suspense fallback={<p className="h-5" />}>
          <p className="mb-2 mt-4 text-xl md:text-2xl">
            {formatDate(post.metadata.publishedDateTime)}
          </p>
        </Suspense>
        <hr />

        {/* blog content */}
        <article className="prose prose-xl md:prose-2xl mt-8 text-pretty break-words">
          <CustomMDX source={post.content} />
        </article>
      </section>
    </Wrapper>
  );
}

export default Blog;
