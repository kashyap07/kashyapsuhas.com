import MaxWidthWrapper from "../components/MaxWidthWrapper";
import SideTitle from "../components/SideTitle";
import { Socials, socialsObj } from "../components/Socials";

const contact = ({ className }) => {
  const { twitter, github, instagram } = socialsObj;

  return (
    <main className={`${className} relative md:mt-6`}>
      <SideTitle className="mt-20">/contact</SideTitle>

      <MaxWidthWrapper>
        <div className="flex text-xl">
          <Socials list={[twitter, github, instagram]} />
        </div>
      </MaxWidthWrapper>
    </main>
  );
};

export default contact;
