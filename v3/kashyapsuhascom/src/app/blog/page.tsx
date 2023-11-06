import Image from "next/image";
import Link from "next/link";

import { Wrapper } from "@/components/Wrapper";
import { MaxWidth } from "@/variables/sizes";

export default function Blog() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between pt-24 md:p-24">
      <Wrapper
        maxWidth={MaxWidth.Wide}
        className="mb-12 md:mb-20 flex w-full flex-col items-center justify-center gap-4"
      >
        <div className="mx-auto mb-10 flex flex-col gap-2">
          <span className="text-3xl">THIS PAGE IS UNDER CONSTRUCTION</span>
        </div>
      </Wrapper>
    </main>
  );
}
