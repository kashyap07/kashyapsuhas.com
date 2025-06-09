import type { MetadataRoute } from "next";
import { getBlogPosts } from "@/db/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getBlogPosts();

  return [
    {
      url: "https://kashyapsuhas.com",
      lastModified: new Date().toISOString(),
    },
    {
      url: "https://kashyapsuhas.com/photos",
      lastModified: new Date().toISOString(),
    },
    {
      url: "https://kashyapsuhas.com/blog",
      lastModified: new Date().toISOString(),
    },
    ...posts.map((post) => ({
      url: `https://kashyapsuhas.com/blog/${post.slug}`,
      lastModified: post.metadata.publishedDateTime,
    })),
  ];
}
