import fs from 'fs';
import Link from 'next/link';
import matter from 'gray-matter';
import MaxWidthWrapper from '@components/MaxWidthWrapper';
import path from 'path';
import SideTitle from '@components/SideTitle';
// @ts-ignore
import toc from 'markdown-toc';
import { h1, h2, h3, h4, inlineCode, pre } from '@components/OverrRideDefaultHTML';
import { HiChevronRight } from 'react-icons/hi';
import { marked } from 'marked';
import { MDXProvider } from '@mdx-js/react';
import { MDXRemote } from 'next-mdx-remote';
import { NextSeo } from 'next-seo';
import { serialize } from 'next-mdx-remote/serialize';
import { useRouter } from 'next/router';

const getPost = async (slug: string) => {
  // FIXME: hardcoded to mdx
  const postContent = fs.readFileSync(path.join(process.cwd(), 'Blog', `${slug}.mdx`), 'utf8');

  console.log({ postContent });

  const frontMatter = JSON.parse(JSON.stringify(matter(postContent)));
  const { creation_date, ...frontMatterWithoutDate } = frontMatter.data;
  const tocList = toc(frontMatter.content);
  const mdxSource = await serialize(frontMatter.content);
  const postDescription = frontMatter.data.description || '';

  let post = {
    ...frontMatterWithoutDate,
    date: new Date(frontMatter.data.creation_date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    toc: marked(tocList.content),
    mdxSource: mdxSource,
    postDescription,
  };

  console.log({ post });

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
    paths: [],
    fallback: true,
  };
};

const Breadcrumb = ({ category }: { category: any }) => (
  <>
    {/* https://tailwindesign.com/components/breadcrumbhttps://tailwindesign.com/components/breadcrumb */}
    <ul className="mb-1 flex text-sm text-black">
      <li className="inline-flex items-center">
        <Link href="/">
          <a>HOME</a>
        </Link>
        <HiChevronRight className="text-xl" />
        {/* Convert to a component, set direction as props */}
      </li>
      <li className="inline-flex items-center">
        <Link href="/blog">
          <a>BLOG</a>
        </Link>
        <HiChevronRight className="text-xl" />
      </li>
      <li className="inline-flex items-center">
        <Link href="/">
          <a className="uppercase">{category}</a>
        </Link>
      </li>
    </ul>
  </>
);

const Slug = ({ className = '', ...props }) => {
  const { post } = props;
  const router = useRouter();

  return (
    <>
      <NextSeo
        title={post?.title}
        description={post?.postDescription}
        openGraph={{
          title: post?.title,
          description: post?.postDescription,
          images: [
            {
              url: 'https://www.kashyapsuhas.com/_next/image?url=%2Fprofile_640.jpg&w=640&q=75',
              width: 320,
              height: 320,
              alt: 'Suhas Kashyap',
              type: 'image/jpg',
            },
          ],
          site_name: 'SiteName',
        }}
        twitter={{
          handle: 'kashyapS07',
          site: 'https://www.kashyapsuhas.com',
          cardType: 'summary_large_image',
        }}
      />
      {/* @ts-ignore */}
      <MDXProvider components={components}>
        <main className={`${className} relative md:mt-6`}>
          <SideTitle>{post?.date?.split(' ')?.at(-1) || 'POST'}</SideTitle>

          <MaxWidthWrapper withBg>
            <div className="pt-5 text-xl md:px-7">
              {router.isFallback ? (
                <span>Loading post, please wait...</span>
              ) : (
                <>
                  <Breadcrumb category={post.category} />
                  <div className="mb-10 flex flex-col items-baseline justify-between gap-2 border-b-4 pb-5 font-sans">
                    <h1 className="break-words text-5xl font-bold">{post.title}</h1>
                    <span className="text-base font-medium text-black">{post.date}</span>
                  </div>

                  <div data-element="post-body" className="relative justify-between md:flex">
                    <div data-element="post-prose" className="lg:w-full lg:max-w-prose">
                      {/* FIXME:  overflow-x-hidden SHITTY FIX FOR NON-STYLED CODE SNIPPET */}
                      {/* FIXME:  MANUAL PRE ADDED */}
                      <div className="prose prose-base max-w-none font-serif text-black md:prose-lg">
                        <MDXRemote {...post.mdxSource} components={components} />
                      </div>
                    </div>
                    <aside
                      data-element="post-table-of-contents"
                      className="sticky top-1/4 ml-10 hidden h-80 w-auto flex-col lg:flex"
                    >
                      <h2 className="text-primary">Table of contents</h2>
                      <nav
                        data-element="table-of-contents"
                        className="table-of-contents font-serif"
                        dangerouslySetInnerHTML={{ __html: post.toc }}
                      />
                    </aside>
                  </div>
                </>
              )}
            </div>
          </MaxWidthWrapper>
        </main>
      </MDXProvider>
    </>
  );
};

export default Slug;
