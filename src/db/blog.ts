import fs from "fs";
import path from "path";

import { z } from "zod";

const metadataSchema = z.object({
  categories: z.string().default(""),
  publishedDateTime: z.string().min(1, "publishedDateTime is required"),
  title: z.string().min(1, "title is required"),
  description: z.string().default(""),
  heroImage: z.string().default(""),
});

export type Metadata = z.infer<typeof metadataSchema>;

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

function parseFrontmatter(fileContent: string, filePath: string) {
  const frontmatterRegex = /---\s*([\s\S]*?)\s*---/;
  const match = frontmatterRegex.exec(fileContent);

  if (!match || !match[1]) {
    throw new Error(`invalid frontmatter in ${filePath}`);
  }

  const frontMatterBlock = match[1];
  const content = fileContent.replace(frontmatterRegex, "").trim();
  const frontMatterLines = frontMatterBlock.trim().split("\n");
  const raw: Record<string, string> = {};

  frontMatterLines.forEach((line) => {
    const [key, ...valueArr] = line.split(": ");
    let value = valueArr.join(": ").trim();
    value = value.replace(/^['"](.*)['"]$/, "$1");
    raw[key.trim()] = value;
  });

  // auto-fill heroImage from first image in content if not set
  if (!raw.heroImage) {
    raw.heroImage = extractFirstImage(content) || "";
  }

  const result = metadataSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(
      `invalid metadata in ${filePath}: ${result.error.issues.map((i) => i.message).join(", ")}`,
    );
  }

  return { metadata: result.data, content };
}

function getMDXFiles(dir: string) {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === ".mdx");
}

function readMDXFile(filePath: string) {
  const rawContent = fs.readFileSync(filePath, "utf-8");
  return parseFrontmatter(rawContent, filePath);
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
