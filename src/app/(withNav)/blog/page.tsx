import Link from "next/link";
import { Wrapper } from "@/components/Wrapper";
import { getBlogPosts } from "@/db/blog";

export const metadata = {
  title: "Kashyap's Blog | Suhas Kashyap",
  description: "Kashyap's Blog.",
};

export default function Blog() {
  const blogPosts = getBlogPosts();

  const formatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

  return (
    <Wrapper className="md:mb-20w-full mb-12">
      <ul className="flex flex-col">
        {blogPosts.map((post) => (
          <Link key={post.slug} className="py-4" href={`/blog/${post.slug}`}>
            <li className="flex flex-col md:flex-row md:items-end md:justify-between">
              <span className="text-3xl font-medium">
                {post.metadata.title}
              </span>
              <span className="text-l min-w-fit text-gray-600">
                {formatter
                  .format(new Date(post.metadata.creation_date))
                  .split(",")
                  .join("")}
              </span>
            </li>
          </Link>
        ))}
      </ul>
    </Wrapper>
  );
}
