import { getBlogPosts } from "@db/blog";

export async function GET() {
  const posts = getBlogPosts();

  const rssItems = posts
    .map((post) => {
      const { title, description, publishedDateTime, heroImage } =
        post.metadata;
      const url = `https://www.kashyapsuhas.com/blog/${post.slug}`;

      return `
    <item>
      <title><![CDATA[${title}]]></title>
      <description><![CDATA[${description}]]></description>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(publishedDateTime).toUTCString()}</pubDate>
      ${heroImage ? `<media:content url="${heroImage}" medium="image" />` : ""}
      <author>mantles_arbours_00@icloud.com (Suhas Kashyap)</author>
    </item>`;
    })
    .join("");

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Suhas Kashyap's Blog</title>
    <link>https://www.kashyapsuhas.com</link>
    <description>Kashyap's Blog</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://www.kashyapsuhas.com/blog/feed.xml" rel="self" type="application/rss+xml" />
    <generator>Next.js</generator>
    <webMaster>mantles_arbours_00@icloud.com (Suhas Kashyap)</webMaster>
    <managingEditor>mantles_arbours_00@icloud.com (Suhas Kashyap)</managingEditor>
    <image>
      <url>https://www.kashyapsuhas.com/suhas_og.jpg</url>
      <title>Suhas Kashyap's Blog</title>
      <link>https://www.kashyapsuhas.com</link>
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
