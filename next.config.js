import withBundleAnalyzer from "@next/bundle-analyzer";

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// permissions-policy: lock down powerful features we never use. cookieless
// analytics + speed insights don't need camera/mic/geo/etc.
const PERMISSIONS_POLICY = [
  "camera=()",
  "microphone=()",
  "geolocation=()",
  "payment=()",
  "usb=()",
  "magnetometer=()",
  "gyroscope=()",
  "accelerometer=()",
  "fullscreen=(self)",
].join(", ");

const SECURITY_HEADERS = [
  // upgraded HSTS with subdomains + preload. irreversible commitment.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: PERMISSIONS_POLICY },
  // frame-ancestors via CSP is the modern way to block clickjacking.
  // X-Frame-Options as legacy fallback for older browsers.
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // harfbuzzjs (og image text shaping) loads its wasm relative to
  // import.meta.url, which breaks when bundled. keep it external.
  serverExternalPackages: ["harfbuzzjs"],
  async headers() {
    // link headers advertise machine-readable resources so agents that don't
    // parse html can still find them.
    const LINK_HEADER = [
      '<https://www.kashyapsuhas.com/sitemap.xml>; rel="sitemap"; type="application/xml"',
      '<https://www.kashyapsuhas.com/llms.txt>; rel="llms"; type="text/markdown"',
      '<https://www.kashyapsuhas.com/blog/feed.xml>; rel="alternate"; type="application/rss+xml"',
    ].join(", ");

    return [
      {
        source: "/:path*",
        headers: [...SECURITY_HEADERS, { key: "Link", value: LINK_HEADER }],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/resume",
        destination:
          "https://lkwvgafg4cz3fdhy.public.blob.vercel-storage.com/suhas-resume.pdf",
        permanent: true,
      },
      // redirect non-www to www for seo canonicalization
      {
        source: "/:path*",
        has: [{ type: "host", value: "kashyapsuhas.com" }],
        destination: "https://www.kashyapsuhas.com/:path*",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      // expose blog post markdown source at canonical url + .md, for agents.
      // see https://specification.website/spec/agent-readiness/markdown-source-endpoints/
      {
        source: "/blog/:slug.md",
        destination: "/api/blog-md/:slug",
      },
    ];
  },
  images: {
    qualities: [100, 75, 50],
  },
  turbopack: {},
  webpack: (config, { isServer }) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    config.module.rules.push({
      test: /\.wasm$/,
      type: "asset/resource",
    });
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        module: false,
      };
      // Remove all previous hacks and use noParse for ort.node.min.mjs
      config.module.noParse = config.module.noParse || [];
      config.module.noParse.push(/ort[\\/]node\.min\.mjs$/);
    }
    return config;
  },
};

export default bundleAnalyzer(nextConfig);
