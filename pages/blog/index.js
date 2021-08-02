import Link from "next/link";

const { BLOG_URL, CONTENT_API_KEY } = process.env;

const getPosts = async () => {
  const res = await fetch(
    `${BLOG_URL}/ghost/api/v3/content/posts?key=${CONTENT_API_KEY}&include=tags&fields=title,slug,published_at`
  ).then((res) => res.json());

  return res.posts;
};

// https://nextjs.org/docs/basic-features/data-fetching#getstaticprops-static-generation
export const getStaticProps = async () => {
  const posts = await getPosts();
  return {
    revalidate: 10,
    props: { posts },
  };
};

const Blog = (props) => {
  const { posts } = props;

  return (
    <main className="mb-auto">
      <div className="flex items-center text-xl">
        <ul className="flex flex-col">
          {posts.map((post) => (
            <li key={post.slug}>
              {/* filter by tag? Maybe some other identifier for seperation */}
              <Link
                href={"/blog/post/[slug]"}
                as={`/blog/post/${post.slug}`}
                passHref
              >
                <a className="flex items-baseline justify-between sm:justify-start sm:gap-6 mb-2">
                  <span className="font-semibold w-8/12 sm:w-auto">
                    {post.title}
                  </span>
                  <span className="text-sm text-gray-800 font-mono">
                    {new Date(post.published_at).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                  </span>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
};

export default Blog;
