import fs from "fs";
import path from "path";

import { z } from "zod";

const reviewSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  rating: z.number().min(0).max(10),
  wouldRecommend: z.boolean(),
  summary: z.string(),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  link: z.string().optional(),
  reviewDate: z.string().min(1),
});

export type Review = z.infer<typeof reviewSchema> & { slug: string };

function readReviewFile(filename: string): Review {
  const filePath = path.join(process.cwd(), "content/reviews", filename);
  const content = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(content);
  const result = reviewSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(
      `invalid review in ${filename}: ${result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ")}`,
    );
  }
  return { ...result.data, slug: filename.replace(/\.json$/, "") };
}

export function getReviews(): Review[] {
  const reviewsDir = path.join(process.cwd(), "content/reviews");
  const files = fs.readdirSync(reviewsDir);

  return files
    .filter((file) => file.endsWith(".json"))
    .map(readReviewFile)
    .sort(
      (a, b) =>
        new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime(),
    );
}

export function getReviewBySlug(slug: string): Review | undefined {
  const filename = `${slug}.json`;
  const filePath = path.join(process.cwd(), "content/reviews", filename);
  if (!fs.existsSync(filePath)) return undefined;
  return readReviewFile(filename);
}
