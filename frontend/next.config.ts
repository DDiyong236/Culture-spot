import type { NextConfig } from "next";

const backendUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/places",
        destination: `${backendUrl}/api/places`,
      },
      {
        source: "/api/places/:path*",
        destination: `${backendUrl}/api/places/:path*`,
      },
    ];
  },
};

export default nextConfig;
