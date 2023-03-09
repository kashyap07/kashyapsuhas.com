module.exports = {
  reactStrictMode: true,
  images: {
    // domains: [
    //   'scontent.cdninstagram.com',
    //   'scontent-iad3-1.cdninstagram.com',
    //   'scontent-iad3-2.cdninstagram.com',
    //   'scontent-iad3-3.cdninstagram.com',
    //   'scontent-iad3-4.cdninstagram.com',
    // ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/resume',
        destination: '/suhas-resume.pdf',
        permanent: true,
      },
    ];
  },
};
