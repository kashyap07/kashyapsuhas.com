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
      <SideTitle>BLOG</SideTitle>

      <MaxWidthWrapper>
        <div className="text-xl md:pt-2">
          <ul className="flex w-full flex-col">
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
                      <a className=":bg-gray-900 group flex w-full flex-col justify-between border-b px-2 py-5 font-medium transition-colors duration-300 ease-in  hover:bg-gray-50 md:px-4">
                        <div className="flex items-center gap-4">
                          <span className="text-xl">{item.title}</span>
                          <BsArrowRight className="hidden translate-x-0 opacity-0 transition-all duration-700 group-hover:translate-x-2 group-hover:text-white group-hover:opacity-100 md:block" />
                        </div>
                        <span className="text-base text-white ">
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
