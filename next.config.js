/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  output: 'standalone',
  
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      child_process: false,
    };

    // Prevent Socket.IO from being bundled on server side during build
    if (isServer) {
      config.externals = [...(config.externals || []), 'socket.io-client'];
    }

    return config;
  },
  
  async rewrites() {
    return [
      {
        source: '/api/socket',
        destination: process.env.NODE_ENV === 'production' 
          ? `${process.env.BACKEND_URL || 'https://your-backend.onrender.com'}/socket.io/`
          : 'http://localhost:5001/socket.io/',
      },
    ];
  },
  
  // Disable automatic static optimization to force all pages to be server-rendered
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
  
  // Disable static export
  trailingSlash: false,
  
  env: {
    CUSTOM_KEY: 'my-value',
  },
}

module.exports = nextConfig
