import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "export",
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "http", hostname: "171.22.25.222", port: "8087" },
      { protocol: "https", hostname: "**.clashtalent.com" },
    ],
  },
};

export default nextConfig;
