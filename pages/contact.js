import MaxWidthWrapper from "../components/MaxWidthWrapper";
import SideTitle from "../components/SideTitle";

const contact = ({ className }) => {
  return (
    <main className={` ${className} relative py-24`}>
      <SideTitle>/contact</SideTitle>

      <MaxWidthWrapper body>
        <div className="flex text-xl">Contact page under construction</div>
      </MaxWidthWrapper>
    </main>
  );
};

export default contact;
