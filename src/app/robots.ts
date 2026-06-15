import type { MetadataRoute } from "next";

import { SITE_URL } from "@utils/site";

// allow everyone (ai crawlers included), keep admin + next internals out.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/_next/*", "/admin", "/admin/*"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
