import type { MetadataRoute } from "next";

import { getBlogPosts } from "@db/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getBlogPosts();
  const siteUrl = "https://www.kashyapsuhas.com";

  // use latest blog post date as proxy for site freshness
  const latestPostDate =
    posts[0]?.metadata.publishedDateTime ?? "2025-01-01T00:00:00.000Z";

  return [
    {
      url: siteUrl,
      lastModified: latestPostDate,
      priority: 1.0,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: latestPostDate,
      priority: 0.9,
    },
    {
      url: `${siteUrl}/tools`,
      lastModified: "2025-03-01T00:00:00.000Z",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/tools/image-compressor`,
      lastModified: "2025-03-01T00:00:00.000Z",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/tools/image-converter`,
      lastModified: "2025-03-01T00:00:00.000Z",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/tools/background-remover`,
      lastModified: "2025-03-01T00:00:00.000Z",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/tools/panchanga`,
      lastModified: "2025-03-01T00:00:00.000Z",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/photos`,
      lastModified: latestPostDate,
      priority: 0.7,
    },
    {
      url: `${siteUrl}/reviews`,
      lastModified: latestPostDate,
      priority: 0.7,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: "2025-01-01T00:00:00.000Z",
      priority: 0.5,
    },
    ...posts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: post.metadata.publishedDateTime,
      priority: 0.9,
    })),
  ];
}
