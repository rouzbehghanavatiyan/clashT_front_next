import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "export",
  output: "standalone",
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "http", hostname: "171.22.25.222", port: "8087" },
      { protocol: "https", hostname: "**.clashtalent.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/((?!_next/static|_next/image|.*\\..*).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=0, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
