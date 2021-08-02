import Link from "next/link";

const { BLOG_URL, CONTENT_API_KEY } = process.env;

const getPosts = async () => {
  const res = await fetch(
    `https://kashyapsuhas-ghostcms.herokuapp.com/ghost/api/v3/content/posts?key=${CONTENT_API_KEY}&include=tags&fields=title,slug,published_at`
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
                <a className="flex gap-6 items-end">
                  <span className="font-semibold text-2xl">{post.title}</span>
                  <span className="text-sm  text-gray-800 font-mono">
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
