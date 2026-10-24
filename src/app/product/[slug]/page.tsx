import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchProductBySlug, fetchRelatedProducts, fetchAllProducts } from "@/data/products-shopify";
import { fetchProductReviews } from "@/lib/shopify";
import { ProductDetailView } from "@/components/product/ProductDetailView";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = (await fetchProductBySlug(slug)) || (await fetchAllProducts())[0];

  if (!product) {
    return {
      title: "Product Not Found | Vape Mart UAE",
      description: "The requested vape product was not found in our catalog."
    };
  }

  return {
    title: `${product.title} - AED ${product.price.toFixed(2)} | Vape Mart UAE`,
    description: `${product.shortDescription} 100% authentic with same-day express delivery in Dubai and cash on delivery.`,
    openGraph: {
      title: `${product.title} | Vape Mart UAE`,
      description: product.shortDescription,
      images: [
        {
          url: product.primaryImage,
          width: 800,
          height: 800,
          alt: product.title
        }
      ]
    }
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = (await fetchProductBySlug(slug)) || (await fetchAllProducts())[0];

  if (!product) {
    notFound();
  }

  const related = await fetchRelatedProducts(product.slug);
  const reviews = await fetchProductReviews(product.id);
  const productWithReviews = { ...product, reviews };

  // JSON-LD Structured Data for Google Rich Snippets & #1 Ranking
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.primaryImage,
    description: product.shortDescription,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: product.brand
    },
    offers: {
      "@type": "Offer",
      url: `https://vapemart.ae/product/${product.slug}`,
      priceCurrency: "AED",
      price: product.price,
      itemCondition: "https://schema.org/NewCondition",
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Vape Mart UAE"
      }
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.revs
    }
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
        name: product.category,
        item: `https://vapemart.ae/collections/${product.categorySlug}`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.title,
        item: `https://vapemart.ae/product/${product.slug}`
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
      <ProductDetailView product={productWithReviews} relatedProducts={related} />
    </>
  );
}
