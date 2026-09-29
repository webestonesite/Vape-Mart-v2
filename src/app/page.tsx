"use client";
/* eslint-disable react/no-unescaped-entities, @next/next/no-img-element */
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import { Search, Heart, User, ShoppingBag, ChevronLeft, ChevronRight, Phone, ArrowRight, Truck, Headset, RotateCcw, CreditCard, Star, ShoppingCart, Plus, ArrowUpRight, HelpCircle, ChevronDown, ShieldCheck, CheckCircle, Shield, Lock, Tag, Send, Calendar, Mail, MapPin, Flame, Zap, Droplets, Clock, Check, ArrowUp, Menu, X, Home as HomeIcon, Layers } from "lucide-react";
import { SfButton, SfRating } from "@storefront-ui/react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import themePublished from "@/data/theme-published.json";

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

interface ThemeConfig {
  storeName?: string;
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
  hidden: { opacity: 0, y: 30, filter: "blur(4px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as const } 
  }
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.95, y: 20, filter: "blur(4px)" },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } 
  }
};

const slideInLeft = {
  hidden: { opacity: 0, x: -35, filter: "blur(4px)" },
  visible: { 
    opacity: 1, 
    x: 0, 
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } 
  }
};

const slideInRight = {
  hidden: { opacity: 0, x: 35, filter: "blur(4px)" },
  visible: { 
    opacity: 1, 
    x: 0, 
    filter: "blur(0px)",
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

function ProductCard({ prod }: { prod: Product }) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <motion.div
      variants={fadeInScale}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className="group bg-white rounded-2xl border border-neutral-200/80 p-2.5 sm:p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_30px_rgba(6,78,59,0.12)] transition-all duration-300 flex flex-col justify-between relative overflow-hidden h-full"
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
          <span className="bg-red-600 text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
            {prod.badge}
          </span>
        )}
      </div>

      {/* Product Image Area - Clean White Presentation */}
      <div className="relative w-full aspect-square flex items-center justify-center p-2 my-1 overflow-hidden">
        <div className="relative w-full h-full transform group-hover:scale-108 transition-transform duration-500 ease-out">
          <Image
            src={prod.img}
            alt={prod.title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-contain"
          />
        </div>
      </div>

      {/* Brand Series Tag (Like Reference Image) */}
      <div className="w-full bg-neutral-900 text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider py-1 px-2 text-center rounded-sm my-1 truncate">
        {prod.brand || prod.title.split(' ').slice(0, 3).join(' ')}
      </div>

      {/* Product Title */}
      <a
        href="#"
        className="font-bold text-neutral-900 text-[12px] sm:text-[13px] leading-snug line-clamp-2 text-center my-1 hover:text-[#064e3b] transition-colors min-h-[34px] flex items-center justify-center no-underline"
      >
        {prod.title}
      </a>

      {/* Star Rating */}
      <div className="flex items-center justify-center gap-0.5 my-1 text-amber-400">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} size={11} fill="#fbbf24" color="#fbbf24" />
        ))}
        <span className="text-[10px] text-neutral-400 font-medium ml-1">({prod.revs})</span>
      </div>

      {/* Price */}
      <div className="text-center my-1">
        <span className="text-[13px] sm:text-[15px] font-black text-neutral-900 tracking-tight">
          AED {prod.price}
        </span>
      </div>

      {/* Single Add to Cart Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="w-full py-2 sm:py-2.5 bg-[#064e3b] hover:bg-[#022c22] text-white text-[11px] sm:text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer mt-1"
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
  products
}: {
  title: string;
  subtitle: string;
  badgeText: string;
  products: Product[];
}) {
  const [showAll, setShowAll] = useState(false);
  const displayedProducts = showAll ? products : products.slice(0, 4);

  return (
    <motion.section
      className="best-selling-section relative max-w-[1400px] mx-auto px-3 sm:px-6 py-8 sm:py-12"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={staggerContainer}
    >
      {/* Centered Section Header */}
      <motion.div className="section-header-bs mb-6 sm:mb-10 text-center" variants={fadeInUp}>
        <div className="top-picks flex items-center justify-center gap-2 mb-2">
          <span className="line w-6 h-[2px] bg-[#064e3b] rounded-full"></span>
          <span className="text font-cinzel text-xs font-bold tracking-[0.25em] text-[#064e3b] uppercase">{badgeText}</span>
          <span className="line w-6 h-[2px] bg-[#064e3b] rounded-full"></span>
        </div>
        <h2 className="font-luxury text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-neutral-900 tracking-tight">{title}</h2>
        <div className="flex items-center justify-center gap-4 my-2 sm:my-3">
          <div className="h-px w-12 sm:w-16 bg-gradient-to-r from-transparent to-[#064e3b]"></div>
          <div className="w-2 h-2 rotate-45 bg-[#064e3b]"></div>
          <div className="h-px w-12 sm:w-16 bg-gradient-to-l from-transparent to-[#064e3b]"></div>
        </div>
        <p className="text-neutral-500 text-xs sm:text-sm max-w-xl mx-auto">{subtitle}</p>
      </motion.div>

      {/* 2x2 on Mobile (2 ta 2 ta 4 ta), 4 across on Desktop */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 md:gap-6"
        variants={staggerContainer}
      >
        {displayedProducts.map((prod, idx) => (
          <ProductCard key={idx} prod={prod} />
        ))}
      </motion.div>

      {/* View All / Show Less Button */}
      <motion.div className="mt-8 flex justify-center" variants={fadeInUp}>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAll(!showAll)}
          className="px-6 py-2.5 sm:px-8 sm:py-3 rounded-full bg-[#064e3b] text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-900/15 hover:bg-[#022c22] transition-all flex items-center gap-2 cursor-pointer group"
        >
          <span>{showAll ? "Show Less" : `View All (${products.length})`}</span>
          <ArrowRight size={15} className={`transition-transform duration-300 ${showAll ? "-rotate-90" : "group-hover:translate-x-1"}`} />
        </motion.button>
      </motion.div>
    </motion.section>
  );
}

