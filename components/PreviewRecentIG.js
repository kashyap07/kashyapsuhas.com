/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { BsArrowRight } from "react-icons/bs";

const PreviewRecentIG = ({ router, igPosts, className }) => {
  if (router.isFallback) return <span>Loading IG posts, please wait...</span>;
  else if (igPosts) {
    return (
      <div data-element="preview-section" className="my-2 w-full">
        <h2 className="text-primary">Recent Photos</h2>

        <div data-component="recent-instagrams" className="flex md:pl-2 py-2">
          <div className="flex flex-row flex-wrap md:flex-nowrap w-full justify-between items-center">
            {igPosts.map((post) => (
              <Link key={post.id} href={post.permalink}>
                <a className="m-2 relative">
                  <img
                    src={post.media_url}
                    alt="Open image in Instagram"
                    className="max-h-igImagePreview"
                  />
                </a>
              </Link>
            ))}
          </div>
        </div>

        <Link href="https://www.instagram.com/kashyap_07">
          <a
            className="flex flex-row items-center gap-1 group"
            aria-label="See more Instagram.com"
            target="_blank"
          >
            See more{" "}
            <BsArrowRight className="transition-transform duration-700 translate-x-0 group-hover:translate-x-2" />
          </a>
        </Link>
      </div>
    );
  } else return false;
};

export default PreviewRecentIG;
