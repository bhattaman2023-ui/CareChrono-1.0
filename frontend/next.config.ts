import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  distDir: ".next-webpack",
  turbopack: {
    root: path.resolve(__dirname),
  },
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
};

export default nextConfig;
