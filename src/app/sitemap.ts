import type { MetadataRoute } from "next";

import { getBlogPosts } from "@db/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getBlogPosts();

  return [
    {
      url: "https://www.kashyapsuhas.com",
      lastModified: new Date().toISOString(),
      priority: 1.0,
    },
    {
      url: "https://www.kashyapsuhas.com/blog",
      lastModified: new Date().toISOString(),
      priority: 0.9,
    },
    {
      url: "https://www.kashyapsuhas.com/tools",
      lastModified: new Date().toISOString(),
      priority: 0.8,
    },
    {
      url: "https://www.kashyapsuhas.com/photos",
      lastModified: new Date().toISOString(),
      priority: 0.7,
    },
    {
      url: "https://www.kashyapsuhas.com/reviews",
      lastModified: new Date().toISOString(),
      priority: 0.7,
    },
    ...posts.map((post) => ({
      url: `https://www.kashyapsuhas.com/blog/${post.slug}`,
      lastModified: post.metadata.publishedDateTime,
      priority: 0.9,
    })),
  ];
}
