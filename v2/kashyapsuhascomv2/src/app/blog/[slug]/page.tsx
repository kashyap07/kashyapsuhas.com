import Image from 'next/image';

// const getPost = async (slug: string) => {
//   // FIXME: hardcoded to mdx
//   const postContent = fs.readFileSync(path.join(process.cwd(), 'Blog', `${slug}.mdx`), 'utf8');
//   const frontMatter = JSON.parse(JSON.stringify(matter(postContent)));
//   const { creation_date, ...frontMatterWithoutDate } = frontMatter.data;
//   const tocList = toc(frontMatter.content);
//   const mdxSource = await serialize(frontMatter.content);
//   const postDescription = frontMatter.data.description || '';
//   const postHero =
//     frontMatter.data.hero_image ||
//     'https://www.kashyapsuhas.com/_next/image?url=%2Fprofile_640.jpg&w=640&q=75';

//   let post = {
//     ...frontMatterWithoutDate,
//     date: new Date(frontMatter.data.creation_date).toLocaleDateString('en-IN', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//     }),
//     toc: marked(tocList.content),
//     mdxSource: mdxSource,
//     postDescription,
//     postHero,
//   };

//   return post;
// };

// const components = {
//   pre: pre,
//   h1: h1,
//   h2: h2,
//   h3: h3,
//   h4: h4,
//   inlineCode: inlineCode,
// };

export default function Slug({ params }: { params: { slug: string } }) {
  return (
    <main className="p-20">
      <div className="flex w-full flex-col">
        <h1 className="text-5xl">HELLO {params.slug}</h1>
      </div>
    </main>
  );
}
