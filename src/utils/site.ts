// single source of truth for the canonical site origin. preview/staging deploys
// set NEXT_PUBLIC_SITE_URL so canonicals, og urls, json-ld and sitemap don't
// point at prod. trailing slash stripped so `${SITE_URL}/path` never doubles up.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.kashyapsuhas.com"
).replace(/\/+$/, "");
