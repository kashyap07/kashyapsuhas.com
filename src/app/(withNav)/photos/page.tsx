import Image from "next/image";

import { Wrapper } from "@components/ui";

import galleryImages from "./galleryImages";
import { GalleryImageWrapper, GalleryProvider } from "./PhotoGallery";

// maybe in the future: https://vercel.com/blog/building-a-fast-animated-image-gallery-with-next-js

export const metadata = {
  title: "Kashyap's Photos | Suhas Kashyap",
  description: "Kashyap's Photos.",
  alternates: {
    canonical: "https://www.kashyapsuhas.com/photos",
  },
  keywords: ["Suhas Kashyap photography", "photos", "gallery", "kashyap's photos", "photography"],
};

export default function Photos() {
  return (
    <GalleryProvider>
      <Wrapper className="mb-12 flex w-full flex-col items-center justify-center gap-4 md:mb-20">
        <div className="columns-1 gap-4 sm:columns-2 xl:columns-3">
          {galleryImages.map(({ src, title }, idx) => (
            <GalleryImageWrapper key={idx} src={src} title={title}>
              <Image
                alt={title}
                src={src}
                width={720}
                height={480}
                sizes="(max-width: 640px) 100vw,
                    (max-width: 1280px) 50vw,
                    (max-width: 1536px) 33vw,
                    25vw"
                className="mb-4 cursor-pointer"
              />
            </GalleryImageWrapper>
          ))}
        </div>
      </Wrapper>
    </GalleryProvider>
  );
}
