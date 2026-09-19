import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Product photos are resized in the browser and uploaded one per
      // request. Stays under Vercel's 4.5 MB request limit.
      bodySizeLimit: "4mb",
    },
  },
  images: {
    // Only product photos and the two brand logos may be optimized (local
    // uploads, Cloudinary, or the Wikimedia Commons photos used by the seed
    // data).
    localPatterns: [
      { pathname: "/uploads/**", search: "" },
      { pathname: "/logo.png", search: "" },
      { pathname: "/logo-wordmark.png", search: "" },
    ],
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/wikipedia/commons/**",
      },
    ],
  },
};

export default nextConfig;
