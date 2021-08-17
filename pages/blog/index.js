import { readFiles } from "../../utils/fileUtils";
import Link from "next/link";
import Wrapper from "../../components/Wrapper";
import MaxWidthWrapper from "../../components/MaxWidthWrapper";
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

// linear-gradient(
// 180deg
// , transparent, rgba(255,255,255,0.5)), linear-gradient(to top right, var(--tw-gradient-stops));

const Blog = ({ className, ...props }) => {
  // call it file meta data or something and also have title (slug)
  const fm = props.frontMatterData;

  return (
    <main className={` ${className} relative py-24`}>
      {/* <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        className="absolute top-0 wave-seperator-crop filter drop-shadow-wave-seperator"
      >
        <path
          className="fill-current text-white"
          fillOpacity="1"
          d="M0 33C17 64 112 75 151 70C284 60 404.011-23.041 568.842 14.249C698.546 34.245 903 156 1098 158C1236 154 1315 73 1440 120L1440 0 0 0Z"
        ></path>
      </svg> */}
      <MaxWidthWrapper>
        <div className=" text-xl">
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
