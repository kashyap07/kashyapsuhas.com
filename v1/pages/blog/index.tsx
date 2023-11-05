import moment from 'moment';
import Link from 'next/link';
import { Key } from 'react';
import { BsArrowRight } from 'react-icons/bs';

import MaxWidthWrapper from '@components/MaxWidthWrapper';
import SideTitle from '@components/SideTitle';
import { getFrontMatters } from '@utils/getFrontMatters';

export async function getStaticProps() {
  const frontMatters = await getFrontMatters();

  return {
    props: {
      frontMatterData: frontMatters,
    },
  };
}

const Blog = ({ className = '', ...props }) => {
  const fm = props.frontMatterData;

  return (
    <main className={`${className} relative md:mt-6`}>
      <SideTitle>BLOG</SideTitle>

      <MaxWidthWrapper>
        <div className="text-xl md:pt-2">
          <ul className="flex w-full flex-col">
            {fm.map(
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
                    <Link
                      href={`/blog/post/${item.filename.split('.').slice(0, -1).join('.')}`}
                      className="group flex w-full flex-col justify-between border-b px-2 py-5 font-medium transition-colors duration-300 ease-in hover:bg-gray-200 md:px-4"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-xl">{item.title}</span>
                        <BsArrowRight className="hidden translate-x-0 opacity-0 transition-all duration-700 group-hover:translate-x-2 group-hover:text-black group-hover:opacity-100 md:block" />
                      </div>
                      <span className="text-sm uppercase text-gray-700">
                        {moment(item.creation_date).format('D MMM YYYY')}
                      </span>
                    </Link>
                  </li>
                );
              },
            )}
          </ul>
        </div>
      </MaxWidthWrapper>
    </main>
  );
};

export default Blog;
