/* ------------------------------------------------------------------ */
/*  Shopify-backed async data access (server components).              */
/*  Falls back to the local demo catalog if Shopify is unreachable,    */
/*  so the site never breaks.                                          */
/* ------------------------------------------------------------------ */

import { ProductItem, CollectionCategory } from "@/types/product";
import {
  fetchAllShopifyProducts,
  fetchShopifyProductByHandle,
  fetchCollectionMeta,
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
  return products.map((p) => ({
    ...p,
    categorySlug: normalizeCategorySlug(p.categorySlug),
    shopifyCollections: p.shopifyCollections?.map((c) => ({ ...c, slug: normalizeCategorySlug(c.slug) })),
  }));
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
        // Panel-picked related products (discovery metafield) win; only when
        // the panel picked none do same-category products fill the row.
        if (!normalized.relatedSlugs?.length) {
          const all = await fetchAllProducts();
          const related = all
            .filter((r) => r.slug !== slug && r.categorySlug === normalized.categorySlug)
            .slice(0, 4)
            .map((r) => r.slug);
          normalized.relatedSlugs = related.length ? related : all.filter((r) => r.slug !== slug).slice(0, 4).map((r) => r.slug);
        }
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
  const filtered = all.filter(
    (p) => p.categorySlug === norm || (p.shopifyCollections || []).some((c) => c.slug === norm)
  );
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

/** Category cards on the shop pages follow the sheet-organised structure:
    the main categories, their sub-categories and the brand collections.
    Legacy collections (pod systems, vape kits, shisha, per-origin Terea,
    Lambda, ...) stay in Shopify but no longer surface as cards. */
const ORGANIZED_CATEGORY_SLUGS = new Set([
  "juul", "terea", "iqos", "disposable-vape", "e-liquid",
  "juul-1", "juul-2", "terea-device", "terea-flavor", "iqos-iluma",
]);

function isOrganizedCategory(slug: string): boolean {
  return (
    ORGANIZED_CATEGORY_SLUGS.has(slug) ||
    slug.endsWith("-disposable") ||
    slug.endsWith("-e-liquid")
  );
}

/** Categories: local rich metadata first, then auto entries for new Shopify collections. */
export async function fetchCategories(): Promise<CollectionCategory[]> {
  const [all, meta] = await Promise.all([fetchAllProducts(), fetchCollectionMeta()]);
  // Panel-managed collection meta, keyed by normalized slug (handles are aliased above).
  const metaBySlug: Record<string, { badge?: string; heroSubtitle?: string; showAsCard?: boolean }> = {};
  const faqsBySlug: Record<string, { q: string; a: string }[]> = {};
  for (const [h, m] of Object.entries(meta.byHandle)) metaBySlug[normalizeCategorySlug(h)] = m;
  for (const [h, list] of Object.entries(meta.faqsByHandle)) faqsBySlug[normalizeCategorySlug(h)] = list;
  const flagged = new Set(
    Object.entries(metaBySlug).filter(([, m]) => m.showAsCard).map(([s]) => s)
  );
  const seen = new Map<string, { title: string; count: number }>();
  for (const p of all) {
    const cols = p.shopifyCollections?.length
      ? p.shopifyCollections
      : [{ slug: p.categorySlug, title: p.category }];
    for (const c of cols) {
      const s = seen.get(c.slug) || { title: c.title, count: 0 };
      s.count += 1;
      seen.set(c.slug, s);
    }
  }
  const local = localCategories;
  const extra: CollectionCategory[] = [];
  for (const [slug, info] of seen) {
    if (local.some((c) => c.slug === slug)) continue;
    const sample =
      all.find((p) => p.categorySlug === slug) ||
      all.find((p) => (p.shopifyCollections || []).some((c) => c.slug === slug));
    extra.push({
      slug,
      name: info.title,
      title: `${info.title} | Vape Mart UAE`,
      subtitle: metaBySlug[slug]?.heroSubtitle || `Shop authentic ${info.title.toLowerCase()} with same-day delivery across the UAE.`,
      badge: metaBySlug[slug]?.badge || "NEW",
      icon: "Flame",
      image: sample?.primaryImage || "/images/prod_disposable.png",
      count: info.count,
      description: `Explore our ${info.title.toLowerCase()} collection — 100% authentic products with express delivery across Dubai and the UAE.`,
      faqs: faqsBySlug[slug],
    });
  }
  const withCounts = local
    .filter((c) => isOrganizedCategory(c.slug))
    .map((c) => {
      const m = metaBySlug[c.slug];
      return {
        ...c,
        count: seen.get(c.slug)?.count ?? c.count,
        badge: m?.badge || c.badge,
        subtitle: m?.heroSubtitle || c.subtitle,
        faqs: faqsBySlug[c.slug],
      };
    });
  return [...withCounts, ...extra.filter((c) => isOrganizedCategory(c.slug) || flagged.has(c.slug))];
}

export function getCategoryBySlugSync(slug: string): CollectionCategory | undefined {
  return localCategories.find((c) => c.slug === slug);
}
