import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";

const Footer = ({ className }) => {
  return (
    <footer className={`relative bg-background ${className} border-t-2`}>
      <MaxWidthWrapper className="flex flex-row justify-between items-center py-5">
        <span className="font-medium text-base">Thanks for visiting!</span>
        <div className="flex items-center text-sm">
          Working Links: &nbsp;
          <Link href="/">
            <a>Home</a>
          </Link>
          <div className="divider divider-vertical" />
          <Link href="/blog">
            <a>Blog</a>
          </Link>
          <div className="divider divider-vertical" />
          <Link href="/404lol">
            <a>404</a>
          </Link>
        </div>
      </MaxWidthWrapper>
    </footer>
  );
};

export default Footer;
