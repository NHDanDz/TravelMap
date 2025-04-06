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
  // Configure experimental features
  experimental: {
    ppr: 'incremental',
    // Enable Turbopack for development
    turbo: {
      // Turbopack specific rules
      rules: {
        // Include your custom rules here if needed
      },
      // Resolve aliases if needed
      resolveAlias: {
        // Example: Map a module to another module
        // 'module-name': 'actual-module-name'
      },
    }
  },
};

export default nextConfig;