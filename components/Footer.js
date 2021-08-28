import Socials from "./Socials";
import MaxWidthWrapper from "./MaxWidthWrapper";
import Link from "next/link";

const Footer = ({ className }) => {
  return (
    <footer className={`relative bg-gray-200 z-40 ${className}`}>
      <MaxWidthWrapper className="flex flex-row justify-between items-center py-5">
        <span className="">Thanks for visiting!</span>
        <span>
          View
          <Link href="https://github.com/kashyap07/kashyapsuhas.com">
            <a className="text-secondary"> source.</a>
          </Link>
        </span>

        {/* <Socials /> */}
      </MaxWidthWrapper>
    </footer>
  );
};

export default Footer;
