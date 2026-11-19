import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { SectionErrorBoundary } from "@/components/common/SectionErrorBoundary";
import { cdnWidth } from "@/lib/cdn";
import { fetchSiteContent, fetchShopSettings, fetchBlogPosts } from "@/lib/shopify";
import type { BlogPost } from "@/lib/shopify";
import type { ProductItem } from "@/types/product";

// Server-rendered homepage (Option A, 2026-11-19): the real CMS data is
// fetched on the server, so the first paint already shows the real
// products. There are NO fallback/demo product lists anywhere on this
// page anymore — a section with no CMS products renders empty (heading
// + "View All (0)"), never hardcoded products. The old client-side
// fetch + homeData fallbacks showed stale demo products for ~1s on every
// reload, which broke the no-demo rule.
export const revalidate = 300;

// Map a Shopify product to the carousel card shape (same as
// /api/site-content's cardProduct).
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

const BADGE = ["bg-emerald-600 text-white", "bg-amber-600 text-white", "bg-blue-600 text-white", "bg-purple-600 text-white", "bg-rose-600 text-white"];

function mapBlogPost(p: BlogPost, i: number) {
  return {
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
  };
}

// Static UI & SEO Components (Zero Layout Shift on Reload)
import ProductCarousel from "@/components/ProductCarousel";
import { SeoContent } from "@/components/SeoContent";
import { HomeHero } from "@/components/home/HomeHero";
import { HomePromoBanners } from "@/components/home/HomePromoBanners";
import { HomeCategories } from "@/components/home/HomeCategories";
import { HomeFeatures } from "@/components/home/HomeFeatures";
import { HomeFeaturedBrand } from "@/components/home/HomeFeaturedBrand";
import { HomeFlavorArcDial } from "@/components/home/HomeFlavorArcDial";
import { HomeFaq } from "@/components/home/HomeFaq";
import { HomeTrustReviews } from "@/components/home/HomeTrustReviews";
import { HomeBlogCarousel } from "@/components/home/HomeBlogCarousel";
import { HomeFloatingControls } from "@/components/home/HomeFloatingControls";

