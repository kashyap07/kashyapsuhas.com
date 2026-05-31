import type { MetadataRoute } from "next";

// keep admin + internals out of every crawler. ai crawlers are explicitly
// allowed; named here so future changes (e.g. opting out of training) are
// a one-line edit rather than guesswork.
const COMMON_DISALLOW = ["/_next/*", "/admin", "/admin/*"];

const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
  "Meta-ExternalAgent",
  "Meta-ExternalFetcher",
  "Amazonbot",
  "cohere-ai",
  "DuckAssistBot",
  "Diffbot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: COMMON_DISALLOW },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: COMMON_DISALLOW,
      })),
    ],
    sitemap: "https://www.kashyapsuhas.com/sitemap.xml",
    host: "https://www.kashyapsuhas.com",
  };
}
