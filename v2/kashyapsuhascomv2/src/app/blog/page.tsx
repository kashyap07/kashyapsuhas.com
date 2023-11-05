
import fs from 'fs';
import matter from 'gray-matter';
import moment from 'moment';
import Image from 'next/image';
import Link from 'next/link';
import path from 'path';
import React, { Key, use, useEffect, useState } from 'react';
import { BsArrowRight } from 'react-icons/bs';

import { Wrapper } from '@/components/Wrapper';
import { MaxWidth } from '@/variables/sizes';

/**
 * Promise all
 * @author Loreto Parisi (loretoparisi at gmail dot com)
 */
function promiseAllP(
  items: any[],
  block: {
    (filename: any, index: any, resolve: any, reject: any): void;
    apply?: any;
  },
) {
  var promises: any[] = [];
  items.forEach(function (item: any, index: any) {
    promises.push(
      (function (item, i) {
        return new Promise(function (resolve, reject) {
          // @ts-ignore
          return block.apply(this, [item, index, resolve, reject]);
        });
      })(item, index),
    );
  });
  return Promise.all(promises);
}


/**
 * read files
 * @param dirname string
 * @return Promise
 * @author Loreto Parisi (loretoparisi at gmail dot com)
 * @see http://stackoverflow.com/questions/10049557/reading-all-files-in-a-directory-store-them-in-objects-and-send-the-object
 */
function readFiles(dirname: fs.PathLike) {
  return new Promise((resolve, reject) => {
    fs.readdir(dirname, function (err, filenames) {
      if (err) return reject(err);
      promiseAllP(
        filenames,
        (
          filename: string,
          index: any,
          resolve: (arg0: { filename: any; contents: string }) => void,
          reject: (arg0: NodeJS.ErrnoException) => void,
        ) => {
          fs.readFile(
            // @ts-ignore
            path.resolve(dirname, filename),
            'utf-8',
            function (err, content) {
              if (err) return reject(err);
              return resolve({ filename: filename, contents: content });
            },
          );
        },
      )
        .then(results => {
          return resolve(results);
        })
        .catch(error => {
          return reject(error);
        });
    });
  });
}


/**
 * get Front Matters of all files sorted by date
 * @returns Array
 */
const getFrontMatters = async () => {
  const frontMatters: { [x: string]: any }[] = [];

  await readFiles('Blog').then(files => {
    // @ts-ignore
    files.forEach(post => {
      let fm = matter(post.contents);

      // date is date object, fix this by modifying frontmatter config in forestry
      let newFMData = { ...fm.data };
      newFMData.filename = post.filename;
      newFMData.creation_date = new Date(fm.data.creation_date).getTime();
      frontMatters.push(newFMData);
    });
  });

  frontMatters.sort((a, b) => (a.creation_date > b.creation_date ? -1 : 1));

  return frontMatters;
};

export default function Blog() {
  const [frontMatterData, setFrontMatterData] = useState<{ [x: string]: any }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getFrontMatters();
      setFrontMatterData(data);
    };

    fetchData();
  }, []); // Empty dependency array to run once on component mount

  console.log(frontMatterData);

  return (
    <main className="pt-20 md:px-20 md:pt-24">
      <Wrapper
        maxWidth={MaxWidth.Wide}
        className="mb-20 flex w-full flex-col items-center justify-center"
      >
        {/* Render your data here */}
      </Wrapper>
    </main>
  );
}
