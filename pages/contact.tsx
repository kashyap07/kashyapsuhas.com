import MaxWidthWrapper from "../components/MaxWidthWrapper";
import SideTitle from "../components/SideTitle";
import { Socials } from "../components/Socials";

const contact = ({ className }: { className?: string }) => {
  return (
    <main className={`${className} relative md:mt-6`}>
      <SideTitle className="mt-20">CONTACT</SideTitle>

      <MaxWidthWrapper className="pt-2">
        <div className="flex text-xl">
          <Socials className="flex-col gap-4 text-3xl" withDescription />
        </div>
      </MaxWidthWrapper>
    </main>
  );
};

export default contact;
