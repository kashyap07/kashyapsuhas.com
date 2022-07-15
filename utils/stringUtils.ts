// yoinked from https://github.com/jonschlinkert/markdown-toc/blob/master/lib/utils.js#L50
// returns slugified version of a string
// Go Daddy! daddy's go and then I eat pokemon "go": what?
// yields: go-daddy-daddys-go-and-then-i-eat-pokemon-go-what
const slugify = (str: string) => {
  str = str.toLowerCase();
  str = str.split(" ").join("-");
  str = str.split(/\t/).join("--");
  str = str.split(/[|$&`~=\\\/@+*!?({[\]})<>=.,;:'"^]/).join("");
  str = str
    .split(/[。？！，、；：“”【】（）〔〕［］﹃﹄“ ”‘’﹁﹂—…－～《》〈〉「」]/)
    .join("");

  return str;
};

export { slugify };
