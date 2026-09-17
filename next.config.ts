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
    // Only product photos may be optimized (local uploads or Cloudinary).
    localPatterns: [{ pathname: "/uploads/**", search: "" }],
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
};

export default nextConfig;
