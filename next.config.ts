import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  
  // Enable standalone output for Docker
  output: process.env.DOCKER_BUILD === "true" ? "standalone" : undefined,
  
  // Image optimization for external sources
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.ethos.network',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com', // Twitter profile images
      },
      {
        protocol: 'https',
        hostname: 'abs.twimg.com', // Twitter static assets
      },
      {
        protocol: 'https',
        hostname: 'cdn.stamp.fyi', // Common crypto profile images
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com', // GitHub avatars
      },
    ],
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "s-maxage=60, stale-while-revalidate=300",
          },
        ],
      },
      {
        source: "/api/summary",
        headers: [
          {
            key: "Cache-Control",
            value: "s-maxage=300, stale-while-revalidate=900",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
