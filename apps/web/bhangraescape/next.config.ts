import type { NextConfig } from "next";

// next.config.ts
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bhangraescape.s3.us-east-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: 'placehold.co', 
      }
    ],
  },
};
export default nextConfig;

