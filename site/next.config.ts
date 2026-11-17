import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { formats: ["image/avif", "image/webp"], minimumCacheTTL: 31536000 },
  /* config options here */
};

export default nextConfig;
