const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

module.exports = nextConfig;