/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { Key } from 'react';
import { BsArrowRight } from 'react-icons/bs';
import { UrlObject } from 'url';
import Image from 'next/image';
import ImageAutoHeight from './ImageAutoHeight';
import clsx from 'clsx';

const PreviewRecentIG = ({
  router,
  igPosts,
  className,
}: {
  router: any;
  igPosts: any;
  className?: string;
}) => {
  if (router.isFallback) return <span>Loading IG posts, please wait...</span>;
  else if (Object.keys(igPosts).length > 0) {
    return (
      <div data-element="preview-section" className="my-2 w-full">
        <h2 className="text-primary">Recent Photos</h2>

        <div data-component="recent-instagrams" className="flex py-2 md:pl-2">
          <div className="flex w-full flex-col flex-wrap items-center justify-between gap-4 md:flex-row md:flex-nowrap md:justify-center">
            {igPosts.map(
              (post: {
                id: Key | null | undefined;
                permalink: string | UrlObject;
                media_url: string | undefined;
              }) => {
                if (post.media_url !== undefined)
                  return (
                    <Link key={post.id} href={post.permalink}>
                      <a className="relative">
                        <div className="h-48 w-48">
                          <Image
                            src={post.media_url}
                            alt="Open image in Instagram"
                            className="!h-unset !relative max-h-igImagePreview !w-full !object-contain"
                            layout="fill"
                          />
                        </div>
                      </a>
                    </Link>
                  );
              },
            )}
          </div>
        </div>

        <Link href="https://www.instagram.com/kashyap_07">
          <a
            className="group flex flex-row items-center gap-1"
            aria-label="See more Instagram.com"
            target="_blank"
          >
            See more{' '}
            <BsArrowRight className="translate-x-0 transition-transform duration-700 group-hover:translate-x-2" />
          </a>
        </Link>
      </div>
    );
  } else return false;
};

export default PreviewRecentIG;
