"use client";
/* eslint-disable react/no-unescaped-entities, @next/next/no-img-element */
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import { Search, Heart, User, ShoppingBag, ChevronLeft, ChevronRight, Phone, ArrowRight, Truck, Headset, RotateCcw, CreditCard, Star, ShoppingCart, Plus, ArrowUpRight, HelpCircle, ChevronDown, ShieldCheck, CheckCircle, Shield, Lock, Tag, Send, Calendar, Mail, MapPin, Flame, Zap, Droplets, Clock, Check, ArrowUp, Menu, X, Home as HomeIcon, Layers, Play, Pause } from "lucide-react";
import { SfButton, SfRating } from "@storefront-ui/react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import themePublished from "@/data/theme-published.json";
import { Header } from "@/components/Header";
import { SeoContent } from "@/components/SeoContent";

interface Product {
  title: string;
  price: string;
  revs: number;
  badge?: string;
  brand?: string;
  img: string;
}

interface ThemeSectionData {
  title: string;
  subtitle: string;
  badgeText: string;
  products: Product[];
}

interface SubMenuItem {
  title: string;
  href: string;
  badge?: string;
  desc?: string;
}

interface MegaMenuColumn {
  heading: string;
  items: SubMenuItem[];
}

interface MegaMenuBanner {
  title: string;
  subtitle?: string;
  image?: string;
  badge?: string;
  href?: string;
  buttonText?: string;
}

interface HeaderNavItem {
  label: string;
  href: string;
  badge?: string;
  hasDropdown?: boolean;
  columns?: MegaMenuColumn[];
  featuredBanner?: MegaMenuBanner;
}

interface ThemeHeaderConfig {
  topBar?: {
    enabled?: boolean;
    announcements: string[];
    phone: string;
    phoneHref?: string;
    links: { label: string; href: string }[];
  };
  logo?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
  search?: {
    placeholder: string;
  };
  navItems: HeaderNavItem[];
  actions?: {
    showWishlist?: boolean;
    showAccount?: boolean;
    showCart?: boolean;
  };
}

interface ThemeConfig {
  storeName?: string;
  header?: ThemeHeaderConfig;
  hero?: {
    title: string;
    subtitle: string;
    buttonText: string;
    image: string;
  };
  featured?: {
    title: string;
    products: unknown[];
  };
  footer?: {
    text: string;
  };
  tereaHeets?: ThemeSectionData;
  juulProducts?: ThemeSectionData;
}

const themeData = themePublished as unknown as ThemeConfig;

function AnimatedCounter({ end, duration = 2500, suffix = "" }: { end: number, duration?: number, suffix?: string }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const startAnimation = () => {
      setHasAnimated(true);
      const animate = (time: number) => {
        if (!startTime) startTime = time;
        const progress = Math.min((time - startTime) / duration, 1);
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        setCount(Math.floor(easeProgress * end));
        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animate);
        } else {
          setCount(end);
        }
      };
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleScroll = () => {
      const el = document.getElementById("animated-counters-trigger");
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight + 100) { // Trigger slightly before fully in view
          startAnimation();
          window.removeEventListener("scroll", handleScroll);
        }
      } else {
        startAnimation();
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [end, duration, hasAnimated]);

  return <>{count.toLocaleString()}{suffix}</>;
}

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

const slideInLeft = {
  hidden: { opacity: 0, x: -35 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } 
  }
};

