"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  ShieldCheck,
  Truck,
  Heart,
  Share2,
  Check,
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  Zap,
  Flame,
  Droplets,
  Wind,
  Layers,
  Battery,
  Lock,
  RotateCcw,
  Headset,
  HelpCircle,
  ChevronDown,
  Info,
  QrCode,
  Shield,
  Clock,
  Plus,
  Minus,
  MessageCircle,
  Eye,
  CheckCircle2
} from "lucide-react";
import { ProductItem, CartItem } from "@/types/product";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { CartDrawer } from "@/components/CartDrawer";

interface ProductDetailViewProps {
  product: ProductItem;
  relatedProducts: ProductItem[];
}

export function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
  // Gallery State
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const currentImage = product.images[selectedImageIdx] || product.primaryImage;
  
  // Variant Selection State
  const [selectedFlavor, setSelectedFlavor] = useState(product.flavors[0]?.id || "");
  const [selectedNicotine, setSelectedNicotine] = useState(product.nicotineOptions[0] || product.nicotineStrength);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [bundleAdded, setBundleAdded] = useState(false);
  
  // Active Navigation Anchor Scroll Spy
  const [activeTab, setActiveTab] = useState("overview");
  
  // Cart Drawer State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  // Anti-Counterfeit Verification Interactive Simulator
  const [scratchCode, setScratchCode] = useState("");
  const [verifyStatus, setVerifyStatus] = useState<"idle" | "success" | "invalid">("idle");
  
  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  
  // Sticky Bottom Bar on Mobile/Desktop
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Free delivery calculation
  const freeDeliveryThreshold = 350;
  const currentTotal = product.price * quantity;
  const remainingForFreeShipping = Math.max(0, freeDeliveryThreshold - currentTotal);
  const freeShippingProgress = Math.min(100, (currentTotal / freeDeliveryThreshold) * 100);

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 550);

      const sections = ["overview", "specs", "flavor-lab", "engineering", "authenticity", "shipping", "reviews", "faqs"];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140 && rect.bottom >= 140) {
            setActiveTab(section);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -110;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleAddToCart = () => {
    const chosenFlavorName = product.flavors.find(f => f.id === selectedFlavor)?.name || product.flavors[0]?.name;
    const newItem: CartItem = {
      id: `${product.id}-${selectedFlavor}-${selectedNicotine}`,
      productId: product.id,
      title: product.title,
      brand: product.brand,
      price: product.price,
      quantity: quantity,
      flavor: chosenFlavorName,
      nicotine: selectedNicotine,
      image: currentImage
    };

    setCartItems(prev => {
      const existing = prev.find(i => i.id === newItem.id);
      if (existing) {
        return prev.map(i => i.id === newItem.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, newItem];
    });

    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems(prev =>
      prev
        .map(item => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter(item => item.quantity > 0)
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (scratchCode.trim().length >= 8) {
      setVerifyStatus("success");
    } else {
      setVerifyStatus("invalid");
    }
  };

  const currentFlavorName = product.flavors.find(f => f.id === selectedFlavor)?.name || product.flavors[0]?.name;

  return (
    <div className="min-h-screen bg-[#ffffff] text-neutral-900 flex flex-col font-sans">
      <Header
        onCartClick={() => setIsCartOpen(true)}
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
      />

      {/* SECTION 1: BREADCRUMBS & REAL-TIME UAE LOGISTICS TICKER */}
      <section className="bg-emerald-950/20 border-b border-emerald-900/10 py-2.5 px-4 sm:px-6">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          {/* Breadcrumb Path */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-neutral-500 font-medium overflow-x-auto no-scrollbar py-0.5">
            <Link href="/" className="hover:text-[#064e3b] transition-colors">Home</Link>
            <ChevronRight size={12} className="text-neutral-400 shrink-0" />
            <Link href="/collections" className="hover:text-[#064e3b] transition-colors">Shop</Link>
            <ChevronRight size={12} className="text-neutral-400 shrink-0" />
            <Link href={`/collections/${product.categorySlug}`} className="hover:text-[#064e3b] transition-colors font-medium">
              {product.category}
            </Link>
            <ChevronRight size={12} className="text-neutral-400 shrink-0" />
            <span className="text-neutral-900 font-bold truncate max-w-[200px] sm:max-w-[320px]">
              {product.title}
            </span>
          </nav>

          {/* UAE Shipping Countdown Pill */}
          <div className="flex items-center gap-2 text-[11px] font-bold text-[#064e3b] bg-emerald-100/80 px-3.5 py-1 rounded-full border border-emerald-300 shadow-xs">
            <Clock size={13} className="text-amber-600 animate-pulse" />
            <span>Order within 1 hr 45 min for Same-Day Dubai Delivery (2-3 hrs)</span>
          </div>
        </div>
      </section>

      {/* IN-PAGE UX STICKY JUMP BAR (APPLE/LUXURY E-COMMERCE ERGONOMIC NAV) */}
      <nav aria-label="Product Sections Navigation" className="sticky top-[58px] sm:top-[66px] z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200/90 shadow-xs py-2 px-4 sm:px-6 transition-all">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: "overview", label: "Overview" },
              { id: "specs", label: "Hardware Specs" },
              { id: "flavor-lab", label: "Flavor Profile" },
              { id: "engineering", label: "Engineering" },
              { id: "authenticity", label: "Authenticity" },
              { id: "shipping", label: "UAE Delivery" },
              { id: "reviews", label: `Reviews (${product.rating}★)` },
              { id: "faqs", label: "FAQs" }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => scrollToSection(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#064e3b] text-white shadow-xs"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3 shrink-0">
            <span className="font-black text-sm text-[#064e3b]">AED {product.price.toFixed(2)}</span>
            <button
              type="button"
              onClick={handleAddToCart}
              className="px-4 py-1.5 rounded-full bg-[#064e3b] hover:bg-[#022c22] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
            >
              <ShoppingBag size={13} />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </nav>

      {/* SECTION 2: INTERACTIVE HERO PRESENTATION & PURCHASE SUITE */}
      <section id="overview" className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: ERGONOMIC GALLERY */}
          <div className="lg:col-span-6 flex flex-col-reverse sm:flex-row gap-4 items-start">
            
            {/* Vertical/Horizontal Thumbnails */}
            <div className="flex sm:flex-col gap-2.5 w-full sm:w-20 overflow-x-auto sm:overflow-visible shrink-0 pb-2 sm:pb-0">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 p-1.5 transition-all cursor-pointer relative bg-neutral-50 flex items-center justify-center shrink-0 ${
                    selectedImageIdx === idx
                      ? "border-[#064e3b] shadow-md ring-2 ring-emerald-500/20 scale-102"
                      : "border-neutral-200 hover:border-emerald-300 opacity-70 hover:opacity-100"
                  }`}
                  aria-label={`Show product image ${idx + 1}`}
                >
                  <Image
                    src={img}
                    alt={`${product.title} angle ${idx + 1}`}
                    fill
                    className="object-contain p-1"
                  />
                </button>
              ))}
            </div>

            {/* Main Stage */}
            <div className="flex-1 w-full bg-gradient-to-b from-neutral-50 via-white to-neutral-100/70 border border-neutral-200/90 rounded-3xl p-6 sm:p-10 relative flex items-center justify-center min-h-[380px] sm:min-h-[500px] overflow-hidden group shadow-[0_4px_25px_rgba(0,0,0,0.04)]">
              {/* Badges Overlay */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                {product.badge && (
                  <span className="bg-red-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                    {product.badge}
                  </span>
                )}
                <span className="bg-[#064e3b] text-white text-[9.5px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <ShieldCheck size={12} className="text-amber-400" />
                  100% Original UAE Import
                </span>
              </div>

              {/* Action Buttons: Wishlist & Share */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`w-10 h-10 rounded-full border border-neutral-200/80 bg-white flex items-center justify-center transition-all shadow-sm ${
                    isWishlisted ? "text-red-500 bg-red-50 border-red-200" : "text-neutral-500 hover:text-red-500"
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart size={18} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: product.title, url: window.location.href });
                    }
                  }}
                  className="w-10 h-10 rounded-full border border-neutral-200/80 bg-white flex items-center justify-center text-neutral-500 hover:text-[#064e3b] transition-all shadow-sm"
                  aria-label="Share"
                >
                  <Share2 size={16} />
                </button>
              </div>

              {/* Prev / Next Image Quick Buttons */}
              {product.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setSelectedImageIdx(prev => (prev === 0 ? product.images.length - 1 : prev - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-neutral-700 border border-neutral-200 flex items-center justify-center shadow-md transition-all cursor-pointer opacity-70 group-hover:opacity-100"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedImageIdx(prev => (prev === product.images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-neutral-700 border border-neutral-200 flex items-center justify-center shadow-md transition-all cursor-pointer opacity-70 group-hover:opacity-100"
                    aria-label="Next image"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}

              {/* Main Product Image with subtle scale */}
              <div className="relative w-full h-[320px] sm:h-[420px] flex items-center justify-center">
                <Image
                  src={currentImage}
                  alt={product.title}
                  fill
                  priority
                  className="object-contain group-hover:scale-106 transition-transform duration-500"
                />
              </div>

              {/* Live Warehouse Stock Ribbon */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 border border-neutral-200/80 flex items-center justify-between text-[11px] text-neutral-600 shadow-xs">
                <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  UAE Stock: <span className="text-emerald-700">{product.stockQuantity} Units Left</span> (Fast Dispatch)
                </span>
                <span className="text-neutral-500 font-mono font-bold">SKU: {product.sku}</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: HIGH-CONVERSION DECISION ENGINE */}
          <div className="lg:col-span-6 flex flex-col justify-start">
            {/* Brand Chip */}
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-neutral-900 text-amber-300 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md">
                {product.brand}
              </span>
              <span className="text-xs text-neutral-500 font-bold">• {product.category}</span>
            </div>

            {/* Product Title */}
            <h1 className="font-luxury text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight leading-tight mb-2">
              {product.title}
            </h1>

            {/* Subtitle */}
            {product.subtitle && (
              <p className="text-xs sm:text-sm text-neutral-600 font-medium mb-3">
                {product.subtitle}
              </p>
            )}

            {/* Ratings & Fast Status */}
            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-neutral-200/80">
              <button
                type="button"
                onClick={() => scrollToSection("reviews")}
                className="flex items-center gap-1 text-amber-400 hover:opacity-80 transition-opacity cursor-pointer"
              >
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={15} fill="#fbbf24" color="#fbbf24" />
                ))}
                <span className="text-xs font-black text-neutral-900 ml-1.5">{product.rating}</span>
                <span className="text-xs text-neutral-500 ml-1 underline">({product.revs} reviews)</span>
              </button>
              <span className="text-xs text-neutral-300">|</span>
              <span className="inline-flex items-center gap-1 text-xs text-emerald-800 font-bold bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                <Check size={12} strokeWidth={3} /> In Stock in UAE
              </span>
            </div>

            {/* Price Box */}
            <div className="bg-gradient-to-r from-emerald-50/90 to-neutral-50 border border-emerald-200 rounded-3xl p-4 sm:p-5 mb-5 flex items-center justify-between shadow-xs">
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">
                    AED {product.price.toFixed(2)}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-base sm:text-lg text-neutral-400 line-through font-semibold">
                      AED {product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-emerald-800 font-bold mt-1 flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  <span>All Taxes & UAE VAT Included • Same-Day Dispatch</span>
                </p>
              </div>

              {product.originalPrice > product.price && (
                <div className="bg-[#064e3b] text-white text-xs font-black px-3.5 py-2 rounded-2xl shadow-sm text-center">
                  SAVE {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                </div>
              )}
            </div>

            {/* Flavor Variant Selector (Luxury Swatches with Taste Tag) */}
            {product.flavors && product.flavors.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-black text-neutral-900 uppercase tracking-wider">
                    Flavor Profile:
                  </span>
                  <span className="text-xs font-bold text-[#064e3b] bg-emerald-100/90 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                    {currentFlavorName}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {product.flavors.map((flavor) => {
                    const isSelected = selectedFlavor === flavor.id;
                    return (
                      <button
                        key={flavor.id}
                        type="button"
                        onClick={() => setSelectedFlavor(flavor.id)}
                        className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer text-left ${
                          isSelected
                            ? "border-[#064e3b] bg-emerald-50/90 text-[#064e3b] ring-2 ring-emerald-600/20 shadow-sm"
                            : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300 hover:bg-neutral-50/60"
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full shrink-0 shadow-xs ring-1 ring-black/10"
                          style={{ backgroundColor: flavor.color }}
                        />
                        <span className="truncate flex-1">{flavor.name}</span>
                        {isSelected && <Check size={14} className="text-[#064e3b] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Nicotine Strength Selector */}
            {product.nicotineOptions && product.nicotineOptions.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-neutral-900 uppercase tracking-wider">
                    Nicotine Strength:
                  </span>
                  <span className="text-xs font-bold text-neutral-500">Official UAE Formulation</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.nicotineOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSelectedNicotine(opt)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedNicotine === opt
                          ? "bg-[#064e3b] text-white border-[#064e3b] shadow-sm"
                          : "bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Free Shipping Progress Indicator (User-friendly incentive) */}
            <div className="mb-5 p-3 bg-neutral-50 border border-neutral-200/90 rounded-2xl">
              <div className="flex justify-between text-[11px] font-bold text-neutral-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <Truck size={13} className="text-[#064e3b]" />
                  {remainingForFreeShipping > 0
                    ? `Add AED ${remainingForFreeShipping.toFixed(2)} more for FREE Express UAE Delivery`
                    : "🎉 You qualified for FREE UAE Express Delivery!"}
                </span>
                <span className="text-[#064e3b]">{Math.round(freeShippingProgress)}%</span>
              </div>
              <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#064e3b] to-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>

            {/* Action Buttons: Quantity, Add to Cart, Express COD, WhatsApp Order */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                {/* Quantity Stepper */}
                <div className="flex items-center border border-neutral-300 rounded-2xl bg-white p-1 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-neutral-900">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-9 h-9 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus size={15} />
                  </button>
                </div>

                {/* Add to Cart CTA */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 py-3.5 px-6 rounded-2xl bg-[#064e3b] hover:bg-[#022c22] text-white font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <ShoppingBag size={18} />
                  <span>Add to Cart (AED {(product.price * quantity).toFixed(2)})</span>
                </button>
              </div>

              {/* Express Buy Now (Cash on Delivery) */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs sm:text-sm tracking-wide transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer uppercase active:scale-98"
              >
                <Truck size={18} />
                <span>Express Buy Now (Cash on Delivery)</span>
              </button>

              {/* WhatsApp 1-Click Order (UAE Favorite UX) */}
              <a
                href={`https://wa.me/971551688299?text=${encodeURIComponent(
                  `Hello Vape Mart UAE, I want to order ${quantity}x ${product.title} (${currentFlavorName}, ${selectedNicotine}) for AED ${(product.price * quantity).toFixed(2)}. Please confirm delivery to Dubai.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-[#064e3b] border border-emerald-600/30 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer text-center no-underline"
              >
                <MessageCircle size={16} className="text-emerald-700" />
                <span>Quick Order via WhatsApp (+971 55 168 8299)</span>
              </a>
            </div>

            {/* Trust Assurance Grid */}
            <div className="grid grid-cols-4 gap-2 py-3 px-3 bg-neutral-50 rounded-2xl border border-neutral-200/90 text-center">
              <div className="flex flex-col items-center justify-center p-1">
                <Truck size={17} className="text-[#064e3b] mb-1" />
                <span className="text-[10px] font-bold text-neutral-900">2-3h Dubai</span>
                <span className="text-[9px] text-neutral-500">Express Van</span>
              </div>
              <div className="flex flex-col items-center justify-center p-1 border-l border-neutral-200">
                <ShieldCheck size={17} className="text-[#064e3b] mb-1" />
                <span className="text-[10px] font-bold text-neutral-900">ESMA Stamp</span>
                <span className="text-[9px] text-neutral-500">100% Original</span>
              </div>
              <div className="flex flex-col items-center justify-center p-1 border-l border-neutral-200">
                <Headset size={17} className="text-[#064e3b] mb-1" />
                <span className="text-[10px] font-bold text-neutral-900">COD Ready</span>
                <span className="text-[9px] text-neutral-500">Pay on Arrival</span>
              </div>
              <div className="flex flex-col items-center justify-center p-1 border-l border-neutral-200">
                <RotateCcw size={17} className="text-[#064e3b] mb-1" />
                <span className="text-[10px] font-bold text-neutral-900">24h Replace</span>
                <span className="text-[9px] text-neutral-500">DOA Guarantee</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 3: HARDWARE & TECHNICAL SPECIFICATIONS MATRIX */}
      <section id="specs" className="bg-neutral-50/70 border-y border-neutral-200/70 py-10 sm:py-14 scroll-mt-28">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <span className="font-cinzel text-xs font-bold text-[#064e3b] uppercase tracking-widest">
              HARDWARE SPECIFICATIONS
            </span>
            <h2 className="font-luxury text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-1">
              Engineering & Performance Metrics
            </h2>
            <div className="flex items-center justify-center gap-3 my-2.5">
              <div className="h-px w-12 bg-[#064e3b]"></div>
              <div className="w-1.5 h-1.5 rotate-45 bg-amber-500"></div>
              <div className="h-px w-12 bg-[#064e3b]"></div>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600">
              Laboratory-tested hardware specifications adhering to international safety and UAE ESMA guidelines.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {product.specifications.map((spec, i) => (
              <div
                key={i}
                className="bg-white border border-neutral-200/80 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-emerald-300 transition-colors"
              >
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                  {spec.label}
                </span>
                <span className="text-sm sm:text-base font-extrabold text-neutral-900 tracking-tight block">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: SENSORY FLAVOR PROFILE & AROMA GAUGES */}
      <section id="flavor-lab" className="py-12 sm:py-16 max-w-[1400px] mx-auto px-4 sm:px-6 scroll-mt-28">
        <div className="bg-gradient-to-br from-[#064e3b] via-[#043e2e] to-[#022c22] rounded-[32px] p-6 sm:p-10 md:p-12 text-white shadow-xl relative overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-400/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Description */}
            <div className="lg:col-span-5">
              <span className="font-cinzel text-xs font-bold text-amber-300 uppercase tracking-[0.2em] block mb-2">
                FLAVOR SCIENCE LAB
              </span>
              <h2 className="font-luxury text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-4">
                Sensory Tasting Notes & Vapor Dynamics
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed mb-6 font-medium">
                Every blend is calibrated with pharmaceutical-grade aromatic concentrates. Our organoleptic analysis guarantees a stable palate without sweet-fatigue or coil burning.
              </p>

              {/* Formulation Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2 rounded-xl text-xs font-semibold text-emerald-200">
                <Droplets size={16} className="text-amber-400" />
                <span>Formulation: {product.sensoryProfile.ratio || "Balanced Nicotine Formulation"}</span>
              </div>
            </div>

            {/* Right: Sensory Gauges & Aroma Triad */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Gauges Box */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/15 space-y-4">
                
                {/* Sweetness */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-emerald-100">Sweetness Intensity</span>
                    <span className="text-amber-300">{product.sensoryProfile.sweetness} / 5</span>
                  </div>
                  <div className="h-2.5 bg-black/30 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full transition-all duration-1000"
                      style={{ width: `${(product.sensoryProfile.sweetness / 5) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Arctic Cooling */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-emerald-100">Arctic Cooling / Menthol Chill</span>
                    <span className="text-cyan-300">{product.sensoryProfile.cooling} / 5</span>
                  </div>
                  <div className="h-2.5 bg-black/30 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full transition-all duration-1000"
                      style={{ width: `${(product.sensoryProfile.cooling / 5) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Throat Hit */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-emerald-100">Throat Hit Satisfaction</span>
                    <span className="text-rose-300">{product.sensoryProfile.throatHit} / 5</span>
                  </div>
                  <div className="h-2.5 bg-black/30 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-rose-400 to-red-500 rounded-full transition-all duration-1000"
                      style={{ width: `${(product.sensoryProfile.throatHit / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Three Aroma Note Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block mb-1">
                    TOP NOTE (INHALE)
                  </span>
                  <p className="text-xs font-bold text-white">{product.sensoryProfile.topNote}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest block mb-1">
                    HEART NOTE (BODY)
                  </span>
                  <p className="text-xs font-bold text-white">{product.sensoryProfile.heartNote}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-widest block mb-1">
                    BASE NOTE (EXHALE)
                  </span>
                  <p className="text-xs font-bold text-white">{product.sensoryProfile.baseNote}</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: ADVANCED DEVICE ENGINEERING HIGHLIGHTS */}
      <section id="engineering" className="py-12 sm:py-16 max-w-[1400px] mx-auto px-4 sm:px-6 scroll-mt-28">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="font-cinzel text-xs font-bold text-[#064e3b] uppercase tracking-widest">
            PATENTED ARCHITECTURE
          </span>
          <h2 className="font-luxury text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-900 mt-1">
            Why It Delivers a Superior Draw
          </h2>
          <div className="flex items-center justify-center gap-3 my-2.5">
            <div className="h-px w-12 bg-[#064e3b]"></div>
            <div className="w-1.5 h-1.5 rotate-45 bg-amber-500"></div>
            <div className="h-px w-12 bg-[#064e3b]"></div>
          </div>
          <p className="text-xs sm:text-sm text-neutral-600">
            Constructed with food-grade PCTG polymers and aerospace-grade chassis alloys for heat dissipation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {product.highlights.map((hl, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#064e3b] group-hover:bg-[#064e3b] group-hover:text-white transition-colors flex items-center justify-center mb-4">
                  {idx === 0 && <Flame size={22} />}
                  {idx === 1 && <Zap size={22} />}
                  {idx === 2 && <Layers size={22} />}
                  {idx === 3 && <Wind size={22} />}
                </div>
                <h3 className="font-bold text-base text-neutral-900 mb-2">{hl.title}</h3>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">{hl.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] font-bold text-[#064e3b]">
                <span>Verified Spec</span>
                <Check size={14} className="text-emerald-600" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6: UAE ESMA AUTHENTICITY & ANTI-COUNTERFEIT VERIFICATION PROTOCOL */}
      <section id="authenticity" className="bg-emerald-950/30 border-y border-emerald-900/20 py-12 sm:py-16 scroll-mt-28">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Guide Text */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 bg-emerald-900/40 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold mb-3 border border-emerald-700/50">
                <ShieldCheck size={14} className="text-amber-400" />
                ANTI-COUNTERFEIT PROTECTION SYSTEM
              </div>
              <h2 className="font-luxury text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-900 mb-3">
                100% Genuine Guaranteed or 200% Refund
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6">
                The UAE market is flooded with unauthorized replica vapes. Vape Mart imports directly from manufacturer cleanrooms. Every single box includes an ESMA UAE Digital Tax Stamp and a scratch-off verification code.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#064e3b] font-black text-xs flex items-center justify-center mb-2">1</span>
                  <h4 className="text-xs font-bold text-neutral-900 mb-1">Locate Security Label</h4>
                  <p className="text-[11px] text-neutral-500">Find the silver holographic sticker on the outer box.</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#064e3b] font-black text-xs flex items-center justify-center mb-2">2</span>
                  <h4 className="text-xs font-bold text-neutral-900 mb-1">Scratch To Reveal</h4>
                  <p className="text-[11px] text-neutral-500">Gently scratch the silver coating to reveal the 16-digit code.</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#064e3b] font-black text-xs flex items-center justify-center mb-2">3</span>
                  <h4 className="text-xs font-bold text-neutral-900 mb-1">Scan or Test Below</h4>
                  <p className="text-[11px] text-neutral-500">Instant database validation verifies official production batch.</p>
                </div>
              </div>
            </div>

            {/* Interactive Scratch Code Verification Simulator */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <QrCode size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-neutral-900">Live Authenticity Validator</h3>
                  <p className="text-[11px] text-neutral-500">Enter your box security code to verify now</p>
                </div>
              </div>

              <form onSubmit={handleVerify} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider block mb-1">
                    Security Code / Serial:
                  </label>
                  <input
                    type="text"
                    value={scratchCode}
                    onChange={(e) => setScratchCode(e.target.value)}
                    placeholder="e.g. UAE-8492-VM91-2026"
                    className="w-full h-11 px-4 rounded-xl border border-neutral-300 text-sm font-mono text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#064e3b] focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#064e3b] hover:bg-[#022c22] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Verify Authenticity
                </button>
              </form>

              {verifyStatus === "success" && (
                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900 font-bold">
                  <Check size={18} className="text-emerald-600 shrink-0" />
                  <span>Verified Genuine Product! Batch origin approved for UAE distribution.</span>
                </div>
              )}

              {verifyStatus === "invalid" && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center gap-2.5 text-xs text-amber-900 font-medium">
                  <Info size={18} className="text-amber-600 shrink-0" />
                  <span>Please enter at least 8 alphanumeric characters from your product packaging.</span>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 7: UAE EXPRESS SHIPPING & COURIER SCHEDULE */}
      <section id="shipping" className="py-12 sm:py-16 max-w-[1400px] mx-auto px-4 sm:px-6 scroll-mt-28">
        <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 sm:p-10 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="font-cinzel text-xs font-bold text-[#064e3b] uppercase tracking-widest">
              NATIONWIDE LOGISTICS
            </span>
            <h2 className="font-luxury text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-1">
              UAE Express Delivery Schedules
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mt-2">
              Temperature-controlled dispatched parcels ensure zero flavor degradation in the Gulf climate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-5 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#064e3b] flex items-center justify-center mx-auto mb-3 font-black text-sm">
                2-3h
              </div>
              <h3 className="font-bold text-sm text-neutral-900 mb-1">Dubai Express VIP</h3>
              <p className="text-xs text-neutral-600 mb-3">Downtown, Marina, JBR, Business Bay, Deira, Palm Jumeirah</p>
              <span className="inline-block bg-white text-[#064e3b] text-[11px] font-black px-2.5 py-1 rounded-full border border-emerald-200">
                2 to 3 Hours from Dispatch
              </span>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-3 font-black text-sm">
                Same Day
              </div>
              <h3 className="font-bold text-sm text-neutral-900 mb-1">Abu Dhabi & Sharjah</h3>
              <p className="text-xs text-neutral-600 mb-3">Orders placed before 5:00 PM delivered same evening</p>
              <span className="inline-block bg-white text-neutral-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-neutral-200">
                Same Evening Delivery
              </span>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 text-center">
              <div className="w-12 h-12 rounded-full bg-neutral-200 text-neutral-800 flex items-center justify-center mx-auto mb-3 font-black text-sm">
                24h
              </div>
              <h3 className="font-bold text-sm text-neutral-900 mb-1">Ajman, RAK & Fujairah</h3>
              <p className="text-xs text-neutral-600 mb-3">Secure courier dispatch across all Northern Emirates</p>
              <span className="inline-block bg-white text-neutral-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-neutral-200">
                Next-Day Guaranteed
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: FREQUENTLY BOUGHT TOGETHER / BUNDLE UPSELL */}
      {product.bundleUpsell && (
        <section className="py-10 max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-r from-amber-50/70 via-emerald-50/70 to-amber-50/70 border border-amber-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <span className="bg-amber-500 text-neutral-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                  EXCLUSIVE BUNDLE DEAL
                </span>
                <h3 className="font-luxury text-xl sm:text-2xl font-bold text-neutral-900 mt-1">
                  {product.bundleUpsell.title}
                </h3>
              </div>
              <div className="text-left md:text-right">
                <div className="text-xl sm:text-2xl font-black text-neutral-900">
                  Bundle Price: AED {product.bundleUpsell.bundlePrice.toFixed(2)}
                </div>
                <span className="text-xs text-emerald-700 font-bold">
                  You Save AED {product.bundleUpsell.savings.toFixed(2)} with 1-Click
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {product.bundleUpsell.bundleItems.map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-neutral-200/80 flex items-center gap-3">
                  <div className="w-14 h-14 relative shrink-0 bg-neutral-50 rounded-xl p-1">
                    <Image src={item.img} alt={item.title} fill className="object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-neutral-900 truncate">{item.title}</h4>
                    <span className="text-xs font-extrabold text-[#064e3b]">AED {item.price.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setBundleAdded(true);
                handleAddToCart();
                setTimeout(() => setBundleAdded(false), 2000);
              }}
              className="w-full sm:w-auto px-8 py-3 bg-[#064e3b] hover:bg-[#022c22] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <ShoppingBag size={16} />
              <span>{bundleAdded ? "Bundle Added to Cart!" : "Add Complete 3-Piece Bundle to Cart"}</span>
            </button>
          </div>
        </section>
      )}

      {/* SECTION 9: STEP-BY-STEP USAGE & BATTERY SAFETY GUIDE */}
      <section className="py-12 sm:py-16 max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="font-cinzel text-xs font-bold text-[#064e3b] uppercase tracking-widest">
            OPERATING INSTRUCTIONS
          </span>
          <h2 className="font-luxury text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-1">
            How to Use & Battery Care Guidelines
          </h2>
          <div className="flex items-center justify-center gap-3 my-2.5">
            <div className="h-px w-12 bg-[#064e3b]"></div>
            <div className="w-1.5 h-1.5 rotate-45 bg-amber-500"></div>
            <div className="h-px w-12 bg-[#064e3b]"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#064e3b] font-black text-xs flex items-center justify-center mb-3">
              01
            </div>
            <h4 className="font-bold text-sm text-neutral-900 mb-1.5">Unseal Silicone Plugs</h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Remove the top silicone hygiene mouthpiece cover and the bottom airflow sticker seal before inhaling.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#064e3b] font-black text-xs flex items-center justify-center mb-3">
              02
            </div>
            <h4 className="font-bold text-sm text-neutral-900 mb-1.5">Auto Draw Activation</h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Take steady, gentle draws. The pneumatic sensor activates the mesh heating coil within milliseconds.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#064e3b] font-black text-xs flex items-center justify-center mb-3">
              03
            </div>
            <h4 className="font-bold text-sm text-neutral-900 mb-1.5">Safe 5V/1A Charging</h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Use a standard 5V/1A USB port or laptop. Avoid smartphone ultra-fast chargers (65W+) to protect battery cell.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#064e3b] font-black text-xs flex items-center justify-center mb-3">
              04
            </div>
            <h4 className="font-bold text-sm text-neutral-900 mb-1.5">Eco Recycling In UAE</h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              When e-liquid is depleted, drop old devices at our designated Dubai recycling return boxes for AED 5 discount.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 10: VERIFIED CUSTOMER REVIEWS & RATING DISTRIBUTION */}
      <section id="reviews" className="bg-neutral-50/70 border-y border-neutral-200/70 py-12 sm:py-16 scroll-mt-28">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Rating Summary Card */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm">
              <span className="font-cinzel text-xs font-bold text-[#064e3b] uppercase tracking-widest block mb-1">
                COMMUNITY FEEDBACK
              </span>
              <h3 className="font-luxury text-2xl font-extrabold text-neutral-900 mb-4">
                Overall Customer Rating
              </h3>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-5xl font-black text-neutral-900">{product.rating}</span>
                <div>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={16} fill="#fbbf24" color="#fbbf24" />
                    ))}
                  </div>
                  <span className="text-xs text-neutral-500 font-medium">Based on {product.revs} reviews</span>
                </div>
              </div>

              {/* Star Distribution Bars */}
              <div className="space-y-2 mb-6">
                {[
                  { star: "5 Star", pct: 92 },
                  { star: "4 Star", pct: 6 },
                  { star: "3 Star", pct: 2 },
                  { star: "2 Star", pct: 0 },
                  { star: "1 Star", pct: 0 }
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <span className="w-12 text-neutral-600 font-semibold">{row.star}</span>
                    <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${row.pct}%` }} />
                    </div>
                    <span className="w-8 text-neutral-400 text-right">{row.pct}%</span>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#064e3b] shrink-0" />
                <span>100% Verified UAE Buyer Reviews Only</span>
              </div>
            </div>

            {/* Individual Review Cards */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                <h4 className="font-bold text-base text-neutral-900">Recent Customer Reviews</h4>
                <span className="text-xs text-neutral-500">Showing top verified reviews</span>
              </div>

              {product.reviews.map((rev) => (
                <div key={rev.id} className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#064e3b] text-white font-bold text-xs flex items-center justify-center">
                        {rev.author.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-neutral-900">{rev.author}</span>
                          {rev.verified && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded-full">
                              <Check size={10} strokeWidth={3} /> Verified
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-neutral-400">{rev.location}</span>
                      </div>
                    </div>
                    <span className="text-xs text-neutral-400">{rev.date}</span>
                  </div>

                  <div className="flex items-center gap-1 text-amber-400 mb-2">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} size={13} fill="#fbbf24" color="#fbbf24" />
                    ))}
                  </div>

                  <h5 className="font-bold text-xs sm:text-sm text-neutral-900 mb-1">{rev.title}</h5>
                  <p className="text-xs text-neutral-600 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 11: FREQUENTLY ASKED QUESTIONS (FAQ ACCORDION) */}
      <section id="faqs" className="py-12 sm:py-16 max-w-[1000px] mx-auto px-4 sm:px-6 w-full scroll-mt-28">
        <div className="text-center mb-10">
          <span className="font-cinzel text-xs font-bold text-[#064e3b] uppercase tracking-widest">
            COMMON INQUIRIES
          </span>
          <h2 className="font-luxury text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-1">
            Frequently Asked Questions
          </h2>
          <div className="flex items-center justify-center gap-3 my-2.5">
            <div className="h-px w-12 bg-[#064e3b]"></div>
            <div className="w-1.5 h-1.5 rotate-45 bg-amber-500"></div>
            <div className="h-px w-12 bg-[#064e3b]"></div>
          </div>
        </div>

        <div className="space-y-3">
          {product.faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-neutral-200 rounded-2xl bg-white overflow-hidden transition-all shadow-xs"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-bold text-sm sm:text-base text-neutral-900 hover:text-[#064e3b] transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={`text-neutral-400 shrink-0 transition-transform duration-300 ${
                    openFaq === idx ? "rotate-180 text-[#064e3b]" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 pt-3">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 12: RELATED & RECOMMENDED PRODUCTS CAROUSEL */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="bg-neutral-50/70 border-t border-neutral-200/70 py-12 sm:py-16">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="text-center mb-8">
              <span className="font-cinzel text-xs font-bold text-[#064e3b] uppercase tracking-widest">
                YOU MAY ALSO LIKE
              </span>
              <h2 className="font-luxury text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-1">
                Complementary Devices & Alternatives
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  className="bg-white rounded-2xl border border-neutral-200/80 p-3 sm:p-4 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <Link href={`/product/${rel.slug}`} className="block relative aspect-square w-full mb-3 p-2 bg-neutral-50/50 rounded-xl">
                    <Image src={rel.primaryImage} alt={rel.title} fill className="object-contain p-2 hover:scale-105 transition-transform" />
                  </Link>

                  <div>
                    <span className="bg-neutral-900 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded">
                      {rel.brand}
                    </span>
                    <Link
                      href={`/product/${rel.slug}`}
                      className="font-bold text-xs sm:text-sm text-neutral-900 hover:text-[#064e3b] transition-colors line-clamp-2 mt-1 mb-2 block"
                    >
                      {rel.title}
                    </Link>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                    <span className="font-black text-sm text-neutral-900">AED {rel.price.toFixed(2)}</span>
                    <Link
                      href={`/product/${rel.slug}`}
                      className="px-3 py-1.5 bg-[#064e3b] text-white text-[11px] font-bold rounded-lg hover:bg-[#022c22] transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FLOATING STICKY MOBILE/DESKTOP PURCHASE BAR */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-neutral-200/90 shadow-[0_-10px_35px_rgba(0,0,0,0.18)] p-3 lg:py-3.5 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          >
            <div className="max-w-[1400px] mx-auto px-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 relative shrink-0 bg-neutral-100 rounded-lg p-1 hidden sm:block">
                  <Image src={currentImage} alt={product.title} fill className="object-contain" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-neutral-900 truncate max-w-[180px] sm:max-w-md">
                    {product.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm sm:text-base text-[#064e3b]">
                      AED {product.price.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-neutral-500 font-medium hidden sm:inline">
                      • {currentFlavorName}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <a
                  href={`https://wa.me/971551688299?text=${encodeURIComponent(
                    `Hello Vape Mart UAE, I want to order ${product.title} (${currentFlavorName}, ${selectedNicotine}) for AED ${product.price.toFixed(2)}. Please confirm delivery.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 sm:px-4 py-2.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-[#064e3b] border border-emerald-600/30 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95 no-underline"
                  title="Order via WhatsApp"
                >
                  <MessageCircle size={15} className="text-emerald-700" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="px-5 sm:px-6 py-2.5 bg-[#064e3b] hover:bg-[#022c22] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5 whitespace-nowrap active:scale-95"
                >
                  <ShoppingBag size={15} />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REUSABLE CART DRAWER */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={() => setCartItems([])}
      />

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
