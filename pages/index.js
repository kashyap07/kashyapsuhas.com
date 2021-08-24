import MaxWidthWrapper from "../components/MaxWidthWrapper";
import Socials from "../components/Socials";

const Home = ({ className }) => {
  return (
    <main className={`w-full ${className}`}>
      <div
        data-element="section"
        className="flex mb-auto min-h-minusHeader justify-center items-center"
      >
        <MaxWidthWrapper className="flex justify-center">
          <div className="flex" data-element="home-card">
            <div className="flex flex-col justify-center gap-6 font-bold text-3xl text-gray-900">
              <span className="text-4xl md:text-6xl">
                Hello there, I&apos;m Suhas <span className="wiggle">👋</span>
              </span>
              <span className="text-3xl md:text-4xl">
                Welcome to my slice of the Interwebs.
              </span>
            </div>
          </div>
        </MaxWidthWrapper>
      </div>

      <div data-element="section" className="flex min-h-screen">
        <MaxWidthWrapper className="flex flex-col items-start w-full">
          <div data-element="preview-section" className="py-4 my-10">
            <h2>Recent Blog Posts</h2>
          </div>
          <div data-element="preview-section" className="py-4 my-10">
            <h2>Recent Photos</h2>
          </div>
          <div data-element="preview-section" className="py-4 my-10">
            <h2>What I&apos;m listening to on spotify rn</h2>
          </div>
          <div data-element="preview-section" className="py-4 my-10">
            <h2>Socials</h2>
            <Socials />
          </div>
        </MaxWidthWrapper>
      </div>
    </main>
  );
};

export default Home;
