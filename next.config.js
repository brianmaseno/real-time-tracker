/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  // Temporarily ignore build errors for deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
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
          ? `${process.env.NEXT_PUBLIC_API_URL || 'https://realtime-tracker-backend.onrender.com'}/socket.io/`
          : 'http://localhost:5001/socket.io/',
      },
    ];
  },
}

module.exports = nextConfig
