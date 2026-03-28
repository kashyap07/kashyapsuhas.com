import fs from "fs";
import path from "path";

import matter from "gray-matter";
import { z } from "zod";

// gray-matter parses dates as Date objects and categories as arrays
const metadataSchema = z.object({
  categories: z
    .union([z.string(), z.array(z.string())])
    .transform((v) => (Array.isArray(v) ? v.join(", ") : v))
    .default(""),
  publishedDateTime: z.coerce.string().min(1, "publishedDateTime is required"),
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

function getMDXFiles(dir: string) {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === ".mdx");
}

function readMDXFile(filePath: string) {
  const rawContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(rawContent);

  // auto-fill heroImage from first image in content if not set
  if (!data.heroImage) {
    data.heroImage = extractFirstImage(content) || "";
  }

  const result = metadataSchema.safeParse(data);
  if (!result.success) {
    throw new Error(
      `invalid metadata in ${filePath}: ${result.error.issues.map((i) => i.message).join(", ")}`,
    );
  }

  return { metadata: result.data, content };
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