const bestSellingProducts: Product[] = [
  { title: "Kief King 35000 Puffs 3mg Disposable Vape in UAE", price: "49.00", revs: 57, badge: "VAPOR UAE", img: "/images/cat_vape_kits.png" },
  { title: "Vozol Star 40000 puff 20mg nicotine vape in UAE", price: "45.00", revs: 55, badge: "BEST SELLER", img: "/images/prod_disposable.png" },
  { title: "Myle Meta Max 18000 Puff 50mg Disposable Vape in UAE", price: "50.00", revs: 50, badge: "", img: "/images/product-2.png" },
  { title: "Elf bar JoinOne Ice 25000 Puffs 50mg Pod Kit in UAE", price: "50.00", revs: 54, badge: "7% OFF", img: "/images/prod_pod.png" },
  { title: "Geekvape Aegis Legend 3 200W Starter Kit", price: "185.00", revs: 42, badge: "POPULAR", img: "/images/cat_vape_kits.png" },
  { title: "Juice Head Blueberry Lemon 100ml E-Liquid", price: "55.00", revs: 39, badge: "", img: "/images/prod_eliquid.png" },
  { title: "Vaporesso Luxe XR Max 80W Pod Mod Kit", price: "165.00", revs: 48, badge: "TOP", img: "/images/product-3.png" },
  { title: "Nasty ModMate Grape & Mixed Berries 60ml", price: "45.00", revs: 62, badge: "", img: "/images/prod_eliquid.png" }
];

const tereaHeetsProducts: Product[] = themeData.tereaHeets?.products ?? [
  { title: "IQOS Terea Amber Selection Indonesian in UAE", price: "125.00", revs: 84, badge: "BEST SELLER", brand: "TEREA INDO", img: "/images/terea_heets.jpg" },
  { title: "IQOS Terea Bronze Selection Indonesian Sticks", price: "125.00", revs: 67, badge: "POPULAR", brand: "TEREA INDO", img: "/images/terea_heets.jpg" },
  { title: "IQOS Terea Purple Wave Menthol Heated Sticks", price: "130.00", revs: 92, badge: "COOL", brand: "TEREA INDO", img: "/images/terea_heets.jpg" },
  { title: "IQOS Terea Sienna Balanced Warm Tobacco", price: "125.00", revs: 48, badge: "", brand: "TEREA ILUMA", img: "/images/terea_heets.jpg" },
  { title: "IQOS Terea Green Zing Crisp Herbal Menthol", price: "130.00", revs: 53, badge: "FRESH", brand: "TEREA ILUMA", img: "/images/terea_heets.jpg" },
  { title: "IQOS Heets Bronze Selection Arabic Version", price: "115.00", revs: 76, badge: "CLASSIC", brand: "HEETS DUO", img: "/images/terea_heets.jpg" },
  { title: "IQOS Heets Amber Selection Smooth Rich Flavor", price: "115.00", revs: 61, badge: "", brand: "HEETS DUO", img: "/images/terea_heets.jpg" },
  { title: "IQOS Heets Silver Selection Subtle Refined Tobacco", price: "115.00", revs: 39, badge: "", brand: "HEETS DUO", img: "/images/terea_heets.jpg" }
];

const juulProductsList: Product[] = themeData.juulProducts?.products ?? [
  { title: "JUUL 2 Starter Kit with Slate Grey Device & 2 Pods", price: "145.00", revs: 110, badge: "STARTER KIT", brand: "JUUL OFFICIAL", img: "/images/juul_product.jpg" },
  { title: "JUUL 2 Device with USB Magnetic Charging Dock", price: "95.00", revs: 88, badge: "DEVICE ONLY", brand: "JUUL OFFICIAL", img: "/images/juul_product.jpg" },
  { title: "JUUL 2 Virginia Tobacco Pods 18mg (Pack of 2)", price: "45.00", revs: 142, badge: "TOP RATED", brand: "JUUL2 PODS", img: "/images/juul_product.jpg" },
  { title: "JUUL 2 Crisp Menthol Pods 18mg Nicotine 2-Pack", price: "45.00", revs: 96, badge: "ICE", brand: "JUUL2 PODS", img: "/images/juul_product.jpg" },
  { title: "JUUL 2 Polar Menthol Pods 18mg Extra Fresh", price: "45.00", revs: 74, badge: "POPULAR", brand: "JUUL2 PODS", img: "/images/juul_product.jpg" },
  { title: "JUUL 2 Ruby Menthol Wild Berry Pods 2-Pack", price: "48.00", revs: 81, badge: "NEW", brand: "JUUL2 PODS", img: "/images/juul_product.jpg" },
  { title: "JUUL 2 Autumn Tobacco Rich Blend Pods 2-Pack", price: "45.00", revs: 58, badge: "", brand: "JUUL2 PODS", img: "/images/juul_product.jpg" },
  { title: "JUUL USB Magnetic Rapid Charging Cable", price: "35.00", revs: 43, badge: "ACCESSORY", brand: "JUUL GEAR", img: "/images/juul_product.jpg" }
];


const newArrivalsProducts: Product[] = [
  { title: "Lost Mary OS5000 Disposable Pod Device", price: "35.00", revs: 12, badge: "NEW", img: "/images/cat_vape_kits.png" },
  { title: "Geek Bar Pulse 15000 Puffs Disposable", price: "55.00", revs: 18, badge: "NEW", img: "/images/prod_disposable.png" },
  { title: "Vaporesso XROS 3 Mini Pod Kit", price: "110.00", revs: 22, badge: "", img: "/images/product-3.png" },
  { title: "Nasty Juice Cush Man 60ml E-Liquid", price: "45.00", revs: 41, badge: "", img: "/images/prod_eliquid.png" },
  { title: "OXVA Xlim Pro 2 Pod System Kit 30W", price: "125.00", revs: 15, badge: "NEW", img: "/images/prod_pod.png" },
  { title: "Waka soPro PA10000 Dual Mesh Disposable", price: "48.00", revs: 29, badge: "NEW", img: "/images/product-1.png" },
  { title: "Voopoo Drag S2 Pod Kit 60W Vape Device", price: "145.00", revs: 31, badge: "NEW", img: "/images/product-2.png" },
  { title: "Loaded Glazed Donuts 120ml Premium E-Juice", price: "65.00", revs: 24, badge: "NEW", img: "/images/prod_eliquid.png" }
];

const mostPopularProducts: Product[] = [
  { title: "Smok Nord 4 80W Pod Kit", price: "120.00", revs: 85, badge: "HOT", img: "/images/product-1.png" },
  { title: "Juice Head Blueberry Lemon 100ml", price: "55.00", revs: 43, badge: "", img: "/images/prod_eliquid.png" },
  { title: "Uwell Caliburn G2 Pod System", price: "95.00", revs: 112, badge: "HOT", img: "/images/prod_pod.png" },
  { title: "Dinner Lady Lemon Tart 60ml", price: "50.00", revs: 67, badge: "", img: "/images/product-2.png" },
  { title: "Vozol Gear 10000 Puffs Disposable Vape", price: "42.00", revs: 76, badge: "TRENDING", img: "/images/prod_disposable.png" },
  { title: "Al Fakher Crown Bar 8000 Puffs DTL", price: "40.00", revs: 91, badge: "HOT", img: "/images/cat_vape_kits.png" },
  { title: "Geekvape Wenax K1 Pod System 16W", price: "75.00", revs: 98, badge: "HOT", img: "/images/product-3.png" },
  { title: "Tokyo Iced Mango 30ml Saltnic Premium E-Liquid", price: "45.00", revs: 88, badge: "POPULAR", img: "/images/prod_disposable.png" }
];

