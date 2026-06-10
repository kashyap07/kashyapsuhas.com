// shared by mdx headings and trip <Stop> titles so anchors behave the same
const slugify = (str: string): string => {
  return str
    .toString()
    .toLowerCase()
    .trim() // remove whitespace from both ends of a string
    .replace(/\s+/g, "-") // replace spaces with -
    .replace(/&/g, "-and-") // replace & with 'and'
    .replace(/[^\w\-]+/g, "") // remove all non-word characters except for -
    .replace(/\-\-+/g, "-"); // replace multiple - with single -
};

export default slugify;
