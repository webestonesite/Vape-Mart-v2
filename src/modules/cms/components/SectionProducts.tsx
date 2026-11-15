import React from "react";
import { SectionProductsDTO } from "../cms.types";
import { ProductCard } from "@/modules/catalog/components/ProductCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionProducts({
  section,
  products = [],
}: {
  section: SectionProductsDTO;
  products?: any[];
}) {
  const displayProducts = products.slice(0, section.productLimit || 8);

  return (
    <section className="my-16 mx-auto max-w-7xl px-4 sm:px-6">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {section.heading}
          </h2>
          {section.subHeading && (
            <p className="mt-1 text-sm text-muted-foreground">{section.subHeading}</p>
          )}
        </div>

        {section.showViewAll && section.collectionHandle && (
          <Link
            href={`/collections/${section.collectionHandle}`}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            View All
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {displayProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {displayProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-12 text-center text-sm text-muted-foreground">
          No products found in this collection.
        </div>
      )}
    </section>
  );
}

