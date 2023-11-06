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
};

module.exports = nextConfig;
