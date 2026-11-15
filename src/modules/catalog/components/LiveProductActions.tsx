"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/modules/cart/CartProvider";
import { formatPrice } from "@/shared/utils/formatters";
import { ShoppingBag, Check, AlertCircle, Truck, ShieldCheck, Zap } from "lucide-react";

interface VariantOption {
  name: string;
  value: string;
}

interface ProductVariant {
  id: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  availableForSale: boolean;
  quantityAvailable?: number;
  selectedOptions?: VariantOption[];
}

interface LiveProductActionsProps {
  productId: string;
  productTitle: string;
  productBrand: string;
  productImage: string;
  initialVariants: ProductVariant[];
  initialPrice: number;
}

export function LiveProductActions({
  productId,
  productTitle,
  productBrand,
  productImage,
  initialVariants,
  initialPrice,
}: LiveProductActionsProps) {
  const { addToCart } = useCart();
  const [variants] = useState<ProductVariant[]>(initialVariants);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    initialVariants[0]?.id || `${productId}-default`
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) || variants[0];
  const currentPrice = selectedVariant?.price || initialPrice;
  const isAvailable = selectedVariant ? selectedVariant.availableForSale : true;

  const handleAddToCart = () => {
    addToCart({
      id: selectedVariantId,
      productId,
      title: productTitle,
      brand: productBrand,
      price: currentPrice,
      quantity,
      variantLabel: selectedVariant?.title !== "Default Title" ? selectedVariant?.title : undefined,
      image: productImage,
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Variant Selector (if multi-variant) */}
      {variants.length > 1 && (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Select Option: <span className="text-foreground">{selectedVariant?.title}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVariantId(v.id)}
                className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
                  selectedVariantId === v.id
                    ? "border-primary bg-primary/10 text-primary shadow-sm shadow-primary/20"
                    : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:text-foreground"
                }`}
              >
                {v.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Live Stock Status Indicator */}
      <div className="flex items-center gap-2 text-xs">
        {isAvailable ? (
          <span className="flex items-center gap-1.5 font-medium text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            In Stock — 2-3 Hours Dubai Express Dispatch
          </span>
        ) : (
          <span className="flex items-center gap-1.5 font-medium text-red-400">
            <AlertCircle className="h-3.5 w-3.5" />
            Out of Stock
          </span>
        )}
      </div>

      {/* Price + Quantity + Add to Cart Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
        {/* Quantity Controls */}
        <div className="flex items-center justify-between sm:justify-start rounded-xl border border-white/10 bg-white/5 p-1">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-sm text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
          >
            -
          </button>
          <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-sm text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
          >
            +
          </button>
        </div>

        {/* Primary CTA */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!isAvailable}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-black shadow-lg shadow-primary/20 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAdded ? (
            <>
              <Check className="h-4 w-4" />
              Added to Cart!
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" />
              Add to Cart • {formatPrice(currentPrice * quantity)}
            </>
          )}
        </button>
      </div>

      {/* UAE Trust Value Badges */}
      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10 text-center">
        <div className="flex flex-col items-center gap-1 rounded-xl bg-white/[0.02] p-2.5">
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-semibold text-muted-foreground">Express Dispatch</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-xl bg-white/[0.02] p-2.5">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-semibold text-muted-foreground">100% Authentic</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-xl bg-white/[0.02] p-2.5">
          <Truck className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-semibold text-muted-foreground">Cash on Delivery</span>
        </div>
      </div>
    </div>
  );
}

export default LiveProductActions;

