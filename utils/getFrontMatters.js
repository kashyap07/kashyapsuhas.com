import { readFiles } from "../utils/fileUtils";
import matter from "gray-matter";

/**
 * get Front Matters of all files sorted by date
 * @returns Array
 */
const getFrontMatters = async () => {
  const frontMatters = [];

  await readFiles("Blog").then((files) => {
    files.forEach((post) => {
      let fm = matter(post.contents);

      // date is date object, fix this by modifying frontmatter config in forestry
      let newFMData = { ...fm.data };
      newFMData.filename = post.filename;
      newFMData.creation_date = fm.data.creation_date.getTime();
      frontMatters.push(newFMData);
      console.log(newFMData);
    });
  });

  frontMatters.sort((a, b) => (a.creation_date > b.creation_date ? -1 : 1));

  console.log(frontMatters);

  return frontMatters;
};

export { getFrontMatters };
