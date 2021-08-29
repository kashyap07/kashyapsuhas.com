import MaxWidthWrapper from "../components/MaxWidthWrapper";
import SideTitle from "../components/SideTitle";

const Work = ({ className }) => {
  return (
    <main className={`${className} relative md:mt-6`}>
      <SideTitle>/work</SideTitle>

      <MaxWidthWrapper>
        <div className="flex text-xl">Work page under construction</div>
      </MaxWidthWrapper>
    </main>
  );
};

export default Work;
