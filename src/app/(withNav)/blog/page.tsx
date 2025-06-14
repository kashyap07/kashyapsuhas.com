import Link from "next/link";

import { Wrapper } from "@/components/Wrapper";
import { getBlogPosts } from "@/db/blog";

export const metadata = {
  title: "Kashyap's Blog | Suhas Kashyap",
  description: "Kashyap's Blog.",
  alternates: {
    canonical: "https://kashyapsuhas.com/blog",
  },
  keywords: ["Suhas Kashyap", "blog"],
};

function Blog() {
  const blogPosts = getBlogPosts();

  const formatter = new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

  return (
    <Wrapper className="mb-12 w-full md:mb-20">
      <ul className="flex flex-col">
        {blogPosts.map((post) => (
          <Link key={post.slug} className="my-4" href={`/blog/${post.slug}`}>
            <li className="flex flex-col md:flex-row md:items-end md:justify-between">
              <span className="text-3xl font-medium">
                {post.metadata.title}
              </span>

              <span className="text-l min-w-fit text-gray-600">
                {formatter.format(new Date(post.metadata.publishedDateTime))}
              </span>
            </li>
          </Link>
        ))}
      </ul>
    </Wrapper>
  );
}

export default Blog;