const slideInRight = {
  hidden: { opacity: 0, x: 35 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } 
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

function ProductCarousel({
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

      {/* Centered Section Header */}
      <motion.div className="section-header-bs mb-6 sm:mb-9 text-center relative z-10" variants={fadeInUp}>
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
        <p className={`text-xs sm:text-sm max-w-xl mx-auto ${greenBoxPC ? "text-neutral-500 md:!text-emerald-100/90 font-medium" : "text-neutral-500"}`}>{subtitle}</p>
      </motion.div>

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

const bestSellingProducts: Product[] = [
  { title: "KIEF King 35000 Puffs Disposable Vape", price: "45.00", revs: 57, badge: "VAPOR UAE", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/KIEFKing35000PuffsDisposableVape.webp?v=1781160145" },
  { title: "Vozol Star 40000 Puffs Disposable Vape", price: "40.00", revs: 55, badge: "BEST SELLER", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Vozol_Star_40000_Puffs_Disposable_Vape_devices_3_different_flavor.webp?v=1785160523" },
  { title: "Waka Blade 50K Puffs 50mg in Dubai, UAE", price: "55.00", revs: 50, badge: "", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/WakaBlade50KPuffs50mginDubai_UAE.webp?v=1776947486" },
  { title: "ELFBAR BC10000 Puffs Disposable Vape 20mg Nicotine/50 mg nicotine", price: "35.00", revs: 54, badge: "7% OFF", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/ELFBAR_BC10000_Puffs_Disposable_Vape_20mg_Nicotine_with_peach_and_mango_slices.jpg?v=1780560836" },
  { title: "OXBAR Tri Fusion 45K Disposable Vape", price: "45.00", revs: 42, badge: "POPULAR", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/OXBARTriFusion45KDisposableVape.webp?v=1781421347" },
  { title: "VGOD SaltNic e-liquids 25 mg and 50 mg", price: "30.00", revs: 39, badge: "", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/IcedCherryLime.jpg?v=1753208462" },
  { title: "Mazaya 50K Cloud Aura", price: "49.00", revs: 48, badge: "TOP", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Mazaya50KCloudAura.webp?v=1781098994" },
  { title: "Nasty Juice 3MG Freebase E-Liquid 60ml", price: "30.00", revs: 62, badge: "", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Nasty_Juice_3mg_e-liquid_bottle_Blackcurrant_Bad_Blood_flavors_device_with_box.jpg?v=1783152654" }
];

const tereaHeetsProducts: Product[] = themeData.tereaHeets?.products ?? [
  { title: "IQOS Terea Amber Selection Indonesian in UAE", price: "100.00", revs: 84, badge: "BEST SELLER", brand: "TEREA INDO", img: "/images/terea_heets.jpg" },
  { title: "IQOS Terea Bronze Selection Indonesian Sticks", price: "100.00", revs: 67, badge: "POPULAR", brand: "TEREA INDO", img: "/images/terea_heets.jpg" },
  { title: "IQOS Terea Purple Wave Menthol Heated Sticks", price: "100.00", revs: 92, badge: "COOL", brand: "TEREA INDO", img: "/images/terea_heets.jpg" },
  { title: "IQOS Terea Sienna Balanced Warm Tobacco", price: "100.00", revs: 48, badge: "", brand: "TEREA ILUMA", img: "/images/terea_heets.jpg" },
  { title: "IQOS Terea Green Zing Crisp Herbal Menthol", price: "100.00", revs: 53, badge: "FRESH", brand: "TEREA ILUMA", img: "/images/terea_heets.jpg" },
  { title: "IQOS Heets Bronze Selection Arabic Version", price: "100.00", revs: 76, badge: "CLASSIC", brand: "HEETS DUO", img: "/images/terea_heets.jpg" },
  { title: "IQOS Heets Amber Selection Smooth Rich Flavor", price: "100.00", revs: 61, badge: "", brand: "HEETS DUO", img: "/images/terea_heets.jpg" },
  { title: "IQOS Heets Silver Selection Subtle Refined Tobacco", price: "100.00", revs: 39, badge: "", brand: "HEETS DUO", img: "/images/terea_heets.jpg" }
];

const juulProductsList: Product[] = themeData.juulProducts?.products ?? [
  { title: "JUUL 2 Starter Kit with Slate Grey Device & 2 Pods", price: "90.00", revs: 110, badge: "STARTER KIT", brand: "JUUL OFFICIAL", img: "/images/juul_product.jpg" },
  { title: "JUUL 2 Device with USB Magnetic Charging Dock", price: "80.00", revs: 88, badge: "DEVICE ONLY", brand: "JUUL OFFICIAL", img: "/images/juul_product.jpg" },
  { title: "JUUL 2 Virginia Tobacco Pods 18mg (Pack of 2)", price: "65.00", revs: 142, badge: "TOP RATED", brand: "JUUL2 PODS", img: "/images/juul_product.jpg" },
  { title: "JUUL 2 Crisp Menthol Pods 18mg Nicotine 2-Pack", price: "65.00", revs: 96, badge: "ICE", brand: "JUUL2 PODS", img: "/images/juul_product.jpg" },
  { title: "JUUL 2 Polar Menthol Pods 18mg Extra Fresh", price: "65.00", revs: 74, badge: "POPULAR", brand: "JUUL2 PODS", img: "/images/juul_product.jpg" },
  { title: "JUUL 2 Ruby Menthol Wild Berry Pods 2-Pack", price: "65.00", revs: 81, badge: "NEW", brand: "JUUL2 PODS", img: "/images/juul_product.jpg" },
  { title: "JUUL 2 Autumn Tobacco Rich Blend Pods 2-Pack", price: "65.00", revs: 58, badge: "", brand: "JUUL2 PODS", img: "/images/juul_product.jpg" },
  { title: "JUUL 2 Tropical Medley Pods 18mg (Pack of 2)", price: "65.00", revs: 43, badge: "NEW", brand: "JUUL2 PODS", img: "/images/juul_product.jpg" }
];


const newArrivalsProducts: Product[] = [
  { title: "Lost Mary 35000 Puffs Disposable Vape", price: "40.00", revs: 12, badge: "NEW", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/LostMary35KAll.jpg?v=1751907873" },
  { title: "Geek Bar 50000 Puffs Disposable Vape", price: "45.00", revs: 18, badge: "NEW", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/GeekBar50000PuffsDisposableVape.webp?v=1781109060" },
  { title: "HQD Cuvie Slick 6000 Puff Disposable Vape", price: "45.00", revs: 22, badge: "", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/HQD6kPuffsStrawberryBanana.jpg?v=1751791607" },
  { title: "Pod Salt Go 2500 Puffs Disposable Vape", price: "30.00", revs: 41, badge: "", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Pod_Salt_Go_2500_Puffs_Disposable_Vape_Banana_Ice.jpg?v=1783234943" },
  { title: "Tugboat T12000 Puffs Disposable Vape 50MG Rechargeable", price: "35.00", revs: 15, badge: "NEW", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Tugboat_T12000_Puffs_Disposable_Vape_50mg_salt_nicotine_Black_Ice_Flavor.jpg?v=1778391844" },
  { title: "Waka SoPro 20000 Puffs 50mg in Dubai, UAE", price: "50.00", revs: 29, badge: "NEW", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/WakaSoPro20000Puffs50mginDubai_UAE.webp?v=1776946302" },
  { title: "Pod Salt Onyx Cloud 25000 Puffs Disposable Vape", price: "40.00", revs: 31, badge: "NEW", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Pod_Salt_Onyx_Cloud_25000_Puffs_Disposable_Vape_Blue_Mist_Flavor.jpg?v=1781358608" },
  { title: "Pod Salt Pearl Pro 10000 Puffs Disposable Vape", price: "35.00", revs: 24, badge: "NEW", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Pod_Salt_Pearl_Pro_10000_Puffs_Disposable_Vape_device_Berry_Menthol_flavor.jpg?v=1781355904" }
];

const mostPopularProducts: Product[] = [
  { title: "Yuoto XXL 2500 Puffs Disposable Vape", price: "20.00", revs: 85, badge: "HOT", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/117e2871-5a8f-42ab-a108-21939a2e6bc8.jpg?v=1750872314" },
  { title: "IQOS TEREA Uzbekistan", price: "110.00", revs: 43, badge: "", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/IQOS_TEREA_Uzbekistan_Twilight_Pearl_flavor_pack.png?v=1784621433" },
  { title: "JUUL 2 Starter Kit", price: "90.00", revs: 112, badge: "HOT", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Juul_2_Starter_Kit_packaging_with_device_and_USB_cable.jpg?v=1786199894" },
  { title: "Nasty Juice 3MG Freebase E-Liquid 60ml", price: "30.00", revs: 67, badge: "", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Nasty_Juice_3mg_e-liquid_bottle_Blackcurrant_Bad_Blood_flavors_device_with_box.jpg?v=1783152654" },
  { title: "Vozol Star 35000 Puffs Disposable Vape", price: "45.00", revs: 76, badge: "TRENDING", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Vozol_Star_35000_Puffs_Disposable_Vape_Appricot_Watermelon_Ice_Flavor.jpg?v=1789477966" },
  { title: "AL Fakher Hypermax 15k Puffs", price: "50.00", revs: 91, badge: "HOT", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/ALFakherHypermax15kPuffs.webp?v=1781161964" },
  { title: "Al Fakher Mega Max 40000 Puffs Disposable Vape", price: "50.00", revs: 98, badge: "HOT", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/AlFakherMegaMax40000PuffsDisposableVape.webp?v=1781161097" },
  { title: "Geek Bar 50000 Puffs Disposable Vape", price: "45.00", revs: 88, badge: "POPULAR", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/GeekBar50000PuffsDisposableVape.webp?v=1781109060" }
];

interface MatchedFlavorProduct {
  title: string;
  price: string;
  rating: number;
  revs: number;
  img: string;
  badge?: string;
}

interface FlavorItem {
  id: string;
  title: string;
  category: string;
  tag: string;
  desc: string;
  productCount: number;
  img: string;
  accentColor: string;
  ringColor: string;
  sweetness: number;
  cooling: number;
  throatHit: number;
  topNote: string;
  heartNote: string;
  baseNote: string;
  ratio: string;
  family: "berries" | "menthol" | "tropical" | "dessert";
  matchedProducts: MatchedFlavorProduct[];
}

const flavorsData: FlavorItem[] = [
  {
    id: "strawberry",
    title: "Strawberry Garden",
    category: "LUSH ORCHARD & BERRIES",
    tag: "SIGNATURE BLEND",
    desc: "Sun-drenched California strawberries picked at peak ripeness, infused with delicate nectar sweetness and subtle velvet vapor.",
    productCount: 42,
    img: "/images/flavors/strawberry.jpg",
    accentColor: "#ef4444",
    ringColor: "ring-rose-500",
    sweetness: 5,
    cooling: 2,
    throatHit: 3,
    topNote: "Sun-ripened Sweet Strawberry",
    heartNote: "Rich Wild Berry Nectar",
    baseNote: "Velvet Cream & Mild Mist",
    ratio: "70 VG / 30 PG",
    family: "berries",
    matchedProducts: [
      { title: "VGOD SaltNic e-liquids 25 mg and 50 mg", price: "30.00", rating: 4.9, revs: 88, badge: "TOP SELLER", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/IcedCherryLime.jpg?v=1753208462" },
      { title: "Vozol Star 35000 Puffs Disposable Vape", price: "45.00", rating: 4.8, revs: 76, badge: "TRENDING", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Vozol_Star_35000_Puffs_Disposable_Vape_Appricot_Watermelon_Ice_Flavor.jpg?v=1789477966" }
    ]
  },
  {
    id: "watermelon",
    title: "Watermelon Glacial Ice",
    category: "LUSH ORCHARD & BERRIES",
    tag: "GLOBAL BEST SELLER",
    desc: "Crisp succulent red watermelon wedges layered with crushed arctic glacier menthol for an exhilarating refreshing throat hit.",
    productCount: 48,
    img: "/images/flavors/watermelon.jpg",
    accentColor: "#10b981",
    ringColor: "ring-emerald-500",
    sweetness: 4,
    cooling: 5,
    throatHit: 4,
    topNote: "Crisp Sweet Watermelon Rind",
    heartNote: "Succulent Red Melon Puree",
    baseNote: "Sub-Zero Alpine Glacier Freeze",
    ratio: "70 VG / 30 PG",
    family: "berries",
    matchedProducts: [
      { title: "Pod Salt Onyx Cloud 25000 Puffs Disposable Vape", price: "40.00", rating: 4.9, revs: 94, badge: "BEST SELLER", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Pod_Salt_Onyx_Cloud_25000_Puffs_Disposable_Vape_Blue_Mist_Flavor.jpg?v=1781358608" },
      { title: "Waka Blade 50K Puffs 50mg in Dubai, UAE", price: "55.00", rating: 5.0, revs: 112, badge: "HOT", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/WakaBlade50KPuffs50mginDubai_UAE.webp?v=1776947486" }
    ]
  },
  {
    id: "mint",
    title: "Cool Spearmint Frost",
    category: "ARCTIC FROST & MENTHOL",
    tag: "ARCTIC HIT",
    desc: "Fresh garden spearmint leaves crushed over pure crystalline menthol, delivering crisp palate-cleansing coolness on every draw.",
    productCount: 39,
    img: "/images/flavors/mint.jpg",
    accentColor: "#06b6d4",
    ringColor: "ring-cyan-500",
    sweetness: 2,
    cooling: 5,
    throatHit: 5,
    topNote: "Fresh Garden Spearmint Leaf",
    heartNote: "Double Distilled Peppermint Essence",
    baseNote: "Crystal Menthol Chill",
    ratio: "50 VG / 50 PG",
    family: "menthol",
    matchedProducts: [
      { title: "Nasty Juice 3MG Freebase E-Liquid 60ml", price: "30.00", rating: 4.9, revs: 83, badge: "ARCTIC", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Nasty_Juice_3mg_e-liquid_bottle_Blackcurrant_Bad_Blood_flavors_device_with_box.jpg?v=1783152654" },
      { title: "JUUL Slate Device", price: "80.00", rating: 4.9, revs: 112, badge: "RECOMMENDED", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/IMG_3894JUUL_Slate_device_and_packaging.jpg?v=1786259181" }
    ]
  },
  {
    id: "peach",
    title: "Juicy Georgia Peach",
    category: "LUSH ORCHARD & BERRIES",
    tag: "POPULAR PICK",
    desc: "Golden velvety Georgia peach nectar layered with delicate white blossom honey and a light soothing vapor exhale.",
    productCount: 34,
    img: "/images/flavors/peach.png",
    accentColor: "#f97316",
    ringColor: "ring-orange-500",
    sweetness: 4,
    cooling: 3,
    throatHit: 3,
    topNote: "Sun-warmed Golden Peach Skin",
    heartNote: "Velvety Peach Nectar & Pulp",
    baseNote: "Wild Blossom Floral Honey",
    ratio: "70 VG / 30 PG",
    family: "berries",
    matchedProducts: [
      { title: "Pod Salt Pearl Pro 10000 Puffs Disposable Vape", price: "35.00", rating: 4.8, revs: 64, badge: "NEW", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Pod_Salt_Pearl_Pro_10000_Puffs_Disposable_Vape_device_Berry_Menthol_flavor.jpg?v=1781355904" },
      { title: "Vozol Star 40000 Puffs Disposable Vape", price: "40.00", rating: 4.8, revs: 71, badge: "POPULAR", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Vozol_Star_40000_Puffs_Disposable_Vape_devices_3_different_flavor.webp?v=1785160523" }
    ]
  },
  {
    id: "grape",
    title: "Purple Concord Grape",
    category: "LUSH ORCHARD & BERRIES",
    tag: "TRENDING",
    desc: "Deep vineyard Concord grapes bursting with natural tart sweetness, candied skin zest, and sparkling chilled vapor.",
    productCount: 36,
    img: "/images/flavors/grape.png",
    accentColor: "#a855f7",
    ringColor: "ring-purple-500",
    sweetness: 4,
    cooling: 4,
    throatHit: 3,
    topNote: "Dark Concord Grape Skin Zest",
    heartNote: "Rich Purple Grape Jam Nectar",
    baseNote: "Effervescent Chilled Soda Finish",
    ratio: "70 VG / 30 PG",
    family: "berries",
    matchedProducts: [
      { title: "Pod Salt Go 2500 Puffs Disposable Vape", price: "30.00", rating: 4.9, revs: 91, badge: "CLASSIC", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Pod_Salt_Go_2500_Puffs_Disposable_Vape_Banana_Ice.jpg?v=1783234943" },
      { title: "AL Fakher Hypermax 15k Puffs", price: "50.00", rating: 4.9, revs: 85, badge: "HOT", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/ALFakherHypermax15kPuffs.webp?v=1781161964" }
    ]
  },
  {
    id: "blueberry",
    title: "Blueberry Mountain Mist",
    category: "ARCTIC FROST & MENTHOL",
    tag: "TOP RATED",
    desc: "Plump wild forest blueberries chilled with a touch of crushed mountain snow and tart citrus undertones.",
    productCount: 52,
    img: "/images/flavors/blueberry.png",
    accentColor: "#3b82f6",
    ringColor: "ring-blue-500",
    sweetness: 3,
    cooling: 4,
    throatHit: 3,
    topNote: "Fresh Wild Blueberries",
    heartNote: "Subtle Tart Blackberry Juice",
    baseNote: "Crisp Mountain Breeze Ice",
    ratio: "70 VG / 30 PG",
    family: "menthol",
    matchedProducts: [
      { title: "Yuoto XXL 2500 Puffs Disposable Vape", price: "20.00", rating: 4.9, revs: 79, badge: "TOP RATED", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/117e2871-5a8f-42ab-a108-21939a2e6bc8.jpg?v=1750872314" },
      { title: "Geek Bar 50000 Puffs Disposable Vape", price: "45.00", rating: 4.8, revs: 98, badge: "HOT", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/GeekBar50000PuffsDisposableVape.webp?v=1781109060" }
    ]
  },
  {
    id: "pineapple",
    title: "Golden Hawaiian Pineapple",
    category: "TROPICAL & CITRUS",
    tag: "ISLAND EXOTIC",
    desc: "Tangy sweet Maui golden pineapples dripping with sun-drenched island juice and cool coastal sea spray.",
    productCount: 29,
    img: "/images/flavors/pineapple.png",
    accentColor: "#eab308",
    ringColor: "ring-amber-500",
    sweetness: 4,
    cooling: 4,
    throatHit: 3,
    topNote: "Bright Tangy Pineapple Crown",
    heartNote: "Sun-Ripened Golden Island Core",
    baseNote: "Chilled Coconut Water Mist",
    ratio: "70 VG / 30 PG",
    family: "tropical",
    matchedProducts: [
      { title: "HQD Cuvie Slick 6000 Puff Disposable Vape", price: "45.00", rating: 4.9, revs: 58, badge: "EXOTIC", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/HQD6kPuffsStrawberryBanana.jpg?v=1751791607" },
      { title: "Mazaya 50K Cloud Aura", price: "49.00", rating: 4.7, revs: 63, badge: "POPULAR", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Mazaya50KCloudAura.webp?v=1781098994" }
    ]
  },
  {
    id: "lychee",
    title: "Exotic Asian Lychee",
    category: "TROPICAL & CITRUS",
    tag: "RARE ARTISAN",
    desc: "Fragrant translucent imperial lychee fruit with delicate natural rosewater perfume and a silky refreshing finish.",
    productCount: 26,
    img: "/images/flavors/lychee.png",
    accentColor: "#ec4899",
    ringColor: "ring-pink-500",
    sweetness: 4,
    cooling: 3,
    throatHit: 2,
    topNote: "Fresh Lychee Floral Bloom",
    heartNote: "Sweet Translucent Fruit Pulp",
    baseNote: "Delicate Rosewater & Light Frost",
    ratio: "50 VG / 50 PG",
    family: "tropical",
    matchedProducts: [
      { title: "Lost Mary 35000 Puffs Disposable Vape", price: "40.00", rating: 4.9, revs: 52, badge: "RARE GOURMET", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/LostMary35KAll.jpg?v=1751907873" },
      { title: "JUUL 2 Starter Kit", price: "90.00", rating: 4.9, revs: 112, badge: "POPULAR", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Juul_2_Starter_Kit_packaging_with_device_and_USB_cable.jpg?v=1786199894" }
    ]
  },
  {
    id: "mixed_berry",
    title: "Forest Berry Medley",
    category: "LUSH ORCHARD & BERRIES",
    tag: "ALL-DAY VAPE",
    desc: "Sophisticated fusion of dark tart blackberries, sweet wild raspberries, and deep red currants balanced with subtle frost.",
    productCount: 45,
    img: "/images/flavors/mixed_berry.png",
    accentColor: "#8b5cf6",
    ringColor: "ring-violet-500",
    sweetness: 4,
    cooling: 4,
    throatHit: 3,
    topNote: "Tangy Ripe Raspberries",
    heartNote: "Rich Forest Blackberries",
    baseNote: "Dark Blackcurrant Spark & Ice",
    ratio: "70 VG / 30 PG",
    family: "berries",
    matchedProducts: [
      { title: "Waka SoPro 20000 Puffs 50mg in Dubai, UAE", price: "50.00", rating: 4.9, revs: 92, badge: "FAVORITE", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/WakaSoPro20000Puffs50mginDubai_UAE.webp?v=1776946302" },
      { title: "Al Fakher Mega Max 40000 Puffs Disposable Vape", price: "50.00", rating: 4.8, revs: 84, badge: "HOT", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/AlFakherMegaMax40000PuffsDisposableVape.webp?v=1781161097" }
    ]
  },
  {
    id: "vanilla",
    title: "Madagascan Vanilla Custard",
    category: "ARTISAN CREAM & DESSERT",
    tag: "GOURMET LUXURY",
    desc: "Aged Madagascan vanilla bean pods steeped in warm rich golden egg custard, whipped velvet cream, and toasted caramel drizzle.",
    productCount: 28,
    img: "/images/flavors/vanilla.png",
    accentColor: "#d97706",
    ringColor: "ring-amber-600",
    sweetness: 5,
    cooling: 1,
    throatHit: 4,
    topNote: "Fragrant Madagascan Vanilla Bean",
    heartNote: "Golden Creamy Custard Pudding",
    baseNote: "Toasted Brown Sugar & Butter",
    ratio: "80 VG / 20 PG",
    family: "dessert",
    matchedProducts: [
      { title: "Tugboat T12000 Puffs Disposable Vape 50MG Rechargeable", price: "35.00", rating: 5.0, revs: 67, badge: "AWARD WINNER", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Tugboat_T12000_Puffs_Disposable_Vape_50mg_salt_nicotine_Black_Ice_Flavor.jpg?v=1778391844" },
      { title: "OXBAR Tri Fusion 45K Disposable Vape", price: "45.00", rating: 4.8, revs: 98, badge: "RESERVE", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/OXBARTriFusion45KDisposableVape.webp?v=1781421347" }
    ]
  },
  {
    id: "orange",
    title: "Valencia Sparkling Citrus",
    category: "TROPICAL & CITRUS",
    tag: "CITRUS BLISS",
    desc: "Sun-drenched Spanish Valencia oranges cold-pressed over effervescent mineral tonic and chilled shaved ice.",
    productCount: 31,
    img: "/images/flavors/orange.png",
    accentColor: "#ea580c",
    ringColor: "ring-orange-600",
    sweetness: 3,
    cooling: 3,
    throatHit: 3,
    topNote: "Zesty Orange Peel Oils",
    heartNote: "Sweet Valencia Orange Juice",
    baseNote: "Effervescent Chilled Tonic",
    ratio: "70 VG / 30 PG",
    family: "tropical",
    matchedProducts: [
      { title: "ELFBAR BC10000 Puffs Disposable Vape 20mg Nicotine/50 mg nicotine", price: "35.00", rating: 4.8, revs: 55, badge: "REFRESHING", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/ELFBAR_BC10000_Puffs_Disposable_Vape_20mg_Nicotine_with_peach_and_mango_slices.jpg?v=1780560836" },
      { title: "Vozol Star 35000 Puffs Disposable Vape", price: "45.00", rating: 4.7, revs: 49, badge: "POPULAR", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/Vozol_Star_35000_Puffs_Disposable_Vape_Appricot_Watermelon_Ice_Flavor.jpg?v=1789477966" }
    ]
  },
  {
    id: "cheesecake",
    title: "New York Caramel Cheesecake",
    category: "ARTISAN CREAM & DESSERT",
    tag: "CONFECTIONERY RESERVE",
    desc: "Dense velvety cream cheese whipped over buttery honey-graham biscuit crust with sea salt caramel ribbon.",
    productCount: 22,
    img: "/images/flavors/cheesecake.png",
    accentColor: "#b45309",
    ringColor: "ring-amber-700",
    sweetness: 5,
    cooling: 0,
    throatHit: 4,
    topNote: "Buttery Honey-Graham Crust",
    heartNote: "Rich Dense New York Cream Cheese",
    baseNote: "Warm Fleur de Sel Caramel",
    ratio: "80 VG / 20 PG",
    family: "dessert",
    matchedProducts: [
      { title: "VGOD SaltNic e-liquids 25 mg and 50 mg", price: "30.00", rating: 4.9, revs: 43, badge: "GOURMET", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/IcedCherryLime.jpg?v=1753208462" },
      { title: "JUUL Slate Device", price: "80.00", rating: 4.9, revs: 112, badge: "POPULAR", img: "https://cdn.shopify.com/s/files/1/0631/8607/5696/files/IMG_3894JUUL_Slate_device_and_packaging.jpg?v=1786259181" }
    ]
  }
];

interface BlogPost {
  id: number;
  handle: string;
  title: string;
  category: string;
  readTime: string;
  date: string;
  excerpt: string;
  image: string;
  badgeBg: string;
  author: string;
}

const blogPostsData: BlogPost[] = [
  {
    id: 1,
    handle: "disposable-vs-pod-system-which-is-right-for-you",
    title: "Disposable vs Pod System: Which Is Right for You?",
    category: "BUYING GUIDES",
    readTime: "6 min read",
    date: "October 12, 2026",
    excerpt: "Torn between a grab-and-go disposable and a refillable pod system? We break down cost, flavour, convenience and who each one suits best in the UAE.",
    image: "/images/blog_1.png",
    badgeBg: "bg-emerald-600 text-white",
    author: "Vape Mart Team"
  },
  {
    id: 2,
    handle: "best-disposable-vapes-uae-2026",
    title: "Best Disposable Vapes in UAE 2026: Top Picks and Buying Guide",
    category: "BUYING GUIDES",
    readTime: "8 min read",
    date: "October 18, 2026",
    excerpt: "We tested the best-selling disposables in the Emirates for flavour, puff count, battery life and value. Here are our top 5 picks for 2026, plus how to choose and how to spot fakes.",
    image: "/images/blog_2.png",
    badgeBg: "bg-amber-600 text-white",
    author: "Vape Mart Team"
  },
  {
    id: 3,
    handle: "how-to-spot-fake-vapes-in-uae",
    title: "How to Spot Fake Vapes in the UAE (5 Checks)",
    category: "SAFETY",
    readTime: "5 min read",
    date: "October 8, 2026",
    excerpt: "Counterfeit vapes are everywhere in the Emirates. Learn the five quick checks our team uses to verify every product before it reaches your hands.",
    image: "/images/blog_3.png",
    badgeBg: "bg-blue-600 text-white",
    author: "Vape Mart Team"
  },
  {
    id: 4,
    handle: "nicotine-strength-guide-uae-vapers",
    title: "Nicotine Strength Guide: 20mg vs 50mg Explained",
    category: "EDUCATION",
    readTime: "7 min read",
    date: "October 3, 2026",
    excerpt: "Confused by 2% vs 5%, 20mg vs 50mg? This plain-English guide explains nicotine salts, what each strength feels like, and how to pick yours.",
    image: "/images/hero_slide_1.jpg",
    badgeBg: "bg-purple-600 text-white",
    author: "Vape Mart Team"
  },
  {
    id: 5,
    handle: "uae-vape-laws-2026-what-you-need-to-know",
    title: "UAE Vape Laws in 2026: What Every Vaper Must Know",
    category: "REGULATIONS",
    readTime: "8 min read",
    date: "September 14, 2026",
    excerpt: "Age limits, where you can vape, import rules, and ESMA certification — the essential legal guide for vapers in the Emirates.",
    image: "/images/hero_slide_3.jpg",
    badgeBg: "bg-rose-600 text-white",
    author: "Vape Mart Team"
  }
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // ---- Site content from Shopify (edited in Shopify admin, no deploy) ----
  const [cms, setCms] = useState<any>(null);
  useEffect(() => {
    fetch("/api/site-content")
      .then((res) => res.json())
      .then((data) => setCms(data))
      .catch(() => {});
  }, []);
  const cmsSlides = ((cms?.heroSlides ?? []) as any[])
    .filter((s) => s.title)
    .map((s) => ({
      title: String(s.title).includes("\n")
        ? s.title
        : String(s.title).replace(" — ", "\n— "),
      desc: s.description || "",
      badge: s.badge || "",
      image: s.imageUrl || "/images/hero_slide_1.jpg",
    }));
  const cmsSection = (key: string) =>
    ((cms?.homeSections ?? []) as any[]).find((s) => s.key === key);
  const secProducts = (key: string, fallback: any[]) => {
    const s = cmsSection(key);
    return s && Array.isArray(s.products) && s.products.length ? s.products : fallback;
  };
  const secText = (key: string, field: string, fallback: string) => {
    const s = cmsSection(key);
    return (s && s[field]) || fallback;
  };
  const cmsShowcase = (key: string, fallback: any[]) => {
    const cards = ((cms?.showcaseCards ?? []) as any[]).filter((c) => c.sectionKey === key);
    return cards.length
      ? cards.map((c) => ({
          title: c.title,
          price: c.price || "0.00",
          revs: c.revs || 0,
          badge: c.badge || "",
          brand: c.brand || "",
          img: c.imageUrl || "",
        }))
      : fallback;
  };
  // Home page settings from the panel (shop metafields, namespace "home").
  const homeSettings: any = cms?.settings?.home || {};
  const homeBanners: any[] = Array.isArray(homeSettings.promoBanners ?? homeSettings.promo_banners) && (homeSettings.promoBanners ?? homeSettings.promo_banners).length ? (homeSettings.promoBanners ?? homeSettings.promo_banners) : [];
  const banner1 = homeBanners[0] || {};
  const banner2 = homeBanners[1] || {};
  const categoryTiles: { title: string; subtitle: string; num: string; img: string; color: string; tag: string }[] = Array.isArray(homeSettings.categoryTiles ?? homeSettings.category_tiles) && (homeSettings.categoryTiles ?? homeSettings.category_tiles).length
    ? (homeSettings.categoryTiles ?? homeSettings.category_tiles).map((t: any, i: number) => ({ title: t.title || "", subtitle: t.subtitle || "", num: String(i + 1).padStart(2, "0"), img: t.img || "/images/cat_disposables.png", color: t.color || "from-emerald-900/80 to-black/90", tag: t.tag || "" }))
    : [
        { title: "JUUL", subtitle: "PODS & DEVICES", num: "01", img: "/images/juul_product.jpg", color: "from-blue-900/80 to-black/90", tag: "POPULAR" },
        { title: "Disposables", subtitle: "NEW ARRIVALS", num: "02", img: "/images/cat_disposables.png", color: "from-emerald-900/80 to-black/90", tag: "TRENDING" },
        { title: "E-Liquids", subtitle: "TOP RATED", num: "03", img: "/images/vape_hero_sky.png", color: "from-amber-900/80 to-black/90", tag: "HOT" },
        { title: "TEREA", subtitle: "HEATED TOBACCO", num: "04", img: "/images/terea_heets.jpg", color: "from-purple-900/80 to-black/90", tag: "FEATURED" },
        { title: "IQOS", subtitle: "ILUMA DEVICES", num: "05", img: "/images/prod_pod.png", color: "from-teal-900/80 to-black/90", tag: "NEW" },
        { title: "Shop All", subtitle: "FULL COLLECTION", num: "06", img: "/images/cat_disposables.png", color: "from-rose-900/80 to-black/90", tag: "EXPLORE" },
      ];
  const HOME_FEATURE_ICONS: Record<string, any> = { Truck, Headset, RotateCcw, CreditCard, ShieldCheck, Zap, Clock, Star };
  const homeFeatures: { icon: any; title: string; desc: string }[] = Array.isArray(homeSettings.features) && homeSettings.features.length
    ? homeSettings.features.map((f: any) => ({ icon: HOME_FEATURE_ICONS[f.icon] || ShieldCheck, title: f.title || "", desc: f.desc || "" }))
    : [
        { icon: Truck, title: "Free Shipping", desc: "Terms & Conditions applied for free shipping and delivery" },
        { icon: Headset, title: "24x7 Support", desc: "Round-the-Clock Assistance, Anytime You Need It" },
        { icon: RotateCcw, title: "1 Week Return", desc: "Your Satisfaction is Our Priority: Return Any Product Within 1 week" },
        { icon: CreditCard, title: "Secure Payment", desc: "Seamless Shopping Backed by Safe and Secure Payment Options" },
      ];
  const homeTrust = homeSettings.trustStats ?? homeSettings.trust_stats ?? {};
  const homeVisible = (key: string) => (homeSettings.sectionVisibility ?? homeSettings.section_visibility)?.[key] !== false;
  // Home section order from the panel (home.section_order). Unknown or
  // missing ids fall back to the default order, so a partial list can
  // never drop a section. .main-layout is already flex-column, so the
  // order property reorders sections with no layout change.
  const HOME_SECTION_ORDER = ["hero", "banners", "categories", "features", "brand", "flavors", "faq", "trust", "blog"];
  const savedHomeOrder = Array.isArray(homeSettings.sectionOrder ?? homeSettings.section_order) ? (homeSettings.sectionOrder ?? homeSettings.section_order).filter((id: string) => HOME_SECTION_ORDER.includes(id)) : [];
  const orderedHomeSections = [...savedHomeOrder, ...HOME_SECTION_ORDER.filter((id) => !savedHomeOrder.includes(id))];
  const homeSecOrder = (id: string) => orderedHomeSections.indexOf(id) + 1;
  // Blog carousel: live Shopify blog posts when the API has them, local
  // fallback (the same real articles) while it loads or on failure.
  const shopifyBlogPosts: BlogPost[] = Array.isArray(cms?.blogPosts) ? cms.blogPosts : [];
  const blogPosts = shopifyBlogPosts.length ? shopifyBlogPosts : blogPostsData;

  const initialsOf = (name: string) =>
    name
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  const testimonialList: any[] = cms?.testimonials?.length
    ? cms.testimonials.map((t: any) => ({
        name: t.name,
        avatar: initialsOf(t.name || "V"),
        role: t.role || "Verified Buyer",
        title: t.title,
        review: t.review,
      }))
    : [
        {
          name: 'Dubai Customer',
          avatar: 'DC',
          role: 'Verified Buyer',
          title: 'Super fast delivery & 100% authentic',
          review: "Best vape store in Dubai! Delivery arrived within hours, and the scratch-off authenticity code checked out directly on the manufacturer's site."
        },
        {
          name: 'Abu Dhabi Customer',
          avatar: 'AC',
          role: 'Verified Buyer',
          title: 'Genuine products guaranteed',
          review: "I've bought knock-offs from random stores before, but Vape Mart only delivers original factory-sealed products. Truly unmatched service."
        },
        {
          name: 'Sharjah Customer',
          avatar: 'SC',
          role: 'Verified Buyer',
          title: 'Great flavor selection & support',
          review: "Their premium collection is always in stock with fresh batches. Smooth checkout, great customer care, and unbeatable prices."
        },
        {
          name: 'Ajman Customer',
          avatar: 'AJ',
          role: 'Verified Buyer',
          title: 'Always fresh stock & fast WhatsApp response',
          review: "Ordered TEREA and disposable kits multiple times. Delivery always on time and verified original seal. Customer service is 10/10."
        },
        {
          name: 'Fujairah Customer',
          avatar: 'FC',
          role: 'Verified Buyer',
          title: 'Best disposable vape deals in UAE',
          review: "Authentic devices with authentic QR codes. Super responsive team, discreet delivery, and prices are better than physical shops."
        },
        {
          name: 'Ras Al Khaimah Customer',
          avatar: 'RC',
          role: 'Verified Buyer',
          title: 'Flawless experience every single order',
          review: "Top quality pod devices and pods. Packaging is tamper-proof with cold ice packs. Recommended to all my friends!"
        }
      ];
  const faqList: { q: string; a: string }[] = cms?.faqs?.length
    ? cms.faqs.map((f: any) => ({ q: f.question, a: f.answer }))
    : [
        { q: "What products does Vape Mart offer?", a: "We offer a wide range of premium disposable vapes, JUUL and IQOS TEREA products, and e-liquids from top global brands." },
        { q: "Are your vape products authentic?", a: "Yes! All our products are 100% authentic and sourced directly from official manufacturers. We guarantee original brands." },
        { q: "Do you offer same-day delivery in Dubai?", a: "Absolutely. We provide fast same-day delivery across Dubai for all orders placed before our daily cutoff time." },
        { q: "What payment methods do you accept?", a: "We accept all major Credit/Debit cards, Apple Pay, and offer Cash on Delivery (COD) for your convenience." },
        { q: "Can I refill a disposable vape?", a: "No, disposable vapes are designed for single-use. Attempting to refill them can be dangerous and damage the device." }
      ];
  const fbProducts: any[] = secProducts("featuredBrand", [
    { title: "AL Fakher Hypermax 15k Puffs", price: "50.00", oldPrice: "", discount: "" },
    { title: "Al Fakher Mega Max 40000 Puffs Disposable Vape", price: "50.00", oldPrice: "", discount: "" },
    { title: "Waka Blade 50K Puffs 50mg in Dubai, UAE", price: "55.00", oldPrice: "", discount: "" },
    { title: "ELFBAR BC10000 Puffs Disposable Vape", price: "35.00", oldPrice: "", discount: "" },
    { title: "Waka SoPro 20000 Puffs 50mg in Dubai, UAE", price: "50.00", oldPrice: "", discount: "" },
    { title: "KIEF King 35000 Puffs Disposable Vape", price: "45.00", oldPrice: "", discount: "" },
  ]);

  const defaultSlides = [
    {
      title: "Buy Authentic Vape in Dubai\n— Fast Delivery, Best Prices",
      desc: "Shop premium disposable vapes, pod systems, and starter kits from top brands. Delivered anywhere in Dubai & UAE.",
      badge: "Exclusive Offer up to 10% OFF",
      image: "/images/hero_slide_1.jpg",
    },
    {
      title: "New Arrivals: Premium Pods\nCompact & Powerful",
      desc: "Upgrade your vaping experience with the latest pod systems. Long battery life and intense flavor production.",
      badge: "New Arrivals",
      image: "/images/hero_slide_2.jpg",
    },
    {
      title: "Best E-Liquids of 2026\nTaste the Difference",
      desc: "Explore our new collection of premium e-liquids featuring exotic fruit blends and classic tobacco flavors.",
      badge: "Top Rated",
      image: "/images/hero_slide_3.jpg",
    },
    {
      title: "Mega Sale on Starter Kits\nBegin Your Journey",
      desc: "Perfect for beginners. Get everything you need to start vaping at an unbeatable price today.",
      badge: "Flash Sale",
      image: "/images/hero_slide_4.jpg",
    }
  ];

  const slides = cmsSlides.length ? cmsSlides : defaultSlides;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Minimum swipe threshold 35px, horizontal motion must exceed vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 35) {
      if (deltaX < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const lenisRef = useRef<Lenis | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Option 2: Luxury 3D Arc Dial State
  const [activeArcIdx, setActiveArcIdx] = useState<number>(0);
  const [isArcAutoplay, setIsArcAutoplay] = useState<boolean>(true);
  const isArcHovered = useRef<boolean>(false);

  useEffect(() => {
    if (!isArcAutoplay) return;
    const timer = setInterval(() => {
      if (!isArcHovered.current) {
        setActiveArcIdx((prev) => (prev + 1) % flavorsData.length);
      }
    }, 1300);
    return () => clearInterval(timer);
  }, [isArcAutoplay]);

  const currentArcFlavor = flavorsData[activeArcIdx] || flavorsData[0];

  // 3D Curved Rotating Blog Carousel State
  const [activeBlogIdx, setActiveBlogIdx] = useState(0);
  const [isBlogAutoplay, setIsBlogAutoplay] = useState(false);
  const isBlogHovered = useRef(false);

  useEffect(() => {
    if (!isBlogAutoplay) return;
    const timer = setInterval(() => {
      if (!isBlogHovered.current) {
        setActiveBlogIdx((prev) => (prev + 1) % blogPosts.length);
      }
    }, 4500);
    return () => clearInterval(timer);
  }, [isBlogAutoplay]);

  const nextBlog = useCallback(() => {
    setActiveBlogIdx((prev) => (prev + 1) % blogPosts.length);
  }, []);

  const prevBlog = useCallback(() => {
    setActiveBlogIdx((prev) => (prev - 1 + blogPosts.length) % blogPosts.length);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setShowScrollTop(scrollY > 450);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Enable Lenis smooth scrolling ONLY on desktop pointer devices
    // Mobile/touch devices already have hardware-accelerated 60/120fps native touch momentum
    const isTouchOrMobile = typeof window !== 'undefined' && (window.innerWidth < 1024 || window.matchMedia('(pointer: coarse)').matches);
    if (isTouchOrMobile) {
      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 0,
    });
    lenisRef.current = lenis;

    let animId: number;
    function raf(time: number) {
      lenis.raf(time);
      animId = requestAnimationFrame(raf);
    }
    animId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("scroll", handleScroll);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollToTop = () => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { duration: 1.4 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <main className="main-layout">
      {/* Dynamic Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3.5px] bg-gradient-to-r from-emerald-400 via-amber-400 to-teal-400 origin-left z-[9999] shadow-[0_1px_12px_rgba(52,211,153,0.6)]"
        style={{ scaleX }}
      />

      {/* Global Unified Header Component */}
      <Header />

      {/* Hero Section */}
      <section
        className="relative w-full min-h-[580px] sm:min-h-[640px] md:h-[650px] lg:h-[700px] overflow-hidden bg-gradient-to-br from-[#064e3b] via-[#022c22] to-[#064e3b] select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ order: homeSecOrder("hero") }}
      >
          {/* Background Effects */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[70%] rounded-full bg-emerald-500/20 blur-[120px]"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[70%] rounded-full bg-teal-500/20 blur-[120px]"></div>

          {/* Sliders arrows */}
          <motion.button
            whileHover={{ scale: 1.15, x: -3 }}
            whileTap={{ scale: 0.9 }}
            className="hidden sm:flex absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 items-center justify-center text-white hover:bg-white hover:text-[#064e3b] transition-colors shadow-lg cursor-pointer"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <ChevronLeft size={22} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.15, x: 3 }}
            whileTap={{ scale: 0.9 }}
            className="hidden sm:flex absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 items-center justify-center text-white hover:bg-white hover:text-[#064e3b] transition-colors shadow-lg cursor-pointer"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <ChevronRight size={22} />
          </motion.button>

          {/* Swipe Track for Content and Image */}
          <div className="absolute inset-0 z-20">
            <div className="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]" style={{
              width: `${slides.length * 100}%`,
              transform: `translateX(-${(currentSlide * 100) / slides.length}%)`,
            }}>
              {slides.map((slide, idx) => (
                <div key={idx} className="w-full h-full flex items-center relative" style={{ width: `${100 / slides.length}%` }}>
                  <div className="max-w-[1400px] mx-auto px-4 sm:px-8 md:px-16 w-full flex flex-col md:flex-row items-center justify-between pb-12 md:pb-0">
                    {/* Content */}
                    <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left z-20 pt-4 md:pt-10">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-emerald-400/15 to-amber-500/15 border border-amber-400/30 mb-3 sm:mb-6 shadow-sm backdrop-blur-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                        <span className="font-cinzel text-amber-300 font-bold text-[10px] sm:text-[11px] tracking-[0.25em] uppercase">
                          {slide.badge}
                        </span>
                      </div>
                      <h1 className="font-luxury text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[68px] font-extrabold text-white leading-[1.12] mb-3 sm:mb-6 tracking-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
                        {slide.title.split('\n')[0]}
                        {slide.title.split('\n')[1] && (
                          <span className="block mt-1 sm:mt-2 font-luxury italic font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 drop-shadow-[0_2px_15px_rgba(245,158,11,0.3)]">
                            {slide.title.split('\n')[1]}
                          </span>
                        )}
                      </h1>
                      <p className="text-xs sm:text-sm md:text-base lg:text-lg text-emerald-50/85 leading-relaxed mb-6 sm:mb-10 max-w-sm sm:max-w-lg font-normal tracking-wide line-clamp-3 sm:line-clamp-none">
                        {slide.desc}
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative bg-white text-[#064e3b] px-7 py-3 sm:px-9 sm:py-4 rounded-full font-extrabold text-sm sm:text-base hover:bg-emerald-50 transition-all duration-300 shadow-[0_10px_30px_rgba(255,255,255,0.2)] hover:shadow-[0_15px_40px_rgba(52,211,153,0.35)] flex items-center gap-2.5 sm:gap-3 overflow-hidden cursor-pointer"
                      >
                        <span className="relative z-10">Explore Collection</span>
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#064e3b] text-white flex items-center justify-center relative z-10 group-hover:scale-110 group-hover:bg-[#022c22] transition-all">
                          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent pointer-events-none"></span>
                      </motion.button>
                    </div>

                    {/* Image Showcase */}
                    <div className="w-full md:w-1/2 h-[220px] sm:h-[320px] md:h-[460px] lg:h-[560px] relative z-10 flex items-center justify-center mt-4 md:mt-0 px-2 sm:px-4">
                      <div className="relative w-full max-w-[260px] sm:max-w-[360px] md:max-w-[480px] aspect-square rounded-[24px] sm:rounded-[36px] overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border-2 border-emerald-400/20 group/heroImg backdrop-blur-sm bg-black/20">
                        <Image
                          src={slide.image}
                          alt={slide.title}
                          fill
                          priority={idx === 0}
                          className="object-cover transform group-hover/heroImg:scale-105 transition-transform duration-700 ease-out"
                        />
                        {/* Elegant atmospheric edge vignette */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#022c22]/60 via-transparent to-transparent pointer-events-none"></div>
                        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[24px] sm:rounded-[36px] pointer-events-none"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom SVG Wave Bottom */}
          <div className="absolute bottom-[-1px] left-0 w-full z-30 text-white">
            <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="w-full h-10 sm:h-16 md:h-24 fill-current">
              <path d="M0,0 L0,80 C240,120 480,120 720,80 C960,40 1200,40 1440,80 L1440,120 L0,120 Z" />
            </svg>
          </div>

          {/* Slider Dots */}
          <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-40 flex gap-2 sm:gap-3">
            {slides.map((_, idx) => (
              <button
                key={idx}
                className={`h-2 rounded-full transition-all duration-500 ease-out ${currentSlide === idx ? "w-8 sm:w-10 bg-white" : "w-2 bg-white/40 hover:bg-white/80"}`}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              ></button>
            ))}
          </div>
        </section>

        {/* Ultra-Premium Promo Banners Section */}
        {homeVisible("banners") && (<motion.section
          className="max-w-[1400px] mx-auto px-4 sm:px-6 mt-8 sm:mt-12 md:mt-16 mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          style={{ order: homeSecOrder("banners") }}
        >
          <motion.div className="group relative min-h-[250px] sm:h-[300px] md:h-[320px] rounded-[24px] sm:rounded-[32px] overflow-hidden bg-gradient-to-br from-[#064e3b] to-emerald-900 shadow-[0_20px_40px_-15px_rgba(6,78,59,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(6,78,59,0.4)] transition-all duration-500 hover:-translate-y-1 border border-emerald-800" variants={slideInLeft}>
            <div className="absolute inset-0 bg-white opacity-5 mix-blend-overlay"></div>
            <div className="relative z-10 flex flex-col justify-center h-full p-6 sm:p-10 md:p-12 w-full sm:w-2/3 pr-20 sm:pr-0">
              <span className="font-cinzel text-emerald-400 font-extrabold text-xs sm:text-sm tracking-[0.25em] uppercase mb-1.5 sm:mb-2">{banner1.eyebrow || "Exclusive"}</span>
              <h2 className="font-luxury text-white text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight mb-2.5 sm:mb-4 drop-shadow-md">{banner1.title || "Vape Kits & Pod Systems"}</h2>
              <p className="text-emerald-100/80 text-xs sm:text-sm mb-5 sm:mb-8 line-clamp-2">{banner1.desc || "High-performance vape kits designed for smooth flavor and long battery life."}</p>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { if (banner1.buttonLink) window.location.href = banner1.buttonLink; }}
                className="bg-white text-[#064e3b] px-5 py-2.5 sm:px-6 sm:py-3 rounded-full font-bold text-xs sm:text-sm hover:bg-emerald-50 transition-all w-max shadow-lg flex items-center gap-2 pr-4 group-hover:pr-6 duration-300 cursor-pointer relative overflow-hidden group/btn"
              >
                <span className="relative z-10">{banner1.buttonText || "Shop Kits"}</span>
                <ArrowRight size={15} className="relative z-10 transition-transform duration-300 transform group-hover/btn:translate-x-1" />
                <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent pointer-events-none"></span>
              </motion.button>
            </div>
            <img src={banner1.image || "/images/cat_vape_kits.png"} alt={banner1.title || "Vape Kits"} className="absolute -right-4 -bottom-4 sm:-bottom-8 w-44 sm:w-56 md:w-64 h-auto object-contain transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-700 drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] opacity-50 sm:opacity-90 md:opacity-100" />
          </motion.div>

          <motion.div className="group relative min-h-[250px] sm:h-[300px] md:h-[320px] rounded-[24px] sm:rounded-[32px] overflow-hidden bg-gradient-to-br from-[#d97706] to-amber-700 shadow-[0_20px_40px_-15px_rgba(217,119,6,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(217,119,6,0.4)] transition-all duration-500 hover:-translate-y-1 border border-amber-600" variants={slideInRight}>
            <div className="absolute inset-0 bg-white opacity-5 mix-blend-overlay"></div>
            <div className="relative z-10 flex flex-col justify-center h-full p-6 sm:p-10 md:p-12 w-full sm:w-2/3 pr-20 sm:pr-0">
              <span className="font-cinzel text-amber-200 font-extrabold text-xs sm:text-sm tracking-[0.25em] uppercase mb-1.5 sm:mb-2">{banner2.eyebrow || "New Arrival"}</span>
              <h2 className="font-luxury text-white text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight mb-2.5 sm:mb-4 drop-shadow-md">{banner2.title || "Premium Vape Collection"}</h2>
              <p className="text-amber-100/80 text-xs sm:text-sm mb-5 sm:mb-8 line-clamp-2">{banner2.desc || "Discover top-tier vape devices crafted for performance and style."}</p>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { if (banner2.buttonLink) window.location.href = banner2.buttonLink; }}
                className="bg-white text-[#d97706] px-5 py-2.5 sm:px-6 sm:py-3 rounded-full font-bold text-xs sm:text-sm hover:bg-amber-50 transition-all w-max shadow-lg flex items-center gap-2 pr-4 group-hover:pr-6 duration-300 cursor-pointer relative overflow-hidden group/btn"
              >
                <span className="relative z-10">{banner2.buttonText || "Shop Premium"}</span>
                <ArrowRight size={15} className="relative z-10 transition-transform duration-300 transform group-hover/btn:translate-x-1" />
                <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent pointer-events-none"></span>
              </motion.button>
            </div>
            <img src={banner2.image || "/images/product-3.png"} alt={banner2.title || "Premium Vape"} className="absolute -right-4 bottom-0 w-44 sm:w-56 md:w-64 h-auto object-contain transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] opacity-50 sm:opacity-90 md:opacity-100" />
          </motion.div>
        </motion.section>)}

        {/* Ultra-Premium Categories Section */}
        {homeVisible("categories") && (<motion.section
          className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={staggerContainer}
          style={{ order: homeSecOrder("categories") }}
        >
          {/* Centered Category Header */}
          <motion.div className="flex flex-col items-center mb-10 sm:mb-16 text-center px-2" variants={fadeInUp}>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-[2px] bg-[#064e3b] rounded-full"></span>
              <span className="font-cinzel text-xs font-bold tracking-[0.25em] text-[#064e3b] uppercase">COLLECTION</span>
              <span className="w-6 h-[2px] bg-[#064e3b] rounded-full"></span>
            </div>
            <h2 className="font-luxury text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-900 mb-3 sm:mb-4 tracking-tight">Shop by Category</h2>
            <div className="flex items-center gap-4 mb-4 sm:mb-6">
              <div className="h-px w-12 sm:w-16 bg-gradient-to-r from-transparent to-[#064e3b]"></div>
              <div className="w-2 h-2 rotate-45 bg-[#064e3b]"></div>
              <div className="h-px w-12 sm:w-16 bg-gradient-to-l from-transparent to-[#064e3b]"></div>
            </div>
            <p className="text-neutral-500 max-w-2xl text-xs sm:text-[15px] leading-relaxed">
              Discover our carefully curated collection of premium vaping products designed for the ultimate experience.
            </p>
          </motion.div>

          {/* Categories Grid (2-Column on Mobile, 3 on Tablet, 6 on Desktop) */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5 px-1 sm:px-0"
            variants={staggerContainer}
          >
            {categoryTiles.map((cat, idx) => (
              <motion.div
                key={idx}
                variants={fadeInScale}
                whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.3 } }}
                className="group relative h-[210px] sm:h-[280px] md:h-[340px] rounded-2xl sm:rounded-3xl overflow-hidden bg-neutral-900 cursor-pointer shadow-[0_4px_15px_rgba(0,0,0,0.06)] hover:shadow-[0_15px_35px_rgba(6,78,59,0.25)] transition-all duration-500 border border-neutral-200/60 flex flex-col justify-between p-3 sm:p-5"
              >
                <div className="absolute inset-0 bg-neutral-900">
                  <Image src={cat.img} alt={cat.title} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw" className="object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out opacity-85 group-hover:opacity-95" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} via-black/40 to-black/20 transition-opacity duration-500`}></div>
                </div>

                <div className="relative z-10 flex justify-between items-start w-full">
                  <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-[8px] sm:text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full uppercase">{cat.tag}</span>
                  <span className="text-white/60 font-black text-lg sm:text-2xl">{cat.num}</span>
                </div>

                <div className="relative z-10 flex flex-col items-start transform transition-transform duration-300 group-hover:-translate-y-1">
                  <span className="font-cinzel text-amber-400 font-bold text-[8px] sm:text-[10px] tracking-[0.15em] mb-0.5 sm:mb-1 drop-shadow-md">{cat.subtitle}</span>
                  <h3 className="font-luxury text-white text-sm sm:text-lg md:text-xl font-bold mb-2 drop-shadow-md line-clamp-1">{cat.title}</h3>
                  <div className="bg-white/15 backdrop-blur-md border border-white/25 text-white px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full font-semibold text-[10px] sm:text-xs group-hover:bg-white group-hover:text-[#064e3b] transition-all flex items-center gap-1 shadow-sm">
                    <span>Shop</span>
                    <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
      </motion.section>)}

        {/* Ultra-Premium Features Section */}
        {homeVisible("features") && (<motion.section
          className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 sm:py-12 mb-8 sm:mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          style={{ order: homeSecOrder("features") }}
        >
          <div className="bg-gradient-to-r from-[#022c22] via-[#064e3b] to-[#022c22] rounded-[24px] sm:rounded-[40px] shadow-[0_20px_40px_rgba(6,78,59,0.2)] p-6 sm:p-10 relative overflow-hidden border border-emerald-900/50">
            {/* Background glowing effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none"></div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-white/10 relative z-10">
              {homeFeatures.map((feature, idx) => (
                <motion.div 
                  key={idx} 
                  className="flex flex-col items-center text-center px-4 pt-6 sm:pt-0 group cursor-pointer" 
                  variants={fadeInScale}
                  whileHover={{ y: -6, scale: 1.03 }}
                >
                  <div className="w-13 h-13 sm:w-16 sm:h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-amber-400 group-hover:border-amber-400 transition-all duration-500 shadow-[0_0_20px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_30px_rgba(251,191,36,0.3)] transform group-hover:-translate-y-2">
                    <feature.icon size={24} className="sm:hidden text-emerald-400 group-hover:text-[#064e3b] transition-colors duration-500" strokeWidth={1.5} />
                    <feature.icon size={28} className="hidden sm:block text-emerald-400 group-hover:text-[#064e3b] transition-colors duration-500" strokeWidth={1.5} />
                  </div>
                  <h4 className="text-[15px] sm:text-[17px] font-bold text-white mb-2 sm:mb-3 tracking-wide">{feature.title}</h4>
                  <p className="text-emerald-100/60 text-xs sm:text-[13px] leading-relaxed max-w-[250px]">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>)}

        {/* Product Carousels — order tied to the features section so they always sit right after it (same order value renders in DOM order) */}
        <div style={{ order: homeSecOrder("features") }}>
        {/* Best Selling Carousel */}
        <ProductCarousel
          title={secText("bestSelling", "title", "Best Selling")}
          subtitle={secText("bestSelling", "subtitle", "Our most loved products, chosen by you")}
          badgeText={secText("bestSelling", "badgeText", "TOP PICKS")}
          products={secProducts("bestSelling", bestSellingProducts)}
          greenBoxPC={true}
        />

        {/* TEREA & HEETS Carousel */}
        <ProductCarousel
          title={secText("tereaHeets", "title", themeData.tereaHeets?.title || "TEREA & HEETS")}
          subtitle={secText("tereaHeets", "subtitle", themeData.tereaHeets?.subtitle || "Authentic heated tobacco sticks for IQOS ILUMA & IQOS 3 Duo in UAE")}
          badgeText={secText("tereaHeets", "badgeText", themeData.tereaHeets?.badgeText || "HEATED TOBACCO")}
          products={secProducts("tereaHeets", cmsShowcase("tereaHeets", tereaHeetsProducts))}
          greenBoxPC={true}
        />

        {/* JUUL Products Carousel */}
        <ProductCarousel
          title={secText("juulProducts", "title", themeData.juulProducts?.title || "JUUL Pods & Devices")}
          subtitle={secText("juulProducts", "subtitle", themeData.juulProducts?.subtitle || "Original JUUL2 starter kits, replacement pods & accessories with rapid delivery")}
          badgeText={secText("juulProducts", "badgeText", themeData.juulProducts?.badgeText || "PREMIUM PODS")}
          products={secProducts("juulProducts", cmsShowcase("juulProducts", juulProductsList))}
          greenBoxPC={true}
        />

        {/* New Arrivals Carousel */}
        <ProductCarousel
          title={secText("featured", "title", "New Arrivals")}
          subtitle={secText("featured", "subtitle", "Explore our latest premium collection")}
          badgeText={secText("featured", "badgeText", "NEW ITEMS")}
          products={secProducts("featured", newArrivalsProducts)}
          greenBoxPC={true}
        />

        {/* Most Popular Carousel */}
        <ProductCarousel
          title={secText("mostPopular", "title", "Most Popular")}
          subtitle={secText("mostPopular", "subtitle", "The most trending products right now")}
          badgeText={secText("mostPopular", "badgeText", "TRENDING")}
          products={secProducts("mostPopular", mostPopularProducts)}
          greenBoxPC={true}
        />
        </div>

        {/* Featured Brand Section */}
        <motion.section
          className="featured-brand-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={staggerContainer}
          style={{ order: homeSecOrder("brand") }}
        >
          <div className="fb-container">
            <motion.div className="fb-left" variants={slideInLeft}>
              <div className="fb-badge font-cinzel tracking-[0.25em]">FEATURED</div>
              <div className="fb-logo-wrapper">
                <Image src="/vape-mart-text-logo.png" alt="Vape Mart Brand Logo" fill sizes="170px" className="object-contain p-2" priority />
              </div>
              <h3 className="font-luxury text-2xl sm:text-3xl font-bold text-[#064e3b] mb-6">{secText("featuredBrand", "title", "Your Vibe. Your Flavor.")}</h3>
              <motion.button
                whileHover={{ scale: 1.06, y: -2 }}
                whileTap={{ scale: 0.94 }}
                className="fb-explore-btn cursor-pointer relative overflow-hidden group/exp shadow-md hover:shadow-lg"
              >
                <span className="relative z-10 flex items-center gap-1.5 font-bold">
                  Explore <ArrowUpRight size={16} className="group-hover/exp:translate-x-0.5 group-hover/exp:-translate-y-0.5 transition-transform" />
                </span>
                <span className="absolute inset-0 -translate-x-full group-hover/exp:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></span>
              </motion.button>
            </motion.div>

            <div className="fb-right">
              <motion.div className="fb-grid" variants={staggerContainer}>
                {fbProducts.map((prod, idx) => (
                  <motion.div
                    className="fb-product-card"
                    key={idx}
                    variants={fadeInScale}
                    whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.25 } }}
                  >
                    <div className="fb-img-wrapper">
                      <div className="fb-podium"></div>
                      <Image src={(prod as any).img || "/images/cat_disposables.png"} alt={prod.title} fill style={{ objectFit: 'contain', padding: '5px', zIndex: 2 }} />
                    </div>
                    <div className="fb-info">
                      {prod.discount && <div className="fb-discount">{prod.discount}</div>}
                      <h4 className="fb-title">{prod.title}</h4>
                      <div className="fb-price">
                        <span className="current">AED {prod.price}</span>
                        {prod.oldPrice && <span className="old">AED {prod.oldPrice}</span>}
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.15, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      className="fb-add-btn cursor-pointer shadow-md hover:shadow-emerald-900/30"
                    >
                      <Plus size={16} />
                    </motion.button>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.section>
        {/* Option 2: Luxury 3D Arc Dial Section (Vibrant Light Luxury Edition) */}
        <motion.section
          id="flavors"
          className="relative max-w-[1380px] w-full mx-auto px-4 sm:px-6 my-16 md:my-24 select-none"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          style={{ order: homeSecOrder("flavors") }}
        >
          {/* Section Header with Site Royal Emerald & Amber Accents */}
          <div className="flex flex-col items-center text-center mb-6 sm:mb-10">
            <span className="font-cinzel text-xs font-black tracking-[0.25em] text-[#064e3b] bg-emerald-50 border border-emerald-200/80 px-4 py-1.5 rounded-full uppercase mb-3 shadow-2xs">
              TASTE THE EXTRAORDINARY • 12 ARTISAN BLENDS
            </span>
            <h2 className="font-luxury text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#064e3b] tracking-tight mb-2">
              Signature Flavours
            </h2>
            <p className="text-neutral-600 text-sm sm:text-base max-w-xl">
              Rotate the artisan dial to explore hand-crafted tasting notes, sensory sweetness, and cooling ice profiles.
            </p>
          </div>

          {/* Luxury Arch Horizon Stage - Warm Ivory & Emerald Satin Pedestal */}
          <div className="relative rounded-[36px] sm:rounded-[48px] bg-gradient-to-b from-[#f8fbf9] via-[#ffffff] to-[#f2f8f5] border-2 border-[#064e3b]/20 shadow-[0_24px_70px_-15px_rgba(6,78,59,0.14)] p-6 sm:p-10 md:p-12 overflow-hidden flex flex-col items-center">
            {/* Top Amber & Emerald Ambient Glow */}
            <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-emerald-500/10 via-amber-400/5 to-transparent pointer-events-none" />

            {/* Ambient Flavor Accent Glow */}
            <div
              className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[380px] rounded-full blur-[110px] pointer-events-none transition-all duration-700"
              style={{ background: currentArcFlavor.accentColor, opacity: 0.22 }}
            />

            {/* Navigation Controls */}
            <div className="w-full flex items-center justify-end z-20 mb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveArcIdx((prev) => (prev - 1 + flavorsData.length) % flavorsData.length)}
                  aria-label="Previous flavor"
                  className="w-9 h-9 rounded-full bg-white border border-[#064e3b]/30 text-[#064e3b] hover:bg-[#064e3b] hover:text-white flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <ChevronLeft size={17} />
                </button>
                <button
                  onClick={() => setIsArcAutoplay(!isArcAutoplay)}
                  aria-label={isArcAutoplay ? "Pause autoplay" : "Start autoplay"}
                  className="px-4 py-1.5 rounded-full bg-white border border-[#064e3b]/30 text-[#064e3b] text-xs font-black hover:bg-emerald-50 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  {isArcAutoplay ? <Pause size={12} className="text-[#064e3b]" /> : <Play size={12} className="text-[#064e3b]" />}
                  <span className="text-[11px] uppercase tracking-wider">{isArcAutoplay ? "Auto-Rotating" : "Paused"}</span>
                </button>
                <button
                  onClick={() => setActiveArcIdx((prev) => (prev + 1) % flavorsData.length)}
                  aria-label="Next flavor"
                  className="w-9 h-9 rounded-full bg-white border border-[#064e3b]/30 text-[#064e3b] hover:bg-[#064e3b] hover:text-white flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>

            {/* The 3D Curved Arc Display Stage */}
            <div 
              className="relative w-full max-w-[960px] h-[280px] sm:h-[320px] md:h-[350px] flex items-center justify-center my-4 overflow-visible"
              style={{ perspective: "1200px" }}
            >
              {/* SVG Horological Arc Track with Emerald & Gold Details */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 960 350">
                <defs>
                  <linearGradient id="arcEmeraldGold" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#064e3b" stopOpacity="0.1" />
                    <stop offset="25%" stopColor="#064e3b" stopOpacity="0.4" />
                    <stop offset="50%" stopColor="#d97706" stopOpacity="0.8" />
                    <stop offset="75%" stopColor="#064e3b" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#064e3b" stopOpacity="0.1" />
                  </linearGradient>
                </defs>

                {/* Primary Outer Solid Arc Track */}
                <path
                  d="M 60,270 Q 480,45 900,270"
                  fill="none"
                  stroke="#064e3b"
                  strokeWidth="2.5"
                  strokeOpacity="0.25"
                />

                {/* Inner Gold Precision Dotted Dial Track */}
                <path
                  d="M 100,275 Q 480,70 860,275"
                  fill="none"
                  stroke="url(#arcEmeraldGold)"
                  strokeWidth="2"
                  strokeDasharray="6 8"
                />

                {/* Dial Ticks & Anchor Pivot Dots */}
                <circle cx="480" cy="45" r="4" fill="#d97706" />
                <circle cx="340" cy="80" r="3.5" fill="#064e3b" opacity="0.6" />
                <circle cx="620" cy="80" r="3.5" fill="#064e3b" opacity="0.6" />
                <circle cx="200" cy="150" r="3" fill="#064e3b" opacity="0.4" />
                <circle cx="760" cy="150" r="3" fill="#064e3b" opacity="0.4" />
              </svg>

              {/* 3D Arc Dial Nodes - High Contrast & Continuous Marquee Flow */}
              {flavorsData.map((flv, idx) => {
                const total = flavorsData.length;
                let diff = (idx - activeArcIdx) % total;
                if (diff > total / 2) diff -= total;
                if (diff < -total / 2) diff += total;

                // Render visible items across full horizon (-3 to +3 for continuous marquee flow)
                if (Math.abs(diff) > 3) return null;

                const isCenter = diff === 0;
                const isAdjacent = Math.abs(diff) === 1;
                const isSecondary = Math.abs(diff) === 2;

                return (
                  <motion.div
                    key={flv.id}
                    onClick={() => setActiveArcIdx(idx)}
                    onMouseEnter={() => { isArcHovered.current = true; }}
                    onMouseLeave={() => { isArcHovered.current = false; }}
                    animate={{
                      x: diff * 155,
                      y: Math.pow(diff, 2) * 20,
                      z: -Math.abs(diff) * 50,
                      rotateY: -diff * 12,
                      scale: isCenter ? 1.35 : isAdjacent ? 1.05 : isSecondary ? 0.88 : 0.70,
                      opacity: isCenter ? 1 : isAdjacent ? 0.95 : isSecondary ? 0.70 : 0,
                    }}
                    transition={{ duration: 0.85, ease: [0.25, 0.1, 0.25, 1] }}
                    className={`absolute cursor-pointer transition-transform ${
                      isCenter ? "z-30" : "z-10 hover:opacity-100 hover:scale-110"
                    }`}
                  >
                    {/* Ring Bezel with Brand Color & Accent Outline */}
                    <div
                      className={`relative rounded-full p-2 bg-white transition-all duration-300 flex items-center justify-center ${
                        isCenter
                          ? "w-28 h-28 sm:w-36 sm:h-36 shadow-[0_20px_45px_rgba(6,78,59,0.28)] ring-4 ring-[#d97706] border-4 border-[#064e3b]"
                          : isAdjacent
                          ? "w-22 h-22 sm:w-26 sm:h-26 shadow-lg border-2 border-[#064e3b]/40 ring-2 ring-emerald-500/10"
                          : "w-18 h-18 sm:w-22 sm:h-22 shadow-md border-2 border-neutral-300"
                      }`}
                    >
                      <div className="relative w-full h-full rounded-full overflow-hidden shadow-inner">
                        <Image
                          src={flv.img}
                          alt={flv.title}
                          fill
                          sizes="(max-width: 640px) 110px, 150px"
                          className="object-cover"
                          priority={isCenter}
                        />
                      </div>

                      {/* Flavor Badge - Center Active with Brand Emerald & Gold Border */}
                      {isCenter ? (
                        <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#064e3b] border-2 border-amber-300/60 shadow-lg text-[11px] font-black tracking-wider uppercase whitespace-nowrap text-white flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span>{flv.title}</span>
                        </div>
                      ) : (
                        /* Flanking Visible Flavor Label Pill */
                        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-white/95 border border-[#064e3b]/30 shadow-xs text-[9px] sm:text-[10px] font-extrabold text-[#064e3b] whitespace-nowrap">
                          {flv.title.split(' ')[0]}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Center Details Showcase Card - Light Luxury Gold & Emerald Finish */}
            <AnimatePresence mode="popLayout">
              <motion.div
                key={currentArcFlavor.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="relative z-20 w-full max-w-2xl bg-white/98 rounded-3xl border-2 border-[#064e3b]/20 shadow-[0_20px_50px_-10px_rgba(6,78,59,0.12)] p-6 sm:p-8 flex flex-col items-center text-center mt-3 overflow-hidden"
              >
                {/* Gold-Emerald Luxury Top Bevel Strip */}
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#064e3b] via-[#d97706] to-[#064e3b]" />

                {/* Tag & Category */}
                <div className="flex items-center gap-2 mb-2 pt-1">
                  <span
                    className="px-3.5 py-1 rounded-full text-[10px] sm:text-[11px] font-black tracking-wider uppercase text-white shadow-xs"
                    style={{ backgroundColor: currentArcFlavor.accentColor }}
                  >
                    {currentArcFlavor.tag}
                  </span>
                  <span className="font-cinzel text-xs font-bold text-[#064e3b] uppercase tracking-widest">
                    {currentArcFlavor.category}
                  </span>
                </div>

                {/* Flavor Name in Site Primary Emerald */}
                <h3 className="font-luxury text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#064e3b] tracking-tight leading-tight mb-2">
                  {currentArcFlavor.title}
                </h3>

                {/* 1-Line Tasting Description */}
                <p className="text-neutral-700 text-xs sm:text-sm max-w-lg leading-relaxed mb-4 font-medium">
                  {currentArcFlavor.desc}
                </p>

                {/* 3-Point Aroma Notes Strip with Emerald Accent */}
                <div className="w-full grid grid-cols-3 gap-2 py-2.5 px-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-[11px] mb-4">
                  <div>
                    <span className="text-[9px] font-black tracking-wider uppercase text-[#064e3b] block mb-0.5">TOP NOTE</span>
                    <span className="font-extrabold text-neutral-900 line-clamp-1">{currentArcFlavor.topNote}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black tracking-wider uppercase text-[#064e3b] block mb-0.5">HEART NOTE</span>
                    <span className="font-extrabold text-neutral-900 line-clamp-1">{currentArcFlavor.heartNote}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black tracking-wider uppercase text-[#064e3b] block mb-0.5">BASE FINISH</span>
                    <span className="font-extrabold text-neutral-900 line-clamp-1">{currentArcFlavor.baseNote}</span>
                  </div>
                </div>

                {/* Sensory Balance & Action Button */}
                <div className="flex items-center justify-between w-full flex-wrap gap-3 pt-1">
                  <div className="flex items-center gap-3.5 text-xs font-bold text-neutral-700">
                    <span className="flex items-center gap-1.5">
                      Sweet: <span className="text-amber-600 font-black">{currentArcFlavor.sweetness}/5</span>
                    </span>
                    <span className="w-1 h-1 rounded-full bg-neutral-300" />
                    <span className="flex items-center gap-1.5">
                      Ice: <span className="text-cyan-700 font-black">{currentArcFlavor.cooling}/5</span>
                    </span>
                    <span className="w-1 h-1 rounded-full bg-neutral-300" />
                    <span className="text-[#064e3b] font-black">
                      {currentArcFlavor.productCount}+ Blends
                    </span>
                  </div>

                  <motion.a
                    href="#shop"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="px-7 py-3 rounded-full bg-gradient-to-r from-[#064e3b] to-[#043729] hover:from-[#043729] hover:to-[#064e3b] text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-emerald-950/20 border border-amber-400/40 flex items-center gap-2 cursor-pointer no-underline transition-all"
                  >
                    <span>Shop {currentArcFlavor.title}</span>
                    <ArrowRight size={14} className="text-amber-300" />
                  </motion.a>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.section>

        {/* Ultra-Premium FAQ Section */}
        <motion.section
          className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={staggerContainer}
          style={{ order: homeSecOrder("faq") }}
        >
          <motion.div className="flex flex-col items-center mb-10 sm:mb-16 text-center px-2" variants={fadeInUp}>
            <span className="font-cinzel inline-block px-4 py-1.5 rounded-full bg-[#064e3b]/10 text-[#064e3b] font-bold text-xs tracking-[0.25em] uppercase mb-3 sm:mb-4">GOT QUESTIONS?</span>
            <h2 className="font-luxury text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-900 mb-3 sm:mb-6 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-neutral-500 max-w-2xl text-sm sm:text-[17px]">Everything you need to know about our products and services.</p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8 sm:gap-12 lg:gap-20">
            <motion.div
              variants={slideInLeft}
              className="w-full lg:w-1/3 flex flex-col items-start bg-gradient-to-br from-neutral-50 to-neutral-100 p-6 sm:p-10 rounded-[24px] sm:rounded-[32px] border border-neutral-200/60 shadow-sm h-max"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#064e3b] flex items-center justify-center mb-6 sm:mb-8 shadow-lg shadow-emerald-900/20">
                <HelpCircle size={26} color="#fff" />
              </div>
              <h3 className="font-luxury text-xl sm:text-2xl font-bold text-neutral-900 mb-3 sm:mb-4">Still have questions?</h3>
              <p className="text-neutral-500 text-sm mb-6 sm:mb-8 leading-relaxed">Can&apos;t find the answer you&apos;re looking for? Our support team is happy to help you with any inquiries.</p>
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                className="w-full py-3.5 sm:py-4 rounded-full bg-[#064e3b] text-white font-bold text-sm sm:text-base hover:bg-[#022c22] hover:shadow-lg transition-all flex items-center justify-center gap-2 border border-transparent cursor-pointer shadow-md shadow-emerald-900/10 relative overflow-hidden group/faq"
              >
                <span className="relative z-10">Contact Support</span>
                <ArrowRight size={16} className="relative z-10 group-hover/faq:translate-x-1.5 transition-transform" />
                <span className="absolute inset-0 -translate-x-full group-hover/faq:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></span>
              </motion.button>
            </motion.div>

            <motion.div className="w-full lg:w-2/3 flex flex-col gap-3 sm:gap-4" variants={staggerContainer}>
              {faqList.map((faq, idx) => (
                <motion.div
                  variants={fadeInUp}
                  className={`border border-neutral-200/80 rounded-2xl overflow-hidden transition-all duration-300 ${openFaq === idx ? "bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)] border-transparent" : "bg-transparent hover:bg-neutral-50 cursor-pointer"}`}
                  key={idx}
                  onClick={() => toggleFaq(idx)}
                >
                  <div className="px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-3 sm:gap-4 cursor-pointer">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1">
                      <span className={`font-black text-lg sm:text-xl transition-colors duration-300 ${openFaq === idx ? "text-[#064e3b]" : "text-neutral-300"}`}>0{idx + 1}</span>
                      <h4 className={`font-semibold text-sm sm:text-base md:text-lg transition-colors duration-300 ${openFaq === idx ? "text-[#064e3b]" : "text-neutral-700"}`}>{faq.q}</h4>
                    </div>
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${openFaq === idx ? "bg-[#064e3b] text-white" : "bg-neutral-100 text-neutral-400"} shrink-0`}>
                      <ChevronDown size={16} className={`transition-transform duration-300 ${openFaq === idx ? "rotate-180" : ""}`} />
                    </div>
                  </div>
                  <div
                    className={`px-4 sm:px-6 pl-10 sm:pl-16 text-neutral-500 text-xs sm:text-sm leading-relaxed overflow-hidden transition-all duration-500 ease-in-out`}
                    style={{ maxHeight: openFaq === idx ? "500px" : "0", opacity: openFaq === idx ? 1 : 0, paddingBottom: openFaq === idx ? "1.25rem" : "0" }}
                  >
                    {faq.a}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

      {/* Ultra-Premium Trust & Reviews Hub Section */}
      {homeVisible("trust") && (<motion.section
        className="relative overflow-hidden bg-[#064e3b] text-white py-12 sm:py-16 md:py-20 mb-0 border-t border-emerald-900"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={staggerContainer}
        style={{ order: homeSecOrder("trust") }}
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[130px] opacity-20 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-600 rounded-full blur-[130px] opacity-20 translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center">
          {/* Header */}
          <motion.div className="flex flex-col items-center text-center max-w-2xl mb-8 sm:mb-10 px-2" variants={fadeInUp}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/25 mb-3 sm:mb-4 shadow-sm backdrop-blur-md">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span className="font-cinzel text-[10px] sm:text-[11px] font-black tracking-[0.25em] text-emerald-300 uppercase">100% Authorized & Certified</span>
            </div>
            <h2 className="font-luxury text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-2.5 sm:mb-3 tracking-tight text-white drop-shadow-sm">
              Official Authorized Premium Retailer
            </h2>
            <p className="text-emerald-100/80 text-xs sm:text-sm md:text-base leading-relaxed">
              Directly partnered with global leaders to ensure 100% genuine hardware, verifiable security codes, and tamper-proof packaging.
            </p>
          </motion.div>

          {/* Social Proof Stats Header */}
          <motion.div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10" variants={fadeInUp}>
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <div className="flex -space-x-2.5">
                {['JD', 'SM', 'AK', 'MR'].map((initials, idx) => (
                  <div key={idx} className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-700 border-2 border-[#064e3b] flex items-center justify-center text-xs font-bold text-white shadow-sm">
                    {initials}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-white font-bold text-base">
                  Trusted by <span className="text-emerald-400 font-extrabold"><AnimatedCounter end={homeTrust.customers || 160000} suffix="+" /></span> Customers
                </p>
                <p className="text-emerald-200/70 text-xs">Verified UAE & GCC buyers</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-black/25 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/10 shadow-sm">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={15} fill="#fbbf24" color="#fbbf24" />)}
              </div>
              <span className="text-white font-black text-base">4.9 / 5</span>
              <span className="text-emerald-200/70 text-xs">({homeTrust.reviews ? homeTrust.reviews.toLocaleString() : "1,200"}+ reviews)</span>
            </div>
          </motion.div>

          {/* Continuous Infinite Marquee Reviews Carousel */}
          <div className="w-full overflow-hidden relative mb-8 [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)] py-2">
            <div className="reviews-marquee-track">
              {[...testimonialList, ...testimonialList].map((rev, i) => (
                <div
                  key={i}
                  className="w-[300px] sm:w-[360px] md:w-[390px] shrink-0 bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur-xl border border-white/10 hover:border-emerald-400/40 rounded-2xl p-5 sm:p-6 transition-all duration-300 shadow-lg flex flex-col justify-between select-none"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-bold text-sm text-white shadow-inner border border-white/20">
                          {rev.avatar}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{rev.name}</h4>
                          <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider">
                            <CheckCircle size={11} /> {rev.role}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(starIdx => (
                          <Star key={starIdx} size={12} fill="#fbbf24" color="#fbbf24" />
                        ))}
                      </div>
                    </div>
                    <h5 className="font-semibold text-white/95 text-sm mb-1.5">{rev.title}</h5>
                    <p className="text-emerald-100/75 text-xs leading-relaxed italic">
                      &quot;{rev.review}&quot;
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compact Trust Badges Strip */}
          <motion.div
            variants={fadeInUp}
            className="w-full flex flex-wrap justify-around items-center gap-4 py-4 px-6 bg-black/25 backdrop-blur-md rounded-2xl border border-white/10 text-emerald-100/90 text-xs md:text-sm font-semibold shadow-inner"
          >
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-emerald-400" />
              <span>100% Secure Checkout</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck size={18} className="text-emerald-400" />
              <span>Fast UAE Express Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw size={18} className="text-emerald-400" />
              <span>30-Day Money Back</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-400" />
              <span>Original Brands Guaranteed</span>
            </div>
          </motion.div>
        </div>
      </motion.section>)}

      {/* Blog Section - 3D Curved Rotating Cover-Flow Carousel */}
      <motion.section
        className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-14 sm:pb-20 relative overflow-hidden scroll-mt-28"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={staggerContainer}
        style={{ order: homeSecOrder("blog") }}
      >
        {/* Soft Ambient Glows */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Section Header */}
        <motion.div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4 sm:gap-6" variants={fadeInUp}>
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 mb-3 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span className="font-cinzel text-[11px] font-black tracking-[0.25em] text-[#064e3b] uppercase">Blog & Guides • 3D Showcase</span>
            </div>
            <h2 className="font-luxury text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-neutral-900 tracking-tight">
              Vape Culture <span className="font-luxury text-[#064e3b]">&</span> Insights
            </h2>
            <p className="text-neutral-500 text-xs sm:text-sm md:text-base mt-2 max-w-xl">
              Immerse yourself in expert masterclasses, flavor science, and the latest vaping trends across UAE.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-end shrink-0">
            {/* Autoplay Pause/Play button */}
            <button
              onClick={() => setIsBlogAutoplay((prev) => !prev)}
              aria-label={isBlogAutoplay ? "Pause carousel rotation" : "Resume carousel rotation"}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-bold transition-all shadow-xs cursor-pointer ${
                isBlogAutoplay
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                  : "bg-white border-neutral-200 text-neutral-700 hover:bg-emerald-50 hover:border-emerald-200"
              }`}
            >
              {isBlogAutoplay ? <Pause size={14} className="text-emerald-700" /> : <Play size={14} className="text-emerald-700" />}
              <span className="text-[11px] uppercase tracking-wider">{isBlogAutoplay ? "Auto-Rotating" : "Paused"}</span>
            </button>

            <motion.a
              href="#"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#064e3b] text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-900/15 hover:bg-[#022c22] transition-colors cursor-pointer group"
            >
              <span>View All Articles</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </motion.a>
          </div>
        </motion.div>

        {/* 3D Curved Carousel Stage */}
        <div
          className="relative w-full h-[520px] sm:h-[560px] md:h-[580px] flex items-center justify-center [perspective:1400px] select-none my-2"
          onMouseEnter={() => { isBlogHovered.current = true; }}
          onMouseLeave={() => { isBlogHovered.current = false; }}
        >
          {/* Navigation Arrow: Previous */}
          <button
            onClick={prevBlog}
            aria-label="Previous article"
            className="absolute left-2 sm:left-6 md:left-10 z-40 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/95 backdrop-blur-md border border-neutral-200 shadow-xl flex items-center justify-center text-neutral-800 hover:text-emerald-700 hover:scale-110 hover:border-emerald-300 transition-all cursor-pointer group"
          >
            <ChevronLeft size={22} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>

          {/* Navigation Arrow: Next */}
          <button
            onClick={nextBlog}
            aria-label="Next article"
            className="absolute right-2 sm:right-6 md:right-10 z-40 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/95 backdrop-blur-md border border-neutral-200 shadow-xl flex items-center justify-center text-neutral-800 hover:text-emerald-700 hover:scale-110 hover:border-emerald-300 transition-all cursor-pointer group"
          >
            <ChevronRight size={22} className="group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* 3D Stack of Cards */}
          <div className="relative w-full h-full flex items-center justify-center [transform-style:preserve-3d]">
            {blogPosts.map((post, idx) => {
              // Calculate relative distance with wrapping
              let diff = (idx - activeBlogIdx) % blogPosts.length;
              if (diff < -Math.floor(blogPosts.length / 2)) {
                diff += blogPosts.length;
              } else if (diff > Math.floor(blogPosts.length / 2)) {
                diff -= blogPosts.length;
              }

              const isActive = diff === 0;
              const isPrev = diff === -1;
              const isNext = diff === 1;
              const isVisible = Math.abs(diff) <= 1; // Only 3 cards visible at once to avoid edge clipping & flying

              // Compute clean 3D transforms based on position
              let translateX = "0%";
              let translateZ = 0;
              let rotateY = 0;
              let scale = 1;
              let opacity = 0;
              let zIndex = 0;

              if (isActive) {
                translateX = "0%";
                translateZ = 0;
                rotateY = 0;
                scale = 1;
                opacity = 1;
                zIndex = 30;
              } else if (isNext) {
                translateX = "70%";
                translateZ = -25;
                rotateY = -15;
                scale = 0.90;
                opacity = 0.85;
                zIndex = 20;
              } else if (isPrev) {
                translateX = "-70%";
                translateZ = -25;
                rotateY = 15;
                scale = 0.90;
                opacity = 0.85;
                zIndex = 20;
              } else {
                translateX = diff < 0 ? "-110%" : "110%";
                translateZ = -80;
                rotateY = 0;
                scale = 0.75;
                opacity = 0;
                zIndex = 0;
              }

              return (
                <div
                  key={post.id}
                  onClick={() => !isActive && setActiveBlogIdx(idx)}
                  className={`absolute w-[86vw] max-w-[340px] sm:max-w-[390px] md:max-w-[430px] h-[470px] sm:h-[510px] md:h-[530px] rounded-[28px] sm:rounded-[32px] bg-white overflow-hidden flex flex-col transform-gpu [backface-visibility:hidden] [-webkit-font-smoothing:antialiased] transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                    isActive
                      ? "cursor-default border-2 border-emerald-500/70 shadow-[0_20px_50px_rgba(6,78,59,0.18)] ring-4 ring-emerald-500/15"
                      : "cursor-pointer border border-neutral-200/90 shadow-[0_10px_28px_rgba(0,0,0,0.06)] hover:border-emerald-300"
                  }`}
                  style={{
                    transform: `translate3d(${translateX}, 0, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                    opacity: isVisible ? opacity : 0,
                    zIndex,
                    pointerEvents: isVisible ? "auto" : "none",
                    WebkitFontSmoothing: "antialiased",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                >
                  {/* Top Image Banner */}
                  <div className="relative h-[220px] sm:h-[250px] w-full overflow-hidden bg-neutral-900 shrink-0">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 85vw, 430px"
                      className="object-cover transform hover:scale-105 transition-transform duration-700 ease-out opacity-100"
                      priority={isActive}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                    {/* Floating Badges */}
                    <div className="absolute top-4 left-4 z-10">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/95 text-[#064e3b] border border-white/80 shadow-md">
                        {post.category}
                      </span>
                    </div>

                    <div className="absolute top-4 right-4 z-10">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-black/75 text-white border border-white/20 flex items-center gap-1 shadow-sm">
                        <Clock size={11} className="text-amber-400" /> {post.readTime}
                      </span>
                    </div>

                    {/* Meta info overlaid at bottom of image */}
                    <div className="absolute bottom-3 left-4 right-4 z-10 flex items-center justify-between text-white/95 text-xs">
                      <span className="flex items-center gap-1.5 font-medium bg-black/50 px-2.5 py-0.5 rounded-md">
                        <Calendar size={12} className="text-emerald-400" /> {post.date}
                      </span>
                      <span className="text-[11px] text-amber-300 font-semibold bg-black/50 px-2.5 py-0.5 rounded-md">
                        By {post.author}
                      </span>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between bg-gradient-to-b from-white to-[#fafcfb]">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        <span className="text-[10px] font-black tracking-widest uppercase text-emerald-800">
                          {isActive ? "FEATURED ARTICLE" : "RECOMMENDED"}
                        </span>
                      </div>
                      <h3 className="font-luxury font-extrabold text-base sm:text-lg md:text-xl text-neutral-900 mb-2 leading-snug line-clamp-2 hover:text-[#064e3b] transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-between mt-auto">
                      <span className="text-xs font-bold text-neutral-400">
                        Article 0{post.id} / 0{blogPosts.length}
                      </span>
                      <a
                        href={post.handle ? `/blog/${post.handle}` : "#"}
                        className="inline-flex items-center gap-2 text-xs sm:text-sm font-black text-[#064e3b] hover:text-[#022c22] group/btn transition-colors"
                      >
                        <span>Read Full Guide</span>
                        <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-[#064e3b] group-hover/btn:bg-[#064e3b] group-hover/btn:text-white transition-all shadow-2xs">
                          <ArrowRight size={13} className="group-hover/btn:translate-x-0.5 transition-transform" />
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Interactive Navigation Dots / Article Selectors */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {blogPosts.map((post, idx) => (
              <button
                key={post.id}
                onClick={() => setActiveBlogIdx(idx)}
                aria-label={`Go to article ${idx + 1}: ${post.title}`}
                className={`transition-all duration-300 rounded-full cursor-pointer flex items-center gap-1.5 ${
                  activeBlogIdx === idx
                    ? "w-10 sm:w-14 h-3 bg-[#064e3b] shadow-md shadow-emerald-900/20"
                    : "w-3 h-3 bg-neutral-300 hover:bg-neutral-400"
                }`}
              />
            ))}
          </div>
          <span className="text-neutral-400 text-xs font-medium">
            Click side cards or drag arrows to explore • {activeBlogIdx + 1} of {blogPosts.length}
          </span>
        </div>
      </motion.section>

      {/* SEO Content */}
      <SeoContent />

      {/* Footer */}
      <motion.footer
        className="bg-[#022c22] text-white pt-12 sm:pt-16 md:pt-20 pb-24 lg:pb-8 mt-0 rounded-t-[28px] sm:rounded-t-[40px] shadow-2xl relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
        style={{ order: 999 }}
      >
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
        
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10">
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-8 mb-12 sm:mb-16" variants={staggerContainer}>
            
            {/* Brand Col */}
            <motion.div variants={fadeInUp} className="lg:col-span-4 flex flex-col items-start">
              <div className="mb-4 sm:mb-6">
                <Image
                  src="/vape-mart-text-logo-white.png"
                  alt="Vape Mart"
                  width={180}
                  height={62}
                  className="h-8 sm:h-10 w-auto object-contain"
                />
              </div>
              <p className="text-emerald-100/60 leading-relaxed text-xs sm:text-sm mb-6 sm:mb-8 pr-4">
                The UAE&apos;s premier destination for premium vaping products. We offer 100% authentic devices, exquisite e-liquids, and top-tier accessories with exceptional customer service.
              </p>
              <div className="flex items-center gap-3">
                {[
                  { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>, bg: "hover:bg-[#1877F2]" },
                  { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>, bg: "hover:bg-[#E4405F]" },
                  { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>, bg: "hover:bg-[#1DA1F2]" },
                  { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>, bg: "hover:bg-[#FF0000]" }
                ].map((social, idx) => (
                  <a key={idx} href="#" className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/80 transition-all duration-300 ${social.bg} hover:border-transparent hover:text-white transform hover:scale-110`}>
                    {social.icon}
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div variants={fadeInUp} className="lg:col-span-2">
              <h4 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 text-white tracking-wide">Quick Links</h4>
              <ul className="flex flex-col gap-2.5 sm:gap-3">
                {['Home', 'Shop All', 'About Us', 'Blog & News', 'Contact Us', 'FAQs'].map((link, idx) => (
                  <li key={idx}>
                    <a href="#" className="text-emerald-100/60 hover:text-amber-400 text-xs sm:text-sm font-medium transition-colors flex items-center gap-2 group">
                      <ChevronRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-amber-400" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Categories */}
            <motion.div variants={fadeInUp} className="lg:col-span-2">
              <h4 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 text-white tracking-wide">Categories</h4>
              <ul className="flex flex-col gap-2.5 sm:gap-3">
                {['Vape Kits', 'Disposable Vapes', 'E-Liquids', 'Nicotine Pouches', 'Pod Systems', 'Accessories'].map((cat, idx) => (
                  <li key={idx}>
                    <a href="#" className="text-emerald-100/60 hover:text-amber-400 text-xs sm:text-sm font-medium transition-colors flex items-center gap-2 group">
                      <ChevronRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-amber-400" />
                      {cat}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Contact & Newsletter */}
            <motion.div variants={fadeInUp} className="lg:col-span-4">
              <h4 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 text-white tracking-wide">Contact Us</h4>
              <ul className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
                <li className="flex items-start gap-3 text-emerald-100/60 text-xs sm:text-sm">
                  <MapPin size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>123 Vape Street, Downtown Dubai, United Arab Emirates</span>
                </li>
                <li className="flex items-center gap-3 text-emerald-100/60 text-xs sm:text-sm">
                  <Phone size={18} className="text-emerald-400 shrink-0" />
                  <span>+971 55 168 8299</span>
                </li>
                <li className="flex items-center gap-3 text-emerald-100/60 text-xs sm:text-sm">
                  <Mail size={18} className="text-emerald-400 shrink-0" />
                  <span>support@vapemart.ae</span>
                </li>
              </ul>

              <h4 className="text-xs sm:text-sm font-bold mb-3 sm:mb-4 text-white uppercase tracking-wider">Join Our Newsletter</h4>
              <form className="relative flex items-center" onSubmit={e => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="w-full h-11 sm:h-12 bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 sm:pr-14 text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 transition-colors"
                />
                <motion.button
                  whileHover={{ scale: 1.12, rotate: 12 }}
                  whileTap={{ scale: 0.9 }}
                  type="submit"
                  className="absolute right-1.5 w-8 h-8 sm:w-9 sm:h-9 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg flex items-center justify-center transition-colors shadow-md cursor-pointer"
                >
                  <Send size={15} />
                </motion.button>
              </form>
            </motion.div>
          </motion.div>

          <motion.div variants={fadeInUp} className="pt-6 sm:pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-emerald-100/40 text-[11px] sm:text-xs font-medium text-center md:text-left">
              {`© ${new Date().getFullYear()} Vape Mart. All Rights Reserved. Designed with `}<Heart size={10} className="inline text-red-500" fill="currentColor" />{` in UAE.`}
            </p>
            <div className="flex items-center gap-3 sm:gap-4 text-emerald-100/30">
              <div className="w-9 sm:w-10 h-6 bg-white/5 rounded flex items-center justify-center"><CreditCard size={14} /></div>
              <div className="w-9 sm:w-10 h-6 bg-white/5 rounded flex items-center justify-center"><CreditCard size={14} /></div>
              <div className="w-9 sm:w-10 h-6 bg-white/5 rounded flex items-center justify-center"><CreditCard size={14} /></div>
            </div>
          </motion.div>
        </div>
      </motion.footer>

      {/* Premium WhatsApp FAB */}
      <motion.a
        href="#"
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5, ease: "easeOut" }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-[84px] right-4 sm:bottom-8 sm:right-8 z-[60] w-13 h-13 sm:w-16 sm:h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(37,211,102,0.4)] hover:shadow-[0_12px_40px_rgba(37,211,102,0.6)] transition-all duration-300 group cursor-pointer"
        aria-label="Chat on WhatsApp"
      >
        <div className="absolute inset-0 rounded-full border border-white/40 group-hover:animate-ping opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
      </motion.a>

      {/* Smooth Back to Top Floating Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            onClick={scrollToTop}
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            whileHover={{ scale: 1.12, y: -3 }}
            whileTap={{ scale: 0.92 }}
            className="fixed bottom-[148px] right-5 sm:bottom-28 sm:right-9 z-[60] w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-[#064e3b] shadow-[0_10px_30px_rgba(6,78,59,0.25)] border border-emerald-100 flex items-center justify-center cursor-pointer group hover:bg-[#064e3b] hover:text-white transition-colors"
            aria-label="Scroll to top"
          >
            <ArrowUp size={18} className="group-hover:-translate-y-0.5 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile Sticky Bottom Navigation */}
      <nav aria-label="Mobile Bottom Navigation" className="lg:hidden fixed bottom-0 left-0 right-0 z-[70] bg-[#064e3b] border-t border-emerald-600/40 shadow-[0_-8px_25px_rgba(0,0,0,0.35)] px-2 py-2 flex items-center justify-between safe-bottom">
        <Link href="/" className="flex-1 flex flex-col items-center justify-center gap-1 text-amber-400 py-1.5 px-1 rounded-xl active:scale-95 transition-all text-center no-underline">
          <HomeIcon size={20} className="stroke-[2.2]" />
          <span className="text-[11px] font-bold tracking-tight">Home</span>
        </Link>
        <Link 
          href="/collections" 
          className="flex-1 flex flex-col items-center justify-center gap-1 text-emerald-100/75 hover:text-white py-1.5 px-1 rounded-xl active:scale-95 transition-all text-center no-underline"
        >
          <Layers size={20} className="stroke-[2.2]" />
          <span className="text-[11px] font-semibold tracking-tight">Shop</span>
        </Link>
        <Link 
          href="/collections" 
          className="flex-1 flex flex-col items-center justify-center gap-1 text-emerald-100/75 hover:text-white py-1.5 px-1 rounded-xl active:scale-95 transition-all !bg-transparent !border-0 outline-none cursor-pointer text-center no-underline"
        >
          <Search size={20} className="stroke-[2.2]" />
          <span className="text-[11px] font-semibold tracking-tight">Search</span>
        </Link>
        <Link href="/collections/disposable-vape" className="flex-1 flex flex-col items-center justify-center gap-1 text-emerald-100/75 hover:text-white py-1.5 px-1 rounded-xl active:scale-95 transition-all text-center no-underline">
          <Droplets size={20} className="stroke-[2.2]" />
          <span className="text-[11px] font-semibold tracking-tight">Disposables</span>
        </Link>
        <Link href="/collections" className="flex-1 flex flex-col items-center justify-center gap-1 text-emerald-100/75 hover:text-white py-1.5 px-1 rounded-xl active:scale-95 transition-all relative text-center no-underline">
          <div className="relative">
            <ShoppingBag size={20} className="stroke-[2.2]" />
            <span className="absolute -top-1 -right-2 w-4 h-4 bg-amber-400 text-neutral-900 text-[10px] font-black flex items-center justify-center rounded-full shadow-sm">0</span>
          </div>
          <span className="text-[11px] font-semibold tracking-tight">Cart</span>
        </Link>
      </nav>
    </main>
  );
}
