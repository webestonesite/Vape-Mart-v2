/* ------------------------------------------------------------------ */
/*  Shopify-backed async data access (server components).              */
/*  Falls back to the local demo catalog if Shopify is unreachable,    */
/*  so the site never breaks.                                          */
/* ------------------------------------------------------------------ */

import { ProductItem, CollectionCategory } from "@/types/product";
import {
  fetchAllShopifyProducts,
  fetchShopifyProductByHandle,
} from "@/lib/shopify";
import { allProducts as localProducts, categories as localCategories } from "./products";

/** Normalize a Shopify collection handle to a local category slug when they match. */
const HANDLE_ALIASES: Record<string, string> = {
  "e-liquids": "e-liquid",
  "pod-systems": "pods-system",
  "iqos-terea": "heated-tobacco",
  "disposable-vape": "disposable-vape",
  "nicotine-pouches": "nicotine-pouches",
  "vape-kits": "vape-kits",
  "shisha-hookah": "shisha-hookah",
};

function normalizeCategorySlug(handle: string): string {
  return HANDLE_ALIASES[handle] || handle;
}

function withNormalizedCategories(products: ProductItem[]): ProductItem[] {
  return products.map((p) => ({ ...p, categorySlug: normalizeCategorySlug(p.categorySlug) }));
}

export async function fetchAllProducts(): Promise<ProductItem[]> {
  try {
    const products = await fetchAllShopifyProducts();
    if (products.length > 0) return withNormalizedCategories(products);
    return localProducts;
  } catch {
    return localProducts;
  }
}

export async function fetchProductBySlug(slug: string): Promise<ProductItem | undefined> {
  try {
    const p = await fetchShopifyProductByHandle(slug);
    if (p) {
      const normalized = withNormalizedCategories([p])[0];
      try {
        const all = await fetchAllProducts();
        const related = all
          .filter((r) => r.slug !== slug && r.categorySlug === normalized.categorySlug)
          .slice(0, 4)
          .map((r) => r.slug);
        normalized.relatedSlugs = related.length ? related : all.filter((r) => r.slug !== slug).slice(0, 4).map((r) => r.slug);
      } catch { /* related optional */ }
      return normalized;
    }
  } catch { /* fallback below */ }
  return localProducts.find((p) => p.slug === slug);
}

export async function fetchProductsByCategory(categorySlug: string): Promise<ProductItem[]> {
  const all = await fetchAllProducts();
  if (!categorySlug || categorySlug === "all") return all;
  const norm = normalizeCategorySlug(categorySlug);
  const filtered = all.filter((p) => p.categorySlug === norm);
  return filtered.length ? filtered : all;
}

export async function fetchRelatedProducts(slug: string): Promise<ProductItem[]> {
  const current = await fetchProductBySlug(slug);
  const all = await fetchAllProducts();
  if (!current) return all.slice(0, 4);
  const bySlugs = (current.relatedSlugs || [])
    .map((s) => all.find((p) => p.slug === s))
    .filter((p): p is ProductItem => !!p);
  if (bySlugs.length >= 4) return bySlugs.slice(0, 4);
  const sameCat = all.filter(
    (p) => p.slug !== slug && p.categorySlug === current.categorySlug && !bySlugs.some((b) => b.slug === p.slug)
  );
  const merged = [...bySlugs, ...sameCat].slice(0, 4);
  if (merged.length) return merged;
  return all.filter((p) => p.slug !== slug).slice(0, 4);
}

/** Categories: local rich metadata first, then auto entries for new Shopify collections. */
export async function fetchCategories(): Promise<CollectionCategory[]> {
  const all = await fetchAllProducts();
  const seen = new Map<string, { title: string; count: number }>();
  for (const p of all) {
    const s = seen.get(p.categorySlug) || { title: p.category, count: 0 };
    s.count += 1;
    seen.set(p.categorySlug, s);
  }
  const local = localCategories;
  const extra: CollectionCategory[] = [];
  for (const [slug, info] of seen) {
    if (local.some((c) => c.slug === slug)) continue;
    const sample = all.find((p) => p.categorySlug === slug);
    extra.push({
      slug,
      name: info.title,
      title: `${info.title} | Vape Mart UAE`,
      subtitle: `Shop authentic ${info.title.toLowerCase()} with same-day delivery across the UAE.`,
      badge: "NEW",
      icon: "Flame",
      image: sample?.primaryImage || "/images/prod_disposable.png",
      count: info.count,
      description: `Explore our ${info.title.toLowerCase()} collection — 100% authentic products with express delivery across Dubai and the UAE.`,
    });
  }
  const withCounts = local.map((c) => ({
    ...c,
    count: seen.get(c.slug)?.count ?? c.count,
  }));
  return [...withCounts, ...extra];
}

export function getCategoryBySlugSync(slug: string): CollectionCategory | undefined {
  return localCategories.find((c) => c.slug === slug);
}