interface FlavorItem {
  title: string;
  category: string;
  tag: string;
  desc: string;
  productCount: number;
  img: string;
  bgGradient: string;
  glowColor: string;
  badgeBg: string;
  accentColor: string;
}

const flavorsData: FlavorItem[] = [
  {
    title: "Watermelon Ice",
    category: "FRUITY & CHILLED",
    tag: "BEST SELLER",
    desc: "Crisp red watermelon slice paired with an icy arctic breeze.",
    productCount: 48,
    img: "/images/prod_disposable.png",
    bgGradient: "from-rose-50 to-pink-50/60",
    glowColor: "group-hover:shadow-[0_20px_45px_rgba(244,63,94,0.18)]",
    badgeBg: "bg-rose-500 text-white",
    accentColor: "#f43f5e"
  },
  {
    title: "Cool Mint & Spearmint",
    category: "MENTHOL & ICED",
    tag: "ULTRA FRESH",
    desc: "Pure icy mint leaf infused with refreshing crushed menthol crystals.",
    productCount: 39,
    img: "/images/cat_disposables.png",
    bgGradient: "from-cyan-50 to-teal-50/60",
    glowColor: "group-hover:shadow-[0_20px_45px_rgba(6,182,212,0.18)]",
    badgeBg: "bg-cyan-600 text-white",
    accentColor: "#0891b2"
  },
  {
    title: "Blue Razz Lemonade",
    category: "BERRY & TANGY",
    tag: "POPULAR",
    desc: "Sweet blue raspberries stirred with zesty sparkling lemonade.",
    productCount: 52,
    img: "/images/prod_eliquid.png",
    bgGradient: "from-blue-50 to-indigo-50/60",
    glowColor: "group-hover:shadow-[0_20px_45px_rgba(59,130,246,0.18)]",
    badgeBg: "bg-blue-600 text-white",
    accentColor: "#2563eb"
  },
  {
    title: "Mango Passion Fruit",
    category: "TROPICAL EXOTIC",
    tag: "HOT PICK",
    desc: "Golden ripe Alphonso mangoes splashed with tangy passion fruit.",
    productCount: 36,
    img: "/images/vape_hero_sky.png",
    bgGradient: "from-amber-50 to-orange-50/60",
    glowColor: "group-hover:shadow-[0_20px_45px_rgba(245,158,11,0.18)]",
    badgeBg: "bg-amber-500 text-white",
    accentColor: "#d97706"
  },
  {
    title: "Virginia Tobacco Blend",
    category: "RICH CLASSIC",
    tag: "SMOOTH & BOLD",
    desc: "Sun-cured Virginia golden tobacco leaf with subtle caramel undertones.",
    productCount: 28,
    img: "/images/product-2.png",
    bgGradient: "from-stone-100 to-amber-50/70",
    glowColor: "group-hover:shadow-[0_20px_45px_rgba(180,83,9,0.18)]",
    badgeBg: "bg-amber-800 text-white",
    accentColor: "#92400e"
  },
  {
    title: "Lemon Tart & Vanilla",
    category: "DESSERT & BAKERY",
    tag: "GOURMET",
    desc: "Crumbly buttery pastry crust layered with zesty whipped lemon curd.",
    productCount: 31,
    img: "/images/product-3.png",
    bgGradient: "from-yellow-50 to-amber-50/60",
    glowColor: "group-hover:shadow-[0_20px_45px_rgba(234,179,8,0.18)]",
    badgeBg: "bg-yellow-600 text-white",
    accentColor: "#ca8a04"
  },
  {
    title: "Grape Ice & Aloe",
    category: "CHILLED FRUIT",
    tag: "TRENDING",
    desc: "Dark concord grapes blended with soothing aloe and frosted mint.",
    productCount: 34,
    img: "/images/product-1.png",
    bgGradient: "from-purple-50 to-fuchsia-50/60",
    glowColor: "group-hover:shadow-[0_20px_45px_rgba(168,85,247,0.18)]",
    badgeBg: "bg-purple-600 text-white",
    accentColor: "#9333ea"
  },
  {
    title: "Strawberry Kiwi Splash",
    category: "SWEET & SOUR",
    tag: "SUMMER VIBE",
    desc: "Sun-ripened garden strawberries accented with tangy green kiwi slices.",
    productCount: 44,
    img: "/images/cat_vape_kits.png",
    bgGradient: "from-emerald-50 to-rose-50/60",
    glowColor: "group-hover:shadow-[0_20px_45px_rgba(16,185,129,0.18)]",
    badgeBg: "bg-emerald-600 text-white",
    accentColor: "#059669"
  }
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const slides = [
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
      title: "Best E-Liquids of 2024\nTaste the Difference",
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const [showAllFlavors, setShowAllFlavors] = useState(false);
  const displayedFlavors = showAllFlavors ? flavorsData : flavorsData.slice(0, 4);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setShowScrollTop(scrollY > 450);
      setIsScrolled(scrollY > 80);
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

      {/* Premium Top Strip */}
      <div className="bg-[#022c22] text-white text-[11px] font-medium tracking-wide py-2.5 px-6 flex justify-between items-center relative overflow-hidden">
        <div className="flex-1 overflow-hidden relative flex items-center h-full">
          <div className="flex gap-8 whitespace-nowrap animate-[marquee_25s_linear_infinite] hover:![animation-play-state:paused] cursor-default w-max">
            <span className="flex items-center gap-1.5 opacity-90"><Lock size={12} className="text-amber-400" /> Secure Payment | COD Available</span>
            <span className="flex items-center gap-1.5 opacity-90"><Tag size={12} className="text-amber-400" /> Exclusive offer up to 10% OFF</span>
            <span className="flex items-center gap-1.5 opacity-90"><ShieldCheck size={12} className="text-amber-400" /> 100% Authentic Products - Original Brands Guaranteed</span>
            <span className="flex items-center gap-1.5 opacity-90"><Truck size={12} className="text-amber-400" /> Free Delivery on Orders Above AED 350</span>
            <span className="flex items-center gap-1.5 opacity-90"><Star size={12} className="text-amber-400" /> 20,000+ Happy Customers</span>
            {/* Duplicated for smooth infinite scroll */}
            <span className="flex items-center gap-1.5 opacity-90"><Lock size={12} className="text-amber-400" /> Secure Payment | COD Available</span>
            <span className="flex items-center gap-1.5 opacity-90"><Tag size={12} className="text-amber-400" /> Exclusive offer up to 10% OFF</span>
            <span className="flex items-center gap-1.5 opacity-90"><ShieldCheck size={12} className="text-amber-400" /> 100% Authentic Products - Original Brands Guaranteed</span>
            <span className="flex items-center gap-1.5 opacity-90"><Truck size={12} className="text-amber-400" /> Free Delivery on Orders Above AED 350</span>
            <span className="flex items-center gap-1.5 opacity-90"><Star size={12} className="text-amber-400" /> 20,000+ Happy Customers</span>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-6 ml-6 border-l border-white/10 pl-6 z-10 bg-[#022c22]">
          <span className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity"><Phone size={12} /> +971 55 168 8299</span>
          <a href="#" className="text-white opacity-70 hover:opacity-100 transition-opacity">About Us</a>
          <a href="#" className="text-white opacity-70 hover:opacity-100 transition-opacity">Contact Us</a>
        </div>
      </div>

      {/* Ultra-Premium Main Header */}
      <header className={`sticky top-0 z-50 bg-[#064e3b] border-b border-emerald-800 transition-all duration-300 ${isScrolled ? 'shadow-[0_12px_40px_rgba(0,0,0,0.3)] bg-[#064e3b]/95 backdrop-blur-xl' : 'shadow-[0_10px_40px_-15px_rgba(6,78,59,0.3)]'}`}>
        <div className={`max-w-[1400px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-3 sm:gap-6 md:gap-12 transition-all duration-300 ${isScrolled ? 'h-[64px] sm:h-[76px]' : 'h-[70px] sm:h-[90px]'}`}>

          {/* Left: Mobile Menu Toggle + Brand Logo */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo without background */}
            <a href="#" className="flex-shrink-0 group cursor-pointer block py-1">
              <Image
                src="/vape-mart-text-logo-white.png"
                alt="Vape Mart Logo"
                width={190}
                height={66}
                className="h-8 sm:h-10 md:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </a>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden sm:block flex-1 max-w-2xl relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-emerald-100/50 group-focus-within:text-white transition-colors">
              <Search size={18} strokeWidth={2.5} />
            </div>
            <input
              type="text"
              placeholder="Search for vapes, e-liquids, brands..."
              className="w-full h-11 md:h-12 bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-transparent focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 rounded-full pl-12 pr-14 text-sm md:text-[15px] font-medium text-white placeholder-emerald-100/50 outline-none transition-all duration-300 backdrop-blur-md"
            />
            <motion.button
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.9 }}
              className="absolute inset-y-1 right-1 md:inset-y-1.5 md:right-1.5 w-9 h-9 flex items-center justify-center bg-white hover:bg-emerald-50 text-[#064e3b] rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)] transition-all cursor-pointer"
            >
              <ArrowRight size={16} strokeWidth={2.5} />
            </motion.button>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="sm:hidden w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
              aria-label="Open search bar"
            >
              <Search size={20} strokeWidth={2} />
            </button>

            <motion.button
              whileHover={{ scale: 1.12, y: -2 }}
              whileTap={{ scale: 0.9 }}
              className="hidden md:flex w-10 h-10 md:w-11 md:h-11 items-center justify-center rounded-full bg-white/10 text-white hover:text-[#064e3b] hover:bg-white transition-colors duration-300 backdrop-blur-md cursor-pointer"
              aria-label="Wishlist"
            >
              <Heart size={20} strokeWidth={2} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.12, y: -2 }}
              whileTap={{ scale: 0.9 }}
              className="hidden sm:flex w-10 h-10 md:w-11 md:h-11 items-center justify-center rounded-full bg-white/10 text-white hover:text-[#064e3b] hover:bg-white transition-colors duration-300 backdrop-blur-md cursor-pointer"
              aria-label="My Account"
            >
              <User size={20} strokeWidth={2} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.12, y: -2 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-full bg-white/10 text-white hover:text-[#064e3b] hover:bg-white transition-colors duration-300 relative group backdrop-blur-md cursor-pointer"
              aria-label="Cart"
            >
              <ShoppingBag size={20} strokeWidth={2} />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 text-neutral-900 text-[11px] font-bold flex items-center justify-center rounded-full shadow-sm group-hover:scale-110 transition-transform">0</span>
            </motion.button>
          </div>
        </div>

        {/* Mobile Expandable Search Bar */}
        <AnimatePresence>
          {isMobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="sm:hidden px-4 pb-3 border-t border-emerald-800/60 overflow-hidden bg-[#064e3b]"
            >
              <div className="relative mt-2">
                <input
                  type="text"
                  placeholder="Search for vapes, e-liquids..."
                  className="w-full h-11 bg-white/15 border border-white/20 rounded-full pl-11 pr-12 text-sm text-white placeholder-emerald-100/60 focus:outline-none focus:border-amber-400"
                  autoFocus
                />
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/60" />
                <button
                  onClick={() => setIsMobileSearchOpen(false)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Navigation (Hidden on Mobile) */}
        <nav className="hidden lg:block border-t border-emerald-800 bg-[#064e3b]">
          <ul className="max-w-[1400px] mx-auto px-6 h-[50px] flex items-center justify-center gap-8 text-[13px] font-bold tracking-wider">
            {['HOME', 'SHOP', 'DISPOSABLE VAPE', 'NICOTINE POUCHES', 'SHISHA/HOOKAH', 'PODS SYSTEM', 'E-LIQUID', 'VAPE KIT', 'BRANDS', 'OFFERS'].map((item, i) => (
              <li key={i} className="h-full flex items-center relative group cursor-pointer">
                <a href="#" className={`flex items-center gap-1 hover:text-amber-400 transition-colors ${i === 0 ? 'text-amber-400' : 'text-white'}`}>
                  {item}
                  {(i === 2 || i === 4 || i === 6) && <ChevronDown size={14} strokeWidth={2.5} className="group-hover:rotate-180 transition-transform duration-300" />}
                </a>
                <div className={`absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full bg-amber-400 transform origin-left transition-transform duration-300 ${i === 0 ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></div>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* Mobile Navigation Drawer / Slide-Over */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 240 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 z-[90] w-[85%] max-w-[340px] bg-[#022c22] border-r border-emerald-800 text-white flex flex-col shadow-2xl overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-emerald-800 flex items-center justify-between bg-[#064e3b]">
                <div className="flex items-center">
                  <Image
                    src="/vape-mart-text-logo-white.png"
                    alt="Vape Mart Logo"
                    width={140}
                    height={48}
                    className="h-7 sm:h-8 w-auto object-contain"
                  />
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Links */}
              <div className="p-4 flex-1">
                <span className="font-cinzel text-[10px] tracking-[0.2em] text-emerald-400 font-extrabold uppercase px-3 mb-2 block">Categories & Shop</span>
                <ul className="flex flex-col gap-1">
                  {[
                    { name: 'Home', badge: 'Main' },
                    { name: 'Shop All', badge: 'Hot' },
                    { name: 'Disposable Vapes', badge: 'Popular' },
                    { name: 'Nicotine Pouches', badge: 'Fresh' },
                    { name: 'Shisha / Hookah', badge: '' },
                    { name: 'Pod Systems', badge: 'Sale' },
                    { name: 'E-Liquids', badge: 'Top' },
                    { name: 'Vape Kits', badge: '' },
                    { name: 'Brands', badge: '' },
                    { name: 'Exclusive Offers', badge: '10% OFF' },
                  ].map((item, idx) => (
                    <li key={idx}>
                      <a
                        href="#"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/10 transition-colors text-sm font-semibold text-emerald-50 hover:text-white"
                      >
                        <span>{item.name}</span>
                        <div className="flex items-center gap-2">
                          {item.badge && (
                            <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                              {item.badge}
                            </span>
                          )}
                          <ChevronRight size={15} className="text-emerald-400/60" />
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>

                {/* Quick Info inside Drawer */}
                <div className="mt-6 pt-5 border-t border-emerald-800/60 px-3 flex flex-col gap-3">
                  <div className="flex items-center gap-2.5 text-xs text-emerald-200/80">
                    <Truck size={14} className="text-amber-400" />
                    <span>Free UAE Delivery over AED 350</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-emerald-200/80">
                    <Phone size={14} className="text-emerald-400" />
                    <span>Support: +971 55 168 8299</span>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section
        className="relative w-full min-h-[580px] sm:min-h-[640px] md:h-[650px] lg:h-[700px] overflow-hidden bg-gradient-to-br from-[#064e3b] via-[#022c22] to-[#064e3b] select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
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
        <motion.section
          className="max-w-[1400px] mx-auto px-4 sm:px-6 mt-8 sm:mt-12 md:mt-16 mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <motion.div className="group relative min-h-[250px] sm:h-[300px] md:h-[320px] rounded-[24px] sm:rounded-[32px] overflow-hidden bg-gradient-to-br from-[#064e3b] to-emerald-900 shadow-[0_20px_40px_-15px_rgba(6,78,59,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(6,78,59,0.4)] transition-all duration-500 hover:-translate-y-1 border border-emerald-800" variants={slideInLeft}>
            <div className="absolute inset-0 bg-white opacity-5 mix-blend-overlay"></div>
            <div className="relative z-10 flex flex-col justify-center h-full p-6 sm:p-10 md:p-12 w-full sm:w-2/3 pr-20 sm:pr-0">
              <span className="font-cinzel text-emerald-400 font-extrabold text-xs sm:text-sm tracking-[0.25em] uppercase mb-1.5 sm:mb-2">Exclusive</span>
              <h2 className="font-luxury text-white text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight mb-2.5 sm:mb-4 drop-shadow-md">Vape Kits & Pod Systems</h2>
              <p className="text-emerald-100/80 text-xs sm:text-sm mb-5 sm:mb-8 line-clamp-2">High-performance vape kits designed for smooth flavor and long battery life.</p>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-[#064e3b] px-5 py-2.5 sm:px-6 sm:py-3 rounded-full font-bold text-xs sm:text-sm hover:bg-emerald-50 transition-all w-max shadow-lg flex items-center gap-2 pr-4 group-hover:pr-6 duration-300 cursor-pointer relative overflow-hidden group/btn"
              >
                <span className="relative z-10">Shop Kits</span>
                <ArrowRight size={15} className="relative z-10 transition-transform duration-300 transform group-hover/btn:translate-x-1" />
                <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent pointer-events-none"></span>
              </motion.button>
            </div>
            <img src="/images/cat_vape_kits.png" alt="Vape Kits" className="absolute -right-4 -bottom-4 sm:-bottom-8 w-44 sm:w-56 md:w-64 h-auto object-contain transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-700 drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] opacity-50 sm:opacity-90 md:opacity-100" />
          </motion.div>

          <motion.div className="group relative min-h-[250px] sm:h-[300px] md:h-[320px] rounded-[24px] sm:rounded-[32px] overflow-hidden bg-gradient-to-br from-[#d97706] to-amber-700 shadow-[0_20px_40px_-15px_rgba(217,119,6,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(217,119,6,0.4)] transition-all duration-500 hover:-translate-y-1 border border-amber-600" variants={slideInRight}>
            <div className="absolute inset-0 bg-white opacity-5 mix-blend-overlay"></div>
            <div className="relative z-10 flex flex-col justify-center h-full p-6 sm:p-10 md:p-12 w-full sm:w-2/3 pr-20 sm:pr-0">
              <span className="font-cinzel text-amber-200 font-extrabold text-xs sm:text-sm tracking-[0.25em] uppercase mb-1.5 sm:mb-2">New Arrival</span>
              <h2 className="font-luxury text-white text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight mb-2.5 sm:mb-4 drop-shadow-md">Premium Vape Collection</h2>
              <p className="text-amber-100/80 text-xs sm:text-sm mb-5 sm:mb-8 line-clamp-2">Discover top-tier vape devices crafted for performance and style.</p>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-[#d97706] px-5 py-2.5 sm:px-6 sm:py-3 rounded-full font-bold text-xs sm:text-sm hover:bg-amber-50 transition-all w-max shadow-lg flex items-center gap-2 pr-4 group-hover:pr-6 duration-300 cursor-pointer relative overflow-hidden group/btn"
              >
                <span className="relative z-10">Shop Premium</span>
                <ArrowRight size={15} className="relative z-10 transition-transform duration-300 transform group-hover/btn:translate-x-1" />
                <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent pointer-events-none"></span>
              </motion.button>
            </div>
            <img src="/images/product-3.png" alt="Premium Vape" className="absolute -right-4 bottom-0 w-44 sm:w-56 md:w-64 h-auto object-contain transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] opacity-50 sm:opacity-90 md:opacity-100" />
          </motion.div>
        </motion.section>

        {/* Ultra-Premium Categories Section */}
        <motion.section
          className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={staggerContainer}
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
            {[
              { title: "Vape Kits", subtitle: "BEST SELLERS", num: "01", img: "/images/cat_vape_kits.png", color: "from-blue-900/80 to-black/90", tag: "POPULAR" },
              { title: "Disposables", subtitle: "NEW ARRIVALS", num: "02", img: "/images/cat_disposables.png", color: "from-emerald-900/80 to-black/90", tag: "TRENDING" },
              { title: "E-Liquids", subtitle: "TOP RATED", num: "03", img: "/images/vape_hero_sky.png", color: "from-amber-900/80 to-black/90", tag: "HOT" },
              { title: "Pod Systems", subtitle: "COMPACT & SLEEK", num: "04", img: "/images/prod_pod.png", color: "from-purple-900/80 to-black/90", tag: "FEATURED" },
              { title: "Nicotine Pouches", subtitle: "ALL DAY FRESH", num: "05", img: "/images/prod_disposable.png", color: "from-teal-900/80 to-black/90", tag: "NEW" },
              { title: "Accessories & Coils", subtitle: "ESSENTIAL GEAR", num: "06", img: "/images/product-2.png", color: "from-rose-900/80 to-black/90", tag: "SUPPLIES" },
            ].map((cat, idx) => (
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
      </motion.section>

        {/* Ultra-Premium Features Section */}
        <motion.section
          className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 sm:py-12 mb-8 sm:mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <div className="bg-gradient-to-r from-[#022c22] via-[#064e3b] to-[#022c22] rounded-[24px] sm:rounded-[40px] shadow-[0_20px_40px_rgba(6,78,59,0.2)] p-6 sm:p-10 relative overflow-hidden border border-emerald-900/50">
            {/* Background glowing effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none"></div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-white/10 relative z-10">
              {[
                { icon: Truck, title: "Free Shipping", desc: "Terms & Conditions applied for free shipping and delivery" },
                { icon: Headset, title: "24x7 Support", desc: "Round-the-Clock Assistance, Anytime You Need It" },
                { icon: RotateCcw, title: "1 Week Return", desc: "Your Satisfaction is Our Priority: Return Any Product Within 1 week" },
                { icon: CreditCard, title: "Secure Payment", desc: "Seamless Shopping Backed by Safe and Secure Payment Options" }
              ].map((feature, idx) => (
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
        </motion.section>

        {/* Best Selling Carousel */}
        <ProductCarousel
          title="Best Selling"
          subtitle="Our most loved products, chosen by you"
          badgeText="TOP PICKS"
          products={bestSellingProducts}
        />

        {/* TEREA & HEETS Carousel */}
        <ProductCarousel
          title={themeData.tereaHeets?.title || "TEREA & HEETS"}
          subtitle={themeData.tereaHeets?.subtitle || "Authentic heated tobacco sticks for IQOS ILUMA & IQOS 3 Duo in UAE"}
          badgeText={themeData.tereaHeets?.badgeText || "HEATED TOBACCO"}
          products={tereaHeetsProducts}
        />

        {/* JUUL Products Carousel */}
        <ProductCarousel
          title={themeData.juulProducts?.title || "JUUL Pods & Devices"}
          subtitle={themeData.juulProducts?.subtitle || "Original JUUL2 starter kits, replacement pods & accessories with rapid delivery"}
          badgeText={themeData.juulProducts?.badgeText || "PREMIUM PODS"}
          products={juulProductsList}
        />

        {/* New Arrivals Carousel */}
        <ProductCarousel
          title="New Arrivals"
          subtitle="Explore our latest premium collection"
          badgeText="NEW ITEMS"
          products={newArrivalsProducts}
        />

        {/* Most Popular Carousel */}
        <ProductCarousel
          title="Most Popular"
          subtitle="The most trending products right now"
          badgeText="TRENDING"
          products={mostPopularProducts}
        />

        {/* Featured Brand Section */}
        <motion.section
          className="featured-brand-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={staggerContainer}
        >
          <div className="fb-container">
            <motion.div className="fb-left" variants={slideInLeft}>
              <div className="fb-badge font-cinzel tracking-[0.25em]">FEATURED</div>
              <div className="fb-logo-wrapper">
                <Image src="/vape-mart-text-logo.png" alt="Vape Mart Brand Logo" fill sizes="170px" className="object-contain p-2" priority />
              </div>
              <h3 className="font-luxury text-2xl sm:text-3xl font-bold text-[#064e3b] mb-6">Your Vibe. Your Flavor.</h3>
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
                {[
                  { title: "Al Fakher crown bar ultra 25000 puff 5mg in UAE", price: "45.00", oldPrice: "50.00", discount: "10% OFF" },
                  { title: "Al Fakher 30mg Salt Nicotine E Liquid 30ml in UAE", price: "35.00", oldPrice: "45.00", discount: "22% OFF" },
                  { title: "Al Fakher Crown Bar E Hose X 60000 puff 6mg vape", price: "55.00", oldPrice: "", discount: "15% OFF" },
                  { title: "Elf bar Ice King Pro 40k Puffs 50mg Disposable", price: "48.00", oldPrice: "50.00", discount: "4% OFF" },
                  { title: "Elf bar Raya D3 25k Puffs Disposable Vape 50mg", price: "45.00", oldPrice: "50.00", discount: "10% OFF" },
                  { title: "Waka Blade 50000 puffs 50mg Nicotine Adjustable", price: "50.00", oldPrice: "55.00", discount: "9% OFF" },
                ].map((prod, idx) => (
                  <motion.div
                    className="fb-product-card"
                    key={idx}
                    variants={fadeInScale}
                    whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.25 } }}
                  >
                    <div className="fb-img-wrapper">
                      <div className="fb-podium"></div>
                      <Image src="/images/cat_disposables.png" alt={prod.title} fill style={{ objectFit: 'contain', padding: '5px', zIndex: 2 }} />
                    </div>
                    <div className="fb-info">
                      {prod.discount && <div className="fb-discount">{prod.discount}</div>}
                      <h4 className="fb-title">{prod.title}</h4>
                      <div className="fb-price">
                        <span className="current">Dhs. {prod.price}</span>
                        {prod.oldPrice && <span className="old">Dhs. {prod.oldPrice}</span>}
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

        {/* Shop by Flavors Section */}
        <motion.section
          id="flavors"
          className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          variants={staggerContainer}
        >
          {/* Centered Section Header */}
          <motion.div className="flex flex-col items-center mb-10 sm:mb-14 text-center px-2" variants={fadeInUp}>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-[2px] bg-amber-500 rounded-full"></span>
              <span className="font-cinzel text-xs font-bold tracking-[0.25em] text-amber-500 uppercase">TASTE THE EXPERIENCE</span>
              <span className="w-6 h-[2px] bg-amber-500 rounded-full"></span>
            </div>
            <h2 className="font-luxury text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-900 mb-3 sm:mb-4 tracking-tight">Shop by Flavors</h2>
            <div className="flex items-center gap-4 mb-4 sm:mb-5">
              <div className="h-px w-12 sm:w-16 bg-gradient-to-r from-transparent to-[#064e3b]"></div>
              <div className="w-2 h-2 rotate-45 bg-[#064e3b]"></div>
              <div className="h-px w-12 sm:w-16 bg-gradient-to-l from-transparent to-[#064e3b]"></div>
            </div>
            <p className="text-neutral-500 max-w-2xl text-xs sm:text-[15px] leading-relaxed">
              Explore our mouthwatering selection of fruity, icy menthol, rich dessert, and classic tobacco blends crafted for maximum flavor satisfaction.
            </p>
          </motion.div>

          {/* Flavor Grid: 2x2 on Mobile (2 ta 2 ta 4 ta), 4 across on Desktop */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 md:gap-6"
            variants={staggerContainer}
          >
            {displayedFlavors.map((flavor, idx) => (
              <motion.div
                key={idx}
                variants={fadeInScale}
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
                className={`group relative rounded-2xl sm:rounded-3xl p-3 sm:p-5 bg-gradient-to-b ${flavor.bgGradient} border border-neutral-200/80 shadow-[0_4px_15px_rgba(0,0,0,0.05)] ${flavor.glowColor} transition-all duration-500 flex flex-col justify-between overflow-hidden cursor-pointer`}
              >
                {/* Decorative background radial tint */}
                <div
                  className="absolute -right-10 -bottom-10 w-36 h-36 rounded-full blur-3xl opacity-20 pointer-events-none transition-opacity duration-500 group-hover:opacity-40"
                  style={{ backgroundColor: flavor.accentColor }}
                ></div>

                {/* Header badges */}
                <div className="flex items-center justify-between mb-2 z-10 relative">
                  <span className={`text-[8px] sm:text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full shadow-xs ${flavor.badgeBg}`}>
                    {flavor.tag}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-neutral-500 bg-white/80 backdrop-blur-sm border border-neutral-200/70 px-1.5 sm:px-2 py-0.5 rounded-full shadow-xs">
                    {flavor.productCount}+
                  </span>
                </div>

                {/* Image showcase */}
                <div className="relative w-full h-24 sm:h-36 my-1 flex items-center justify-center overflow-hidden">
                  <div className="relative w-20 h-20 sm:w-28 sm:h-28 transform group-hover:scale-110 group-hover:-rotate-2 transition-transform duration-500 ease-out">
                    <Image
                      src={flavor.img}
                      alt={flavor.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.2)]"
                    />
                  </div>
                </div>

                {/* Content & Action */}
                <div className="flex flex-col z-10 relative mt-1 pt-2 border-t border-neutral-200/60">
                  <span className="font-cinzel text-[8px] sm:text-[9px] font-extrabold tracking-[0.15em] text-neutral-400 uppercase mb-0.5">
                    {flavor.category}
                  </span>
                  <h3 className="font-luxury text-xs sm:text-base md:text-lg font-extrabold text-neutral-900 mb-1 group-hover:text-[#064e3b] transition-colors line-clamp-1">
                    {flavor.title}
                  </h3>
                  <p className="text-neutral-500 text-[10px] sm:text-xs leading-relaxed line-clamp-2 mb-2 hidden sm:block">
                    {flavor.desc}
                  </p>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-lg sm:rounded-xl bg-white hover:bg-[#064e3b] text-neutral-800 hover:text-white border border-neutral-200 hover:border-transparent font-bold text-[10px] sm:text-xs flex items-center justify-between transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer group/btn relative overflow-hidden mt-1"
                  >
                    <span className="relative z-10">Explore</span>
                    <ArrowRight size={12} className="relative z-10 transform group-hover/btn:translate-x-1 transition-transform" />
                    <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* View All / Show Less Button */}
          <motion.div className="mt-8 flex justify-center" variants={fadeInUp}>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAllFlavors(!showAllFlavors)}
              className="px-6 py-2.5 sm:px-8 sm:py-3 rounded-full bg-[#064e3b] text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-900/15 hover:bg-[#022c22] transition-all flex items-center gap-2 cursor-pointer group"
            >
              <span>{showAllFlavors ? "Show Less" : `View All (${flavorsData.length})`}</span>
              <ArrowRight size={15} className={`transition-transform duration-300 ${showAllFlavors ? "-rotate-90" : "group-hover:translate-x-1"}`} />
            </motion.button>
          </motion.div>
        </motion.section>

        {/* Ultra-Premium FAQ Section */}
        <motion.section
          className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={staggerContainer}
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
              {[
                { q: "What products does Vape Stall offer?", a: "We offer a wide range of premium disposable vapes, pod systems, e-liquids, and vaping accessories from top global brands." },
                { q: "Are your vape products authentic?", a: "Yes! All our products are 100% authentic and sourced directly from official manufacturers. We guarantee original brands." },
                { q: "Do you offer same-day delivery in Dubai?", a: "Absolutely. We provide fast same-day delivery across Dubai for all orders placed before our daily cutoff time." },
                { q: "What payment methods do you accept?", a: "We accept all major Credit/Debit cards, Apple Pay, and offer Cash on Delivery (COD) for your convenience." },
                { q: "Can I refill a disposable vape?", a: "No, disposable vapes are designed for single-use. Attempting to refill them can be dangerous and damage the device." }
              ].map((faq, idx) => (
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
      <motion.section
        className="relative overflow-hidden bg-[#064e3b] text-white py-12 sm:py-16 md:py-20 mb-0 border-t border-emerald-900"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={staggerContainer}
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
                  Trusted by <span className="text-emerald-400 font-extrabold"><AnimatedCounter end={160000} suffix="+" /></span> Customers
                </p>
                <p className="text-emerald-200/70 text-xs">Verified UAE & GCC buyers</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-black/25 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/10 shadow-sm">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={15} fill="#fbbf24" color="#fbbf24" />)}
              </div>
              <span className="text-white font-black text-base">4.9 / 5</span>
              <span className="text-emerald-200/70 text-xs">(1,200+ reviews)</span>
            </div>
          </motion.div>

          {/* 3 Compact Review Cards */}
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8" variants={staggerContainer}>
            {[
              {
                name: 'John Doe',
                avatar: 'JD',
                role: 'Verified Buyer',
                title: 'Super fast delivery & 100% authentic',
                review: "Best vape store in Dubai! Delivery arrived within hours, and the scratch-off authenticity code checked out directly on the manufacturer's site."
              },
              {
                name: 'Sarah M.',
                avatar: 'SM',
                role: 'Verified Buyer',
                title: 'Genuine products guaranteed',
                review: "I've bought knock-offs from random stores before, but Vape Mart only delivers original factory-sealed products. Truly unmatched service."
              },
              {
                name: 'Alex K.',
                avatar: 'AK',
                role: 'Verified Buyer',
                title: 'Great flavor selection & support',
                review: "Their premium collection is always in stock with fresh batches. Smooth checkout, great customer care, and unbeatable prices."
              }
            ].map((rev, i) => (
              <motion.div
                key={i}
                variants={fadeInScale}
                whileHover={{ y: -4, transition: { duration: 0.25 } }}
                className="bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all duration-300 shadow-lg flex flex-col justify-between"
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
              </motion.div>
            ))}
          </motion.div>

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
      </motion.section>

      {/* Blog Section */}
      <motion.section
        className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8 sm:pb-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={staggerContainer}
      >
        <motion.div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4 sm:gap-6" variants={fadeInUp}>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span className="font-cinzel text-[11px] font-black tracking-[0.25em] text-[#064e3b] uppercase">Blog & Guides</span>
            </div>
            <h2 className="font-luxury text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-neutral-900 tracking-tight">
              Vape Culture <span className="font-luxury text-[#064e3b]">&</span> Insights
            </h2>
            <p className="text-neutral-500 text-xs sm:text-sm md:text-base mt-2 max-w-xl">
              Expert tips, product guides, and the latest trends from the vaping world
            </p>
          </div>
          <motion.a
            href="#"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#064e3b] text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-900/10 hover:bg-[#022c22] transition-colors self-start md:self-end shrink-0 cursor-pointer group"
          >
            <span>View All Articles</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </motion.div>

        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8" variants={staggerContainer}>
          {[
            {
              title: "The Ultimate Guide to Selecting Your First Vape Kit",
              category: "GUIDES",
              readTime: "5 min read",
              date: "Oct 24, 2026",
              excerpt: "Starting your vaping journey can be overwhelming. Learn how to choose the perfect starter kit that suits your lifestyle.",
              image: "/images/blog_1.png"
            },
            {
              title: "Top 5 Disposable Vapes of 2026: Flavor & Longevity",
              category: "REVIEWS",
              readTime: "4 min read",
              date: "Oct 18, 2026",
              excerpt: "We put the newest disposable vapes to the test. Discover which ones offer the best flavor consistency and puff count.",
              image: "/images/blog_2.png"
            },
            {
              title: "Understanding E-Liquid Ratios: PG vs VG Explained",
              category: "EDUCATION",
              readTime: "6 min read",
              date: "Oct 12, 2026",
              excerpt: "Confused about Propylene Glycol and Vegetable Glycerin? We break down the differences and how they affect your vape.",
              image: "/images/blog_3.png"
            }
          ].map((post, i) => (
            <motion.div
              key={i}
              className="bg-white rounded-[24px] sm:rounded-[32px] overflow-hidden border border-neutral-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_45px_rgba(6,78,59,0.12)] transition-all duration-500 group cursor-pointer flex flex-col hover:-translate-y-1"
              variants={fadeInScale}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <div className="h-52 sm:h-60 w-full relative overflow-hidden bg-neutral-900">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-[#022c22]/90 backdrop-blur-md border border-emerald-400/30 text-emerald-300 text-[10px] font-black tracking-widest uppercase px-3.5 py-1.5 rounded-full shadow-md">
                    {post.category}
                  </span>
                </div>
                <div className="absolute top-4 right-4 z-10">
                  <span className="bg-black/50 backdrop-blur-md border border-white/20 text-white/90 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <Clock size={11} className="text-amber-400" /> {post.readTime}
                  </span>
                </div>
              </div>
              <div className="p-5 sm:p-8 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-3 text-neutral-400 text-xs font-medium">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-emerald-600" /> {post.date}
                  </span>
                  <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                    Verified Guide
                  </span>
                </div>
                <h3 className="font-luxury font-extrabold text-lg sm:text-xl text-neutral-900 mb-3 leading-snug group-hover:text-[#064e3b] transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed mb-5 sm:mb-6 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="mt-auto flex items-center gap-2 font-black text-[#064e3b] text-xs sm:text-sm group-hover:gap-3 transition-all pt-3 border-t border-neutral-100">
                  <span>Read Article</span>
                  <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center text-[#064e3b] group-hover:bg-[#064e3b] group-hover:text-white transition-all">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        className="bg-[#022c22] text-white pt-12 sm:pt-16 md:pt-20 pb-24 lg:pb-8 mt-0 rounded-t-[28px] sm:rounded-t-[40px] shadow-2xl relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
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
              &copy; {new Date().getFullYear()} Vape Mart. All Rights Reserved. Designed with <Heart size={10} className="inline text-red-500" fill="currentColor" /> in UAE.
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
        <a href="#" className="flex-1 flex flex-col items-center justify-center gap-1 text-amber-400 py-1.5 px-1 rounded-xl active:scale-95 transition-all text-center no-underline">
          <HomeIcon size={20} className="stroke-[2.2]" />
          <span className="text-[11px] font-bold tracking-tight">Home</span>
        </a>
        <button 
          type="button"
          onClick={() => setIsMobileMenuOpen(true)} 
          className="flex-1 flex flex-col items-center justify-center gap-1 text-emerald-100/75 hover:text-white py-1.5 px-1 rounded-xl active:scale-95 transition-all !bg-transparent !border-0 outline-none cursor-pointer text-center"
        >
          <Layers size={20} className="stroke-[2.2]" />
          <span className="text-[11px] font-semibold tracking-tight">Menu</span>
        </button>
        <button 
          type="button"
          onClick={() => { setIsMobileSearchOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
          className="flex-1 flex flex-col items-center justify-center gap-1 text-emerald-100/75 hover:text-white py-1.5 px-1 rounded-xl active:scale-95 transition-all !bg-transparent !border-0 outline-none cursor-pointer text-center"
        >
          <Search size={20} className="stroke-[2.2]" />
          <span className="text-[11px] font-semibold tracking-tight">Search</span>
        </button>
        <a href="#flavors" className="flex-1 flex flex-col items-center justify-center gap-1 text-emerald-100/75 hover:text-white py-1.5 px-1 rounded-xl active:scale-95 transition-all text-center no-underline">
          <Droplets size={20} className="stroke-[2.2]" />
          <span className="text-[11px] font-semibold tracking-tight">Flavors</span>
        </a>
        <a href="#" className="flex-1 flex flex-col items-center justify-center gap-1 text-emerald-100/75 hover:text-white py-1.5 px-1 rounded-xl active:scale-95 transition-all relative text-center no-underline">
          <div className="relative">
            <ShoppingBag size={20} className="stroke-[2.2]" />
            <span className="absolute -top-1 -right-2 w-4 h-4 bg-amber-400 text-neutral-900 text-[10px] font-black flex items-center justify-center rounded-full shadow-sm">0</span>
          </div>
          <span className="text-[11px] font-semibold tracking-tight">Cart</span>
        </a>
      </nav>
    </main>
  );
}
