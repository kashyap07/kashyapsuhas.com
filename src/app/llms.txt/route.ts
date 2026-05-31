import { getBlogPosts } from "@db/blog";

export const dynamic = "force-static";

const SITE_URL = "https://www.kashyapsuhas.com";

export function GET() {
  const posts = getBlogPosts();

  const lines = [
    "# Suhas Kashyap",
    "",
    "> Personal site of Suhas Kashyap. Software engineer working at Rakuten, based in Bengaluru.",
    "",
    "## Pages",
    "",
    `- [Home](${SITE_URL}/): landing page with intro and links`,
    `- [Blog](${SITE_URL}/blog): essays and writing`,
    `- [Photos](${SITE_URL}/photos): photo gallery`,
    `- [Tools](${SITE_URL}/tools): browser-side tools`,
    `- [Reviews](${SITE_URL}/reviews): reviews of products and places`,
    `- [Contact](${SITE_URL}/contact): contact details and socials`,
    "",
    "## Blog posts",
    "",
    ...posts.map((post) => {
      const desc = post.metadata.description?.trim();
      const url = `${SITE_URL}/blog/${post.slug}`;
      return desc
        ? `- [${post.metadata.title}](${url}): ${desc}`
        : `- [${post.metadata.title}](${url})`;
    }),
    "",
    "## Optional",
    "",
    `- [RSS feed](${SITE_URL}/blog/feed.xml)`,
    `- [Sitemap](${SITE_URL}/sitemap.xml)`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
