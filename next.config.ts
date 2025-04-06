import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: [
      'fastly.4sqi.net',  // Foursquare image host
      'fastly.fsqcdn.com' // Alternate Foursquare image host
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Giữ nguyên cấu hình experimental
  experimental: {
    ppr: 'incremental'
  },
  // Thêm webpack config nếu cần thiết
  webpack: (config) => {
    // Nếu cần thêm cấu hình webpack
    return config;
  }
};

export default nextConfig;