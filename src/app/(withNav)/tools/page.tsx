import Link from "next/link";
import { Wrapper } from "@/components/Wrapper";

export const metadata = {
  title: "Kashyap's Blog | Suhas Kashyap",
  description: "Kashyap's Blog.",
};

export default function Tools() {
  return (
    <Wrapper className="md:mb-20w-full mb-12">
      <ul className="flex flex-col">
        <li className="flex flex-col md:flex-row md:items-end md:justify-between">
          <span className="text-3xl font-medium">Image Compressor</span>
        </li>
      </ul>
      Page is WIP
    </Wrapper>
  );
}
