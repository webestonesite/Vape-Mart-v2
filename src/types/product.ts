export interface SensoryProfile {
  sweetness: number; // 1-5
  cooling: number;   // 1-5
  throatHit: number; // 1-5
  topNote: string;
  heartNote: string;
  baseNote: string;
  ratio?: string;
}

export interface ProductFlavor {
  id: string;
  name: string;
  color: string;
  inStock: boolean;
  img?: string;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface ProductHighlight {
  title: string;
  desc: string;
  iconName: string;
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
  location: string;
}

export interface ProductFAQ {
  q: string;
  a: string;
}

export interface BundleItem {
  id: string;
  title: string;
  price: number;
  img: string;
}

export interface ProductBundle {
  title: string;
  bundleItems: BundleItem[];
  bundlePrice: number;
  savings: number;
}

export interface ProductItem {
  id: string;
  slug: string;
  title: string;
  seo?: { title: string; description: string };
  subtitle?: string;
  brand: string;
  category: string;
  categorySlug: string;
  /** All Shopify collections this product belongs to (slug + title), when Shopify-backed. */
  shopifyCollections?: { slug: string; title: string }[];
  subCategory?: string;
  price: number;
  originalPrice: number;
  revs: number;
  rating: number;
  badge?: string;
  inStock: boolean;
  stockQuantity: number;
  sku: string;
  images: string[];
  primaryImage: string;
  shortDescription: string;
  fullDescription: string;
  puffs?: number;
  puffRange?: string; // e.g. "25000-35000"
  nicotineStrength: string;
  nicotineOptions: string[];
  eLiquidCapacity?: string;
  batteryCapacity?: string;
  chargingType?: string;
  coilType?: string;
  activation?: string;
  flavors: ProductFlavor[];
  flavorFamily: "fruit_ice" | "menthol" | "tobacco" | "dessert" | "";
  /** Shopify variant options (e.g. Flavor, Color, Pack Size) + every variant. Empty for single-variant products. */
  variantOptions?: { name: string; values: string[] }[];
  productVariants?: { id: string; title: string; options: { name: string; value: string }[]; price: number; compareAtPrice: number; stock: number; sku: string }[];
  sensoryProfile: SensoryProfile;
  highlights: ProductHighlight[];
  specifications: ProductSpecification[];
  bundleUpsell?: ProductBundle;
  reviews: ProductReview[];
  faqs: ProductFAQ[];
  relatedSlugs: string[];
}

export interface CollectionCategory {
  slug: string;
  name: string;
  title: string;
  subtitle: string;
  badge: string;
  icon: string;
  image: string;
  count: number;
  description: string;
  faqs?: { q: string; a: string }[];
}

export interface FilterState {
  category: string;
  priceRange: string;
  brands: string[];
  puffRanges: string[];
  nicotineStrengths: string[];
  flavorFamilies: string[];
  inStockOnly: boolean;
  sortBy: "popular" | "price_asc" | "price_desc" | "rating" | "newest";
  searchQuery: string;
}

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  brand: string;
  price: number;
  quantity: number;
  flavor?: string;
  nicotine?: string;
  /** e.g. "Mango Ice / 10 pcs" for variant-driven products. */
  variantLabel?: string;
  image: string;
}

