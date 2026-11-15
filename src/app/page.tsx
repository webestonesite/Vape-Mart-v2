"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SectionErrorBoundary } from "@/components/common/SectionErrorBoundary";
import themeData from "@/data/theme-published.json";
import { cdnWidth } from "@/lib/cdn";

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

// Static Fallback Seed Data
import {
  bestSellingProducts,
  tereaHeetsProducts,
  juulProductsList,
  newArrivalsProducts,
  mostPopularProducts,
} from "@/data/homeData";

// Dynamic Streaming Blocks removed in favor of static imports for zero CLS and instant SSR render

export default function Home() {
  const [cms, setCms] = useState<any>(null);

  useEffect(() => {
    fetch("/api/site-content")
      .then((res) => res.json())
      .then((data) => setCms(data))
      .catch(() => {});
  }, []);

  // CMS Section Helper
  const cmsSection = (key: string) =>
    ((cms?.homeSections ?? []) as any[]).find((s) => s.key === key);

  const secProducts = (key: string, fallback: any[]) => {
    const s = cmsSection(key);
    return s && Array.isArray(s.products) && s.products.length ? s.products : fallback;
  };

  const secText = (key: string, field: string, fallback: string) => {
    const s = cmsSection(key);
    return s && s[field] ? s[field] : fallback;
  };

  const cmsShowcase = (key: string, fallback: any[]) => {
    const s = cmsSection(key);
    return s && Array.isArray(s.collection?.products) && s.collection.products.length
      ? s.collection.products.map((c: any) => ({
          title: c.title,
          price: c.price || "0.00",
          revs: c.revs || 0,
          badge: c.badge || "",
          brand: c.brand || "",
          img: c.imageUrl || "",
        }))
      : fallback;
  };

  const homeSettings: any = cms?.settings?.home || {};
  const homeBanners: any[] =
    Array.isArray(homeSettings.promoBanners ?? homeSettings.promo_banners) &&
    (homeSettings.promoBanners ?? homeSettings.promo_banners).length
      ? homeSettings.promoBanners ?? homeSettings.promo_banners
      : [];
  const banner1 = homeBanners[0] || {};
  const banner2 = homeBanners[1] || {};

  const collectionImages: Record<string, string> = cms?.collectionImages || {};
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

  const fbProducts = secProducts("featuredBrand", [
    { title: "AL Fakher Hypermax 15k Puffs", price: "50.00", oldPrice: "", discount: "", img: "/images/cat_disposables.png" },
    { title: "Al Fakher Mega Max 40000 Puffs Disposable Vape", price: "50.00", oldPrice: "", discount: "", img: "/images/cat_disposables.png" },
    { title: "Waka Blade 50K Puffs 50mg in Dubai, UAE", price: "55.00", oldPrice: "", discount: "", img: "/images/cat_disposables.png" },
    { title: "ELFBAR BC10000 Puffs Disposable Vape", price: "35.00", oldPrice: "", discount: "", img: "/images/cat_disposables.png" },
    { title: "Waka SoPro 20000 Puffs 50mg in Dubai, UAE", price: "50.00", oldPrice: "", discount: "", img: "/images/cat_disposables.png" },
    { title: "KIEF King 35000 Puffs Disposable Vape", price: "45.00", oldPrice: "", discount: "", img: "/images/cat_disposables.png" },
  ]);

  const initialsOf = (name: string) =>
    name
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const testimonialList = cms?.testimonials?.length
    ? cms.testimonials.map((t: any) => ({
        name: t.name,
        avatar: initialsOf(t.name || "V"),
        role: t.role || "Verified Buyer",
        title: t.title,
        review: t.review,
      }))
    : undefined;

  const faqList = cms?.faqs?.length
    ? cms.faqs.map((f: any) => ({ q: f.question, a: f.answer }))
    : undefined;

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-[#064e3b] selection:text-white flex flex-col">
      {/* Global Unified Header Component */}
      <Header />

      <main className="flex-1 flex flex-col">
        {/* 1. Hero Section */}
        <div style={{ order: homeSecOrder("hero") }} className="w-full bg-[#064e3b]">
          <SectionErrorBoundary sectionName="Hero Section">
            <HomeHero cmsHeroSlides={cms?.heroSlides} order={homeSecOrder("hero")} />
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
              products={secProducts("bestSelling", bestSellingProducts)}
              greenBoxPC={true}
            />
          </SectionErrorBoundary>

          <SectionErrorBoundary sectionName="IQOS & TEREA Carousel">
            <ProductCarousel
              title={secText("tereaHeets", "title", themeData.tereaHeets?.title || "IQOS and TEREA")}
              subtitle={secText("tereaHeets", "subtitle", themeData.tereaHeets?.subtitle || "Authentic heated tobacco sticks for IQOS ILUMA & IQOS 3 Duo in UAE")}
              badgeText={secText("tereaHeets", "badgeText", themeData.tereaHeets?.badgeText || "HEATED TOBACCO")}
              products={secProducts("tereaHeets", cmsShowcase("tereaHeets", tereaHeetsProducts))}
              greenBoxPC={true}
            />
          </SectionErrorBoundary>

          <SectionErrorBoundary sectionName="JUUL Carousel">
            <ProductCarousel
              title={secText("juulProducts", "title", themeData.juulProducts?.title || "JUUL Pods & Devices")}
              subtitle={secText("juulProducts", "subtitle", themeData.juulProducts?.subtitle || "Original JUUL2 starter kits, replacement pods & accessories with rapid delivery")}
              badgeText={secText("juulProducts", "badgeText", themeData.juulProducts?.badgeText || "PREMIUM PODS")}
              products={secProducts("juulProducts", cmsShowcase("juulProducts", juulProductsList))}
              greenBoxPC={true}
            />
          </SectionErrorBoundary>

          <SectionErrorBoundary sectionName="New Arrivals Carousel">
            <ProductCarousel
              title={secText("featured", "title", "New Arrivals")}
              subtitle={secText("featured", "subtitle", "Explore our latest premium collection")}
              badgeText={secText("featured", "badgeText", "NEW ITEMS")}
              products={secProducts("featured", newArrivalsProducts)}
              greenBoxPC={true}
            />
          </SectionErrorBoundary>

          <SectionErrorBoundary sectionName="Most Popular Carousel">
            <ProductCarousel
              title={secText("mostPopular", "title", "Most Popular")}
              subtitle={secText("mostPopular", "subtitle", "The most trending products right now")}
              badgeText={secText("mostPopular", "badgeText", "TRENDING")}
              products={secProducts("mostPopular", mostPopularProducts)}
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
            title={secText("flavors", "title", (themeData as any).flavors?.title || "Signature Flavours")}
            subtitle={secText("flavors", "subtitle", (themeData as any).flavors?.subtitle || "Turn the dial and find your flavour. If you're not sure where to start, pick the one that sounds like you and go from there.")}
            badge={secText("flavors", "badge", (themeData as any).flavors?.badge)}
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
          <HomeBlogCarousel posts={cms?.blogPosts} order={homeSecOrder("blog")} />
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
      <HomeFloatingControls phone={cms?.settings?.phone || "+971 55 110 3401"} />
    </div>
  );
}
