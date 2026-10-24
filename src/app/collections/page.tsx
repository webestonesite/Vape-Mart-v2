import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchAllProducts, fetchCategories } from "@/data/products-shopify";
import { fetchShopSettings } from "@/lib/shopify";
import { CollectionPageView } from "@/components/collection/CollectionPageView";

export const metadata: Metadata = {
  title: "Shop All Premium Vapes, E-Liquids & Pods | Vape Mart UAE",
  description:
    "Browse our complete collection of 100% authentic disposable vapes, pod systems, e-liquids, and IQOS TEREA sticks. Same-day delivery across Dubai and UAE.",
  openGraph: {
    title: "All Vape Products & Collections | Vape Mart UAE",
    description:
      "Original imported vapes with rapid 2-3 hour delivery in Dubai and guaranteed cash on delivery."
  }
};

export default async function AllCollectionsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "All Vape Collections",
    description:
      "Complete inventory of authentic electronic cigarettes, heated tobacco, and e-liquids in the United Arab Emirates.",
    url: "https://vapemart.ae/collections"
  };

  const [categories, allProducts, settings] = await Promise.all([fetchCategories(), fetchAllProducts(), fetchShopSettings()]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={null}>
        <CollectionPageView allCategories={categories} products={allProducts} catalogProducts={allProducts} pageSettings={settings.collectionPage} />
      </Suspense>
    </>
  );
}
