"use client";

import React, { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ArrowLeftRight, Eye, ShoppingBag, ArrowRight, Star } from "lucide-react";
import type { ProductItem } from "@/types/product";

function formatAED(n: number): string {
  return `AED ${n.toFixed(2)}`;
}

function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  const full = Math.floor(rating);
  const frac = rating - full;
  return (
    <div className="flex items-center gap-0.5 text-amber-400" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={
            i < full
              ? "fill-amber-400 text-amber-400"
              : i === full && frac >= 0.5
              ? "fill-amber-400/50 text-amber-400"
              : "text-neutral-300"
          }
        />
      ))}
    </div>
  );
}

export interface ProductCardProps {
  product: ProductItem;
  index: number;
  isWished: boolean;
  inCompare: boolean;
  onToggleWishlist: (id: string) => void;
  onToggleCompare: (id: string) => void;
  onQuickView: (p: ProductItem) => void;
  onAddToCart: (p: ProductItem, el: HTMLElement) => void;
  onSaveRecent: (p: ProductItem) => void;
}

export const ProductCard = memo(function ProductCard({
  product: p,
  index: i,
  isWished,
  inCompare,
  onToggleWishlist,
  onToggleCompare,
  onQuickView,
  onAddToCart,
  onSaveRecent,
}: ProductCardProps) {
  const discount = p.originalPrice > p.price ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;

  return (
    <motion.article
      key={p.id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: (i % 6) * 0.05 }}
      className="group relative flex flex-col rounded-2xl bg-white border border-emerald-900/15 shadow-[0_4px_18px_-8px_rgba(6,78,59,0.18)] overflow-hidden hover:shadow-[0_20px_50px_-16px_rgba(6,78,59,0.35)] hover:border-amber-400/50 hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative aspect-square bg-gradient-to-br from-[#f8fafc] to-emerald-50/60 overflow-hidden">
        <Link
          href={`/product/${p.slug}`}
          aria-label={p.title}
          className="block w-full h-full"
          onClick={() => onSaveRecent(p)}
        >
          <Image
            src={p.primaryImage}
            alt={p.title}
            fill
            sizes="(max-width: 640px) 50vw, 33vw"
            priority={i < 4}
            className="object-contain p-1 sm:p-2 transition-transform duration-500 group-hover:scale-105"
          />
          {p.images[1] && (
            <Image
              src={p.images[1]}
              alt=""
              aria-hidden
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              loading="lazy"
              className="object-contain p-1 sm:p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
          )}
        </Link>
        <button
          onClick={() => onToggleWishlist(p.id)}
          aria-label="Add to wishlist"
          className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur border border-emerald-900/10 flex items-center justify-center shadow-sm hover:scale-110 transition-transform cursor-pointer"
        >
          <Heart size={16} className={isWished ? "fill-red-500 text-red-500" : "text-emerald-900"} />
        </button>
        <button
          onClick={() => onToggleCompare(p.id)}
          aria-label={inCompare ? "Remove from compare" : "Add to compare"}
          title="Compare"
          className={`absolute top-[52px] left-3 w-9 h-9 rounded-full backdrop-blur border flex items-center justify-center shadow-sm hover:scale-110 transition-all cursor-pointer ${
            inCompare ? "bg-amber-400 border-amber-400 text-emerald-950" : "bg-white/90 border-emerald-900/10 text-emerald-900"
          }`}
        >
          <ArrowLeftRight size={15} />
        </button>
        {discount > 0 && (
          <span className="absolute top-3 right-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 text-[11px] font-extrabold px-2.5 py-1 shadow">
            -{discount}%
          </span>
        )}
        {p.badge && (
          <span className="absolute bottom-3 left-3 rounded-full bg-emerald-900 text-amber-300 font-cinzel text-[9px] tracking-[0.16em] px-2.5 py-1">
            {p.badge}
          </span>
        )}
        {!p.inStock && (
          <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 mx-auto w-max rounded-full bg-neutral-900/85 text-white text-xs font-bold px-4 py-1.5">
            SOLD OUT
          </span>
        )}
        <button
          onClick={() => onQuickView(p)}
          className="absolute inset-x-3 bottom-3 h-11 rounded-xl bg-emerald-950/90 backdrop-blur text-white text-sm font-bold tracking-wide opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hidden sm:flex items-center justify-center gap-2 cursor-pointer"
        >
          <Eye size={16} /> QUICK VIEW
        </button>
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="font-cinzel text-[10px] tracking-[0.2em] text-emerald-700/80 font-bold truncate">
          {p.brand}
        </p>
        <Link href={`/product/${p.slug}`} onClick={() => onSaveRecent(p)}>
          <h3 className="mt-1 text-[13px] sm:text-sm font-semibold text-emerald-950 leading-snug line-clamp-2 hover:text-amber-600 transition-colors min-h-[2.6em]">
            {p.title}
          </h3>
        </Link>
        <div className="mt-1.5 flex items-center gap-1.5">
          <Stars rating={p.rating} size={13} />
          <span className="text-xs text-neutral-500">({p.revs})</span>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5 whitespace-nowrap overflow-hidden">
          <span className="text-base sm:text-lg font-extrabold text-emerald-900">{formatAED(p.price)}</span>
          {p.originalPrice > p.price && (
            <>
              <span className="text-xs sm:text-sm text-neutral-400 line-through">
                {formatAED(p.originalPrice)}
              </span>
              <span className="hidden sm:inline-block text-[11px] font-bold text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5">
                Save {formatAED(p.originalPrice - p.price)}
              </span>
            </>
          )}
        </div>
        <div className="mt-2.5 sm:mt-3 flex items-center gap-1.5">
          <button
            onClick={(e) => onAddToCart(p, e.currentTarget)}
            disabled={!p.inStock}
            className="flex-1 min-w-0 h-10 sm:h-11 rounded-xl bg-emerald-800 text-white text-[11px] sm:text-sm font-bold tracking-normal sm:tracking-wide hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap px-1.5 sm:px-3 cursor-pointer"
          >
            <ShoppingBag size={14} className="shrink-0 sm:w-4 sm:h-4" /> ADD TO CART
          </button>
          <Link
            href={`/product/${p.slug}`}
            aria-label={`View ${p.title}`}
            className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-xl border-2 border-amber-500/60 text-amber-600 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-colors"
          >
            <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
});

export default ProductCard;

