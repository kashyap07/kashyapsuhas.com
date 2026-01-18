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

// extract first image from mdx content (markdown or jsx syntax)
function extractFirstImage(content: string): string | null {
  // markdown: ![alt](url)
  const mdMatch = /!\[.*?\]\((.*?)\)/.exec(content);
  if (mdMatch?.[1]) return mdMatch[1];

  // jsx: <img src="url" /> or src={...}
  const jsxMatch = /<img[^>]+src=["']([^"']+)["']/.exec(content);
  if (jsxMatch?.[1]) return jsxMatch[1];

  return null;
}

function parseFrontmatter(fileContent: string) {
  const frontmatterRegex = /---\s*([\s\S]*?)\s*---/;
  const match = frontmatterRegex.exec(fileContent);

  if (!match || !match[1]) {
    throw new Error("Invalid frontmatter format: frontmatter block not found");
  }

  const frontMatterBlock = match[1];
  const content = fileContent.replace(frontmatterRegex, "").trim();
  const frontMatterLines = frontMatterBlock.trim().split("\n");
  const metadata: Partial<Metadata> = {};

  frontMatterLines.forEach((line) => {
    const [key, ...valueArr] = line.split(": ");
    let value = valueArr.join(": ").trim();
    value = value.replace(/^['"](.*)['"]$/, "$1");
    metadata[key.trim() as keyof Metadata] = value;
  });

  // auto-fill heroImage from first image in content if not set
  if (!metadata.heroImage) {
    metadata.heroImage = extractFirstImage(content) || "";
  }

  return { metadata: metadata as Metadata, content };
}

function getMDXFiles(dir: string) {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === ".mdx");
}

function readMDXFile(filePath: string) {
  const rawContent = fs.readFileSync(filePath, "utf-8");
  return parseFrontmatter(rawContent);
}

function getMDXData(dir: string) {
  const mdxFiles = getMDXFiles(dir);

  return mdxFiles
    .map((file) => {
      const { metadata, content } = readMDXFile(path.join(dir, file));
      const slug = path.basename(file, path.extname(file)).toLowerCase();
      return {
        metadata,
        slug,
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
