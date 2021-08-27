import Link from "next/link";
import MaxWidthWrapper from "../components/MaxWidthWrapper";
import { ScrollDownIndicator } from "../components/CSSElements";
import Socials from "../components/Socials";
import { getFrontMatters } from "../utils/getFrontMatters";
import { BsArrowRight } from "react-icons/bs";
import moment from "moment";

export async function getStaticProps() {
  const frontMatters = await getFrontMatters();

  return {
    props: {
      frontMatterData: frontMatters,
    },
  };
}

const Home = ({ className, ...props }) => {
  const fm = props.frontMatterData;
  console.log(fm);

  return (
    <main className={`w-full ${className}`}>
      <div
        data-element="main-section"
        className="flex flex-col mb-auto min-h-minusHeader justify-center items-center relative"
      >
        <MaxWidthWrapper className="flex justify-center">
          <div className="flex" data-element="home-card">
            <div className="flex flex-col justify-center gap-6 mb-48 font-bold text-3xl text-gray-900">
              <span className="text-5xl md:text-6xl">
                Hello there, I&apos;m Suhas <span className="wiggle">👋</span>
              </span>
              <span className="text-3xl md:text-4xl text-gray-800">
                Welcome to my slice of the Interwebs.
              </span>
            </div>
          </div>
        </MaxWidthWrapper>

        <ScrollDownIndicator />
      </div>

      <div data-element="main-section" className="flex">
        <MaxWidthWrapper className="flex flex-col items-start w-full">
          <div data-element="preview-section" className="w-full my-2">
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
              <a className="flex flex-row items-center gap-1 group">
                See more{" "}
                <BsArrowRight className="transition-transform duration-700 translate-x-0 group-hover:translate-x-2" />
              </a>
            </Link>
          </div>

          <div data-element="preview-section" className="my-2">
            <h2 className="text-primary">Recent Photos</h2>
          </div>
          {/* <div data-element="preview-section" className="my-2">
            <h2>What I&apos;m listening to on spotify rn</h2>
          </div> */}
          <div data-element="preview-section" className="my-2">
            <h2 className="text-primary">Socials</h2>
            <Socials />
          </div>
        </MaxWidthWrapper>
      </div>
    </main>
  );
};

export default Home;
