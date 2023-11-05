import * as reactPdf from 'react-pdf';
import Link from 'next/link';
import MaxWidthWrapper from '../components/MaxWidthWrapper';
import SideTitle from '../components/SideTitle';
import clsx from 'clsx';
reactPdf.pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${reactPdf.pdfjs.version}/pdf.worker.js`;

const Work = ({ className }: { className?: string }) => {
  const pdfFile = '/suhas-resume.pdf';

  return (
    <main className={clsx('relative md:mt-6', className)}>
      <SideTitle className="">WORK</SideTitle>

      <MaxWidthWrapper className="flex flex-col gap-20 p-5">
        <div className="text-xl font-normal md:px-12">
          <p className="pb-2 text-2xl">
            Hey there <span className="wiggle">👋</span>
          </p>
          <p className="">I currently work for Rakuten India as a Senior Software Engineer II</p>

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

export default Work;
