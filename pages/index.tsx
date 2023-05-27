import getProcessedIGImages from '@utils/getProcessedIGImages';
import Image from 'next/image';
import MaxWidthWrapper from '@components/MaxWidthWrapper';
import PreviewRecentIG from '@components/PreviewRecentIG';
import PreviewRecentPosts from '@components/PreviewRecentPosts';
import { getFrontMatters } from '@utils/getFrontMatters';
import { ScrollDownIndicator } from '@components/CSSElements';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import ReactCurvedText from 'react-curved-text';

export async function getStaticProps() {
  const frontMatters = await getFrontMatters();
  // const posts = await getProcessedIGImages(5);

  return {
    props: {
      frontMatterData: frontMatters,
      // igPosts: posts,
    },
    revalidate: 1800, // check once every 30 seconds
  };
}

const Home = ({ ...props }) => {
  const fm = props.frontMatterData;
  // const igPosts = props.igPosts;
  const router = useRouter();

  return (
    <>
      <NextSeo
        title="Suhas Kashyap"
        description="Welcome to Suhas Kashyap's slice of the interwebs"
        openGraph={{
          title: 'Suhas Kashyap',
          description: "Welcome to Suhas Kashyap's slice of the interwebs",
          images: [
            {
              url: 'https://www.kashyapsuhas.com/_next/image?url=%2Fprofile_640.jpg&w=640&q=75',
              width: 320,
              height: 320,
              alt: 'Suhas Kashyap',
              type: 'image/jpg',
            },
          ],
          site_name: 'SiteName',
        }}
        twitter={{
          handle: 'kashyapS07',
          site: 'https://www.kashyapsuhas.com',
          cardType: 'summary_large_image',
        }}
      />
      <main className="w-full">
        <div
          data-element="main-section"
          className="relative mb-auto flex min-h-screen w-full flex-col items-center justify-center"
        >
          <MaxWidthWrapper className="relative flex w-full items-center justify-center">
            <div className="flex w-full flex-col items-center justify-between gap-10 md:flex-row md:gap-0">
              <div className="flex w-full flex-col justify-center gap-6 md:w-2/3">
                <div className="flex w-full flex-col justify-center gap-2">
                  <span className="text-3xl !font-bold text-black md:text-4xl">
                    <span className="wiggle">👋</span> Hello there, I&apos;m
                  </span>
                  <span className="text-5xl !font-bold text-black md:text-6xl">SUHAS KASHYAP</span>
                </div>

                <span className="text-3xl md:text-4xl">Welcome to my slice of the Interwebs.</span>
              </div>

              <div className="relative h-[322px] w-[322px] overflow-hidden">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform font-mono text-lg md:text-xl">
                  <ReactCurvedText
                    width={322}
                    height={322}
                    cx={161}
                    cy={161}
                    rx={158}
                    ry={158}
                    startOffset={0}
                    reversed={false}
                    text="forever curious 🤔 pizza connoisseur 🍕 web guy 💻 likes taking photos a bit too much 📷"
                    // textProps={{ style: { fontSize: 20 } }}
                    textPathProps={null}
                    tspanProps={null}
                    ellipseProps={null}
                    svgProps={{ className: 'rotating-curved-text' }}
                  />
                </div>

                <div className="absolute left-1/2 top-1/2 h-5/6 w-5/6 -translate-x-1/2 -translate-y-1/2 transform">
                  <Image
                    src={'/profile_640.jpg'}
                    alt="suhas image"
                    layout="fixed"
                    height={320}
                    width={320}
                    priority={true}
                    className="rounded-full"
                  />
                </div>
              </div>

              {/* </div> */}
            </div>
          </MaxWidthWrapper>

          <ScrollDownIndicator />
        </div>

        <div data-element="main-section" className="flex">
          <MaxWidthWrapper className="mb-8 flex w-full flex-col items-start gap-8">
            {/* @ts-ignore */}
            <PreviewRecentPosts fm={fm} />
            {/* @ts-ignore */}
            {/* <PreviewRecentIG router={router} igPosts={igPosts} /> */}
          </MaxWidthWrapper>
        </div>
      </main>
    </>
  );
};

export default Home;
