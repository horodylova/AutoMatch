const nextConfig = {
  compiler: { styledComponents: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'media.ed.edmunds-media.com', pathname: '/**' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
};

module.exports = nextConfig;