export default async function Home() {
  // Same three reads as /api/site-content. Each is guarded: a Shopify
  // failure renders empty sections, never demo products and never a 500.
  // (fetchSiteContent itself already records per-query failures in
  // `error` and returns the good halves.)
  const [settings, content, posts] = await Promise.all([
    fetchShopSettings().catch(() => null),
    fetchSiteContent().catch(() => null),
    fetchBlogPosts().catch(() => []),
  ]);

  // CMS Section Helper — CMS data only, no fallback products.
  const cmsSection = (key: string) =>
    ((content?.homeSections ?? []) as any[]).find((s) => s.key === key);

  const secProducts = (key: string) => {
    const s = cmsSection(key);
    return s && Array.isArray(s.products) && s.products.length
      ? s.products.map(cardProduct)
      : [];
  };

  // Section labels only (plain strings, not products). CMS provides all
  // of these today; the fallback only guards an empty heading if a CMS
  // text field is ever blank.
  const secText = (key: string, field: string, fallback: string) => {
    const s = cmsSection(key);
    return s && s[field] ? s[field] : fallback;
  };

  const homeSettings: any = (settings as any)?.home || {};
  const homeBanners: any[] =
    Array.isArray(homeSettings.promoBanners ?? homeSettings.promo_banners) &&
    (homeSettings.promoBanners ?? homeSettings.promo_banners).length
      ? homeSettings.promoBanners ?? homeSettings.promo_banners
      : [];
  const banner1 = homeBanners[0] || {};
  const banner2 = homeBanners[1] || {};

  const collectionImages: Record<string, string> = content?.collectionImages || {};
  const tileImg = (collection?: string) => {
    const url = collection ? collectionImages[collection] : "";
    return url ? cdnWidth(url, 800) : "";
  };

  const categoryTiles =
    Array.isArray(homeSettings.categoryTiles ?? homeSettings.category_tiles) &&
    (homeSettings.categoryTiles ?? homeSettings.category_tiles).length
      ? (homeSettings.categoryTiles ?? homeSettings.category_tiles).map((t: any, i: number) => ({
          title: t.title || "",
          subtitle: t.subtitle || "",
          num: String(i + 1).padStart(2, "0"),
          img: tileImg(t.collection),
          color: t.color || "from-emerald-900/80 to-black/90",
          tag: t.tag || "",
          collection: t.collection || "",
        }))
      : [
          { title: "TEREA", subtitle: "HEATED TOBACCO", num: "01", img: tileImg("terea"), color: "from-purple-900/80 to-black/90", tag: "FEATURED", collection: "terea" },
          { title: "IQOS", subtitle: "ILUMA DEVICES", num: "02", img: tileImg("iqos"), color: "from-teal-900/80 to-black/90", tag: "NEW", collection: "iqos" },
          { title: "JUUL", subtitle: "PODS & DEVICES", num: "03", img: tileImg("juul"), color: "from-blue-900/80 to-black/90", tag: "POPULAR", collection: "juul" },
          { title: "Disposables", subtitle: "NEW ARRIVALS", num: "04", img: tileImg("disposable-vape"), color: "from-emerald-900/80 to-black/90", tag: "TRENDING", collection: "disposable-vape" },
          { title: "E-Liquids", subtitle: "TOP RATED", num: "05", img: tileImg("e-liquids"), color: "from-amber-900/80 to-black/90", tag: "HOT", collection: "e-liquids" },
          { title: "Shop All", subtitle: "FULL COLLECTION", num: "06", img: tileImg("frontpage"), color: "from-rose-900/80 to-black/90", tag: "EXPLORE", collection: "frontpage" },
        ];

  const homeTrust = homeSettings.trustStats ?? homeSettings.trust_stats ?? {};
  const homeVisible = (key: string) =>
    (homeSettings.sectionVisibility ?? homeSettings.section_visibility)?.[key] !== false;

  const HOME_SECTION_ORDER = [
    "hero",
    "banners",
    "categories",
    "features",
    "brand",
    "flavors",
    "faq",
    "trust",
    "blog",
  ];
  const savedHomeOrder = Array.isArray(homeSettings.sectionOrder ?? homeSettings.section_order)
    ? (homeSettings.sectionOrder ?? homeSettings.section_order).filter((id: string) =>
        HOME_SECTION_ORDER.includes(id)
      )
    : [];
  const orderedHomeSections = [
    ...savedHomeOrder,
    ...HOME_SECTION_ORDER.filter((id) => !savedHomeOrder.includes(id)),
  ];
  const homeSecOrder = (id: string) => orderedHomeSections.indexOf(id) + 1;

  // "Your Vibe. Your Flavor." products — CMS only, no hardcoded list.
  const fbProducts = secProducts("featuredBrand").map((p: any) => ({
    title: p.title,
    price: p.price,
    oldPrice: p.oldPrice || "",
    discount: p.discount || "",
    img: p.img || "",
  }));

  const initialsOf = (name: string) =>
    name
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const testimonialList = content?.testimonials?.length
    ? content.testimonials.map((t: any) => ({
        name: t.name,
        avatar: initialsOf(t.name || "V"),
        role: t.role || "Verified Buyer",
        title: t.title,
        review: t.review,
      }))
    : undefined;

  const faqList = content?.faqs?.length
    ? content.faqs.map((f: any) => ({ q: f.question, a: f.answer }))
    : undefined;

  const blogList = posts.length ? posts.map(mapBlogPost) : undefined;

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-[#064e3b] selection:text-white flex flex-col">
      {/* Global Unified Header Component */}
      <SiteHeader />

      <main className="flex-1 flex flex-col">
        {/* 1. Hero Section */}
        <div style={{ order: homeSecOrder("hero") }} className="w-full bg-[#064e3b]">
          <SectionErrorBoundary sectionName="Hero Section">
            <HomeHero cmsHeroSlides={content?.heroSlides} order={homeSecOrder("hero")} />
          </SectionErrorBoundary>
        </div>

        {/* 2. Promo Banners */}
        {homeVisible("banners") && (
          <SectionErrorBoundary sectionName="Promo Banners">
            <HomePromoBanners
              banner1={banner1}
              banner2={banner2}
              order={homeSecOrder("banners")}
            />
          </SectionErrorBoundary>
        )}

        {/* 3. Categories Grid */}
        {homeVisible("categories") && (
          <SectionErrorBoundary sectionName="Categories Grid">
            <HomeCategories
              categoryTiles={categoryTiles}
              order={homeSecOrder("categories")}
            />
          </SectionErrorBoundary>
        )}

        {/* 4. Features Section */}
        {homeVisible("features") && (
          <SectionErrorBoundary sectionName="Features Badges">
            <HomeFeatures
              features={homeSettings.features}
              order={homeSecOrder("features")}
            />
          </SectionErrorBoundary>
        )}

        {/* 5. Product Carousels Container */}
        <div style={{ order: homeSecOrder("features") }}>
          <SectionErrorBoundary sectionName="Best Selling Carousel">
            <ProductCarousel
              title={secText("bestSelling", "title", "Best Selling")}
              subtitle={secText("bestSelling", "subtitle", "Our most loved products, chosen by you")}
              badgeText={secText("bestSelling", "badgeText", "TOP PICKS")}
              products={secProducts("bestSelling")}
              greenBoxPC={true}
            />
          </SectionErrorBoundary>

          <SectionErrorBoundary sectionName="TEREA Carousel">
            <ProductCarousel
              title={secText("terea", "title", "TEREA flavors")}
              subtitle={secText("terea", "subtitle", "Original TEREA sticks in every flavour for IQOS ILUMA in Dubai")}
              badgeText={secText("terea", "badgeText", "HEATED TOBACCO")}
              products={secProducts("terea")}
              greenBoxPC={true}
            />
          </SectionErrorBoundary>

          <SectionErrorBoundary sectionName="IQOS & TEREA Carousel">
            <ProductCarousel
              title={secText("tereaHeets", "title", "IQOS Devices")}
              subtitle={secText("tereaHeets", "subtitle", "Authentic heated tobacco sticks for IQOS ILUMA & IQOS 3 Duo in UAE")}
              badgeText={secText("tereaHeets", "badgeText", "HEATED TOBACCO")}
              products={secProducts("tereaHeets")}
              greenBoxPC={true}
            />
          </SectionErrorBoundary>

          <SectionErrorBoundary sectionName="JUUL Carousel">
            <ProductCarousel
              title={secText("juulProducts", "title", "JUUL Pods & Devices")}
              subtitle={secText("juulProducts", "subtitle", "Original JUUL2 starter kits, replacement pods & accessories with rapid delivery")}
              badgeText={secText("juulProducts", "badgeText", "PREMIUM PODS")}
              products={secProducts("juulProducts")}
              greenBoxPC={true}
            />
          </SectionErrorBoundary>

          <SectionErrorBoundary sectionName="New Arrivals Carousel">
            <ProductCarousel
              title={secText("featured", "title", "New Arrivals")}
              subtitle={secText("featured", "subtitle", "Explore our latest premium collection")}
              badgeText={secText("featured", "badgeText", "NEW ITEMS")}
              products={secProducts("featured")}
              greenBoxPC={true}
            />
          </SectionErrorBoundary>

          <SectionErrorBoundary sectionName="Most Popular Carousel">
            <ProductCarousel
              title={secText("mostPopular", "title", "Most Popular")}
              subtitle={secText("mostPopular", "subtitle", "The most trending products right now")}
              badgeText={secText("mostPopular", "badgeText", "TRENDING")}
              products={secProducts("mostPopular")}
              greenBoxPC={true}
            />
          </SectionErrorBoundary>
        </div>

        {/* 6. Featured Brand Spotlight */}
        <SectionErrorBoundary sectionName="Featured Brand">
          <HomeFeaturedBrand
            title={secText("featuredBrand", "title", "Your Vibe. Your Flavor.")}
            products={fbProducts}
            order={homeSecOrder("brand")}
          />
        </SectionErrorBoundary>

        {/* 7. Signature Flavor Arc Dial */}
        <SectionErrorBoundary sectionName="Signature Flavors Arc Dial">
          <HomeFlavorArcDial
            order={homeSecOrder("flavors")}
            title={secText("flavors", "title", "Signature Flavours")}
            subtitle={secText("flavors", "subtitle", "Turn the dial and find your flavour. If you're not sure where to start, pick the one that sounds like you and go from there.")}
            badge={secText("flavors", "badge", "TASTE THE EXTRAORDINARY • 11 ARTISAN BLENDS")}
          />
        </SectionErrorBoundary>

        {/* 8. FAQ Accordion */}
        <SectionErrorBoundary sectionName="FAQ Accordion">
          <HomeFaq faqs={faqList} order={homeSecOrder("faq")} />
        </SectionErrorBoundary>

        {/* 9. Trust & Reviews Hub */}
        {homeVisible("trust") && (
          <SectionErrorBoundary sectionName="Trust & Reviews">
            <HomeTrustReviews
              testimonials={testimonialList}
              customersCount={homeTrust.customers || 160000}
              reviewsCount={homeTrust.reviews || 1200}
              order={homeSecOrder("trust")}
            />
          </SectionErrorBoundary>
        )}

        {/* 10. Blog Cover-Flow Carousel */}
        <SectionErrorBoundary sectionName="Blog Carousel">
          <HomeBlogCarousel posts={blogList} order={homeSecOrder("blog")} />
        </SectionErrorBoundary>

        {/* 11. SEO Structured Rich Content */}
        <div style={{ order: 998 }} className="w-full">
          <SectionErrorBoundary sectionName="SEO Rich Content">
            <SeoContent />
          </SectionErrorBoundary>
        </div>
      </main>

      {/* Global Unified Footer */}
      <Footer />

      {/* Floating Controls (WhatsApp, Back To Top, Mobile Bottom Navigation) */}
      <HomeFloatingControls phone={(settings as any)?.phone || "+971 55 110 3401"} />
    </div>
  );
}
