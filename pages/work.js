import Link from "next/link";
import MaxWidthWrapper from "../components/MaxWidthWrapper";
import SideTitle from "../components/SideTitle";
import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const Work = ({ className }) => {
  const pdfFile = "/Resume.pdf";

  return (
    <main className={`${className} relative md:mt-6`}>
      <SideTitle>/work</SideTitle>

      <MaxWidthWrapper className="p-5 flex justify-center items-center">
        <Link href="/Resume.pdf">
          <a target="_blank" className="overflow-scroll border border-gray-200">
            <Document file={pdfFile}>
              <Page pageNumber={1} />
            </Document>
          </a>
        </Link>
      </MaxWidthWrapper>
    </main>
  );
};

export default Work;
