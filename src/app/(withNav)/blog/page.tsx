import Link from "next/link";

import { Wrapper } from "@components/ui";
import { getBlogPosts } from "@db/blog";

export const metadata = {
  title: "Kashyap's Blog | Suhas Kashyap",
  description: "Kashyap's Blog.",
  alternates: {
    canonical: "https://kashyapsuhas.com/blog",
  },
  keywords: ["Suhas Kashyap", "blog"],
};

// split by year of publication
// is pre-sorted by year
// [[], [], []]
const splitPostsByYear = (posts: ReturnType<typeof getBlogPosts>) => {
  const blogPostsSplitByYear = [[posts[0]]];
  let arrayIdx = 0;

  for (const post of posts.slice(1)) {
    const year = new Date(post.metadata.publishedDateTime).getFullYear();
    const arrayIdxYear =
      new Date(
        blogPostsSplitByYear[arrayIdx][0].metadata.publishedDateTime,
      ).getFullYear() || 0;

    if (year === arrayIdxYear) {
      blogPostsSplitByYear[arrayIdx].push(post);
    } else {
      arrayIdx++;
      blogPostsSplitByYear.push([]);
      blogPostsSplitByYear[arrayIdx].push(post);
    }
  }

  return blogPostsSplitByYear;
};

function Blog() {
  const blogPosts = getBlogPosts();
  const blogPostsSplitByYear = splitPostsByYear(blogPosts);

  const formatter = new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

  return (
    <Wrapper className="mb-12 w-full md:mb-20">
      <ul className="flex flex-col gap-14">
        {blogPostsSplitByYear.map((postGroupByYear, idx) => (
          <li key={idx}>
            <ul className="flex flex-col gap-6">
              {postGroupByYear.map((post) => (
                <Link
                  key={post.slug}
                  className="group"
                  href={`/blog/${post.slug}`}
                >
                  <li className="flex flex-col md:flex-row md:items-end md:justify-between">
                    <span className="text-3xl font-medium">
                      {post.metadata.title}
                    </span>

                    <span className="text-l min-w-fit text-gray-600 group-hover:font-medium group-hover:text-columbiaYellow">
                      {formatter.format(
                        new Date(post.metadata.publishedDateTime),
                      )}
                    </span>
                  </li>
                </Link>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </Wrapper>
  );
}

export default Blog;
