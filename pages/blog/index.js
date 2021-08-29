import Link from "next/link";
import MaxWidthWrapper from "../../components/MaxWidthWrapper";
import SideTitle from "../../components/SideTitle";
import { getFrontMatters } from "../../utils/getFrontMatters";
import moment from "moment";
import { BsArrowRight } from "react-icons/bs";

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
            {fm.map((item, index) => {
              return (
                <li className="w-full" key={index}>
                  <Link
                    href={`/blog/post/${item.filename
                      .split(".")
                      .slice(0, -1)
                      .join(".")}`}
                  >
                    <a className="group flex flex-col px-2 md:px-4 py-5 w-full font-medium justify-between border-b hover:bg-gray-50 transition-colors duration-300 ease-in">
                      <div className="flex items-center gap-4">
                        <span className="text-xl">{item.title}</span>
                        <BsArrowRight className="hidden md:block transition-all duration-700 opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-2 group-hover:text-gray-600" />
                      </div>
                      <span className="text-gray-600 text-base">
                        {moment(item.creation_date).format("MMM Do YYYY")}
                      </span>
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
