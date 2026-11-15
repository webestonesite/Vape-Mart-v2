"use client";

import React, { memo } from "react";
import Link from "next/link";
import { SafeImage } from "@/shared/components/SafeImage";
import { formatPrice, formatDiscount } from "@/shared/utils/formatters";
import { useCart } from "@/modules/cart/CartProvider";
import { ShoppingBag } from "lucide-react";

interface ProductCardProps {
  product: {
    id: string;
    handle?: string;
    slug?: string;
    title: string;
    price: number;
    compareAtPrice?: number;
    originalPrice?: number;
    featuredImage?: { url: string; altText?: string } | null;
    primaryImage?: string;
    images?: string[] | Array<{ url: string }>;
    brand?: string;
    vendor?: string;
    availableForSale?: boolean;
    inStock?: boolean;
    badge?: string;
  };
}

export const ProductCard = memo(function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const slug = product.handle || product.slug || "";
  const imageUrl =
    product.featuredImage?.url ||
    product.primaryImage ||
    (Array.isArray(product.images) && product.images.length > 0
      ? typeof product.images[0] === "string"
        ? product.images[0]
        : product.images[0]?.url
      : "");

  const comparePrice = product.compareAtPrice || product.originalPrice || 0;
  const discountLabel = comparePrice > product.price ? formatDiscount(comparePrice, product.price) : null;
  const isAvailable = product.availableForSale !== undefined ? product.availableForSale : product.inStock !== false;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: `${product.id}-default`,
      productId: product.id,
      title: product.title,
      brand: product.brand || product.vendor || "Vape Mart",
      price: product.price,
      quantity: 1,
      image: imageUrl,
    });
  };

  return (
    <div className="group relative flex flex-col rounded-2xl border border-white/10 bg-black/40 p-3 backdrop-blur-md transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
      {/* Badges */}
      <div className="absolute left-3 top-3 z-10 flex flex-col gap-1">
        {discountLabel && (
          <span className="rounded-full bg-red-500/90 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-sm">
            {discountLabel}
          </span>
        )}
        {product.badge && (
          <span className="rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-bold text-black uppercase tracking-wider backdrop-blur-sm">
            {product.badge}
          </span>
        )}
      </div>

      {/* Product Image Link */}
      <Link href={`/product/${slug}`} className="relative aspect-square w-full overflow-hidden rounded-xl bg-white/5">
        <SafeImage
          src={imageUrl}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      {/* Info Section */}
      <div className="mt-3 flex flex-1 flex-col justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {product.brand || product.vendor || "Vape Mart"}
          </p>
          <Link href={`/product/${slug}`} className="line-clamp-2 mt-1 text-sm font-semibold text-foreground hover:text-primary transition-colors">
            {product.title}
          </Link>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-primary">{formatPrice(product.price)}</span>
            {comparePrice > product.price && (
              <span className="text-[11px] text-muted-foreground line-through">
                {formatPrice(comparePrice)}
              </span>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={!isAvailable}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-black transition-transform duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            title={isAvailable ? "Add to cart" : "Out of stock"}
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

export default ProductCard;

