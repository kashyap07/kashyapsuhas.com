import clsx from 'clsx';
import Link from 'next/link';
import moment from 'moment';
import { BsArrowRight } from 'react-icons/bs';
import { Key } from 'react';

const PreviewRecentPosts = ({ fm, className }: { fm: any; className?: string }) => {
  if (fm) {
    return (
      <div data-element="preview-section" className={clsx('my-2 w-full', className)}>
        <h2 className="text-primary">Recent Blog Posts</h2>
        <ul className="flex w-full flex-col gap-5 p-2 md:gap-1">
          {fm.slice(0, 3).map(
            (
              item: {
                filename: string;
                title: any;
                creation_date: moment.MomentInput;
              },
              index: Key | null | undefined,
            ) => {
              return (
                <li className="w-full" key={index}>
                  <Link href={`/blog/post/${item.filename.split('.').slice(0, -1).join('.')}`}>
                    <a className="flex flex-col justify-between font-medium md:flex-row">
                      <span className="text-lg">{item.title}</span>
                      <span className="text-black ">{moment(item.creation_date).fromNow()}</span>
                    </a>
                  </Link>
                </li>
              );
            },
          )}
        </ul>

        <Link href="/blog">
          <a className="group flex flex-row items-center gap-1" aria-label="See more in Blog page">
            See more{' '}
            <BsArrowRight className="translate-x-0 transition-transform duration-700 group-hover:translate-x-2" />
          </a>
        </Link>
      </div>
    );
  } else return false;
};

export default PreviewRecentPosts;
