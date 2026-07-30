import type { NextConfig } from "next";
import path from "path";

const backendUrl = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  compress: true,
  turbopack: {
    root: path.join(__dirname),
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "framer-motion", "gsap"],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
