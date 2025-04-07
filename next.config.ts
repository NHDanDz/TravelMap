// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: [
      'fastly.4sqi.net',  // Foursquare image host
      'fastly.fsqcdn.com', // Alternate Foursquare image host
      'api.mapbox.com',    // Mapbox API
      'mapbox.com',        // Mapbox assets
      'tiles.mapbox.com',  // Mapbox tiles
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
  // Add webpack configuration for Mapbox GL
  webpack: (config) => {
    // Resolve the "Can't resolve 'fs'" issue with mapbox-gl
    config.resolve.fallback = { 
      ...config.resolve.fallback,
      fs: false,
      http: false,
      https: false,
      zlib: false
    };
    
    return config;
  }
};

export default nextConfig;