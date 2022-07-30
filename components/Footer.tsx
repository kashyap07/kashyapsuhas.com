import clsx from 'clsx';
import Link from 'next/link';
import MaxWidthWrapper from './MaxWidthWrapper';

const Footer = ({ className }: { className?: string }) => {
  return (
    <footer className={clsx('relative z-40  bg-gray-200', className)}>
      <MaxWidthWrapper className="flex flex-row items-center justify-between py-5">
        <>
          <span className="font-semibold">Thanks for visiting!</span>
          <span>
            View
            <Link href="https://github.com/kashyap07/kashyapsuhas.com">
              <a className="font-bold text-secondary"> source.</a>
            </Link>
          </span>
        </>
      </MaxWidthWrapper>
    </footer>
  );
};

export default Footer;
