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

export type Review = z.infer<typeof reviewSchema>;

export function getReviews(): Review[] {
  const reviewsDir = path.join(process.cwd(), "content/reviews");
  const files = fs.readdirSync(reviewsDir);

  return files
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      const filePath = path.join(reviewsDir, file);
      const content = fs.readFileSync(filePath, "utf8");
      const parsed = JSON.parse(content);
      const result = reviewSchema.safeParse(parsed);
      if (!result.success) {
        throw new Error(
          `invalid review in ${file}: ${result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ")}`,
        );
      }
      return result.data;
    })
    .sort(
      (a, b) =>
        new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime(),
    );
}
