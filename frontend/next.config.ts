import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  distDir: ".next-webpack",
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
