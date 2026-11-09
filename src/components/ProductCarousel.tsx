"use client";
/* Product carousel + card, split out of src/app/page.tsx so the homepage
   can load them as a separate chunk (next/dynamic). The hero paints first;
   the carousels stream in after. Props only — no page state. */
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Star, ArrowRight, ShoppingBag } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as const } 
  }
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { 
      staggerChildren: 0.08, 
      delayChildren: 0.04 
    } 
  }
};

export interface Product {
  title: string;
  price: string;
  revs: number;
  badge?: string;
  brand?: string;
  img: string;
}

function getProductHref(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("kief king")) return "/product/kief-king-35000-puffs-disposable-vape";
  if (t.includes("hypermax")) return "/product/al-fakher-hypermax-15k-puffs";
  if (t.includes("mega max")) return "/product/al-fakher-mega-max-40000-puffs-disposable-vape";
  if (t.includes("fakher") || t.includes("crown bar")) return "/product/al-fakher-hypermax-15k-puffs";
  if (t.includes("vozol") && t.includes("35000")) return "/product/vozol-star-35000-puffs-disposable-vape";
  if (t.includes("vozol")) return "/product/vozol-star-40000-puffs-disposable-vape";
  if (t.includes("waka") && t.includes("sopro")) return "/product/waka-sopro-20000-puffs-50mg-in-dubai-uae";
  if (t.includes("waka")) return "/product/waka-blade-50k-puffs-50mg-in-dubai-uae";
  if (t.includes("elfbar") || t.includes("elf bar")) return "/product/elfbar-bc10000-puffs-disposable-vape";
  if (t.includes("oxbar")) return "/product/oxbar-tri-fusion-45k-disposable-vape";
  if (t.includes("mazaya")) return "/product/mazaya-50k-cloud-aura";
  if (t.includes("nasty")) return "/product/nasty-juice-3mg-freebase-e-liquid-60ml";
  if (t.includes("vgod")) return "/product/vgod-25-50mg-salt";
  if (t.includes("starter kit") && t.includes("juul")) return "/product/juul-2-starter-kit";
  if (t.includes("slate")) return "/product/juul-slate-device";
  if (t.includes("juul")) return "/product/juul-2-pods";
  if (t.includes("uzbekistan")) return "/product/iqos-terea-uzbekistan";
  if (t.includes("terea") || t.includes("heets")) return "/product/terea-indonesia-sticks";
  if (t.includes("onyx")) return "/product/pod-salt-onyx-cloud-25000-puffs-disposable-vape";
  if (t.includes("pearl")) return "/product/pod-salt-pearl-pro-10000-puffs-disposable-vape";
  if (t.includes("pod salt go")) return "/product/pod-salt-go-2500-puffs-disposable-vape";
  if (t.includes("pod salt")) return "/product/pod-salt-pearl-pro-10000-puffs-disposable-vape";
  if (t.includes("lost mary")) return "/product/lost-mary-35000-puffs-disposable-vape";
  if (t.includes("geek bar")) return "/product/geek-bar-50000-puffs-disposable-vape";
  if (t.includes("hqd")) return "/product/hqd-cuvie-slick-6000-puff-disposable-vape";
  if (t.includes("tugboat")) return "/product/tugboat-t12000-puffs-disposable-vape";
  if (t.includes("yuoto")) return "/product/yuoto-xxl-2500-puffs-disposable-vape";
  return "/collections";
}

