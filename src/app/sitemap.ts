import type { MetadataRoute } from "next";
import { env } from "@/core/config/env";
import { fetchAllShopifyProducts, fetchCollectionMeta } from "@/lib/shopify";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.SITE_URL;
  const now = new Date();

  // Root Homepage and main entrypoints
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  try {
    const [products, collectionMeta] = await Promise.all([
      fetchAllShopifyProducts().catch(() => []),
      fetchCollectionMeta().catch(() => ({ byHandle: {}, faqsByHandle: {} })),
    ]);

    const productRoutes: MetadataRoute.Sitemap = products
      .filter((p) => Boolean(p.slug))
      .map((p) => ({
        url: `${baseUrl}/product/${p.slug}`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.8,
      }));

    const collectionHandles = Object.keys(collectionMeta.byHandle || {});
    const collectionRoutes: MetadataRoute.Sitemap = collectionHandles.map((handle) => ({
      url: `${baseUrl}/collections/${handle}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [...staticRoutes, ...collectionRoutes, ...productRoutes];
  } catch (err) {
    console.error("[Sitemap] Failed to generate dynamic routes:", err);
    return staticRoutes;
  }
}
