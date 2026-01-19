import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/suhas-resume.pdf", "/suhas-resume-old", "/_next/*", "/work"],
    },
    sitemap: "https://www.kashyapsuhas.com/sitemap.xml",
  };
}
