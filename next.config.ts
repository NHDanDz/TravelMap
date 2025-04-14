import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fastly.4sqi.net',
      },
      {
        protocol: 'https',
        hostname: 'fastly.fsqcdn.com',
      },
      {
        protocol: 'https',
        hostname: '*.mapbox.com',
      },
      {
        protocol: 'https',
        hostname: '**',  // Cho phép tất cả domain khác (nếu cần)
      },
    ],
  },
  // Cấu hình Turbopack theo hướng dẫn mới
  experimental: {
    turbo: {
      // Sử dụng rules thay vì loaders
      rules: {
        // Ví dụ: Nếu bạn có custom loader cho .mdx
        // "*.mdx": ["mdx-loader"]
      },
      resolveAlias: {
        // Ánh xạ module nếu cần
        // 'module-name': 'actual-module-path'
      },
    },
    ppr: 'incremental',
  },
  // Cấu hình webpack để xử lý các module đặc biệt
  webpack: (config, { isServer }) => {
    // Resolve the "Can't resolve 'fs'" issue with mapbox-gl
    if (!isServer) {
      config.resolve.fallback = { 
        ...config.resolve.fallback,
        fs: false,
        http: false,
        https: false,
        zlib: false
      };
    }
    
    return config;
  }
};

export default nextConfig;