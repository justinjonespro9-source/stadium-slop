import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
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
