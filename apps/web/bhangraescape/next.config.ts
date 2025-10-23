import type { NextConfig } from "next";

// next.config.ts
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bhangraescape.s3.us-east-2.amazonaws.com",
      },
    ],
  },
};
export default nextConfig;

