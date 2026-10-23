import { NextResponse } from "next/server";
import { fetchShopSettings, fetchSiteContent } from "@/lib/shopify";
import type { ProductItem } from "@/types/product";

/**
 * Site content for client components (Header, Footer, homepage).
 * Everything here is edited in Shopify admin; this route just relays it.
 * The underlying reads are cached server-side, so edits appear within
 * a few minutes with no deploy.
 */
export const revalidate = 300;

function cardProduct(p: ProductItem) {
  const discount =
    p.originalPrice > p.price ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
  return {
    handle: p.slug,
    title: p.title,
    price: p.price.toFixed(2),
    oldPrice: p.originalPrice > p.price ? p.originalPrice.toFixed(2) : "",
    discount: discount ? `-${discount}%` : "",
    revs: p.revs,
    badge: p.badge || "",
    brand: p.brand,
    img: p.primaryImage,
  };
}

export async function GET() {
  const [settings, content] = await Promise.all([fetchShopSettings(), fetchSiteContent()]);
  return NextResponse.json({
    settings,
    heroSlides: content.heroSlides,
    homeSections: content.homeSections.map((s) => ({
      key: s.key,
      title: s.title,
      subtitle: s.subtitle,
      badgeText: s.badgeText,
      products: s.products.map(cardProduct),
    })),
    testimonials: content.testimonials,
    faqs: content.faqs,
  });
}
