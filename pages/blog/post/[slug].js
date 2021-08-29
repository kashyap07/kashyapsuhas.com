import { useRouter } from "next/router";
import Link from "next/link";
import fs from "fs";
import matter from "gray-matter";
import marked from "marked";
import InnerHTML from "dangerously-set-html-content";
import SideTitle from "../../../components/SideTitle";
import MaxWidthWrapper from "../../../components/MaxWidthWrapper";
import { HiChevronRight } from "react-icons/hi";

const getPost = async (slug) => {
  // FIXME: hardcoded to md
  const postContent = fs.readFileSync("Blog/" + slug + ".md");
  const frontMatter = JSON.parse(JSON.stringify(matter(postContent)));

  const { creation_date, ...frontMatterWithoutDate } = frontMatter.data;

  let post = {
    ...frontMatterWithoutDate,
    date: new Date(frontMatter.data.creation_date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    html: marked(frontMatter.content),
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

const Breadcrumb = ({ category }) => (
  <>
    {/* https://tailwindesign.com/components/breadcrumbhttps://tailwindesign.com/components/breadcrumb */}
    <ul className="flex text-gray-500 text-sm mb-1">
      <li className="inline-flex items-center">
        <Link href="/">
          <a>Home</a>
        </Link>
        <HiChevronRight className="text-xl" />
        {/* Convert to a component, set direction as props */}
      </li>
      <li className="inline-flex items-center">
        <Link href="/blog">
          <a>Blog</a>
        </Link>
        <HiChevronRight className="text-xl" />
      </li>
      <li className="inline-flex items-center">
        <Link href="/">
          <a>{category}</a>
        </Link>
      </li>
    </ul>
  </>
);

const Slug = ({ className, ...props }) => {
  const { post } = props;
  const router = useRouter();

  return (
    <main className={`${className} relative md:mt-6`}>
      <SideTitle>/post</SideTitle>

      <MaxWidthWrapper withBg>
        <div className="text-xl md:px-7 pt-5">
          {router.isFallback ? (
            <span>Loading post, please wait...</span>
          ) : (
            <>
              <Breadcrumb category={post.category} />
              <div className="flex flex-col md:flex-row gap-2 justify-between items-baseline">
                <h1 className="text-5xl font-bold">{post.title}</h1>
                <span className="text-base text-gray-700">{post.date}</span>
              </div>
              <hr className="mt-5 mb-8" />

              <InnerHTML html={post.html} className="prose max-w-none" />
            </>
          )}
        </div>
      </MaxWidthWrapper>
    </main>
  );
};

export default Slug;
