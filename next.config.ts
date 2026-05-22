import { createRequire } from "node:module";
import type { NextConfig } from "next";

const require = createRequire(import.meta.url);

const nextConfig: NextConfig = {
  /** Vercel adapter modifyConfig needs projectDir; Next 16.2.x does not pass it yet. */
  adapterPath: require.resolve("./lib/vercel-adapter-shim.cjs"),
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
