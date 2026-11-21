import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  devIndicators: false,
  // Reduce memory in dev
  experimental: {
    // Optimize deps to reduce memory
    optimizePackageImports: ["lucide-react", "next-auth"],
  },
};

export default nextConfig;
