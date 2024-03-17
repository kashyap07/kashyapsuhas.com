import type { Metadata } from 'next';
import { Suspense, cache } from 'react';
import { notFound } from 'next/navigation';
import CustomMDX from '@/components/Mdx';
import { getBlogPosts } from '@/db/blog';
import { unstable_noStore as noStore } from 'next/cache';
import { Wrapper } from '@/components/Wrapper';
import { MaxWidth } from '@/variables/sizes';

export async function generateMetadata({
  params,
}: {
  params: any;
}): Promise<Metadata | undefined> {
  const post = getBlogPosts().find((post) => post.slug === params.slug);

  if (!post) {
    return;
  }

  const { creation_date, author, title, description, hero_image } =
    post.metadata;

  //   TODO: og image
  //   let ogImage = hero_image
  //     ? `https://leerob.io${image}`
  //     : `https://leerob.io/og?title=${title}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
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

function formatDate(date: string) {
  noStore();
  let currentDate = new Date();
  if (!date.includes('T')) {
    date = `${date}T00:00:00`;
  }
  let targetDate = new Date(date);

  let yearsAgo = currentDate.getFullYear() - targetDate.getFullYear();
  let monthsAgo = currentDate.getMonth() - targetDate.getMonth();
  let daysAgo = currentDate.getDate() - targetDate.getDate();

  let formattedDate = '';

  if (yearsAgo > 0) {
    formattedDate = `${yearsAgo}y ago`;
  } else if (monthsAgo > 0) {
    formattedDate = `${monthsAgo}mo ago`;
  } else if (daysAgo > 0) {
    formattedDate = `${daysAgo}d ago`;
  } else {
    formattedDate = 'Today';
  }

  let fullDate = targetDate.toLocaleString('en-us', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return `${fullDate} (${formattedDate})`;
}

// @ts-ignore
export default function Blog({ params }) {
  let post = getBlogPosts().find((post) => post.slug === params.slug);

  if (!post) {
    notFound();
  }

  return (
    <Wrapper className="mb-12 md:mb-20w-full">
      <section>
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: post.metadata.title,
              datePublished: post.metadata.creation_date,
              dateModified: post.metadata.creation_date,
              description: post.metadata.description,
              image: post.metadata.hero_image,
              url: `https://kashyapsuhas.com/blog/${post.slug}`,
              author: {
                '@type': 'Person',
                name: 'Suhas Kashyap',
              },
            }),
          }}
        />
        <h1 className="title font-medium text-6xl md:text-9xl w-full">
          {post.metadata.title}
        </h1>
        <Suspense fallback={<p className="h-5" />}>
          <p className="my-4 text-2xl text-neutral-600 dark:text-neutral-400">
            {formatDate(post.metadata.creation_date)}
          </p>
        </Suspense>
        <hr />

        <article className="prose prose-quoteless prose-neutral dark:prose-invert">
          <CustomMDX source={post.content} />
        </article>
      </section>
    </Wrapper>
  );
}
