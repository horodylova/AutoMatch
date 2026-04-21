const nextConfig = {
  compiler: { styledComponents: true },
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'media.ed.edmunds-media.com', pathname: '/**' },
      { protocol: 'https', hostname: 'www.edmunds.com', pathname: '/**' },
      { protocol: 'https', hostname: 'edmunds.com', pathname: '/**' },
      { protocol: 'https', hostname: 'file.kelleybluebookimages.com', pathname: '/**' },
      { protocol: 'https', hostname: 'assets.carsdn.co', pathname: '/**' },
      { protocol: 'https', hostname: 'images.autotrader.com', pathname: '/**' },
      { protocol: 'https', hostname: 'static.cargurus.com', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.sanity.io', pathname: '/**' },
    ],
    minimumCacheTTL: 2678400,
  },
};

module.exports = nextConfig;
