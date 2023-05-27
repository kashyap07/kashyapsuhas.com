import * as reactPdf from 'react-pdf';
import Link from 'next/link';
import MaxWidthWrapper from '../components/MaxWidthWrapper';
import SideTitle from '../components/SideTitle';
import clsx from 'clsx';
reactPdf.pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${reactPdf.pdfjs.version}/pdf.worker.js`;

const HireMe = ({ className }: { className?: string }) => {
  const pdfFile = '/suhas-resume.pdf';

  return (
    <main className={clsx('relative md:mt-6', className)}>
      <SideTitle className="mt-20">HIRE ME!</SideTitle>

      <MaxWidthWrapper className="flex flex-col gap-20 p-5">
        <div className="text-xl font-normal md:px-12">
          <p className="pb-2 text-2xl">
            Hey there <span className="wiggle">👋</span>
          </p>
          <p className="">
            I&apos;m looking to get hired at the moment.
            <br />
            <br />
            Here&apos;s what I bring to the table:
          </p>
          <ul className="">
            <li>
              - ~5 years of <u>Full-Stack</u> development experience in the JS world.
            </li>
            <li>
              - Experience in developing Applications from <u>scratch</u>, and moving older tech
              stacks to <u>newer ones</u>.
            </li>
            <li>
              - Expertise in <u>Accessibility</u> (ADA Compliance) on the web.
            </li>
            <li> - Ability to write clean and maintainable code and mentor juniors.</li>
            <li>
              - A passion for building good UI/UX and an eye for design - with an arts background; I
              hold <u>senior degrees</u> in Drawing and Carnatic Classical music.
            </li>
            <li>
              - A fun person in general with loads of hobbies. I can teach you a thing or two about
              a few things :)
            </li>
          </ul>

          <p className="pt-16">
            Follow link for my resume:{' '}
            <a
              href="https://www.kashyapsuhas.com/resume"
              aria-label="Follow for resume"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary"
            >
              kashyapsuhas.com/resume
            </a>
            <br />
            Or just scroll down a bit.
          </p>
        </div>

        <div className="flex w-full items-center justify-center">
          <Link
            href="/suhas-resume.pdf"
            target="_blank"
            className="resume-pdf overflow-scroll border border-gray-200"
          >
            <reactPdf.Document file={pdfFile}>
              <reactPdf.Page pageNumber={1} />
            </reactPdf.Document>
          </Link>
        </div>
      </MaxWidthWrapper>
    </main>
  );
};

export default HireMe;
