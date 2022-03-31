// yoinked from https://github.com/jonschlinkert/markdown-toc/blob/master/lib/utils.js#L50
// returns slugified version of a string
// Go Daddy! daddy's go adn then I eat pokemon "go": what?
// yields: go-daddy-daddys-go-adn-then-i-eat-pokemon-go-what
const slugify = (str) => {
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