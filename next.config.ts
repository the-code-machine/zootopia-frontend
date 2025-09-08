import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)", // apply to all routes
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *;", // allow all domains to embed
          },
        ],
      },
    ];
  },
};

export default nextConfig;
