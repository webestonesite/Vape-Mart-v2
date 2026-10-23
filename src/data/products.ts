import { ProductItem, CollectionCategory } from "@/types/product";

export const categories: CollectionCategory[] = [
  {
    slug: "disposable-vape",
    name: "Disposable Vapes",
    title: "Premium Disposable Vapes in UAE",
    subtitle: "High-puff rechargeable disposables from Elf Bar, Vozol, Yuoto, and Tugboat with instant mesh coil flavor delivery.",
    badge: "TOP CATEGORY",
    icon: "Flame",
    image: "/images/prod_disposable.png",
    count: 148,
    description: "Explore the UAE's most comprehensive catalog of authentic disposable vapes. Offering ultra-high puff counts from 5,000 up to 40,000 puffs, dual-mesh coils, smart LED battery indicators, and rapid Type-C charging. Same-day delivery across Dubai, Sharjah, and Abu Dhabi."
  },
  {
    slug: "pods-system",
    name: "Pod Systems & Kits",
    title: "Advanced Pod Systems & Closed Kits",
    subtitle: "Compact, refillable, and pre-filled pod kits from JUUL2, Uwell Caliburn, Vaporesso, and Myle.",
    badge: "TRENDING",
    icon: "Zap",
    image: "/images/prod_pod.png",
    count: 86,
    description: "Ideal for adult smokers seeking smooth nicotine salt delivery and effortless pocket portability. Our pod collection includes both open-refillable systems and authentic closed pod systems."
  },
  {
    slug: "e-liquid",
    name: "Premium E-Liquids",
    title: "Artisan Nicotine Salts & Freebase E-Juice",
    subtitle: "Original imported American, UK, and Malaysian gourmet e-juices with intense aroma and authentic fruit ice notes.",
    badge: "FLAVOR LAB",
    icon: "Droplets",
    image: "/images/prod_eliquid.png",
    count: 112,
    description: "Crafted for maximum flavor depth and cloud density. Choose from 20mg to 50mg nicotine salts for pod devices, or 3mg to 6mg high-VG freebase e-liquids for sub-ohm tank systems."
  },
  {
    slug: "heated-tobacco",
    name: "TEREA & HEETS",
    title: "IQOS ILUMA TEREA & HEETS Sticks",
    subtitle: "Original Indonesian, Italian, and European heated tobacco sticks with Smartcore Induction System.",
    badge: "GENUINE 100%",
    icon: "ShieldCheck",
    image: "/images/terea_heets.jpg",
    count: 44,
    description: "Zero ash, zero tar, and no blade cleaning required. Authentic Indonesian & Japanese TEREA sticks designed specifically for IQOS ILUMA devices with same-day express delivery across Dubai."
  },
  {
    slug: "vape-kits",
    name: "Vape Starter & Mod Kits",
    title: "High-Performance Sub-Ohm Vape Kits",
    subtitle: "Rugged, high-wattage box mods and versatile pod mods from Geekvape, Voopoo, and Vaporesso.",
    badge: "PRO SERIES",
    icon: "Layers",
    image: "/images/cat_vape_kits.png",
    count: 52,
    description: "Built for cloud chasers and flavour purists. Featuring IP68 shockproof & waterproof ratings, responsive chipset firing speeds, and massive rechargeable battery life."
  },
  {
    slug: "shisha-hookah",
    name: "E-Shisha & Hookah",
    title: "Electronic Shisha Devices & Flavors",
    subtitle: "Modern charcoal-free electronic hookah devices with clean vapor output and authentic Two Apple flavours.",
    badge: "LUXURY",
    icon: "Flame",
    image: "/images/hero_slide_2.jpg",
    count: 32,
    description: "Experience royal hookah pleasure without toxic charcoal combustion or mess. Enjoy authentic Al Fakher shisha molasses notes in ultra-modern electronic portable form."
  }
];

/** The local demo catalog was removed: the storefront reads exclusively
 *  from Shopify. On a Shopify outage the shop shows an empty state rather
 *  than demo products. */
export const allProducts: ProductItem[] = [];

export function getProductBySlug(slug: string): ProductItem | undefined {
  return allProducts.find((p) => p.slug === slug);
}

export function getProductsByCategory(categorySlug: string): ProductItem[] {
  if (!categorySlug || categorySlug === "all") return allProducts;
  return allProducts.filter((p) => p.categorySlug === categorySlug);
}

export function getAllProducts(): ProductItem[] {
  return allProducts;
}

export function getCategoryBySlug(slug: string): CollectionCategory | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getRelatedProducts(slug: string): ProductItem[] {
  const current = getProductBySlug(slug);
  if (!current) return allProducts.slice(0, 4);
  const related = allProducts.filter((p) => current.relatedSlugs?.includes(p.slug) || (p.categorySlug === current.categorySlug && p.slug !== slug));
  return related.length > 0 ? related.slice(0, 4) : allProducts.filter((p) => p.slug !== slug).slice(0, 4);
}
