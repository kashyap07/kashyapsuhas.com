import type { MetadataRoute } from "next";

import { getBlogPosts } from "@db/blog";
import { getReviews } from "@db/reviews";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getBlogPosts();
  const reviews = getReviews();
  const siteUrl = "https://www.kashyapsuhas.com";

  // freshness signal: latest post for blog/home, latest review for reviews,
  // build time for tools (no per-tool changelog yet).
  const latestPostDate =
    posts[0]?.metadata.publishedDateTime ?? new Date().toISOString();
  const latestReviewDate = reviews[0]?.reviewDate ?? new Date().toISOString();
  const buildDate = new Date().toISOString();

  return [
    { url: siteUrl, lastModified: latestPostDate, priority: 1.0 },
    { url: `${siteUrl}/blog`, lastModified: latestPostDate, priority: 0.9 },
    { url: `${siteUrl}/tools`, lastModified: buildDate, priority: 0.8 },
    {
      url: `${siteUrl}/tools/image-compressor`,
      lastModified: buildDate,
      priority: 0.7,
    },
    {
      url: `${siteUrl}/tools/image-converter`,
      lastModified: buildDate,
      priority: 0.7,
    },
    {
      url: `${siteUrl}/tools/background-remover`,
      lastModified: buildDate,
      priority: 0.7,
    },
    {
      url: `${siteUrl}/tools/panchanga`,
      lastModified: buildDate,
      priority: 0.7,
    },
    { url: `${siteUrl}/photos`, lastModified: latestPostDate, priority: 0.7 },
    {
      url: `${siteUrl}/reviews`,
      lastModified: latestReviewDate,
      priority: 0.7,
    },
    { url: `${siteUrl}/contact`, lastModified: buildDate, priority: 0.5 },
    { url: `${siteUrl}/privacy`, lastModified: buildDate, priority: 0.3 },
    ...posts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: post.metadata.publishedDateTime,
      priority: 0.9,
    })),
    ...reviews.map((review) => ({
      url: `${siteUrl}/reviews/${review.slug}`,
      lastModified: review.reviewDate,
      priority: 0.6,
    })),
  ];
}
