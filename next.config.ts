import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  
  // Enable standalone output for Docker
  output: process.env.DOCKER_BUILD === "true" ? "standalone" : undefined,
  
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
