import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/videos/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/news/:file(.+\\.(?:jpg|jpeg|png|webp|svg))",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/:file(hero-portrait\\.webp|hero-portrait\\.png|hero-avatar-1\\.jpg|hero-avatar-2\\.jpg|hero-avatar-3\\.jpg|hero-card-horizon\\.jpg|hero-card-orb\\.jpg|logo\\.png|logo-light\\.png|window\\.png|apple\\.png)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
