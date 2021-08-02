import { useRouter } from "next/router";
import Link from "next/link";

const { BLOG_URL, CONTENT_API_KEY } = process.env;

const getPost = async (slug) => {
  const res = await fetch(
    `${BLOG_URL}/ghost/api/v3/content/posts/slug/${slug}?key=${CONTENT_API_KEY}&fields=title,published_at,html`
  ).then((res) => res.json());

  return res.posts[0];
};

export const getStaticProps = async ({ params }) => {
  const post = await getPost(params.slug);
  return {
    props: { post },
  };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: true,
  };
};

const Slug = (props) => {
  const { post } = props;
  const router = useRouter();

  return (
    <main className="mb-auto">
      <div className="flex flex-col text-xl">
        <Link href="/blog" passHref>
          <a className="text-sm mb-2">{`<- Back to Blog`}</a>
        </Link>
        {router.isFallback ? (
          <span>Loading post, please woldein...</span>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-5xl font-bold">{post.title}</h1>
              <span className="text-sm  text-gray-800 font-mono">
                {new Date(post.published_at).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}{" "}
              </span>
            </div>
            <div
              dangerouslySetInnerHTML={{ __html: post.html }}
              className="prose max-w-none"
            />
          </>
        )}
      </div>
    </main>
  );
};

export default Slug;
