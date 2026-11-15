import type { MetadataRoute } from "next";
import { env } from "@/core/config/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/cart", "/checkout", "/account"],
      },
    ],
    sitemap: `${env.SITE_URL}/sitemap.xml`,
  };
}

