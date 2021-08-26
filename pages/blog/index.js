import Link from "next/link";
import MaxWidthWrapper from "../../components/MaxWidthWrapper";
import SideTitle from "../../components/SideTitle";
import { getFrontMatters } from "../../utils/getFrontMatters";

export async function getStaticProps() {
  const frontMatters = await getFrontMatters();

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
    <main className={`${className} relative md:mt-6`}>
      <SideTitle>/blog</SideTitle>

      <MaxWidthWrapper withBg>
        <div className="text-xl px-6 pt-5">
          <ul className="flex flex-col  w-full">
            {fm.map((item, index) => {
              return (
                <li key={index}>
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
                </li>
              );
            })}
          </ul>
        </div>
      </MaxWidthWrapper>
    </main>
  );
};

export default Blog;
