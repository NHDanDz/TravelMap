import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: 'incremental'
  },
  eslint: {
    // Bỏ qua các ESLint warnings khi build
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;