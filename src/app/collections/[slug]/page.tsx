import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  fetchCategories,
  fetchProductsByCategory,
  fetchAllProducts,
  getCategoryBySlugSync,
  normalizeCategorySlug,
} from "@/data/products-shopify";
import { fetchShopSettings, fetchCollectionMeta } from "@/lib/shopify";
import { fetchNavMenu } from "@/components/menu";
import { CollectionPageView } from "@/components/collection/CollectionPageView";
import { TEREA_FAQS } from "@/components/collection/TereaEditorialGuide";

interface CollectionSlugPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;
export const revalidate = 86400;

export async function generateStaticParams() {
  try {
    const [categories, allProducts, meta] = await Promise.all([
      fetchCategories(),
      fetchAllProducts(),
      fetchCollectionMeta(),
    ]);
    const slugs = new Set<string>();
    for (const c of categories) if (c.slug) slugs.add(c.slug);
    for (const h of Object.keys(meta.byHandle || {})) if (h) slugs.add(h);
    for (const p of allProducts) {
      if (p.categorySlug) slugs.add(p.categorySlug);
      for (const col of p.shopifyCollections || []) {
        if (col.slug) slugs.add(col.slug);
      }
    }
    return Array.from(slugs).map((slug) => ({
      slug,
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: CollectionSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  // Normalise first, so /collections/e-liquids resolves first-class as the
  // e-liquid category instead of falling through to the brand branch.
  const norm = normalizeCategorySlug(slug);
  const categories = await fetchCategories();
  const category = categories.find((c) => c.slug === norm) || getCategoryBySlugSync(norm);

  if (!category) {
    /* B6: brand / unlisted collection — title it by the collection, not "Not Found". */
    const all = await fetchAllProducts();
    const member = all.find((p) =>
      (p.shopifyCollections || []).some((c) => c.slug === norm || c.slug === slug) || p.categorySlug === norm || p.categorySlug === slug
    );
    const memberTitle = member?.shopifyCollections?.find((c) => c.slug === norm || c.slug === slug)?.title
      || (member?.categorySlug === norm ? member.category : undefined)
      || slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    if (memberTitle) {
      return {
        title: `${memberTitle} | Vape Mart UAE`,
        description: `Shop authentic ${memberTitle.toLowerCase()} with same-day delivery across the UAE. Same-day express delivery in Dubai with 100% genuine guaranteed brands.`,
      };
    }
    return {
      title: "Collection Not Found | Vape Mart UAE",
      description: "The requested vape collection could not be found."
    };
  }

  if (norm === "terea") {
    return {
      title: "IQOS TEREA Shop UAE | TEREA Sticks Dubai | Vape Mart",
      description: "IQOS TEREA Shop UAE. Buy TEREA sticks in Dubai from 7 regions, 61 flavours, with cash on delivery and fast UAE delivery. Sealed original stock. Order now.",
      openGraph: {
        title: "IQOS TEREA Shop UAE | TEREA Sticks Dubai | Vape Mart",
        description: "IQOS TEREA Shop UAE. Buy TEREA sticks in Dubai from 7 regions, 61 flavours, with cash on delivery and fast UAE delivery. Sealed original stock. Order now.",
        images: [
          {
            url: category.image || "https://cdn.shopify.com/s/files/1/0631/8607/5696/collections/Terea_Dubai.webp?v=1794333481",
            width: 800,
            height: 800,
            alt: "IQOS TEREA Shop UAE",
          },
        ],
      },
    };
  }

  return {
    title: `${category.title} | Vape Mart UAE`,
    description: `${category.subtitle} Same-day express delivery in Dubai with 100% genuine guaranteed brands.`,
    openGraph: {
      title: `${category.title} | Vape Mart UAE`,
      description: category.description,
      images: [
        {
          url: category.image,
          width: 800,
          height: 800,
          alt: category.name
        }
      ]
    }
  };
}

export default async function CollectionSlugPage({ params }: CollectionSlugPageProps) {
  const { slug } = await params;
  // Normalise first, so /collections/e-liquids resolves first-class as the
  // e-liquid category instead of falling through to the brand branch.
  const norm = normalizeCategorySlug(slug);
  const [categories, allProducts, settings, menu] = await Promise.all([
    fetchCategories().catch(() => []),
    fetchAllProducts().catch(() => []),
    fetchShopSettings().catch(() => null),
    fetchNavMenu(),
  ]);
  const category = categories.find((c) => c.slug === norm) || getCategoryBySlugSync(norm);

  // Lightweight catalog projection for discovery counts to eliminate huge RSC payload
  const catalogProjection = allProducts.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    brand: p.brand,
    category: p.category,
    categorySlug: p.categorySlug,
    shopifyCollections: p.shopifyCollections,
    flavorFamily: p.flavorFamily,
    primaryImage: p.primaryImage,
    price: p.price,
    inStock: p.inStock,
    reviews: [],
  })) as unknown as typeof allProducts;

  if (!category) {
    /* Brand or unlisted Shopify collection: fetch products matching this collection handle */
    const brandProducts = await fetchProductsByCategory(slug);
    const member = allProducts.find((p) =>
      (p.shopifyCollections || []).some((c) => c.slug === norm || c.slug === slug) || p.categorySlug === norm || p.categorySlug === slug
    );
    const memberTitle = member?.shopifyCollections?.find((c) => c.slug === norm || c.slug === slug)?.title
      || (member?.categorySlug === norm ? member.category : undefined)
      || slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

    if (brandProducts.length > 0 || member) {
      const brandCategory = {
        slug: norm,
        name: memberTitle,
        title: `${memberTitle} | Vape Mart UAE`,
        subtitle: `Shop authentic ${memberTitle.toLowerCase()} with same-day delivery across the UAE.`,
        badge: "NEW",
        icon: "Flame",
        image: member?.primaryImage || brandProducts[0]?.primaryImage || "/images/prod_disposable.png",
        count: brandProducts.length,
        description: `Explore our ${memberTitle.toLowerCase()} collection — 100% authentic products with express delivery across Dubai and the UAE.`,
      };
      return (
        <CollectionPageView
          category={brandCategory}
          allCategories={categories}
          products={brandProducts}
          catalogProducts={catalogProjection}
          pageSettings={settings?.collectionPage}
          menu={menu}
        />
      );
    }
    // Unknown slug with no products: show empty state
    return <CollectionPageView allCategories={categories} products={[]} catalogProducts={catalogProjection} pageSettings={settings?.collectionPage} menu={menu} />;
  }

  const enrichedCategory = norm === "terea" ? {
    ...category,
    name: "TEREA",
    title: "IQOS TEREA Shop UAE – TEREA Sticks from 7 Regions",
    badge: "7 REGIONS • 61 FLAVOURS",
    subtitle: "At the IQOS TEREA Shop UAE, you will find IQOS TEREA sticks from 7 regions, 61 flavours in all, made for IQOS ILUMA and ILUMA i devices. In Dubai, order before 6pm and your sticks arrive in 3–4 hours with cash on delivery across the UAE.",
    description: "Sealed original stock, 20 sticks per pack with region on the label. 100% genuine guaranteed with same-day express delivery across Dubai and the UAE.",
    faqs: TEREA_FAQS,
  } : category;

  const categoryProducts = await fetchProductsByCategory(category.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: enrichedCategory.title,
    description: enrichedCategory.description,
    url: `https://vapemart.ae/collections/${category.slug}`
  };

  const faqJsonLd = norm === "terea" ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: TEREA_FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  } : null;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://vapemart.ae"
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Collections",
        item: "https://vapemart.ae/collections"
      },
      {
        "@type": "ListItem",
        position: 3,
        name: category.name,
        item: `https://vapemart.ae/collections/${category.slug}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Suspense fallback={null}>
        <CollectionPageView
          category={enrichedCategory}
          allCategories={categories}
          products={categoryProducts}
          catalogProducts={catalogProjection}
          pageSettings={settings?.collectionPage}
          menu={menu}
        />
      </Suspense>
    </>
  );
}
