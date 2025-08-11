const webpack = require("webpack");
/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/resume",
        destination: "/suhas-resume.pdf",
        permanent: true,
      },
    ];
  },
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

module.exports = nextConfig;
