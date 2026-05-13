import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**"
      }
    ]
  },
  experimental: {
    serverActions: {
      /** Keep in sync with `MAX_IMAGE_UPLOAD_BYTES` in lib/cloudinary.ts (8MB fan photos). */
      bodySizeLimit: "8mb"
    }
  }
};

export default nextConfig;
