import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  categories,
  getCategoryBySlug,
  getProductsByCategory,
  allProducts
} from "@/data/products";
import { CollectionPageView } from "@/components/collection/CollectionPageView";

interface CollectionSlugPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CollectionSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
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
  const category = getCategoryBySlug(slug);

  if (!category) {
    // If not matching a category, fallback to all products
    return <CollectionPageView allCategories={categories} products={allProducts} />;
  }

  const categoryProducts = getProductsByCategory(category.slug);

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
          products={categoryProducts.length > 0 ? categoryProducts : allProducts}
        />
      </Suspense>
    </>
  );
}
