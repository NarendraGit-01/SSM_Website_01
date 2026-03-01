import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
      { protocol: "https", hostname: "primetechupvc.com" },
    ],
  },
};

export default nextConfig;
