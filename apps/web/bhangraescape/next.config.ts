import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Skip ESLint during next build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip type-checking during next build
    ignoreBuildErrors: true,
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
        hostname: "placehold.co",
      },
    ],
  },
};

export default nextConfig;