function ProductCard({ prod }: { prod: Product }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const href = getProductHref(prod.title);

  return (
    <motion.div
      variants={fadeInScale}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className="group bg-white rounded-2xl border border-neutral-200/80 p-3 sm:p-4 md:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_30px_rgba(6,78,59,0.12)] transition-all duration-300 flex flex-col justify-between relative overflow-hidden h-full"
    >
      {/* Top Bar: Wishlist & Badge */}
      <div className="flex items-center justify-between w-full mb-1 z-10">
        <button
          type="button"
          onClick={() => setIsWishlisted(!isWishlisted)}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-neutral-200/70 flex items-center justify-center transition-all cursor-pointer ${
            isWishlisted ? "bg-red-50 text-red-500 border-red-200" : "bg-neutral-50/80 text-neutral-400 hover:text-red-500 hover:bg-white"
          }`}
          aria-label="Wishlist"
        >
          <Heart size={14} className={isWishlisted ? "fill-red-500 text-red-500" : ""} strokeWidth={2} />
        </button>

        {prod.badge && (
          <span className="bg-red-600 text-white text-[8.5px] sm:text-[9.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
            {prod.badge}
          </span>
        )}
      </div>

      {/* Product Image Area - Clean White Presentation */}
      <Link href={href} className="relative w-full aspect-square max-h-[235px] md:max-h-[255px] mx-auto flex items-center justify-center p-2 my-0.5 sm:my-1 overflow-hidden block">
        <div className="relative w-full h-full transform group-hover:scale-108 transition-transform duration-500 ease-out">
          <Image
            src={prod.img}
            alt={prod.title}
            fill
            loading="lazy"
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-contain"
          />
        </div>
      </Link>

      {/* Brand Series Tag (Like Reference Image) */}
      <div className="w-full bg-neutral-900 text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider py-1 px-2 text-center rounded-sm my-0.5 sm:my-1 truncate">
        {prod.brand || prod.title.split(' ').slice(0, 3).join(' ')}
      </div>

      {/* Product Title */}
      <Link
        href={href}
        className="font-bold text-neutral-900 text-[12.5px] sm:text-[13.5px] md:text-[14px] leading-snug line-clamp-2 text-center my-0.5 sm:my-1 hover:text-[#064e3b] transition-colors min-h-[36px] sm:min-h-[38px] flex items-center justify-center no-underline"
      >
        {prod.title}
      </Link>

      {/* Star Rating */}
      <div className="flex items-center justify-center gap-0.5 my-0.5 sm:my-1 text-amber-400">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} size={11} fill="#fbbf24" color="#fbbf24" />
        ))}
        <span className="text-[10px] text-neutral-400 font-medium ml-1">({prod.revs})</span>
      </div>

      {/* Price */}
      <div className="text-center my-0.5 sm:my-1">
        <span className="text-[13.5px] sm:text-[15px] md:text-[16px] font-black text-neutral-900 tracking-tight">
          AED {prod.price}
        </span>
      </div>

      {/* Single Add to Cart Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="w-full py-2 sm:py-2.5 bg-[#064e3b] hover:bg-[#022c22] text-white text-[11px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer mt-1"
      >
        <ShoppingBag size={13} className="shrink-0" />
        <span>Add to cart</span>
      </motion.button>
    </motion.div>
  );
}


export default function ProductCarousel({
  title,
  subtitle,
  badgeText,
  products,
  greenBoxPC = true
}: {
  title: string;
  subtitle: string;
  badgeText: string;
  products: Product[];
  greenBoxPC?: boolean;
}) {
  const [showAll, setShowAll] = useState(false);
  const displayedProducts = showAll ? products : products.slice(0, 4);

  return (
    <motion.section
      className={`best-selling-section relative max-w-[1440px] w-full mx-auto px-3 sm:px-6 py-7 sm:py-10 transition-all duration-500 ${
        greenBoxPC
          ? "green-box-pc my-5 md:my-7 lg:my-9 md:bg-gradient-to-br md:from-[#064e3b] md:via-[#043e2e] md:to-[#022c22] md:rounded-[36px] md:p-10 lg:p-11 md:pb-12 lg:pb-14 md:shadow-[0_24px_60px_-15px_rgba(6,78,59,0.34)] md:border md:border-emerald-700/60 overflow-hidden"
          : ""
      }`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={staggerContainer}
    >
      {/* Background ambient glows only on PC when greenBoxPC is active */}
      {greenBoxPC && (
        <>
          <div className="hidden md:block absolute -top-24 -left-24 w-80 h-80 rounded-full bg-emerald-400/15 blur-[90px] pointer-events-none" />
          <div className="hidden md:block absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-amber-400/15 blur-[90px] pointer-events-none" />
        </>
      )}

      {/* Centered Section Header — always visible (no fade-in), so the title/subtitle never look missing on load */}
      <div className="section-header-bs mb-6 sm:mb-9 text-center relative z-10">
        <div className="top-picks flex items-center justify-center gap-2 mb-2">
          <span className={`line w-5 sm:w-6 h-[2px] rounded-full ${greenBoxPC ? "bg-[#064e3b] md:!bg-amber-400" : "bg-[#064e3b]"}`}></span>
          <span className={`text font-cinzel text-[11px] sm:text-xs font-bold tracking-[0.24em] uppercase ${greenBoxPC ? "text-[#064e3b] md:!text-amber-300" : "text-[#064e3b]"}`}>{badgeText}</span>
          <span className={`line w-5 sm:w-6 h-[2px] rounded-full ${greenBoxPC ? "bg-[#064e3b] md:!bg-amber-400" : "bg-[#064e3b]"}`}></span>
        </div>
        <h2 className={`font-luxury text-2xl sm:text-3xl md:text-4xl lg:text-[46px] font-extrabold tracking-tight ${greenBoxPC ? "text-neutral-900 md:!text-white md:drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]" : "text-neutral-900"}`}>{title}</h2>
        <div className="flex items-center justify-center gap-3 my-2 sm:my-3">
          <div className={`h-px w-12 sm:w-16 bg-gradient-to-r from-transparent ${greenBoxPC ? "to-[#064e3b] md:to-emerald-300" : "to-[#064e3b]"}`}></div>
          <div className={`w-2 h-2 rotate-45 ${greenBoxPC ? "bg-[#064e3b] md:!bg-amber-400" : "bg-[#064e3b]"}`}></div>
          <div className={`h-px w-12 sm:w-16 bg-gradient-to-l from-transparent ${greenBoxPC ? "to-[#064e3b] md:to-emerald-300" : "to-[#064e3b]"}`}></div>
        </div>
        <p className={`text-xs sm:text-sm max-w-xl mx-auto ${greenBoxPC ? "text-neutral-500 md:text-white! font-medium" : "text-neutral-500"}`}>{subtitle}</p>
      </div>

      {/* 2x2 on Mobile (2 ta 2 ta 4 ta), 4 across on Desktop */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5 md:gap-5.5 lg:gap-6 relative z-10"
        variants={staggerContainer}
      >
        {displayedProducts.map((prod, idx) => (
          <ProductCard key={idx} prod={prod} />
        ))}
      </motion.div>

      {/* View All / Show Less Button */}
      <motion.div className="mt-7 sm:mt-9 flex justify-center relative z-10" variants={fadeInUp}>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAll(!showAll)}
          className={`px-6 py-2.5 sm:px-8 sm:py-3 rounded-full text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer group ${
            greenBoxPC
              ? "bg-[#064e3b] text-white md:bg-white md:text-[#064e3b] md:hover:bg-amber-400 md:hover:text-neutral-950 md:shadow-[0_10px_25px_rgba(0,0,0,0.22)]"
              : "bg-[#064e3b] text-white shadow-emerald-900/15 hover:bg-[#022c22]"
          }`}
        >
          <span>{showAll ? "Show Less" : `View All (${products.length})`}</span>
          <ArrowRight size={15} className={`transition-transform duration-300 ${showAll ? "-rotate-90" : "group-hover:translate-x-1"}`} />
        </motion.button>
      </motion.div>
    </motion.section>
  );
}
