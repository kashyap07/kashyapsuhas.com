import Image from 'next/image';
import Link from 'next/link';

import { Wrapper } from '@/components/Wrapper';

export default function Blog() {
  return (
    <>
      <Wrapper className="mb-12 md:mb-20 flex w-full flex-col items-center justify-center gap-4">
        <div className="mx-auto mb-10 flex flex-col gap-2">
          <span className="text-3xl">THIS PAGE IS UNDER CONSTRUCTION</span>
        </div>
      </Wrapper>
    </>
  );
}
