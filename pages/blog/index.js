import { readFiles } from "../../utils/fileUtils";
import Link from "next/link";
import matter from "gray-matter";

export async function getStaticProps() {
  const frontMatters = [];
  await readFiles("Blog").then((files) => {
    files.forEach((post) => {
      let fm = matter(post.contents);

      // date is date object, fix this by modifying frontmatter config in forestry
      let newFMData = { ...fm.data };
      newFMData.filename = post.filename;
      newFMData.creation_date = fm.data.creation_date.getTime();
      frontMatters.push(newFMData);
      console.log(newFMData);
    });
  });

  return {
    props: {
      frontMatterData: frontMatters,
    },
  };
}

const Blog = (props) => {
  // call it file meta data or something and also have title (slug)
  const fm = props.frontMatterData;

  return (
    <main className="mb-auto">
      <div className="flex items-center text-xl">
        <ul className="flex flex-col max-w-none w-full">
          <div className="prose max-w-none">
            {fm.map((item, index) => {
              return (
                <div key={index}>
                  <Link href={`blog/post/${item.filename}`}>
                    <a>{item.title}</a>
                  </Link>
                </div>
              );
            })}
          </div>
        </ul>
      </div>
    </main>
  );
};

export default Blog;
