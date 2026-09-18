import type { NextConfig } from "next";

/** Old MakeMeViral product pages → home (not part of outbid-style product). */
const leftoverProductPaths = [
  "/dashboard",
  "/dashboard/:path*",
  "/submit",
  "/pricing",
  "/creators",
  "/deals",
  "/trending",
  "/products",
  "/videos",
  "/food",
  "/groceries",
  "/youtube-videos",
  "/youtube-shorts",
  "/instagram-reels",
  "/register",
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "**.instagram.com" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  async redirects() {
    return [
      ...leftoverProductPaths.map((source) => ({
        source,
        destination: "/",
        permanent: false,
      })),
      { source: "/seo", destination: "/category/seo-ai-visibility", permanent: false },
      { source: "/seo/today", destination: "/category/seo-ai-visibility/today", permanent: false },
    ];
  },
};

export default nextConfig;
