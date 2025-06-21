import Link from 'next/link';

import { Wrapper } from '@/components/ui';
import cn from '@/utils/cn';

export default function NotFound() {
  return (
    <Wrapper className="flex h-screen max-h-screen w-full flex-col items-center justify-center text-center">
      <h1 className="flex flex-col gap-0 text-[10rem] font-medium">
        <span>404</span>
      </h1>
      <Link href="/" className={cn("text-5xl font-bold text-columbiaYellow")}>
        YOU'RE LOST. GO HOME.
      </Link>
    </Wrapper>
  );
}
