import Image from 'next/image';
import Link from 'next/link';
import { Wrapper } from '@/components/Wrapper';
import { Suspense } from 'react';
import { getBlogPosts } from '@/db/blog';

export const metadata = {
  title: 'Blog',
  description: "Kashyap's blog",
};

export default function Blog() {
  const blogPosts = getBlogPosts();

  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });

  return (
    <Wrapper className="mb-12 md:mb-20w-full">
      <ul className="flex flex-col">
        {blogPosts.map((post) => (
          <Link
            key={post.slug}
            className="hover:bg-neutral-950 py-4 px-6 -mx-6"
            href={`/blog/${post.slug}`}
          >
            <li className="flex flex-col md:flex-row md:justify-between md:items-end gap-2">
              <span className="text-4xl">{post.metadata.title}</span>
              <span className="text-2xl min-w-fit">
                {formatter
                  .format(new Date(post.metadata.creation_date))
                  .split(',')
                  .join('')}
              </span>
            </li>
          </Link>
        ))}
      </ul>
    </Wrapper>
  );
}
