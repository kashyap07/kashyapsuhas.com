"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Gallery } from 'react-grid-gallery';

import { Wrapper } from '@/components/Wrapper';
import { MaxWidth } from '@/variables/sizes';

const galleryImages = [
  {
    src: "/gallery/bees.jpg",
    alt: "profile",
  },
  {
    src: "/gallery/vade_vibes.jpg",
    alt: "profile",
  },
  {
    src: "/gallery/reddy_anna.jpg",
    alt: "profile",
  },
  {
    src: "/gallery/badigegagi.jpg",
    alt: "profile",
  },
  {
    src: "/gallery/sugar.jpg",
    alt: "profile",
  },
  {
    src: "/gallery/monke.jpg",
    alt: "profile",
  },
  {
    src: "/gallery/alloys.jpg",
    alt: "profile",
  },
  {
    src: "/gallery/bees_2.jpg",
    alt: "profile",
  },
  {
    src: "/gallery/chandni.jpg",
    alt: "profile",
  },
  {
    src: "/gallery/buddy.jpg",
    alt: "profile",
  },
  {
    src: "/gallery/bangles.jpg",
    alt: "profile",
  },
  {
    src: "/gallery/moo_1.jpg",
    alt: "profile",
  },
  {
    src: "/gallery/moon.jpg",
    alt: "profile",
  },
  {
    src: "/gallery/juice.jpg",
    alt: "profile",
  },
  {
    src: "/gallery/brain.jpg",
    alt: "profile",
  },
  {
    src: "/gallery/feet.jpg",
    alt: "profile",
  },
  {
    src: "/gallery/turkey.jpg",
    alt: "profile",
  },
  {
    src: "/gallery/thai_coconut.jpg",
    alt: "profile",
  },
  {
    src: "/gallery/pink.jpg",
    alt: "profile",
  },
  {
    src: "/gallery/goa_1.jpg",
    alt: "profile",
  },
  {
    src: "/gallery/india.jpg",
    alt: "profile",
  },
  {
    src: "/gallery/ulta.jpg",
    alt: "profile",
  },
  {
    src: "/gallery/gods.jpg",
    alt: "profile",
  },
  {
    src: "/gallery/doll.jpg",
    alt: "profile",
  },
  {
    src: "/gallery/seltos_1.jpg",
    alt: "profile",
  },
  {
    src: "/gallery/minar.jpg",
    alt: "profile",
  },
];

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

        <div className="columns-1 gap-4 sm:columns-2 xl:columns-3 ">
          {galleryImages.map(({ src, alt }, idx) => (
            <Image
              key={idx}
              alt={alt}
              src={src}
              width={720}
              height={480}
              sizes="(max-width: 640px) 100vw,
                  (max-width: 1280px) 50vw,
                  (max-width: 1536px) 33vw,
                  25vw"
              className="mb-4 pointer-events-none"
            />
          ))}
        </div>
      </Wrapper>
    </main>
  );
}

// https://vercel.com/blog/building-a-fast-animated-image-gallery-with-next-js
