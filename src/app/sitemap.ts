import type { MetadataRoute } from "next";

import { getBlogPosts } from "@db/blog";
import { getReviews } from "@db/reviews";
import { SITE_URL } from "@utils/site";

import tools from "./(withNav)/tools/toolsList";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getBlogPosts();
  const reviews = getReviews();

  // freshness signal: latest post for blog/home, latest review for reviews,
  // build time for tools (no per-tool changelog yet).
  const latestPostDate =
    posts[0]?.metadata.publishedDateTime ?? new Date().toISOString();
  const latestReviewDate = reviews[0]?.reviewDate ?? new Date().toISOString();
  const buildDate = new Date().toISOString();

  return [
    { url: SITE_URL, lastModified: latestPostDate, priority: 1.0 },
    { url: `${SITE_URL}/blog`, lastModified: latestPostDate, priority: 0.9 },
    { url: `${SITE_URL}/tools`, lastModified: buildDate, priority: 0.8 },
    // tool pages derived from toolsList so adding a tool updates the sitemap too
    ...tools.map((tool) => ({
      url: `${SITE_URL}/${tool.href.replace(/^\//, "")}`,
      lastModified: buildDate,
      priority: 0.7,
    })),
    { url: `${SITE_URL}/photos`, lastModified: latestPostDate, priority: 0.7 },
    {
      url: `${SITE_URL}/reviews`,
      lastModified: latestReviewDate,
      priority: 0.7,
    },
    { url: `${SITE_URL}/contact`, lastModified: buildDate, priority: 0.5 },
    { url: `${SITE_URL}/privacy`, lastModified: buildDate, priority: 0.3 },
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.metadata.publishedDateTime,
      priority: 0.9,
    })),
    ...reviews.map((review) => ({
      url: `${SITE_URL}/reviews/${review.slug}`,
      lastModified: review.reviewDate,
      priority: 0.6,
    })),
  ];
}
