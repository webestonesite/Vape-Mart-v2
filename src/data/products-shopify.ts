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

export function normalizeCategorySlug(handle: string): string {
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
  const family = await resolveFamilyHandles(norm, all);
  const matchSlugs = family ?? new Set([norm]);
  const filtered = all.filter(
    (p) => matchSlugs.has(p.categorySlug) || (p.shopifyCollections || []).some((c) => matchSlugs.has(c.slug))
  );
  // Empty stays empty: an empty or unknown category never falls back to
  // the whole catalogue (that silent fallback hid miscategorised products).
  return filtered;
}

/** The six shop families. A family page shows every ACTIVE product in any
    of its collections, deduped (a product in two family collections still
    appears once, because the filter runs per product). Fixed handle lists
    for terea / iqos / juul; disposables and e-liquids also absorb every
    live brand collection whose handle ends with -disposable / -e-liquid.
    Handles are normalised through HANDLE_ALIASES before matching: the
    products carry iqos-terea as heated-tobacco and e-liquids as e-liquid. */
export const CATEGORY_FAMILIES: Record<string, { handles: string[]; suffix?: string }> = {
  terea: {
    handles: ["terea", "terea-indonesia", "terea-japan", "terea-uzbekistan", "terea-kyrgyzstan", "terea-flavor", "terea-device", "terea-swiss", "terea-italy", "terea-kazakhstan"],
  },
  iqos: { handles: ["iqos", "iqos-iluma", "iqos-iluma-i", "iqos-terea"] },
  juul: { handles: ["juul", "juul-1", "juul-2"] },
  "disposable-vape": { handles: ["disposable-vape"], suffix: "-disposable" },
  "e-liquid": { handles: ["e-liquids", "e-liquid"], suffix: "-e-liquid" },
};

/** Canonical slugs of the six category cards, in tile order. Shop All is "all". */
export const FAMILY_CATEGORY_SLUGS = ["terea", "iqos", "juul", "disposable-vape", "e-liquid", "all"];

/** Resolve a family root slug to its full normalised handle set, or null
    when the slug is not a family root (sub/brand slugs match exactly one
    collection). Suffix families resolve against the live collections list
    (collection metafields) plus the memberships seen on the products, so a
    new brand collection is picked up without a code change. */
export async function resolveFamilyHandles(
  familySlug: string,
  all?: ProductItem[]
): Promise<Set<string> | null> {
  const norm = normalizeCategorySlug(familySlug);
  const family = CATEGORY_FAMILIES[norm];
  if (!family) return null;
  const handles = new Set(family.handles.map(normalizeCategorySlug));
  if (family.suffix) {
    const live = new Set<string>();
    try {
      const meta = await fetchCollectionMeta();
      for (const h of Object.keys(meta.byHandle)) live.add(normalizeCategorySlug(h));
    } catch { /* live list optional: memberships below still cover it */ }
    const products = all ?? (await fetchAllProducts());
    for (const p of products) {
      for (const c of p.shopifyCollections || []) live.add(c.slug);
      if (p.categorySlug) live.add(p.categorySlug);
    }
    for (const h of live) if (h.endsWith(family.suffix)) handles.add(h);
  }
  return handles;
}

/** Does a product belong to the given normalised handle set? */
function productMatchesHandles(p: ProductItem, handles: Set<string>): boolean {
  return handles.has(p.categorySlug) || (p.shopifyCollections || []).some((c) => handles.has(c.slug));
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

/** Category cards on the shop pages follow the six families: TEREA, IQOS,
    JUUL, Disposables, E-Liquids and Shop All. Brand collections (the
    *-disposable / *-e-liquid handles) stay reachable from the menu and from
    their own /collections/<handle> pages, but they are not index cards.
    A collection the owner flags show_as_card in the panel is still listed
    as an extra card. Legacy local categories (pod systems, vape kits,
    shisha) stay in Shopify but never surface as cards. */

/** Categories: local rich metadata first, then auto entries for the
    TEREA / IQOS / JUUL families, then the synthetic Shop All card. Counts
    are family counts over the ACTIVE catalogue (deduped), not membership
    counts, so a product in two family collections is counted once. */
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
  const familyEntry = async (slug: string): Promise<CollectionCategory | null> => {
    const handles = await resolveFamilyHandles(slug, all);
    if (!handles) return null;
    const members = all.filter((p) => productMatchesHandles(p, handles));
    const sample = members[0];
    const title = seen.get(slug)?.title || slug;
    return {
      slug,
      name: title,
      title: `${title} | Vape Mart UAE`,
      subtitle: metaBySlug[slug]?.heroSubtitle || `Shop authentic ${title.toLowerCase()} with same-day delivery across the UAE.`,
      badge: metaBySlug[slug]?.badge || "NEW",
      icon: "Flame",
      image: sample?.primaryImage || "/images/prod_disposable.png",
      count: members.length,
      description: `Explore our ${title.toLowerCase()} collection, 100% authentic products with express delivery across Dubai and the UAE.`,
      faqs: faqsBySlug[slug],
    };
  };
  const local = localCategories;
  const familyCards: CollectionCategory[] = [];
  // Local rich entries (Disposables, E-Liquids) keep their curated copy,
  // with family counts instead of single-collection membership counts.
  for (const c of local.filter((c) => c.slug === "disposable-vape" || c.slug === "e-liquid")) {
    const handles = await resolveFamilyHandles(c.slug, all);
    const count = handles ? all.filter((p) => productMatchesHandles(p, handles)).length : seen.get(c.slug)?.count ?? c.count;
    const m = metaBySlug[c.slug];
    familyCards.push({
      ...c,
      count,
      badge: m?.badge || c.badge,
      subtitle: m?.heroSubtitle || c.subtitle,
      faqs: faqsBySlug[c.slug],
    });
  }
  const familyBySlug = new Map(familyCards.map((c) => [c.slug, c]));
  // Auto entries for the families with no local rich entry (TEREA, IQOS, JUUL).
  for (const slug of ["terea", "iqos", "juul"]) {
    const entry = await familyEntry(slug);
    if (entry) familyBySlug.set(slug, entry);
  }
  // Shop All is the whole ACTIVE catalogue, not the frontpage collection.
  familyBySlug.set("all", {
    slug: "all",
    name: "Shop All",
    title: "Shop All Vapes | Vape Mart UAE",
    subtitle: "Browse the full catalogue of authentic vapes, e-liquids and heated tobacco with same-day delivery across the UAE.",
    badge: "EXPLORE",
    icon: "Flame",
    image: all[0]?.primaryImage || "/images/prod_disposable.png",
    count: all.length,
    description: "Browse the full catalogue of authentic vapes, e-liquids and heated tobacco with express delivery across Dubai and the UAE.",
  });
  const ordered = FAMILY_CATEGORY_SLUGS.map((s) => familyBySlug.get(s)).filter(
    (c): c is CollectionCategory => !!c
  );
  // Panel-flagged collections surface as extra cards after the six families.
  const extra: CollectionCategory[] = [];
  for (const [slug, info] of seen) {
    if (familyBySlug.has(slug) || !flagged.has(slug)) continue;
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
      description: `Explore our ${info.title.toLowerCase()} collection, 100% authentic products with express delivery across Dubai and the UAE.`,
      faqs: faqsBySlug[slug],
    });
  }
  return [...ordered, ...extra];
}

export function getCategoryBySlugSync(slug: string): CollectionCategory | undefined {
  return localCategories.find((c) => c.slug === slug);
}
