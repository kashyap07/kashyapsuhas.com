/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/router";
import MaxWidthWrapper from "../components/MaxWidthWrapper";
import {
  PinkHalo,
  ScrollDownIndicator,
  TealHalo,
} from "../components/CSSElements";
import PreviewRecentIG from "../components/PreviewRecentIG";
import PreviewRecentPosts from "../components/PreviewRecentPosts";
import { getFrontMatters } from "../utils/getFrontMatters";
import getProcessedIGImages from "../utils/getProcessedIGImages";
import Image from "next/image";

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

const Home = ({ ...props }) => {
  const fm = props.frontMatterData;
  const igPosts = props.igPosts;
  const router = useRouter();

  return (
    <main className="w-full">
      <div
        data-element="main-section"
        className="relative mb-auto flex min-h-screen w-full flex-col items-center justify-center"
      >
        <MaxWidthWrapper className="relative flex w-full items-center justify-center">
          <div className="flex w-full flex-col items-center justify-between gap-10 md:flex-row md:gap-0">
            <div className="flex w-full flex-col justify-center gap-6 md:w-2/3">
              <span className="text-5xl !font-bold text-black md:text-6xl">
                Hello there,
                <br />
                I&apos;m SUHAS <span className="wiggle">👋</span>
              </span>
              <span className="text-3xl md:text-4xl ">
                Welcome to my slice of the Interwebs.
              </span>
            </div>

            {/* This was for gradient ring around pp */}
            {/* <div className="absolute-center relative flex h-[310px] w-[310px] items-center justify-center rounded-full bg-white">
                <div className="relative flex h-[295px] w-[295px] items-center justify-center rounded-full"> */}

            <div className="relative flex h-56 w-56 md:h-80 md:w-80">
              <Image
                src={"/profile.jpeg"}
                alt="suhas image"
                layout="fill"
                className="select-none rounded-full"
              />
            </div>
          </div>
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
