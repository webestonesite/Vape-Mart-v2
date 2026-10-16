"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Star,
  Heart,
  ShoppingBag,
  Minus,
  Plus,
  Check,
  ShieldCheck,
  Truck,
  BadgeCheck,
  MessageCircle,
  Share2,
  Zap,
  ArrowRight,
  Link2,
  Phone,
  Clock,
  Flame,
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

const WHATSAPP_LINK = "https://wa.me/971551688299?text=Hi%20Vape%20Mart!%20I%20have%20a%20question%20about%20a%20product.";
const WHATSAPP_PHONE = "+971 55 168 8299";

function formatAED(n: number): string {
  return `AED ${n.toFixed(2)}`;
}

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-neutral-200 text-neutral-200"} />
      ))}
    </span>
  );
}

export function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
  const galleryImages = product.images.length > 0 ? product.images : [product.primaryImage];
  const [imgIdx, setImgIdx] = useState(0);
  const [flavorId, setFlavorId] = useState("");
  const [nicotine, setNicotine] = useState("");
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"desc" | "ship">("desc");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showSticky, setShowSticky] = useState(false);
  const [copied, setCopied] = useState(false);
  const [wished, setWished] = useState(false);
  const [flavorDropOpen, setFlavorDropOpen] = useState(false);
  const [nicotineDropOpen, setNicotineDropOpen] = useState(false);
  const [showAllFlavors, setShowAllFlavors] = useState(false);
  const [relatedWished, setRelatedWished] = useState<Set<string>>(new Set());
  const flavorDropRef = useRef<HTMLDivElement>(null);
  const nicotineDropRef = useRef<HTMLDivElement>(null);
  const reviewTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (flavorDropRef.current && !flavorDropRef.current.contains(e.target as Node)) setFlavorDropOpen(false);
      if (nicotineDropRef.current && !nicotineDropRef.current.contains(e.target as Node)) setNicotineDropOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const buyBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const buyBottom = buyBoxRef.current ? buyBoxRef.current.offsetTop + buyBoxRef.current.offsetHeight : 700;
      setShowSticky(y > buyBottom && !isCartOpen);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isCartOpen]);

  const discount = product.originalPrice > product.price ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
  const total = product.price * qty;

  const addToCart = (openDrawer = true) => {
    if (product.flavors.length > 0 && !flavorId) { setFlavorDropOpen(true); setNicotineDropOpen(false); flavorDropRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    if (product.nicotineOptions.length > 1 && !nicotine) { setNicotineDropOpen(true); setFlavorDropOpen(false); nicotineDropRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    const flavorName = product.flavors.find((f) => f.id === flavorId)?.name;
    const newItem: CartItem = {
      id: `${product.id}-${flavorId || "std"}-${nicotine || "std"}`,
      productId: product.id,
      title: product.title,
      brand: product.brand,
      price: product.price,
      image: product.primaryImage,
      quantity: qty,
      flavor: flavorName,
      nicotine: nicotine || undefined,
    };
    setCartItems((prev) => {
      const i = prev.findIndex((x) => x.id === newItem.id);
      if (i > -1) { const c = [...prev]; c[i].quantity += qty; return c; }
      return [...prev, newItem];
    });
    if (openDrawer) setIsCartOpen(true);
  };

  const buyNow = () => {
    if (product.flavors.length > 0 && !flavorId) { setFlavorDropOpen(true); flavorDropRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    if (product.nicotineOptions.length > 1 && !nicotine) { setNicotineDropOpen(true); nicotineDropRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    addToCart(true);
  };

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); } catch { /* noop */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const keySpecs = useMemo(() => [
    { label: "BRAND", value: product.brand },
    { label: "PUFF COUNT", value: product.puffs ? `${product.puffs.toLocaleString()} Puffs` : product.puffRange ? `${product.puffRange} Puffs` : "—" },
    { label: "NICOTINE", value: nicotine || product.nicotineStrength },
    { label: "E-LIQUID", value: product.eLiquidCapacity || "—" },
    { label: "BATTERY", value: product.batteryCapacity || "—" },
    { label: "CHARGING", value: product.chargingType || "—" },
    { label: "COIL", value: product.coilType || "—" },
    { label: "ACTIVATION", value: product.activation || "—" },
  ], [product, nicotine]);

  const ratingBars = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    product.reviews.forEach((r) => { const s = Math.min(5, Math.max(1, Math.round(r.rating))); counts[5 - s] += 1; });
    const totalR = Math.max(1, product.reviews.length);
    return [5, 4, 3, 2, 1].map((star, i) => ({ star, count: counts[i], pct: Math.round((counts[i] / totalR) * 100) }));
  }, [product.reviews]);

  const visibleFlavors = showAllFlavors ? product.flavors : product.flavors.slice(0, 5);

  const scrollReviews = (dir: 1 | -1) => {
    reviewTrackRef.current?.scrollBy({ left: dir * 340, behavior: "smooth" });
  };

  const toggleRelatedWish = (id: string) => {
    setRelatedWished((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };

  const quickAddRelated = (p: ProductItem) => {
    const f = p.flavors.find((x) => x.inStock)?.id;
    const n: CartItem = { id: `${p.id}-${f || "std"}`, productId: p.id, title: p.title, brand: p.brand, price: p.price, image: p.primaryImage, quantity: 1, flavor: p.flavors.find((x) => x.id === f)?.name, nicotine: p.nicotineStrength };
    setCartItems((prev) => { const i = prev.findIndex((x) => x.id === n.id); if (i > -1) { const c = [...prev]; c[i].quantity += 1; return c; } return [...prev, n]; });
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-neutral-900 flex flex-col">
      <Header onCartClick={() => setIsCartOpen(true)} cartCount={cartItems.reduce((a, i) => a + i.quantity, 0)} />

      <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-10">
        {/* breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 mb-5 flex-wrap">
          <Link href="/" className="hover:text-emerald-800">Home</Link>
          <ChevronRight size={12} />
          <Link href="/collections" className="hover:text-emerald-800">Products</Link>
          <ChevronRight size={12} />
          <span className="text-emerald-900 line-clamp-1">{product.title}</span>
        </nav>

        {/* ============ 2-COL: GALLERY + BUY BOX ============ */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-start">
          {/* gallery */}
          <div className="lg:sticky lg:top-24">
            <motion.div
              key={imgIdx}
              initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}
              className="relative aspect-square rounded-3xl bg-white border border-emerald-900/10 shadow-[0_20px_50px_-20px_rgba(6,78,59,0.25)] overflow-hidden"
            >
              <Image src={galleryImages[imgIdx]} alt={product.title} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain p-6 sm:p-10" />
              {discount > 0 && (
                <span className="absolute top-4 left-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 text-xs font-extrabold px-3 py-1.5 shadow">-{discount}% OFF</span>
              )}
              {product.badge && (
                <span className="absolute top-4 right-4 rounded-full bg-emerald-900 text-amber-300 font-cinzel text-[10px] tracking-[0.16em] px-3 py-1.5">{product.badge}</span>
              )}
              {galleryImages.length > 1 && (
                <span className="absolute bottom-4 right-4 rounded-full bg-emerald-950/80 text-white text-[11px] font-bold px-3 py-1.5 backdrop-blur">
                  {imgIdx + 1} / {galleryImages.length}
                </span>
              )}
              {galleryImages.length > 1 && (
                <>
                  <button onClick={() => setImgIdx((imgIdx - 1 + galleryImages.length) % galleryImages.length)} aria-label="Previous image" className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 border border-emerald-900/10 flex items-center justify-center shadow hover:bg-white">
                    <ChevronLeft size={20} className="text-emerald-900" />
                  </button>
                  <button onClick={() => setImgIdx((imgIdx + 1) % galleryImages.length)} aria-label="Next image" className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 border border-emerald-900/10 flex items-center justify-center shadow hover:bg-white">
                    <ChevronRight size={20} className="text-emerald-900" />
                  </button>
                </>
              )}
            </motion.div>
            {galleryImages.length > 1 && (
              <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1 snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {galleryImages.map((src, i) => (
                  <button
                    key={i} onClick={() => setImgIdx(i)} aria-label={`View image ${i + 1}`}
                    className={`snap-start shrink-0 w-[72px] h-[72px] rounded-2xl border-2 overflow-hidden bg-white transition-all ${i === imgIdx ? "border-amber-500 shadow-md" : "border-emerald-900/10 opacity-70 hover:opacity-100"}`}
                  >
                    <Image src={src} alt="" width={72} height={72} className="object-contain w-full h-full p-1.5" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* buy box */}
          <div ref={buyBoxRef}>
            <span className="inline-block rounded-full bg-emerald-800 text-amber-300 font-cinzel text-[10px] tracking-[0.2em] font-bold px-3.5 py-1.5">{product.category.toUpperCase()}</span>
            <h1 className="mt-3 font-luxury text-[26px] sm:text-4xl font-bold text-emerald-950 leading-tight">{product.title}</h1>
            {product.subtitle && <p className="mt-1.5 text-sm text-neutral-500">{product.subtitle}</p>}

            <div className="mt-3 flex items-center gap-2.5 flex-wrap">
              <Stars rating={product.rating} size={15} />
              <span className="text-sm font-semibold text-neutral-600">{product.rating.toFixed(1)} ({product.revs} reviews)</span>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold tracking-wide ${product.inStock ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-700"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${product.inStock ? "bg-emerald-600" : "bg-red-500"}`} />
                {product.inStock ? "IN STOCK" : "OUT OF STOCK"}
              </span>
            </div>

            {/* share */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-400 tracking-wide flex items-center gap-1"><Share2 size={13} /> SHARE</span>
              <a href={`https://wa.me/?text=${typeof window !== "undefined" ? encodeURIComponent(window.location.href) : ""}`} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp" className="w-9 h-9 rounded-full border border-emerald-900/15 flex items-center justify-center text-emerald-800 hover:border-amber-500 hover:text-amber-600 transition-colors">
                <MessageCircle size={15} />
              </a>
              <button onClick={copyLink} aria-label="Copy product link" className="h-9 px-3 rounded-full border border-emerald-900/15 flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:border-amber-500 hover:text-amber-600 transition-colors">
                {copied ? <Check size={14} className="text-emerald-600" /> : <Link2 size={14} />}
                {copied ? "COPIED" : "COPY LINK"}
              </button>
            </div>

            {/* price */}
            <p className="mt-5 text-[11px] font-extrabold tracking-[0.18em] text-neutral-400">PRICE:</p>
            <div className="mt-1 flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl sm:text-[40px] font-extrabold text-emerald-900">{formatAED(product.price)}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-lg text-neutral-400 line-through">{formatAED(product.originalPrice)}</span>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold px-2.5 py-1">SAVE {formatAED(product.originalPrice - product.price)}</span>
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-neutral-500">VAT included. Free delivery on orders over AED 350.</p>

            {/* key specs */}
            <div className="mt-5 rounded-2xl border-2 border-emerald-900/10 bg-white overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-950">
                <span className="font-cinzel text-[10px] tracking-[0.2em] text-amber-300 font-bold">KEY PRODUCT SPECIFICATIONS</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4">
                {keySpecs.map((s) => (
                  <div key={s.label} className="px-3.5 py-3 border-b border-r border-emerald-900/10">
                    <p className="text-[10px] font-bold tracking-wider text-neutral-400">{s.label}</p>
                    <p className="mt-0.5 text-[13px] font-bold text-emerald-950 leading-snug">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* flavors — premium dropdown */}
            {product.flavors.length > 0 && (
              <div className="mt-5 relative" ref={flavorDropRef}>
                <p className="text-xs font-extrabold tracking-wider text-emerald-950 mb-2">FLAVORS OPTION:</p>
                <button
                  onClick={() => { setFlavorDropOpen(!flavorDropOpen); setNicotineDropOpen(false); }}
                  className={`w-full h-12 rounded-xl border-2 bg-white px-3.5 flex items-center gap-2.5 text-left transition-all ${flavorDropOpen ? "border-amber-500 shadow-[0_8px_24px_-8px_rgba(245,158,11,0.4)]" : "border-emerald-900/15 hover:border-emerald-700"}`}
                >
                  {flavorId && (
                    <span className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-emerald-900/10 bg-emerald-50/50">
                      <Image src={product.flavors.find((f) => f.id === flavorId)?.img || product.primaryImage} alt="" fill className="object-contain p-0.5" sizes="32px" />
                    </span>
                  )}
                  <span className={`flex-1 text-sm font-bold truncate ${flavorId ? "text-emerald-950" : "text-neutral-400"}`}>
                    {product.flavors.find((f) => f.id === flavorId)?.name || "Select flavour"}
                  </span>
                  <ChevronDown size={17} className={`shrink-0 text-amber-600 transition-transform duration-300 ${flavorDropOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {flavorDropOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.99 }}
                      transition={{ duration: 0.18 }}
                      className="absolute z-30 left-0 right-0 mt-2 rounded-2xl border border-emerald-900/10 bg-white shadow-[0_24px_50px_-12px_rgba(6,78,59,0.35)] overflow-hidden max-h-[280px] overflow-y-auto"
                    >
                      {product.flavors.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => { if (f.inStock) { setFlavorId(f.id); const fi = product.flavors.findIndex((x) => x.id === f.id); if (galleryImages[fi]) setImgIdx(fi); setFlavorDropOpen(false); } }}
                          disabled={!f.inStock}
                          className={`w-full px-3.5 py-3 flex items-center gap-3 text-left transition-colors ${flavorId === f.id ? "bg-amber-50" : "hover:bg-emerald-50/60"} ${!f.inStock ? "opacity-40 cursor-not-allowed" : ""}`}
                        >
                          <span className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-emerald-900/10 bg-emerald-50/50">
                            <Image src={f.img || product.primaryImage} alt={f.name} fill className="object-contain p-1" sizes="40px" />
                          </span>
                          <span className={`flex-1 text-sm font-semibold ${flavorId === f.id ? "text-emerald-950" : "text-neutral-700"}`}>{f.name}</span>
                          {!f.inStock && <span className="text-[10px] font-bold text-neutral-400">OUT OF STOCK</span>}
                          {flavorId === f.id && <Check size={16} className="text-amber-600 shrink-0" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* nicotine — premium dropdown */}
            {product.nicotineOptions.length > 1 && (
              <div className="mt-3 relative" ref={nicotineDropRef}>
                <p className="text-xs font-extrabold tracking-wider text-emerald-950 mb-2">NICOTINE STRENGTH:</p>
                <button
                  onClick={() => { setNicotineDropOpen(!nicotineDropOpen); setFlavorDropOpen(false); }}
                  className={`w-full h-12 rounded-xl border-2 bg-white px-3.5 flex items-center gap-2.5 text-left transition-all ${nicotineDropOpen ? "border-amber-500 shadow-[0_8px_24px_-8px_rgba(245,158,11,0.4)]" : "border-emerald-900/15 hover:border-emerald-700"}`}
                >
                  <span className={`flex-1 text-sm font-bold ${nicotine ? "text-emerald-950" : "text-neutral-400"}`}>{nicotine || "Select nicotine strength"}</span>
                  {nicotine && <span className="text-[11px] font-semibold text-neutral-400">nicotine salt</span>}
                  <ChevronDown size={17} className={`shrink-0 text-amber-600 transition-transform duration-300 ${nicotineDropOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {nicotineDropOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.99 }}
                      transition={{ duration: 0.18 }}
                      className="absolute z-30 left-0 right-0 mt-2 rounded-2xl border border-emerald-900/10 bg-white shadow-[0_24px_50px_-12px_rgba(6,78,59,0.35)] overflow-hidden"
                    >
                      {product.nicotineOptions.map((n) => (
                        <button
                          key={n}
                          onClick={() => { setNicotine(n); setNicotineDropOpen(false); }}
                          className={`w-full px-3.5 py-3 flex items-center gap-3 text-left transition-colors ${nicotine === n ? "bg-amber-50" : "hover:bg-emerald-50/60"}`}
                        >
                          <span className={`flex-1 text-sm font-bold ${nicotine === n ? "text-emerald-950" : "text-neutral-700"}`}>{n}</span>
                          {nicotine === n && <Check size={16} className="text-amber-600 shrink-0" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* qty + total + wishlist */}
            <div className="mt-5 flex items-center gap-3">
              <div>
                <p className="text-[11px] font-extrabold tracking-[0.18em] text-neutral-400 mb-1.5">QTY</p>
                <div className="flex items-center rounded-2xl border-2 border-emerald-900/15 bg-white h-[56px]">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity" className="w-[52px] h-full flex items-center justify-center text-emerald-900 hover:text-amber-600"><Minus size={17} /></button>
                  <span className="w-10 text-center font-extrabold text-lg text-emerald-950">{qty}</span>
                  <button onClick={() => setQty(Math.min(99, qty + 1))} aria-label="Increase quantity" className="w-[52px] h-full flex items-center justify-center text-emerald-900 hover:text-amber-600"><Plus size={17} /></button>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-extrabold tracking-[0.18em] text-neutral-400 mb-1.5">TOTAL PRICE:</p>
                <div className="h-[56px] rounded-2xl bg-emerald-50 border border-emerald-900/10 flex items-center px-4">
                  <span className="text-xl font-extrabold text-emerald-900">{formatAED(total)}</span>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-extrabold tracking-[0.18em] text-transparent mb-1.5 select-none">.</p>
                <button
                  onClick={() => setWished(!wished)} aria-label="Add to wishlist"
                  className={`w-[56px] h-[56px] shrink-0 rounded-2xl border-2 flex items-center justify-center transition-all ${wished ? "border-red-300 bg-red-50" : "border-emerald-900/15 bg-white hover:border-amber-500"}`}
                >
                  <Heart size={20} className={wished ? "fill-red-500 text-red-500" : "text-emerald-900"} />
                </button>
              </div>
            </div>
            <p className="mt-1.5 text-[11px] font-bold text-neutral-400 tracking-wide">ADD TO WISHLIST</p>

            {/* CTAs */}
            <div className="mt-4 grid sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => addToCart(true)}
                disabled={!product.inStock}
                className="h-[56px] rounded-2xl border-2 border-emerald-800 text-emerald-900 font-extrabold text-[15px] tracking-wide hover:bg-emerald-50 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <ShoppingBag size={18} /> ADD TO CART
              </button>
              <button
                onClick={buyNow}
                disabled={!product.inStock}
                className="h-[56px] rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 font-extrabold text-[15px] tracking-wide hover:brightness-105 active:scale-[0.99] transition-all shadow-[0_10px_30px_-10px_rgba(245,158,11,0.6)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Zap size={18} /> BUY NOW
              </button>
            </div>
            <a
              href={`https://wa.me/971551688299?text=${encodeURIComponent(`Hi Vape Mart! I want to order: ${product.title} (${formatAED(product.price)})`)}`}
              target="_blank" rel="noopener noreferrer"
              className="mt-2.5 h-[52px] rounded-2xl bg-[#25D366] text-white font-bold text-sm tracking-wide hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle size={18} /> ORDER ON WHATSAPP
            </a>
          </div>
        </div>

        {/* ============ TRUST BADGES ============ */}
        <section className="mt-8 sm:mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: Truck, t: "Free Shipping", d: "On orders over AED 350" },
            { icon: ShieldCheck, t: "Payment Methods", d: "Cash on Delivery" },
            { icon: Zap, t: "Fast Delivery", d: "UAE-wide in 24–48 hours" },
            { icon: Clock, t: "Same Day Delivery", d: "Within Dubai on most items" },
          ].map((b) => (
            <div key={b.t} className="rounded-2xl bg-white border border-emerald-900/10 p-4 sm:p-5 text-center shadow-[0_10px_30px_-18px_rgba(6,78,59,0.4)]">
              <b.icon size={26} className="mx-auto text-amber-500 mb-2" />
              <p className="text-sm font-extrabold text-emerald-950">{b.t}</p>
              <p className="text-xs text-neutral-500 mt-1">{b.d}</p>
            </div>
          ))}
        </section>

        {/* ============ TABS ============ */}
        <section className="mt-10 sm:mt-14">
          <div className="flex gap-1.5 sm:gap-2 border-b-2 border-emerald-900/10 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {([
              { id: "desc", label: "PRODUCT DESCRIPTION" },
              { id: "ship", label: "SHIPPING & RETURN" },
            ] as const).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`shrink-0 h-[52px] px-5 sm:px-7 font-cinzel text-[11px] sm:text-xs tracking-[0.16em] font-bold border-b-[3px] -mb-[2px] transition-colors ${tab === t.id ? "border-amber-500 text-emerald-950" : "border-transparent text-neutral-400 hover:text-emerald-800"}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="py-6 sm:py-8">
            {tab === "desc" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                <h2 className="font-luxury text-2xl sm:text-3xl font-bold text-emerald-950">{product.title}</h2>
                <p className="mt-4 text-[15px] leading-relaxed text-neutral-600">{product.fullDescription}</p>

                {product.highlights.length > 0 && (
                  <div className="mt-7">
                    <h3 className="font-cinzel text-xs tracking-[0.2em] text-emerald-900 font-bold mb-4">KEY FEATURES</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {product.highlights.map((h, i) => (
                        <div key={i} className="flex gap-3.5 rounded-2xl bg-white border border-emerald-900/10 p-4">
                          <span className="w-11 h-11 shrink-0 rounded-xl bg-emerald-900 flex items-center justify-center">
                            <Check size={18} className="text-amber-400" strokeWidth={3} />
                          </span>
                          <div>
                            <p className="text-sm font-extrabold text-emerald-950">{h.title}</p>
                            <p className="mt-1 text-[13px] text-neutral-500 leading-relaxed">{h.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {product.flavors.length > 0 && (
                  <div className="mt-7">
                    <h3 className="font-cinzel text-xs tracking-[0.2em] text-emerald-900 font-bold mb-4">FLAVOR NOTES</h3>
                    <div className="rounded-2xl border border-emerald-900/10 bg-white divide-y divide-emerald-900/10 overflow-hidden">
                      {product.flavors.slice(0, 6).map((f, i) => (
                        <div key={f.id} className="flex gap-4 px-5 py-4 items-start">
                          <span className="w-8 h-8 shrink-0 rounded-full bg-amber-100 text-amber-800 text-sm font-extrabold flex items-center justify-center">{i + 1}</span>
                          <div className="min-w-0">
                            <p className="text-[15px] font-extrabold text-emerald-950 leading-snug">{f.name}</p>
                            <p className="mt-1 text-sm text-neutral-500 leading-relaxed">
                              {product.sensoryProfile.topNote}{product.sensoryProfile.heartNote ? `, ${product.sensoryProfile.heartNote}` : ""}{product.sensoryProfile.baseNote ? ` — ${product.sensoryProfile.baseNote}` : ""}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-7">
                  <h3 className="font-cinzel text-xs tracking-[0.2em] text-emerald-900 font-bold mb-4">KEY SPECIFICATIONS</h3>
                  <ul className="rounded-2xl border border-emerald-900/10 bg-white divide-y divide-emerald-900/10 overflow-hidden">
                    {product.specifications.slice(0, 8).map((s, i) => (
                      <li key={i} className="flex gap-3 px-5 py-3.5 items-start">
                        <Check size={16} className="text-amber-500 shrink-0 mt-1" strokeWidth={3} />
                        <p className="text-[15px] text-neutral-600 leading-relaxed"><strong className="text-emerald-950 font-bold">{s.label}:</strong> {s.value}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                {product.faqs.length > 0 && (
                  <div className="mt-8">
                    <h3 className="font-luxury text-xl sm:text-2xl font-bold text-emerald-950 mb-4">Frequently Asked Questions (FAQs)</h3>
                    <div className="divide-y divide-emerald-900/10 rounded-2xl border border-emerald-900/10 bg-white overflow-hidden">
                      {product.faqs.map((f, i) => (
                        <div key={i}>
                          <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center gap-4 px-5 min-h-[60px] text-left hover:bg-emerald-50/60 transition-colors">
                            <span className="w-8 h-8 shrink-0 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center justify-center">{i + 1}</span>
                            <span className="flex-1 text-sm sm:text-[15px] font-bold text-emerald-950">{f.q}</span>
                            <ChevronDown size={18} className={`shrink-0 text-amber-600 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                          </button>
                          <AnimatePresence initial={false}>
                            {openFaq === i && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                                <p className="px-5 pb-5 pl-[68px] text-sm text-neutral-600 leading-relaxed">{f.a}</p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="mt-7 text-[15px] leading-relaxed text-neutral-600 border-l-4 border-amber-400 pl-4 italic">
                  Final thoughts: {product.shortDescription} Order today from Vape Mart UAE — 100% authentic, express delivery across all Emirates.
                </p>
              </motion.div>
            )}

            {tab === "ship" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full grid sm:grid-cols-3 gap-4">
                {[
                  { icon: Zap, t: "Dubai Express", d: "Order before 9pm — delivered in 2–3 hours across most Dubai areas. Same-day for Sharjah & Ajman." },
                  { icon: Truck, t: "UAE Nationwide", d: "Next-day delivery to Abu Dhabi, Ras Al Khaimah, Fujairah & all Emirates. Free over AED 350." },
                  { icon: ShieldCheck, t: "Cash on Delivery", d: "Pay cash or by card when your order arrives. No prepayment needed, anywhere in the UAE." },
                ].map((c) => (
                  <div key={c.t} className="rounded-2xl bg-white border border-emerald-900/10 p-5">
                    <c.icon size={24} className="text-amber-500 mb-3" />
                    <p className="font-extrabold text-emerald-950">{c.t}</p>
                    <p className="mt-1.5 text-sm text-neutral-600 leading-relaxed">{c.d}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </section>

        {/* ============ SPECS TABLE ============ */}
        <section className="mt-6 sm:mt-10">
          <h2 className="font-luxury text-2xl sm:text-3xl font-bold text-emerald-950 mb-5">Key Features &amp; Specifications</h2>
          <div className="rounded-2xl border-2 border-emerald-900/10 overflow-hidden w-full">
            <div className="grid grid-cols-2 bg-emerald-950 px-5 py-3">
              <span className="font-cinzel text-[11px] tracking-[0.18em] text-amber-300 font-bold">FEATURE</span>
              <span className="font-cinzel text-[11px] tracking-[0.18em] text-amber-300 font-bold">DETAILS</span>
            </div>
            {product.specifications.map((s, i) => (
              <div key={i} className={`grid grid-cols-2 px-5 py-3.5 text-sm ${i % 2 ? "bg-emerald-50/50" : "bg-white"}`}>
                <span className="font-bold text-emerald-950">{s.label}</span>
                <span className="text-neutral-600">{s.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-xs font-extrabold text-emerald-800">
            <BadgeCheck size={15} /> 100% AUTHENTIC UAE CERTIFIED
          </div>
        </section>

        {/* ============ AVAILABLE FLAVOURS ============ */}
        {product.flavors.length > 0 && (
          <section className="mt-10 sm:mt-14">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h2 className="font-luxury text-2xl sm:text-3xl font-bold text-emerald-950">Available Flavours</h2>
              <span className="rounded-full bg-amber-100 text-amber-800 text-[11px] font-extrabold px-3 py-1 tracking-wide">
                {product.flavors.length} SIGNATURE OPTIONS
              </span>
            </div>
            <p className="text-sm text-neutral-500 mb-4 max-w-3xl">Every batch is crafted for consistent flavor. Availability may vary slightly between batches — order your favorites while in stock.</p>
            <div className="hidden sm:block rounded-2xl border-2 border-emerald-900/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[560px]">
                  <thead>
                    <tr className="bg-emerald-950 text-left">
                      <th className="font-cinzel text-[11px] tracking-[0.14em] text-amber-300 px-5 py-3 w-12">#</th>
                      <th className="font-cinzel text-[11px] tracking-[0.14em] text-amber-300 px-5 py-3">FLAVOUR NAME</th>
                      <th className="font-cinzel text-[11px] tracking-[0.14em] text-amber-300 px-5 py-3">FLAVOUR PROFILE</th>
                      <th className="font-cinzel text-[11px] tracking-[0.14em] text-amber-300 px-5 py-3 text-right">AVAILABILITY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleFlavors.map((f, i) => (
                      <tr key={f.id} className={i % 2 ? "bg-emerald-50/50" : "bg-white"}>
                        <td className="px-5 py-3.5 text-neutral-400 font-bold">{String(i + 1).padStart(2, "0")}</td>
                        <td className="px-5 py-3.5">
                          <button onClick={() => { if (f.inStock) { setFlavorId(f.id); const fi = product.flavors.findIndex((x) => x.id === f.id); if (galleryImages[fi]) setImgIdx(fi); } }} className="flex items-center gap-2.5 font-bold text-emerald-950 hover:text-amber-600 disabled:cursor-default" disabled={!f.inStock}>
                            <span className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-emerald-900/10 bg-emerald-50/50">
                              <Image src={f.img || product.primaryImage} alt={f.name} fill className="object-contain p-1" sizes="32px" />
                            </span>
                            {f.name}
                          </button>
                        </td>
                        <td className="px-5 py-3.5 text-neutral-600">{product.sensoryProfile.topNote}</td>
                        <td className="px-5 py-3.5 text-right">
                          {f.inStock
                            ? <span className="inline-block rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-3 py-1">IN STOCK</span>
                            : <span className="inline-block rounded-full bg-neutral-200 text-neutral-500 text-[11px] font-extrabold px-3 py-1">OUT OF STOCK</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="sm:hidden space-y-2.5">
              {visibleFlavors.map((f, i) => (
                <button
                  key={f.id}
                  onClick={() => { if (f.inStock) { setFlavorId(f.id); const fi = product.flavors.findIndex((x) => x.id === f.id); if (galleryImages[fi]) setImgIdx(fi); } }}
                  disabled={!f.inStock}
                  className={`w-full rounded-2xl border-2 p-3 flex items-center gap-3 text-left transition-all ${flavorId === f.id ? "border-amber-500 bg-amber-50/60" : "border-emerald-900/10 bg-white"} ${!f.inStock ? "opacity-50" : ""}`}
                >
                  <span className="w-8 h-8 shrink-0 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center justify-center">{i + 1}</span>
                  <span className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-emerald-900/10 bg-emerald-50/50">
                    <Image src={f.img || product.primaryImage} alt={f.name} fill className="object-contain p-1" sizes="44px" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-bold text-emerald-950 leading-snug">{f.name}</span>
                    <span className="block text-[13px] font-extrabold text-emerald-800 mt-0.5">{formatAED(product.price)}</span>
                  </span>
                  {f.inStock
                    ? <span className="shrink-0 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1">IN STOCK</span>
                    : <span className="shrink-0 rounded-full bg-neutral-200 text-neutral-500 text-[10px] font-extrabold px-2.5 py-1">OUT</span>}
                </button>
              ))}
            </div>
            {product.flavors.length > 5 && (
              <button
                onClick={() => setShowAllFlavors(!showAllFlavors)}
                className="mt-4 h-[48px] px-6 rounded-2xl border-2 border-emerald-800 text-emerald-900 font-extrabold text-sm tracking-wide hover:bg-emerald-50 transition-all flex items-center gap-2 mx-auto"
              >
                {showAllFlavors ? "SHOW LESS" : `SEE MORE FLAVOURS (${product.flavors.length - 5} MORE)`}
                <ChevronDown size={16} className={`transition-transform ${showAllFlavors ? "rotate-180" : ""}`} />
              </button>
            )}
          </section>
        )}

        {/* ============ REVIEWS ============ */}
        {product.reviews.length > 0 && (
          <section className="mt-10 sm:mt-14">
            <p className="font-cinzel text-[11px] tracking-[0.24em] text-amber-600 font-bold mb-2">VERIFIED CUSTOMER FEEDBACK</p>
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <h2 className="font-luxury text-2xl sm:text-3xl font-bold text-emerald-950">Customer Reviews</h2>
              <div className="flex gap-2">
                <button onClick={() => scrollReviews(-1)} aria-label="Previous reviews" className="w-10 h-10 rounded-full border border-emerald-900/15 bg-white flex items-center justify-center text-emerald-900 hover:border-amber-500 transition-colors">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={() => scrollReviews(1)} aria-label="Next reviews" className="w-10 h-10 rounded-full border border-emerald-900/15 bg-white flex items-center justify-center text-emerald-900 hover:border-amber-500 transition-colors">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
            <div className="grid lg:grid-cols-[300px_1fr] gap-5 items-start">
              {/* summary card */}
              <div className="rounded-3xl bg-emerald-950 p-6 text-white shrink-0">
                <p className="font-luxury text-5xl font-bold text-amber-300">{product.rating.toFixed(1)}<span className="text-xl text-emerald-200/60">/5</span></p>
                <div className="mt-2"><Stars rating={product.rating} size={16} /></div>
                <p className="mt-1.5 text-sm text-emerald-100/70">Based on {product.revs} reviews</p>
                <div className="mt-4 space-y-2">
                  {ratingBars.map((b) => (
                    <div key={b.star} className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-emerald-100/80 w-6">{b.star}★</span>
                      <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500" style={{ width: `${b.pct}%` }} />
                      </div>
                      <span className="text-[11px] text-emerald-100/60 w-7 text-right">{b.count}</span>
                    </div>
                  ))}
                </div>
                <a href={`https://wa.me/971551688299?text=${encodeURIComponent(`Hi Vape Mart! I want to leave a review for: ${product.title}`)}`} target="_blank" rel="noopener noreferrer" className="mt-5 h-[48px] rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 hover:brightness-105 transition-all">
                  WRITE A REVIEW
                </a>
              </div>
              {/* carousel */}
              <div ref={reviewTrackRef} className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {product.reviews.map((r) => (
                  <div key={r.id} className="snap-start shrink-0 w-[300px] sm:w-[340px] rounded-2xl bg-white border border-emerald-900/10 p-5 flex flex-col">
                    <Stars rating={r.rating} />
                    <p className="mt-2 text-sm font-bold text-emerald-950">{r.title}</p>
                    <p className="mt-1.5 text-sm text-neutral-600 leading-relaxed flex-1">{r.comment}</p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-neutral-500">
                      <span className="font-semibold text-emerald-900">{r.author}</span>
                      {r.verified && <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold"><BadgeCheck size={13} /> Verified</span>}
                    </div>
                    <p className="mt-1 text-[11px] text-neutral-400">{r.location} · {r.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ============ RELATED ============ */}
        {relatedProducts.length > 0 && (
          <section className="mt-10 sm:mt-14">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-luxury text-2xl sm:text-3xl font-bold text-emerald-950">You May Also Like</h2>
              <Link href="/collections" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-amber-600 hover:text-amber-700">
                View all <ArrowRight size={15} />
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4 sm:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {relatedProducts.map((p) => {
                const d = p.originalPrice > p.price ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
                const rw = relatedWished.has(p.id);
                return (
                  <article key={p.id} className="snap-start shrink-0 w-[220px] sm:w-auto group rounded-2xl bg-white border border-emerald-900/10 overflow-hidden hover:shadow-[0_16px_40px_-14px_rgba(6,78,59,0.3)] hover:-translate-y-1 transition-all duration-300 flex flex-col">
                    <div className="relative aspect-square bg-gradient-to-br from-[#f8fafc] to-emerald-50/60">
                      <Link href={`/product/${p.slug}`} aria-label={p.title} className="block w-full h-full">
                        <Image src={p.primaryImage} alt={p.title} fill sizes="220px" className="object-contain p-4 group-hover:scale-105 transition-transform duration-500" />
                      </Link>
                      {d > 0 && <span className="absolute top-2.5 left-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 text-[10px] font-extrabold px-2 py-0.5">-{d}%</span>}
                      <button onClick={() => toggleRelatedWish(p.id)} aria-label="Add to wishlist" className="absolute top-2.5 right-2.5 w-9 h-9 rounded-full bg-white/90 border border-emerald-900/10 flex items-center justify-center shadow hover:bg-white">
                        <Heart size={15} className={rw ? "fill-red-500 text-red-500" : "text-emerald-900"} />
                      </button>
                    </div>
                    <div className="p-3.5 flex flex-col flex-1">
                      <p className="font-cinzel text-[9px] tracking-[0.18em] text-emerald-700/80 font-bold">{p.brand}</p>
                      <Link href={`/product/${p.slug}`}><h3 className="mt-1 text-[13px] font-semibold text-emerald-950 line-clamp-2 leading-snug hover:text-amber-600 min-h-[2.5em]">{p.title}</h3></Link>
                      <div className="mt-1.5 flex items-center gap-1"><Stars rating={p.rating} size={11} /><span className="text-[11px] text-neutral-500">({p.revs})</span></div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-extrabold text-emerald-900">{formatAED(p.price)}</span>
                        <div className="flex gap-1.5">
                          <Link href={`/product/${p.slug}`} aria-label={`Buy ${p.title} now`} className="h-10 px-3 rounded-xl border-2 border-emerald-800 text-emerald-900 text-[11px] font-extrabold flex items-center hover:bg-emerald-50 transition-all">
                            BUY NOW
                          </Link>
                          <button onClick={() => quickAddRelated(p)} aria-label={`Add ${p.title} to cart`} className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center hover:bg-emerald-700 active:scale-95 transition-all">
                            <Plus size={17} strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* ============ WHATSAPP HELP BANNER ============ */}
        <section className="mt-10 sm:mt-14 rounded-3xl overflow-hidden bg-gradient-to-r from-[#064e3b] to-[#022c22] text-white p-6 sm:p-8 relative">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-400/15 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative z-10 grid sm:grid-cols-[1fr_auto] gap-6 items-center">
            <div className="flex gap-4 items-start">
              <div className="hidden sm:flex w-14 h-14 shrink-0 rounded-2xl bg-white/10 items-center justify-center">
                <MessageCircle size={26} className="text-amber-300" />
              </div>
              <div>
                <h2 className="font-luxury text-2xl sm:text-3xl font-bold">Need Help Ordering?</h2>
                <p className="mt-2 text-sm text-emerald-100/85 max-w-xl">Get instant help from our team — authenticity checks, flavor advice, bulk pricing.</p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
                  <span className="inline-flex items-center gap-1.5 text-emerald-100/90"><Phone size={14} className="text-amber-300" /> {WHATSAPP_PHONE}</span>
                  <span className="inline-flex items-center gap-1.5 text-emerald-100/90"><Clock size={14} className="text-amber-300" /> Mon – Sun: 9 AM – 11 PM</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["SAME DAY DELIVERY DUBAI", "DELIVERY ACROSS UAE", "FREE SHIPPING 350+"].map((b) => (
                    <span key={b} className="rounded-full border border-amber-400/40 text-amber-300 text-[10px] font-extrabold tracking-wider px-3 py-1">{b}</span>
                  ))}
                </div>
              </div>
            </div>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="shrink-0 h-[56px] px-8 rounded-2xl bg-[#25D366] text-white font-extrabold text-sm tracking-wide flex items-center justify-center gap-2.5 hover:brightness-110 active:scale-[0.98] transition-all">
              <MessageCircle size={20} /> CHAT ON WHATSAPP
            </a>
          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomNav />

      {/* floating WhatsApp */}
      <a
        href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp"
        className="fixed z-30 right-4 bottom-[calc(88px+env(safe-area-inset-bottom))] sm:bottom-6 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_10px_30px_-8px_rgba(37,211,102,0.7)] hover:brightness-110 hover:scale-105 active:scale-95 transition-all"
      >
        <MessageCircle size={26} />
      </a>

      {/* ============ STICKY BUY BAR ============ */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: 90, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 90, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className="fixed z-30 left-3 right-3 bottom-[calc(76px+env(safe-area-inset-bottom))] sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:bottom-6 sm:w-[560px]"
          >
            <div className="flex items-center gap-3 rounded-2xl bg-emerald-950/95 backdrop-blur border border-emerald-700/40 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.5)] p-2.5 pl-3">
              <div className="relative w-12 h-12 shrink-0 rounded-xl bg-white overflow-hidden">
                <Image src={product.primaryImage} alt="" fill className="object-contain p-1" sizes="48px" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-white truncate">{product.title}</p>
                <p className="text-sm font-extrabold text-amber-400">{formatAED(product.price)}</p>
              </div>
              <button
                onClick={() => addToCart(true)}
                disabled={!product.inStock}
                className="shrink-0 h-[52px] px-4 sm:px-7 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 font-extrabold text-[13px] sm:text-sm tracking-wide hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center gap-2 whitespace-nowrap"
              >
                <ShoppingBag size={16} /> ADD TO CART
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={(id, delta) =>
          setCartItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)).filter((i) => i.quantity > 0))
        }
        onRemoveItem={(id) => setCartItems((prev) => prev.filter((i) => i.id !== id))}
        onClearCart={() => setCartItems([])}
      />
    </div>
  );
}
