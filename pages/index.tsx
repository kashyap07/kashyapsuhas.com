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
  // const posts = await getProcessedIGImages(5);

  return {
    props: {
      frontMatterData: frontMatters,
      // igPosts: posts,
    },
    // revalidate: 1800, // check once every 30 seconds
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
        className="relative mb-auto flex min-h-minusHeader flex-col items-center justify-center"
      >
        <MaxWidthWrapper className="relative mb-48 flex justify-center">
          <>
            <div className="z-20 flex" data-element="home-card">
              <div className="flex select-none flex-col justify-center gap-6 text-3xl font-bold">
                <span className="text-5xl md:text-6xl">
                  Hello there, I&apos;m Suhas <span className="wiggle">👋</span>
                </span>
                <span className="text-3xl md:text-4xl ">
                  Welcome to my slice of the Interwebs.
                </span>
              </div>
            </div>
            {/* https://stackoverflow.com/a/70255414/5111966 */}
            {/* https://css-tricks.com/almanac/properties/w/will-change/ */}
            <TealHalo className="top-2/3 left-1/2 z-10 scale-250 delay-500 ease-linear " />
          </>
        </MaxWidthWrapper>

        <ScrollDownIndicator />
      </div>

      <div data-element="main-section" className="flex">
        <MaxWidthWrapper className="flex w-full flex-col items-start">
          <>
            {/* @ts-ignore */}
            <PreviewRecentPosts fm={fm} />
            {/* @ts-ignore */}
            <PreviewRecentIG router={router} igPosts={igPosts} />
          </>
        </MaxWidthWrapper>
      </div>
    </main>
  );
};

export default Home;
