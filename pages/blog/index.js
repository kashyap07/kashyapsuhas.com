import { readFiles } from "../../utils/fileUtils";
import Link from "next/link";
import MaxWidthWrapper from "../../components/MaxWidthWrapper";
import SideTitle from "../../components/SideTitle";
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

const Blog = ({ className, ...props }) => {
  // call it file meta data or something and also have title (slug)
  const fm = props.frontMatterData;

  return (
    <main className={` ${className} relative py-10`}>
      <SideTitle>/blog</SideTitle>

      <MaxWidthWrapper body>
        <div className="text-xl">
          <ul className="flex flex-col w-full">
            {fm.map((item, index) => {
              return (
                <div key={index}>
                  {console.log(item)}
                  <Link
                    href={`/blog/post/${item.filename
                      .split(".")
                      .slice(0, -1)
                      .join(".")}`}
                  >
                    <a>
                      {item.title} --{" "}
                      {new Date(item.creation_date).toLocaleDateString(
                        "en-IN",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </a>
                  </Link>
                </div>
              );
            })}
          </ul>
        </div>
      </MaxWidthWrapper>
    </main>
  );
};

export default Blog;
