import Socials from "./Socials";
import MaxWidthWrapper from "./MaxWidthWrapper";

const Footer = ({ className }) => {
  return (
    <footer className={`relative bg-gray-200 z-50 ${className}`}>
      <MaxWidthWrapper className="flex flex-row justify-between items-center py-5">
        <span className="font-medium text-base">Thanks for visiting!</span>
        <Socials />
      </MaxWidthWrapper>
    </footer>
  );
};

export default Footer;
