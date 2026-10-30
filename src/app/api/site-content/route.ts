import { NextResponse } from "next/server";
import { fetchShopSettings, fetchSiteContent, fetchBlogPosts } from "@/lib/shopify";
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
  // Blog posts are best-effort: a Shopify hiccup must not 500 the whole
  // site-content response (or fail a static prerender of this route).
  const [settings, content, posts] = await Promise.all([fetchShopSettings(), fetchSiteContent(), fetchBlogPosts().catch(() => [])]);
  const BADGE = ["bg-emerald-600 text-white", "bg-amber-600 text-white", "bg-blue-600 text-white", "bg-purple-600 text-white", "bg-rose-600 text-white"];
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
    showcaseCards: content.showcaseCards,
    blogPosts: posts.map((p, i) => ({
      id: i + 1,
      handle: p.handle,
      title: p.title,
      category: (p.category || "Guides").toUpperCase(),
      readTime: `${Math.max(1, Math.round(p.bodyHtml.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length / 200))} min read`,
      date: p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "",
      excerpt: p.excerpt,
      image: p.imageUrl || "/images/blog_1.png",
      badgeBg: BADGE[i % BADGE.length],
      author: "Vape Mart Team",
    })),
  });
}
