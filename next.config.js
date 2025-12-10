const nextConfig = {
  compiler: { styledComponents: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'media.ed.edmunds-media.com', pathname: '/**' },
      { protocol: 'https', hostname: 'www.edmunds.com', pathname: '/**' },
      { protocol: 'https', hostname: 'edmunds.com', pathname: '/**' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
};

module.exports = nextConfig;
