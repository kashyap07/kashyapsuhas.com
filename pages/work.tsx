import * as reactPdf from "react-pdf";
import Link from "next/link";
import MaxWidthWrapper from "../components/MaxWidthWrapper";
import SideTitle from "../components/SideTitle";
import clsx from "clsx";
reactPdf.pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${reactPdf.pdfjs.version}/pdf.worker.js`;

const Work = ({ className }: { className?: string }) => {
  const pdfFile = "/Resume.pdf";

  return (
    <main className={clsx("relative md:mt-6", className)}>
      <SideTitle>WORK</SideTitle>

      <MaxWidthWrapper className="flex items-center justify-center p-5">
        <Link href="/Resume.pdf">
          <a target="_blank" className="overflow-scroll border border-gray-200">
            <reactPdf.Document file={pdfFile}>
              <reactPdf.Page pageNumber={1} />
            </reactPdf.Document>
          </a>
        </Link>
      </MaxWidthWrapper>
    </main>
  );
};

export default Work;
