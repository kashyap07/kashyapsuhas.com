import MaxWidthWrapper from "../components/MaxWidthWrapper";
import SideTitle from "../components/SideTitle";

const Work = ({ className }) => {
  return (
    <main className={` ${className} relative py-24`}>
      <SideTitle>/work</SideTitle>

      <MaxWidthWrapper body>
        <div className="flex text-xl">Work page under construction</div>
      </MaxWidthWrapper>
    </main>
  );
};

export default Work;
