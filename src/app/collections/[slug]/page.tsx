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
import { fetchShopSettings } from "@/lib/shopify";
import { CollectionPageView } from "@/components/collection/CollectionPageView";

interface CollectionSlugPageProps {
  params: Promise<{ slug: string }>;
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
      (p.shopifyCollections || []).some((c) => c.slug === norm) || p.categorySlug === norm
    );
    const memberTitle = member?.shopifyCollections?.find((c) => c.slug === norm)?.title
      || (member?.categorySlug === norm ? member.category : undefined);
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
  const [categories, allProducts, settings] = await Promise.all([fetchCategories(), fetchAllProducts(), fetchShopSettings()]);
  const category = categories.find((c) => c.slug === norm) || getCategoryBySlugSync(norm);

  if (!category) {
    /* B6: a brand / unlisted Shopify collection (e.g. /collections/lambda)
       is not a "category", so the old code fell back to the unfiltered
       all-products list. If products are members of a collection with
       this handle, show that collection's products instead — filtered by
       membership, like the main categories. */
    const member = allProducts.find((p) =>
      (p.shopifyCollections || []).some((c) => c.slug === norm) || p.categorySlug === norm
    );
    const memberTitle = member?.shopifyCollections?.find((c) => c.slug === norm)?.title
      || (member?.categorySlug === norm ? member.category : undefined);
    if (member && memberTitle) {
      const brandProducts = await fetchProductsByCategory(slug);
      const brandCategory = {
        slug: norm,
        name: memberTitle,
        title: `${memberTitle} | Vape Mart UAE`,
        subtitle: `Shop authentic ${memberTitle.toLowerCase()} with same-day delivery across the UAE.`,
        badge: "NEW",
        icon: "Flame",
        image: member.primaryImage || "/images/prod_disposable.png",
        count: brandProducts.length,
        description: `Explore our ${memberTitle.toLowerCase()} collection — 100% authentic products with express delivery across Dubai and the UAE.`,
      };
      return (
        <CollectionPageView
          category={brandCategory}
          allCategories={categories}
          products={brandProducts}
          catalogProducts={allProducts}
          pageSettings={settings.collectionPage}
        />
      );
    }
    // Unknown slug with no member product: show the empty state, never
    // the whole catalogue.
    return <CollectionPageView allCategories={categories} products={[]} catalogProducts={allProducts} pageSettings={settings.collectionPage} />;
  }

  const categoryProducts = await fetchProductsByCategory(category.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.title,
    description: category.description,
    url: `https://vapemart.ae/collections/${category.slug}`
  };

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Suspense fallback={null}>
        <CollectionPageView
          category={category}
          allCategories={categories}
          products={categoryProducts}
          catalogProducts={allProducts}
          pageSettings={settings.collectionPage}
        />
      </Suspense>
    </>
  );
}
