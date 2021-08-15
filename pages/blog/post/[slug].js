import { useRouter } from "next/router";
import Link from "next/link";
import fs from "fs";
import matter from "gray-matter";
import marked from "marked";
import InnerHTML from "dangerously-set-html-content";

const getPost = async (slug) => {
  console.log(slug);
  // FIXME: hardcoded to md
  let postContent = fs.readFileSync("Blog/" + slug + ".md");
  let fm = matter(postContent);

  let post = {
    title: fm.data.title,
    date: new Date(fm.data.creation_date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    html: marked(fm.content),
  };
  return post;
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

const Slug = ({ className, ...props }) => {
  const { post } = props;
  const router = useRouter();

  return (
    <main className={`${className}`}>
      <div className="max-width-wrapper">
        <div className="flex flex-col text-xl">
          <Link href="/blog" passHref>
            <a className="text-sm mb-2">{`<- Back to Blog`}</a>
          </Link>
          {router.isFallback ? (
            <span>Loading post, please wait...</span>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-5xl font-bold">{post.title}</h1>
                <span className="text-sm  text-gray-800 font-mono">
                  {post.date}
                </span>
              </div>
              <InnerHTML html={post.html} className="prose max-w-none" />
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default Slug;
