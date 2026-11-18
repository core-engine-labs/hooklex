import type { NextConfig } from "next";
import { createMDX } from 'fumadocs-mdx/next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com", // For GitHub images
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com", // For Google images (if added later)
      }
    ],
  },
  output:"standalone",
  devIndicators:false
};

const withMDX = createMDX();
export default withMDX(nextConfig);