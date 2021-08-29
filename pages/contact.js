import MaxWidthWrapper from "../components/MaxWidthWrapper";
import SideTitle from "../components/SideTitle";
import { Socials, socialsObj } from "../components/Socials";

const contact = ({ className }) => {
  return (
    <main className={`${className} relative md:mt-6`}>
      <SideTitle className="mt-20">/contact</SideTitle>

      <MaxWidthWrapper className="pt-2">
        <div className="flex text-xl">
          <Socials className="flex-col text-3xl gap-4" withDescription />
        </div>
      </MaxWidthWrapper>
    </main>
  );
};

export default contact;
