import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "export",
  images: {
    unoptimized: true, // لازم است چون Image Optimization نیاز به سرور دارد
  },
};

export default nextConfig;
