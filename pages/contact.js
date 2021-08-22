import MaxWidthWrapper from "../components/MaxWidthWrapper";
import SideTitle from "../components/SideTitle";
import Socials from "../components/Socials";

const contact = ({ className }) => {
  return (
    <main className={` ${className} relative py-24`}>
      <SideTitle>/contact</SideTitle>

      <MaxWidthWrapper>
        <div className="flex text-xl">
          <Socials />
        </div>
      </MaxWidthWrapper>
    </main>
  );
};

export default contact;
