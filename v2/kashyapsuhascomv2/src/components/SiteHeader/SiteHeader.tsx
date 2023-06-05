import Link from 'next/link';

import { twMerge } from 'tailwind-merge';
import clsx, { ClassValue } from 'clsx';
import { useState } from 'react';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/SideBar';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="supports-backdrop-blur:bg-background/60 sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center">
        <>
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              logo
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/docs" className={cn('hover:text-foreground/80 transition-colors')}>
                Documentation
              </Link>
              <Link
                href="/docs/components"
                className={cn('hover:text-foreground/80 transition-colors')}
              >
                Components
              </Link>
              <Link href="/examples" className={cn('hover:text-foreground/80 transition-colors')}>
                Examples
              </Link>
            </nav>
          </div>
        </>

        {/* ----- */}

        <>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden">
                <span className="sr-only">Toggle Menu</span>
              </button>
            </SheetTrigger>
            <SheetContent size="xl" position="left" className="pr-0">
              <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6"></div>
            </SheetContent>
          </Sheet>

          {/* TODO: setOpen for indiv links as well */}
          {/* https://github.com/shadcn/ui/blob/main/apps/www/components/mobile-nav.tsx */}
        </>

        <div className="flex flex-1 items-center justify-between space-x-2 sm:space-x-4 md:justify-end">
          <nav className="flex items-center space-x-1">link 1 and 2</nav>
        </div>
      </div>
    </header>
  );
}
