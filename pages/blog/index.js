import Link from "next/link";
import MaxWidthWrapper from "../../components/MaxWidthWrapper";
import SideTitle from "../../components/SideTitle";
import { getFrontMatters } from "../../utils/getFrontMatters";
import moment from "moment";

export async function getStaticProps() {
  const frontMatters = await getFrontMatters();

  return {
    props: {
      frontMatterData: frontMatters,
    },
  };
}

const Blog = ({ className, ...props }) => {
  const fm = props.frontMatterData;

  return (
    <main className={`${className} relative md:mt-6`}>
      <SideTitle>/blog</SideTitle>

      <MaxWidthWrapper>
        <div className="text-xl md:px-10 pt-5">
          <ul className="flex flex-col w-full gap-4">
            {fm.map((item, index) => {
              return (
                <>
                  <li className="w-full" key={index}>
                    <Link
                      href={`/blog/post/${item.filename
                        .split(".")
                        .slice(0, -1)
                        .join(".")}`}
                    >
                      <a className="flex flex-col font-medium justify-between">
                        <span className="text-xl">{item.title}</span>
                        <span className="text-gray-600 text-base">
                          {/* {moment(item.creation_date).fromNow()} */}
                          {moment(item.creation_date).format("MMM Do YYYY")}
                        </span>
                      </a>
                    </Link>
                  </li>
                  <hr />
                </>
              );
            })}
          </ul>
        </div>
      </MaxWidthWrapper>
    </main>
  );
};

export default Blog;
