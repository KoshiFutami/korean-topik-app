import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/korean-topik-app-prod-profile-image/**",
      },
    ],
  },
};

export default nextConfig;
