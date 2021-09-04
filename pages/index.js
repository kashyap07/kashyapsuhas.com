/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/router";
import MaxWidthWrapper from "../components/MaxWidthWrapper";
import { ScrollDownIndicator, TealHalo } from "../components/CSSElements";
import PreviewRecentIG from "../components/PreviewRecentIG";
import PreviewRecentPosts from "../components/PreviewRecentPosts";
import { getFrontMatters } from "../utils/getFrontMatters";
import getProcessedIGImages from "../utils/getProcessedIGImages";

export async function getStaticProps() {
  const frontMatters = await getFrontMatters();
  const posts = await getProcessedIGImages(5);

  return {
    props: {
      frontMatterData: frontMatters,
      igPosts: posts,
    },
    revalidate: 1800, // check once every 30 seconds
  };
}

const Home = ({ className = "", ...props }) => {
  const fm = props.frontMatterData;
  const igPosts = props.igPosts;
  const router = useRouter();

  return (
    <main className={`w-full ${className}`}>
      <div
        data-element="main-section"
        className="flex flex-col mb-auto min-h-minusHeader justify-center items-center relative"
      >
        <MaxWidthWrapper className="group flex justify-center relative mb-48">
          <div className="flex z-20" data-element="home-card">
            <div className="flex flex-col justify-center gap-6 font-bold text-3xl select-none">
              <span className="text-5xl md:text-6xl">
                Hello there, I&apos;m Suhas <span className="wiggle">👋</span>
              </span>
              <span className="text-3xl md:text-4xl dark:text-gray-200">
                Welcome to my slice of the Interwebs.
              </span>
            </div>
          </div>
          <TealHalo className="scale-250 top-2/3 left-1/2 group-hover:opacity-70 dark:opacity-70 z-10 delay-500 ease-linear" />
        </MaxWidthWrapper>

        <ScrollDownIndicator />
      </div>

      <div data-element="main-section" className="flex">
        <MaxWidthWrapper className="flex flex-col items-start w-full">
          <PreviewRecentPosts fm={fm} />
          <PreviewRecentIG router={router} igPosts={igPosts} />
        </MaxWidthWrapper>
      </div>
    </main>
  );
};

export default Home;
