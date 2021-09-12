import { useRouter } from "next/router";
import Link from "next/link";
import fs from "fs";
import matter from "gray-matter";
import marked from "marked";
import SideTitle from "../../../components/SideTitle";
import MaxWidthWrapper from "../../../components/MaxWidthWrapper";
import { HiChevronRight } from "react-icons/hi";
import toc from "markdown-toc";
import { serialize } from "next-mdx-remote/serialize";
import { MDXRemote } from "next-mdx-remote";
import { MDXProvider } from "@mdx-js/react";
import {
  pre,
  h1,
  h2,
  h3,
  h4,
  inlineCode,
} from "../../../components/OverrRideDefaultHTML";

const getPost = async (slug) => {
  // FIXME: hardcoded to mdx
  const postContent = fs.readFileSync("Blog/" + slug + ".mdx");
  const frontMatter = JSON.parse(JSON.stringify(matter(postContent)));
  const { creation_date, ...frontMatterWithoutDate } = frontMatter.data;
  const tocList = toc(frontMatter.content);
  const mdxSource = await serialize(frontMatter.content);

  let post = {
    ...frontMatterWithoutDate,
    date: new Date(frontMatter.data.creation_date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    toc: marked(tocList.content),
    mdxSource: mdxSource,
  };

  return post;
};

const components = {
  pre: pre,
  h1: h1,
  h2: h2,
  h3: h3,
  h4: h4,
  inlineCode: inlineCode,
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
    <ul className="flex text-gray-500 dark:text-gray-300 text-sm mb-1">
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

const Slug = ({ className = "", ...props }) => {
  const { post } = props;
  const router = useRouter();

  return (
    <MDXProvider components={components}>
      <main className={`${className} relative md:mt-6`}>
        <SideTitle>/post</SideTitle>

        <MaxWidthWrapper withBg>
          <div className="text-xl md:px-7 pt-5">
            {router.isFallback ? (
              <span>Loading post, please wait...</span>
            ) : (
              <>
                <Breadcrumb category={post.category} />
                <div className="flex flex-col gap-2 justify-between items-baseline">
                  <h1 className="text-5xl font-bold">{post.title}</h1>
                  <span className="text-base text-gray-700 dark:text-gray-200">
                    {post.date}
                  </span>
                </div>
                <hr className="mt-5 mb-8" />

                <div
                  data-element="post-body"
                  className="md:flex justify-between relative"
                >
                  <div
                    data-element="post-prose"
                    className="lg:max-w-prose lg:w-full"
                  >
                    {/* <InnerHTML
                    html={post.html.compiledSource}
                    className="prose md:prose-lg dark:prose-dark max-w-none"
                  /> */}
                    <div className="prose md:prose-lg dark:prose-dark max-w-none">
                      <MDXRemote {...post.mdxSource} components={components} />
                    </div>
                  </div>
                  <aside
                    data-element="post-table-of-contents"
                    className="hidden lg:flex flex-col h-80 w-auto mx-10 sticky top-1/4"
                  >
                    <h2 className="text-secondary">Table of contents</h2>
                    <nav
                      data-element="table-of-contents"
                      className="table-of-contents"
                      dangerouslySetInnerHTML={{ __html: post.toc }}
                    ></nav>
                  </aside>
                </div>
              </>
            )}
          </div>
        </MaxWidthWrapper>
      </main>
    </MDXProvider>
  );
};

export default Slug;
