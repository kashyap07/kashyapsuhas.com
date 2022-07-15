import { useRouter } from "next/router";
import Link from "next/link";
import fs from "fs";
import matter from "gray-matter";
import { marked } from "marked";
import SideTitle from "../../../components/SideTitle";
import MaxWidthWrapper from "../../../components/MaxWidthWrapper";
import { HiChevronRight } from "react-icons/hi";
// @ts-ignore
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

const getPost = async (slug: string) => {
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

export const getStaticProps = async ({ params }: { params: any }) => {
  const post = await getPost(params.slug);
  return {
    props: { post },
  };
};

export const getStaticPaths = () => {
  return {
    paths: ["/blog/post/how-i-built-this-site-a-guide"],
    fallback: false,
  };
};

const Breadcrumb = ({ category }: { category: any }) => (
  <>
    {/* https://tailwindesign.com/components/breadcrumbhttps://tailwindesign.com/components/breadcrumb */}
    <ul className="flex mb-1 text-sm text-gray-500 dark:text-gray-300">
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
    // @ts-ignore
    <MDXProvider components={components}>
      <main className={`${className} relative md:mt-6`}>
        <SideTitle>/post</SideTitle>

        <MaxWidthWrapper withBg>
          <div className="pt-5 text-xl md:px-7">
            {router.isFallback ? (
              <span>Loading post, please wait...</span>
            ) : (
              <>
                <Breadcrumb category={post.category} />
                <div className="flex flex-col items-baseline justify-between gap-2 pb-5 mb-10 border-b-4 dark:border-gray-700">
                  <h1 className="text-5xl font-bold break-words">
                    {post.title}
                  </h1>
                  <span className="text-base font-medium text-gray-700 dark:text-gray-200">
                    {post.date}
                  </span>
                </div>

                <div
                  data-element="post-body"
                  className="relative justify-between md:flex"
                >
                  <div
                    data-element="post-prose"
                    className="lg:max-w-prose lg:w-full"
                  >
                    {/* <InnerHTML
                    html={post.html.compiledSource}
                    className="prose md:prose-lg dark:prose-dark max-w-none"
                  /> */}
                    <div className="prose prose-lg dark:prose-dark max-w-none">
                      <MDXRemote {...post.mdxSource} components={components} />
                    </div>
                  </div>
                  <aside
                    data-element="post-table-of-contents"
                    className="sticky flex-col hidden w-auto mx-10 lg:flex h-80 top-1/4"
                  >
                    <h2 className="text-primary">Table of contents</h2>
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
