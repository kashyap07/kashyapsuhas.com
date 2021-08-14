import Wrapper from "../components/Wrapper";

const Home = () => {
  return (
    <main className="pb-96 bg-gradient-to-tr from-indigo-700 to-headings-end">
      {/* from https://yqnn.github.io/svg-path-editor/ */}

      <div data-element="section" className="relative mb-auto py-24">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          className="absolute top-0"
        >
          <path
            className="fill-current text-white"
            fillOpacity="1"
            d="M0 33C17 64 112 75 151 70C284 60 404.011-23.041 568.842 14.249C698.546 34.245 927 151 1119 154C1236 146 1315 73 1440 120L1440 0 0 0Z"
          ></path>
        </svg>
        <div className="max-width-wrapper">
          <div className="flex flex-col gap-4 font-bold text-4xl text-white">
            <span>Hello there! 👋</span>
            <span>I&apos;m Suhas.</span>
            <span>This is my slice of the Interwebs.</span>
            <span>Woldein for full site. Coming Soon™.</span>
          </div>
        </div>
      </div>

      <div data-element="section" className="relative mb-auto pt-24 pb-640">
        <div className="max-width-wrapper">
          <div className="flex flex-col gap-4 font-bold text-4xl text-white">
            <span>Design inspiration: Nandini milk packet</span>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
