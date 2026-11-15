import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    loader: "custom",
    loaderFile: "./src/core/shopify/image-loader.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/s/files/**",
      },
      {
        protocol: "https",
        hostname: "*.myshopify.com",
      },
    ],
  },
};

export default nextConfig;
