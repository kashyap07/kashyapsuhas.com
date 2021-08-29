import Link from "next/link";
import moment from "moment";
import { BsArrowRight } from "react-icons/bs";

const PreviewRecentPosts = ({ fm, className }) => {
  if (fm) {
    return (
      <div
        data-element="preview-section"
        className={`w-full my-2 ${className}`}
      >
        <h2 className="text-primary">Recent Blog Posts</h2>
        <ul className="flex flex-col w-full p-2 gap-5 md:gap-1">
          {fm.slice(0, 3).map((item, index) => {
            return (
              <li className="w-full" key={index}>
                <Link
                  href={`/blog/post/${item.filename
                    .split(".")
                    .slice(0, -1)
                    .join(".")}`}
                >
                  <a className="flex flex-col md:flex-row font-medium justify-between">
                    <span className="text-lg">{item.title}</span>
                    <span className="text-gray-600">
                      {moment(item.creation_date).fromNow()}
                    </span>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>

        <Link href="/blog">
          <a
            className="flex flex-row items-center gap-1 group"
            aria-label="See more in Blog page"
          >
            See more{" "}
            <BsArrowRight className="transition-transform duration-700 translate-x-0 group-hover:translate-x-2" />
          </a>
        </Link>
      </div>
    );
  } else return false;
};

export default PreviewRecentPosts;
