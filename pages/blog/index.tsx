import Link from "next/link";
import MaxWidthWrapper from "../../components/MaxWidthWrapper";
import moment from "moment";
import SideTitle from "../../components/SideTitle";
import { BsArrowRight } from "react-icons/bs";
import { getFrontMatters } from "../../utils/getFrontMatters";
import { Key } from "react";

export async function getStaticProps() {
  const frontMatters = await getFrontMatters();

  return {
    props: {
      frontMatterData: frontMatters,
    },
  };
}

const Blog = ({ className = "", ...props }) => {
  const fm = props.frontMatterData;

  return (
    <main className={`${className} relative md:mt-6`}>
      <SideTitle>/blog</SideTitle>

      <MaxWidthWrapper>
        <div className="text-xl md:pt-2">
          <ul className="flex flex-col w-full">
            {fm.map(
              (
                item: {
                  filename: string;
                  title: any;
                  creation_date: moment.MomentInput;
                },
                index: Key | null | undefined
              ) => {
                return (
                  <li className="w-full" key={index}>
                    <Link
                      href={`/blog/post/${item.filename
                        .split(".")
                        .slice(0, -1)
                        .join(".")}`}
                    >
                      <a className="flex flex-col justify-between w-full px-2 py-5 font-medium transition-colors duration-300 ease-in border-b group md:px-4 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="flex items-center gap-4">
                          <span className="text-xl">{item.title}</span>
                          <BsArrowRight className="hidden transition-all duration-700 translate-x-0 opacity-0 md:block group-hover:opacity-100 group-hover:translate-x-2 group-hover:text-gray-600" />
                        </div>
                        <span className="text-base text-gray-600 dark:text-gray-300">
                          {moment(item.creation_date).format("MMM Do YYYY")}
                        </span>
                      </a>
                    </Link>
                  </li>
                );
              }
            )}
          </ul>
        </div>
      </MaxWidthWrapper>
    </main>
  );
};

export default Blog;
