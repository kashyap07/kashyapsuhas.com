import fs from "fs";
import path from "path";

export type Review = {
  name: string;
  category: string;
  rating: number;
  wouldRecommend: boolean;
  summary: string;
  pros: string[];
  cons: string[];
  link?: string;
  reviewDate: string;
};

export function getReviews(): Review[] {
  const reviewsDir = path.join(process.cwd(), "content/reviews");
  const files = fs.readdirSync(reviewsDir);
  
  return files
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      const content = fs.readFileSync(path.join(reviewsDir, file), "utf8");
      return JSON.parse(content) as Review;
    })
    .sort((a, b) => new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime());
} 