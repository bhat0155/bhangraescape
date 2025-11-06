import type { NextConfig } from "next";

// next.config.ts
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
     domains: [
      "bhangraescape.s3.us-east-2.amazonaws.com",
      "lh3.googleusercontent.com",
      "placehold.co",
    ],
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

