import fs from "fs";
import path from "path";

type Metadata = {
  categories: string;
  publishedDateTime: string;
  title: string;
  description: string;
  heroImage: string;
};

// yoinked from: https://github.com/leerob/leerob.io/blob/main/app/blog/page.tsx

function parseFrontmatter(fileContent: string) {
  const frontmatterRegex = /---\s*([\s\S]*?)\s*---/;
  const match = frontmatterRegex.exec(fileContent);
  const frontMatterBlock = match![1];
  const content = fileContent.replace(frontmatterRegex, "").trim();
  const frontMatterLines = frontMatterBlock.trim().split("\n");
  const metadata: Partial<Metadata> = {};

  frontMatterLines.forEach((line) => {
    const [key, ...valueArr] = line.split(": ");
    let value = valueArr.join(": ").trim();
    value = value.replace(/^['"](.*)['"]$/, "$1");
    metadata[key.trim() as keyof Metadata] = value;
  });

  return { metadata: metadata as Metadata, content };
}

function getMDXFiles(dir: string) {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === ".mdx");
}

function readMDXFile(filePath: string) {
  const rawContent = fs.readFileSync(filePath, "utf-8");
  return parseFrontmatter(rawContent);
}

function extractTweetIds(content: string) {
  const tweetMatches = content.match(/<StaticTweet\sid="[0-9]+"\s\/>/g);
  return tweetMatches?.map((tweet) => tweet.match(/[0-9]+/g)?.[0]) || [];
}

function getMDXData(dir: string) {
  const mdxFiles = getMDXFiles(dir);

  return mdxFiles
    .map((file) => {
      const { metadata, content } = readMDXFile(path.join(dir, file));
      const slug = path.basename(file, path.extname(file)).toLowerCase();
      const tweetIds = extractTweetIds(content);
      return {
        metadata,
        slug,
        tweetIds,
        content,
      };
    })
    .sort((a, b) => {
      if (
        new Date(a.metadata.publishedDateTime) >
        new Date(b.metadata.publishedDateTime)
      ) {
        return -1;
      }
      return 1;
    });
}

export function getBlogPosts() {
  return getMDXData(path.join(process.cwd(), "content/blog"));
}
