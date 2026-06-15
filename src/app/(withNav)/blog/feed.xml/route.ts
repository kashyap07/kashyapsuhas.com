import { getBlogPosts } from "@db/blog";
import { SITE_URL } from "@utils/site";

export async function GET() {
  const posts = getBlogPosts();

  const rssItems = posts
    .map((post) => {
      const { title, description, publishedDateTime, heroImage } =
        post.metadata;
      const url = `${SITE_URL}/blog/${post.slug}`;

      return `
    <item>
      <title><![CDATA[${title}]]></title>
      <description><![CDATA[${description}]]></description>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(publishedDateTime).toUTCString()}</pubDate>
      ${heroImage ? `<media:content url="${heroImage}" medium="image" />` : ""}
      <author>mail@kashyapsuhas.com (Suhas Kashyap)</author>
    </item>`;
    })
    .join("");

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Suhas Kashyap's Blog</title>
    <link>${SITE_URL}</link>
    <description>Kashyap's Blog</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/blog/feed.xml" rel="self" type="application/rss+xml" />
    <generator>Next.js</generator>
    <webMaster>mail@kashyapsuhas.com (Suhas Kashyap)</webMaster>
    <managingEditor>mail@kashyapsuhas.com (Suhas Kashyap)</managingEditor>
    <image>
      <url>${SITE_URL}/kashyapcom-og.png</url>
      <title>Suhas Kashyap's Blog</title>
      <link>${SITE_URL}</link>
    </image>${rssItems}
  </channel>
</rss>`;

  return new Response(rssFeed, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
