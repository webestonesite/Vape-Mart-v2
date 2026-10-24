"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  X,
  Star,
  Heart,
  ShoppingBag,
  Search,
  SlidersHorizontal,
  Eye,
  Minus,
  Plus,
  Check,
  ShieldCheck,
  Truck,
  Headset,
  BadgeCheck,
  MessageCircle,
  Flame,
  ArrowRight,
  ArrowLeftRight,
  History,
  ArrowLeft,
  BookOpen,
  Zap,
  Droplets,
  Cpu,
  Leaf,
  CreditCard,
} from "lucide-react";
import { ProductItem, CollectionCategory, CartItem } from "@/types/product";
import type { CollectionPageSettings } from "@/lib/shopify";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { CartDrawer } from "@/components/CartDrawer";

interface CollectionPageViewProps {
  category?: CollectionCategory;
  pageSettings?: CollectionPageSettings;
  allCategories: CollectionCategory[];
  products: ProductItem[];
  catalogProducts?: ProductItem[];
}

const WHATSAPP_LINK = "https://wa.me/971551688299?text=Hi%20Vape%20Mart!%20I%20need%20help%20choosing%20a%20vape.";
const ITEMS_PER_PAGE = 12;

interface RecentItem { slug: string; title: string; brand: string; price: number; primaryImage: string; }

function formatAED(n: number): string {
  return `AED ${n.toFixed(2)}`;
}

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-neutral-200 text-neutral-200"}
        />
      ))}
    </span>
  );
}

interface QuizOption {
  value: string;
  label: string;
  sub?: string;
  count?: number;
  image?: string;
}

function QuizDropdown({
  value, onSelect, options, placeholder,
}: {
  value: string | null;
  onSelect: (v: string) => void;
  options: QuizOption[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`w-full min-h-[60px] rounded-2xl border-2 px-4 flex items-center gap-3 text-left transition-all active:scale-[0.99] ${open || selected ? "border-amber-500 bg-amber-50/60" : "border-emerald-900/15 hover:border-amber-500/60"}`}
      >
        {selected?.image ? (
          <span className="w-10 h-10 rounded-xl bg-white border border-emerald-900/10 overflow-hidden shrink-0">
            <Image src={selected.image} alt="" width={40} height={40} className="w-full h-full object-contain" />
          </span>
        ) : null}
        <span className="flex-1 min-w-0">
          <span className={`block text-sm font-extrabold truncate ${selected ? "text-emerald-950" : "text-neutral-400"}`}>
            {selected ? selected.label : placeholder}
          </span>
          {selected?.sub && <span className="block text-xs text-neutral-500 truncate mt-0.5">{selected.sub}</span>}
        </span>
        {selected?.count !== undefined && (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5 shrink-0">{selected.count} matches</span>
        )}
        <ChevronDown size={18} className={`text-amber-600 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.99 }}
              transition={{ duration: 0.18 }}
              className="absolute z-20 left-0 right-0 mt-2 rounded-2xl border border-emerald-900/10 bg-white shadow-[0_24px_50px_-12px_rgba(2,44,34,0.35)] overflow-hidden max-h-[280px] overflow-y-auto"
            >
              {options.map((o) => (
                <button
                  key={o.value}
                  onClick={() => { onSelect(o.value); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-emerald-50/70 transition-colors ${value === o.value ? "bg-amber-50" : ""}`}
                >
                  {o.image ? (
                    <span className="w-10 h-10 rounded-xl bg-white border border-emerald-900/10 overflow-hidden shrink-0">
                      <Image src={o.image} alt="" width={40} height={40} className="w-full h-full object-contain" />
                    </span>
                  ) : null}
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-bold text-emerald-950">{o.label}</span>
                    {o.sub && <span className="block text-xs text-neutral-500 truncate mt-0.5">{o.sub}</span>}
                  </span>
                  {o.count !== undefined && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5 shrink-0">{o.count}</span>
                  )}
                  {value === o.value && <Check size={16} className="text-amber-600 shrink-0" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CollectionPageView({ category, allCategories, products, catalogProducts, pageSettings}: CollectionPageViewProps) {
  const catalog = catalogProducts ?? products;
  // ---- filter state ----
  // Menu links like /collections?search=elf+bar pre-fill the search box
  const searchParams = useSearchParams();
  const urlSearchQuery = searchParams.get("search") ?? "";
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
  useEffect(() => {
    setSearchQuery(urlSearchQuery);
  }, [urlSearchQuery]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceMinInput, setPriceMinInput] = useState("");
  const [priceMaxInput, setPriceMaxInput] = useState("");
  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [selectedNicotines, setSelectedNicotines] = useState<string[]>([]);
  const [selectedPuffs, setSelectedPuffs] = useState<string[]>([]);
  const [selectedFlavorFamilies, setSelectedFlavorFamilies] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"popular" | "price_asc" | "price_desc" | "rating" | "newest">("popular");
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // ---- quick view ----
  const [quickViewProduct, setQuickViewProduct] = useState<ProductItem | null>(null);
  const [quickViewFlavor, setQuickViewFlavor] = useState("");
  const [quickViewQty, setQuickViewQty] = useState(1);

  // ---- cart ----
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const toggleWishlist = (id: string) =>
    setWishlist((prev) => (prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]));

  // ---- 1) vape finder quiz ----
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizPuffs, setQuizPuffs] = useState<string | null>(null);
  const [quizNicotine, setQuizNicotine] = useState<string | null>(null);
  const [quizFlavor, setQuizFlavor] = useState<string | null>(null);

  // ---- 2) compare ----
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  // ---- 4) fly-to-cart ----
  const [flyItem, setFlyItem] = useState<{ p: ProductItem; x: number; y: number; tx: number; ty: number } | null>(null);

  // ---- 5) hero parallax ----
  const heroRef = useRef<HTMLElement>(null);
  const [heroTilt, setHeroTilt] = useState({ x: 0, y: 0 });
  const [finePointer, setFinePointer] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches) setFinePointer(true);
  }, []);

  // ---- 6) recently viewed ----
  const [recentlyViewed, setRecentlyViewed] = useState<RecentItem[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("vm_recently_viewed");
      if (raw) setRecentlyViewed(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);
  const saveRecent = (p: ProductItem) => {
    setRecentlyViewed((prev) => {
      const next = [
        { slug: p.slug, title: p.title, brand: p.brand, price: p.price, primaryImage: p.primaryImage },
        ...prev.filter((r) => r.slug !== p.slug),
      ].slice(0, 8);
      try { localStorage.setItem("vm_recently_viewed", JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  // ---- live counts computed from the ACTUAL products array (bug fix: no stale counts) ----
  const brandCounts = useMemo(() => {
    const c: Record<string, number> = {};
    products.forEach((p) => { c[p.brand] = (c[p.brand] || 0) + 1; });
    return c;
  }, [products]);
  const brands = useMemo(() => Object.keys(brandCounts).sort(), [brandCounts]);

  // ---- discovery sections: catalog-wide counts (always full catalog) ----
  const catalogCategoryCounts = useMemo(() => {
    const c: Record<string, number> = {};
    catalog.forEach((p) => { c[p.categorySlug] = (c[p.categorySlug] || 0) + 1; });
    return c;
  }, []);
  const flavorFamilyCounts = useMemo(() => {
    const c: Record<string, number> = {};
    catalog.forEach((p) => { c[p.flavorFamily] = (c[p.flavorFamily] || 0) + 1; });
    return c;
  }, []);
  const flavorFamilies = useMemo(() => {
    const defs: { id: string; name: string; desc: string }[] = pageSettings?.flavorFamilies?.length ? pageSettings.flavorFamilies : [
      { id: "fruit_ice", name: "Fruit Ice", desc: "Icy fruit blends — mango ice, blue razz, watermelon chill" },
      { id: "menthol", name: "Menthol & Mint", desc: "Cool, crisp and refreshing with every puff" },
      { id: "tobacco", name: "Tobacco", desc: "Classic rich tobacco notes for traditional taste" },
      { id: "dessert", name: "Dessert & Sweet", desc: "Vanilla custard, candy and sweet treats" },
    ];
    return defs.map((d) => ({
      ...d,
      image: catalog.find((p) => p.flavorFamily === d.id)?.primaryImage ?? "",
    }));
  }, []);

  const nicotineCounts = useMemo(() => {
    const c: Record<string, number> = {};
    products.forEach((p) => { c[p.nicotineStrength] = (c[p.nicotineStrength] || 0) + 1; });
    return c;
  }, [products]);
  const nicotines = useMemo(() => Object.keys(nicotineCounts).sort(), [nicotineCounts]);

  const puffBuckets = useMemo(() => {
    const raw: { id: string; label: string; min: number | null; max: number | null }[] = pageSettings?.puffBuckets?.length ? pageSettings.puffBuckets : [
      { id: "under-10k", label: "Under 10,000", min: null, max: 10000 },
      { id: "10k-20k", label: "10,000 – 20,000", min: 10000, max: 20000 },
      { id: "20k-35k", label: "20,000 – 35,000", min: 20000, max: 35000 },
      { id: "35k-plus", label: "35,000+", min: 35000, max: null },
    ];
    const defs = raw.map((d) => ({
      ...d,
      test: (p?: number) => (d.min == null || (p ?? 0) >= d.min) && (d.max == null || (p ?? 0) < d.max),
    }));
    return defs.map((d) => ({ ...d, count: products.filter((p) => d.test(p.puffs)).length }));
  }, [products, pageSettings]);

  const priceBounds = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 0 };
    const ps = products.map((p) => p.price);
    return { min: Math.floor(Math.min(...ps)), max: Math.ceil(Math.max(...ps)) };
  }, [products]);

  // ---- filtering ----
  const filtered = useMemo(() => {
    let list = [...products];
    const q = searchQuery.trim().toLowerCase();
    if (q) list = list.filter((p) => `${p.title} ${p.brand} ${p.category}`.toLowerCase().includes(q));
    if (selectedBrands.length) list = list.filter((p) => selectedBrands.includes(p.brand));
    if (selectedNicotines.length) list = list.filter((p) => selectedNicotines.includes(p.nicotineStrength));
    if (selectedPuffs.length) {
      const tests = puffBuckets.filter((b) => selectedPuffs.includes(b.id));
      list = list.filter((p) => tests.some((t) => t.test(p.puffs)));
    }
    if (priceMin !== null) list = list.filter((p) => p.price >= priceMin);
    if (priceMax !== null) list = list.filter((p) => p.price <= priceMax);
    if (inStockOnly) list = list.filter((p) => p.inStock);
    if (selectedFlavorFamilies.length) list = list.filter((p) => selectedFlavorFamilies.includes(p.flavorFamily));
    switch (sortBy) {
      case "price_asc": list.sort((a, b) => a.price - b.price); break;
      case "price_desc": list.sort((a, b) => b.price - a.price); break;
      case "rating": list.sort((a, b) => b.rating - a.rating || b.revs - a.revs); break;
      case "newest": list.sort((a, b) => b.id.localeCompare(a.id)); break;
      default: break; // popular = catalog order
    }
    return list;
  }, [products, searchQuery, selectedBrands, selectedNicotines, selectedPuffs, selectedFlavorFamilies, priceMin, priceMax, inStockOnly, sortBy, puffBuckets]);

  // reset to page 1 whenever filters change (bug fix: pagination math)
  useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedBrands, selectedNicotines, selectedPuffs, selectedFlavorFamilies, priceMin, priceMax, inStockOnly, sortBy, products]);

  const itemsPerPage = pageSettings?.itemsPerPage || ITEMS_PER_PAGE;
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const pageItems = filtered.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  const toggleIn = (arr: string[], v: string, set: (x: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const clearAll = () => {
    setSearchQuery(""); setSelectedBrands([]); setSelectedNicotines([]); setSelectedPuffs([]); setSelectedFlavorFamilies([]);
    setPriceMin(null); setPriceMax(null); setPriceMinInput(""); setPriceMaxInput("");
    setInStockOnly(false); setSortBy("popular");
  };
  const activeFilterCount =
    selectedBrands.length + selectedNicotines.length + selectedPuffs.length + selectedFlavorFamilies.length +
    (priceMin !== null || priceMax !== null ? 1 : 0) + (inStockOnly ? 1 : 0) + (searchQuery ? 1 : 0);

  // ---- cart helpers (same pattern as existing views) ----
  const addToCart = (prod: ProductItem, flavorId?: string, qty: number = 1, nicotine?: string) => {
    const flavorName = prod.flavors.find((f) => f.id === flavorId)?.name || prod.flavors[0]?.name;
    const newItem: CartItem = {
      id: `${prod.id}-${flavorId || "std"}-${nicotine || prod.nicotineStrength}`,
      productId: prod.id,
      title: prod.title,
      brand: prod.brand,
      price: prod.price,
      image: prod.primaryImage,
      quantity: qty,
      flavor: flavorName,
      nicotine: nicotine || prod.nicotineStrength,
    };
    setCartItems((prev) => {
      const idx = prev.findIndex((i) => i.id === newItem.id);
      if (idx > -1) { const copy = [...prev]; copy[idx].quantity += qty; return copy; }
      return [...prev, newItem];
    });
    setIsCartOpen(true);
  };

  const pageTitle = category ? category.title : "All Vape Products & Collections";
  const pageEyebrow = category ? category.badge : (pageSettings?.shopAllHero?.title || "THE FULL CATALOG");
  const pageSubtitle = category ? category.subtitle : (pageSettings?.shopAllHero?.subtitle || "100% authentic disposable vapes, pod systems, e-liquids and heated tobacco — with express UAE delivery.");

  const allReviews = useMemo(() => products.flatMap((p) => p.reviews.map((r) => ({ ...r, product: p.title }))).slice(0, 3), [products]);
  const avgRating = useMemo(() => {
    if (!products.length) return 0;
    return products.reduce((a, p) => a + p.rating, 0) / products.length;
  }, [products]);
  const totalRevs = useMemo(() => products.reduce((a, p) => a + p.revs, 0), [products]);

  // ---- quiz live match count ----
  const quizMatches = useMemo(() => {
    let list = [...products];
    if (quizPuffs) {
      const b = puffBuckets.find((x) => x.id === quizPuffs);
      if (b) list = list.filter((p) => b.test(p.puffs));
    }
    if (quizNicotine) list = list.filter((p) => p.nicotineStrength === quizNicotine);
    if (quizFlavor) list = list.filter((p) => p.flavorFamily === quizFlavor);
    return list.length;
  }, [products, quizPuffs, quizNicotine, quizFlavor, puffBuckets]);

  // ---- compare list ----
  const compareProducts = useMemo(
    () => compareIds.map((id) => products.find((p) => p.id === id)).filter((p): p is ProductItem => Boolean(p)),
    [compareIds, products]
  );
  const toggleCompare = (id: string) =>
    setCompareIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= (pageSettings?.compareLimit || 3) ? prev : [...prev, id]));

  const openQuiz = () => {
    setQuizStep(0); setQuizPuffs(null); setQuizNicotine(null); setQuizFlavor(null);
    setQuizOpen(true);
  };
  const applyQuiz = () => {
    setSelectedPuffs(quizPuffs ? [quizPuffs] : []);
    setSelectedNicotines(quizNicotine ? [quizNicotine] : []);
    setSelectedFlavorFamilies(quizFlavor ? [quizFlavor] : []);
    setQuizOpen(false);
    setTimeout(() => document.getElementById("collection-grid-top")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const startFlyToCart = (p: ProductItem, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    setFlyItem({
      p,
      x: r.left + r.width / 2,
      y: r.top + r.height / 2,
      tx: typeof window !== "undefined" ? window.innerWidth - 52 : 300,
      ty: 44,
    });
  };

  // ---------- shared bits ----------
  const filterPanel = (
    <div className="space-y-5">
      {/* search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-700/60" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products…"
          className="w-full h-11 rounded-xl border border-emerald-900/15 bg-white pl-10 pr-4 text-sm text-emerald-950 placeholder:text-emerald-900/40 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
        />
      </div>

      {/* availability */}
      <div className="rounded-2xl border border-emerald-900/10 bg-white p-4">
        <p className="font-cinzel text-[11px] tracking-[0.18em] text-emerald-900 font-bold mb-3">AVAILABILITY</p>
        <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
          <button
            role="checkbox" aria-checked={inStockOnly}
            onClick={() => setInStockOnly(!inStockOnly)}
            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${inStockOnly ? "bg-emerald-800 border-emerald-800" : "border-emerald-900/25 bg-white"}`}
          >
            {inStockOnly && <Check size={14} className="text-white" strokeWidth={3} />}
          </button>
          <span className="text-sm font-medium text-emerald-950">In stock only</span>
        </label>
      </div>

      {/* price */}
      <div className="rounded-2xl border border-emerald-900/10 bg-white p-4">
        <p className="font-cinzel text-[11px] tracking-[0.18em] text-emerald-900 font-bold mb-3">PRICE (AED)</p>
        <div className="flex items-center gap-2">
          <input
            value={priceMinInput} inputMode="numeric"
            onChange={(e) => setPriceMinInput(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder={`${priceBounds.min}`} aria-label="Minimum price"
            className="w-full h-11 rounded-xl border border-emerald-900/15 px-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
          <span className="text-emerald-900/40 font-bold">–</span>
          <input
            value={priceMaxInput} inputMode="numeric"
            onChange={(e) => setPriceMaxInput(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder={`${priceBounds.max}`} aria-label="Maximum price"
            className="w-full h-11 rounded-xl border border-emerald-900/15 px-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
        <button
          onClick={() => {
            setPriceMin(priceMinInput ? parseFloat(priceMinInput) : null);
            setPriceMax(priceMaxInput ? parseFloat(priceMaxInput) : null);
          }}
          className="mt-3 w-full h-11 rounded-xl bg-emerald-900 text-white text-sm font-bold tracking-wide hover:bg-emerald-800 transition-colors"
        >
          APPLY PRICE
        </button>
      </div>

      {/* brand */}
      <div className="rounded-2xl border border-emerald-900/10 bg-white p-4">
        <p className="font-cinzel text-[11px] tracking-[0.18em] text-emerald-900 font-bold mb-2">BRAND</p>
        <div className="max-h-56 overflow-y-auto pr-1 space-y-0.5">
          {brands.map((b) => (
            <label key={b} className="flex items-center gap-3 cursor-pointer min-h-[40px] rounded-lg px-1 hover:bg-emerald-50">
              <button
                role="checkbox" aria-checked={selectedBrands.includes(b)}
                onClick={() => toggleIn(selectedBrands, b, setSelectedBrands)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${selectedBrands.includes(b) ? "bg-amber-500 border-amber-500" : "border-emerald-900/25 bg-white"}`}
              >
                {selectedBrands.includes(b) && <Check size={12} className="text-white" strokeWidth={3.5} />}
              </button>
              <span className="text-sm text-emerald-950 flex-1">{b}</span>
              <span className="text-xs font-semibold text-emerald-900/45 bg-emerald-50 rounded-full px-2 py-0.5">{brandCounts[b]}</span>
            </label>
          ))}
        </div>
      </div>

      {/* nicotine */}
      <div className="rounded-2xl border border-emerald-900/10 bg-white p-4">
        <p className="font-cinzel text-[11px] tracking-[0.18em] text-emerald-900 font-bold mb-2">NICOTINE STRENGTH</p>
        <div className="space-y-0.5">
          {nicotines.map((n) => (
            <label key={n} className="flex items-center gap-3 cursor-pointer min-h-[40px] rounded-lg px-1 hover:bg-emerald-50">
              <button
                role="checkbox" aria-checked={selectedNicotines.includes(n)}
                onClick={() => toggleIn(selectedNicotines, n, setSelectedNicotines)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${selectedNicotines.includes(n) ? "bg-amber-500 border-amber-500" : "border-emerald-900/25 bg-white"}`}
              >
                {selectedNicotines.includes(n) && <Check size={12} className="text-white" strokeWidth={3.5} />}
              </button>
              <span className="text-sm text-emerald-950 flex-1">{n}</span>
              <span className="text-xs font-semibold text-emerald-900/45 bg-emerald-50 rounded-full px-2 py-0.5">{nicotineCounts[n]}</span>
            </label>
          ))}
        </div>
      </div>

      {/* puffs */}
      <div className="rounded-2xl border border-emerald-900/10 bg-white p-4">
        <p className="font-cinzel text-[11px] tracking-[0.18em] text-emerald-900 font-bold mb-2">PUFF COUNT</p>
        <div className="space-y-0.5">
          {puffBuckets.map((b) => (
            <label key={b.id} className="flex items-center gap-3 cursor-pointer min-h-[40px] rounded-lg px-1 hover:bg-emerald-50">
              <button
                role="checkbox" aria-checked={selectedPuffs.includes(b.id)}
                onClick={() => toggleIn(selectedPuffs, b.id, setSelectedPuffs)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${selectedPuffs.includes(b.id) ? "bg-amber-500 border-amber-500" : "border-emerald-900/25 bg-white"}`}
              >
                {selectedPuffs.includes(b.id) && <Check size={12} className="text-white" strokeWidth={3.5} />}
              </button>
              <span className="text-sm text-emerald-950 flex-1">{b.label}</span>
              <span className="text-xs font-semibold text-emerald-900/45 bg-emerald-50 rounded-full px-2 py-0.5">{b.count}</span>
            </label>
          ))}
        </div>
      </div>

      {/* flavour profile */}
      <div className="rounded-2xl border border-emerald-900/10 bg-white p-4">
        <p className="font-cinzel text-[11px] tracking-[0.18em] text-emerald-900 font-bold mb-2">FLAVOUR PROFILE</p>
        <div className="space-y-0.5">
          {flavorFamilies.map((f) => (
            <label key={f.id} className="flex items-center gap-3 cursor-pointer min-h-[40px] rounded-lg px-1 hover:bg-emerald-50">
              <button
                role="checkbox" aria-checked={selectedFlavorFamilies.includes(f.id)}
                onClick={() => toggleIn(selectedFlavorFamilies, f.id, setSelectedFlavorFamilies)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${selectedFlavorFamilies.includes(f.id) ? "bg-amber-500 border-amber-500" : "border-emerald-900/25 bg-white"}`}
              >
                {selectedFlavorFamilies.includes(f.id) && <Check size={12} className="text-white" strokeWidth={3.5} />}
              </button>
              <span className="text-sm text-emerald-950 flex-1">{f.name}</span>
              <span className="text-xs font-semibold text-emerald-900/45 bg-emerald-50 rounded-full px-2 py-0.5">{flavorFamilyCounts[f.id] || 0}</span>
            </label>
          ))}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button
          onClick={clearAll}
          className="w-full h-11 rounded-xl border-2 border-emerald-900/15 text-emerald-900 text-sm font-bold hover:border-amber-500 hover:text-amber-600 transition-colors"
        >
          CLEAR ALL FILTERS ({activeFilterCount})
        </button>
      )}
    </div>
  );

  const productCard = (p: ProductItem, i: number) => {
    const discount = p.originalPrice > p.price ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
    const wished = wishlist.includes(p.id);
    const inCompare = compareIds.includes(p.id);
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
          <Link href={`/product/${p.slug}`} aria-label={p.title} className="block w-full h-full" onClick={() => saveRecent(p)}>
            <Image
              src={p.primaryImage} alt={p.title} fill sizes="(max-width: 640px) 50vw, 33vw"
              className="object-contain p-1 sm:p-2 transition-transform duration-500 group-hover:scale-105"
            />
            {p.images[1] && (
              <Image
                src={p.images[1]} alt="" aria-hidden fill sizes="(max-width: 640px) 50vw, 33vw"
                className="object-contain p-1 sm:p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />
            )}
          </Link>
          <button
            onClick={() => toggleWishlist(p.id)} aria-label="Add to wishlist"
            className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur border border-emerald-900/10 flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
          >
            <Heart size={16} className={wished ? "fill-red-500 text-red-500" : "text-emerald-900"} />
          </button>
          <button
            onClick={() => toggleCompare(p.id)}
            aria-label={inCompare ? "Remove from compare" : "Add to compare"}
            title="Compare"
            className={`absolute top-[52px] left-3 w-9 h-9 rounded-full backdrop-blur border flex items-center justify-center shadow-sm hover:scale-110 transition-all ${inCompare ? "bg-amber-400 border-amber-400 text-emerald-950" : "bg-white/90 border-emerald-900/10 text-emerald-900"}`}
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
            onClick={() => { setQuickViewProduct(p); setQuickViewFlavor(p.flavors[0]?.id || ""); setQuickViewQty(1); }}
            className="absolute inset-x-3 bottom-3 h-11 rounded-xl bg-emerald-950/90 backdrop-blur text-white text-sm font-bold tracking-wide opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hidden sm:flex items-center justify-center gap-2"
          >
            <Eye size={16} /> QUICK VIEW
          </button>
        </div>
        <div className="flex flex-1 flex-col p-3 sm:p-4">
          <p className="font-cinzel text-[10px] tracking-[0.2em] text-emerald-700/80 font-bold truncate">{p.brand}</p>
          <Link href={`/product/${p.slug}`} onClick={() => saveRecent(p)}>
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
                <span className="text-xs sm:text-sm text-neutral-400 line-through">{formatAED(p.originalPrice)}</span>
                <span className="hidden sm:inline-block text-[11px] font-bold text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5">
                  Save {formatAED(p.originalPrice - p.price)}
                </span>
              </>
            )}
          </div>
          <div className="mt-2.5 sm:mt-3 flex items-center gap-1.5">
            <button
              onClick={(e) => startFlyToCart(p, e.currentTarget)}
              disabled={!p.inStock}
              className="flex-1 min-w-0 h-10 sm:h-11 rounded-xl bg-emerald-800 text-white text-[11px] sm:text-sm font-bold tracking-normal sm:tracking-wide hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap px-1.5 sm:px-3"
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
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-neutral-900 flex flex-col">
      <Header
        onCartClick={() => setIsCartOpen(true)}
        cartCount={cartItems.reduce((a, it) => a + it.quantity, 0)}
      />

      {/* ============ HERO BANNER (cinematic) ============ */}
      <section
        ref={heroRef}
        onMouseMove={(e) => {
          if (!finePointer || !heroRef.current) return;
          const r = heroRef.current.getBoundingClientRect();
          setHeroTilt({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
        }}
        onMouseLeave={() => setHeroTilt({ x: 0, y: 0 })}
        className="relative overflow-hidden bg-gradient-to-br from-[#064e3b] via-[#043e2e] to-[#022c22] text-white"
      >
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-400/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-400/15 rounded-full blur-[100px] pointer-events-none" />
        {/* drifting ambient blobs */}
        <motion.div
          aria-hidden
          className="absolute top-1/3 left-1/4 w-72 h-72 bg-emerald-300/10 rounded-full blur-[90px] pointer-events-none"
          animate={{ x: [0, 46, -20, 0], y: [0, -34, 22, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-400/10 rounded-full blur-[100px] pointer-events-none"
          animate={{ x: [0, -40, 28, 0], y: [0, 30, -24, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* floating product images with mouse parallax (desktop only) */}
        {products[0] && (
          <motion.div
            aria-hidden
            className="hidden lg:block absolute right-[8%] top-1/2 w-44 xl:w-56 pointer-events-none z-[5]"
            animate={finePointer ? { x: heroTilt.x * 34, y: heroTilt.y * 26 - 80 } : { y: -80 }}
            transition={{ type: "spring", stiffness: 60, damping: 18 }}
          >
            <motion.div
              animate={{ y: [0, -14, 0], rotate: [0, 2, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 p-4 shadow-2xl"
            >
              <Image src={products[0].primaryImage} alt="" width={200} height={200} className="w-full h-auto object-contain" />
            </motion.div>
          </motion.div>
        )}
        {products[1] && (
          <motion.div
            aria-hidden
            className="hidden lg:block absolute right-[24%] bottom-[8%] w-32 xl:w-40 pointer-events-none z-[5]"
            animate={finePointer ? { x: heroTilt.x * -24, y: heroTilt.y * -18 } : {}}
            transition={{ type: "spring", stiffness: 60, damping: 18 }}
          >
            <motion.div
              animate={{ y: [0, 12, 0], rotate: [0, -3, 0] }}
              transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
              className="rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 p-3 shadow-2xl"
            >
              <Image src={products[1].primaryImage} alt="" width={150} height={150} className="w-full h-auto object-contain" />
            </motion.div>
          </motion.div>
        )}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-6 pb-8 sm:pt-8 sm:pb-10 relative z-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-emerald-200/70 text-xs font-semibold mb-4">
            <Link href="/" className="hover:text-amber-300 transition-colors">Home</Link>
            <ChevronRight size={12} className="text-emerald-400/60" />
            <Link href="/collections" className="hover:text-amber-300 transition-colors">Collections</Link>
            {category && (<><ChevronRight size={12} className="text-emerald-400/60" /><span className="text-amber-300">{category.name}</span></>)}
          </nav>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="font-cinzel text-[11px] sm:text-xs tracking-[0.28em] text-amber-300 font-bold mb-2">{pageEyebrow}</p>
            <h1 className="font-luxury text-3xl sm:text-4xl md:text-5xl font-bold leading-tight lg:max-w-[62%]">{pageTitle}</h1>
            <p className="mt-3 max-w-2xl text-sm sm:text-base text-emerald-100/85 leading-relaxed lg:max-w-[55%]">{pageSubtitle}</p>
            <button
              onClick={openQuiz}
              className="mt-5 h-[52px] px-7 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 font-extrabold text-sm tracking-wide hover:brightness-105 active:scale-[0.98] transition-all shadow-[0_12px_32px_-10px_rgba(245,158,11,0.65)] inline-flex items-center gap-2.5"
            >
              FIND YOUR VAPE
            </button>
          </motion.div>
          {/* brand quick chips */}
          <div className="mt-5 flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x">
            <button
              onClick={() => setSelectedBrands([])}
              className={`shrink-0 snap-start h-10 px-4 rounded-full text-xs font-bold tracking-wide border transition-colors ${selectedBrands.length === 0 ? "bg-amber-400 text-emerald-950 border-amber-400" : "bg-white/10 text-white border-white/20 hover:border-amber-300"}`}
            >
              ALL BRANDS
            </button>
            {brands.map((b) => (
              <button
                key={b}
                onClick={() => toggleIn(selectedBrands, b, setSelectedBrands)}
                className={`shrink-0 snap-start h-10 px-4 rounded-full text-xs font-bold tracking-wide border transition-colors ${selectedBrands.includes(b) ? "bg-amber-400 text-emerald-950 border-amber-400" : "bg-white/10 text-white border-white/20 hover:border-amber-300"}`}
              >
                {b} <span className="opacity-70">({brandCounts[b]})</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ============ BODY: SIDEBAR + GRID ============ */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex gap-6 lg:gap-8 items-start">
          {/* desktop sidebar */}
          <aside className="hidden lg:block w-[280px] shrink-0 sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <SlidersHorizontal size={16} className="text-emerald-800" />
              <h2 className="font-cinzel text-sm tracking-[0.18em] font-bold text-emerald-950">FILTERS</h2>
            </div>
            {filterPanel}
          </aside>

          {/* content */}
          <div className="flex-1 min-w-0" id="collection-grid-top">
            {/* toolbar */}
            <div className="mb-5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden h-11 px-4 rounded-xl bg-emerald-900 text-white text-sm font-bold flex items-center gap-2 shrink-0"
                >
                  <SlidersHorizontal size={16} /> FILTERS
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-emerald-950 text-[11px] font-extrabold flex items-center justify-center">{activeFilterCount}</span>
                  )}
                </button>
                <p className="hidden lg:block text-sm text-neutral-600">
                  Showing <span className="font-bold text-emerald-900">{pageItems.length}</span> of{" "}
                  <span className="font-bold text-emerald-900">{filtered.length}</span> products
                </p>
                <div className="ml-auto relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    aria-label="Sort products"
                    className="h-11 appearance-none rounded-xl border border-emerald-900/15 bg-white pl-4 pr-10 text-sm font-semibold text-emerald-950 outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {(pageSettings?.sortOptions?.length ? pageSettings.sortOptions : [
                      { value: "popular", label: "Most Popular" },
                      { value: "rating", label: "Top Rated" },
                      { value: "price_asc", label: "Price: Low → High" },
                      { value: "price_desc", label: "Price: High → Low" },
                      { value: "newest", label: "Newest" },
                    ]).map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-800 pointer-events-none" />
                </div>
              </div>
              <p className="lg:hidden mt-2.5 text-[13px] text-neutral-500">
                Showing <span className="font-bold text-emerald-900">{pageItems.length}</span> of{" "}
                <span className="font-bold text-emerald-900">{filtered.length}</span> products
              </p>
            </div>

            {/* grid */}
            {pageItems.length > 0 ? (
              <div className="sm:rounded-3xl sm:bg-gradient-to-b sm:from-emerald-50/80 sm:to-emerald-50/30 sm:border sm:border-emerald-900/[0.07] sm:p-5">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {pageItems.map((p, i) => productCard(p, i))}
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border-2 border-dashed border-emerald-900/15 bg-white py-16 px-6 text-center">
                <Search size={36} className="mx-auto text-emerald-900/25 mb-4" />
                <h3 className="font-luxury text-xl font-bold text-emerald-950">No products match your filters</h3>
                <p className="text-sm text-neutral-500 mt-2">Try widening the price range or clearing a filter.</p>
                <button onClick={clearAll} className="mt-5 h-11 px-6 rounded-xl bg-emerald-800 text-white text-sm font-bold hover:bg-emerald-700">
                  CLEAR ALL FILTERS
                </button>
              </div>
            )}

            {/* pagination — correct math (bug fix) */}
            {totalPages > 1 && (
              <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => { setCurrentPage(Math.max(1, safePage - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={safePage === 1}
                  className="h-11 px-4 rounded-xl border border-emerald-900/15 bg-white text-sm font-bold text-emerald-900 disabled:opacity-35 hover:border-amber-500"
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, n) => n + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => { setCurrentPage(n); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    aria-current={n === safePage ? "page" : undefined}
                    className={`w-11 h-11 rounded-xl text-sm font-bold transition-colors ${n === safePage ? "bg-emerald-900 text-white" : "border border-emerald-900/15 bg-white text-emerald-900 hover:border-amber-500"}`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => { setCurrentPage(Math.min(totalPages, safePage + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={safePage === totalPages}
                  className="h-11 px-4 rounded-xl border border-emerald-900/15 bg-white text-sm font-bold text-emerald-900 disabled:opacity-35 hover:border-amber-500"
                >
                  Next →
                </button>
              </nav>
            )}
          </div>
        </div>

        {/* ============ RECENTLY VIEWED ============ */}
        {recentlyViewed.length > 0 && (
          <section className="mt-12 sm:mt-16 rounded-3xl border border-emerald-900/10 bg-gradient-to-br from-white via-emerald-50/40 to-amber-50/30 p-5 sm:p-8 shadow-[0_20px_60px_-30px_rgba(6,78,59,0.25)]">
            <div className="flex items-end justify-between mb-6">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950 px-3.5 py-1.5 font-cinzel text-[10px] tracking-[0.22em] text-amber-300 font-bold mb-3">
                  <History size={12} /> PICK UP WHERE YOU LEFT OFF
                </span>
                <h2 className="font-luxury text-2xl sm:text-3xl font-bold text-emerald-950">Recently Viewed</h2>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800/60">
                Saved on this device
              </span>
            </div>
            <div className="flex gap-4 sm:gap-5 overflow-x-auto pb-2 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-5 px-5 sm:mx-0 sm:px-0">
              {recentlyViewed.map((r) => (
                <Link
                  key={r.slug}
                  href={`/product/${r.slug}`}
                  className="group relative shrink-0 w-48 sm:w-60 snap-start rounded-3xl bg-white border border-emerald-900/10 overflow-hidden hover:border-amber-400/60 hover:shadow-[0_24px_50px_-20px_rgba(245,158,11,0.35)] hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-emerald-50/80 via-white to-amber-50/40 overflow-hidden">
                    <Image src={r.primaryImage} alt={r.title} fill sizes="240px" className="object-contain p-4 transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-4">
                    <p className="font-cinzel text-[10px] tracking-[0.2em] text-amber-600 font-bold">{r.brand}</p>
                    <p className="mt-1 text-sm font-bold text-emerald-950 leading-snug line-clamp-2 min-h-[2.6em] group-hover:text-emerald-800 transition-colors">{r.title}</p>
                    <div className="mt-2.5 flex items-center justify-between">
                      <p className="text-base font-extrabold text-emerald-900">{formatAED(r.price)}</p>
                      <span className="w-8 h-8 rounded-full bg-emerald-950 text-amber-300 flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-300">
                        <ArrowRight size={15} />
                      </span>
                    </div>
                  </div>
                  <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ============ SHOP BY CATEGORY ============ */}
        <section className="mt-14 sm:mt-20">
          <div className="flex items-end justify-between mb-5">
            <div>
              <p className="font-cinzel text-[11px] tracking-[0.24em] text-amber-600 font-bold mb-2">BROWSE COLLECTIONS</p>
              <h2 className="font-luxury text-2xl sm:text-3xl font-bold text-emerald-950">Shop by Category</h2>
            </div>
            <Link href="/collections" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-emerald-800 hover:text-amber-600 transition-colors">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 sm:mx-0 sm:px-0">
            {allCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/collections/${cat.slug}`}
                className="group relative shrink-0 w-44 sm:w-56 h-56 sm:h-64 rounded-3xl overflow-hidden snap-start border border-emerald-900/10"
              >
                <Image src={cat.image} alt={cat.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="224px" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#022c22] via-[#022c22]/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-luxury text-base sm:text-lg font-bold text-white leading-tight">{cat.name}</p>
                  <p className="mt-1 text-xs font-semibold text-amber-300">{catalogCategoryCounts[cat.slug] || 0} products</p>
                </div>
                {cat.badge && (
                  <span className="absolute top-3 left-3 font-cinzel text-[9px] tracking-[0.18em] font-bold bg-amber-400 text-emerald-950 px-2.5 py-1 rounded-full">
                    {cat.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>

        {/* ============ SHOP BY BRAND ============ */}
        <section className="mt-12 sm:mt-16 overflow-hidden rounded-3xl bg-gradient-to-br from-[#064e3b] via-[#043e2e] to-[#022c22] relative">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-amber-400/10 blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-emerald-400/10 blur-[70px] pointer-events-none" />
          <div className="relative z-10 p-6 sm:p-10">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1.5 font-cinzel text-[11px] tracking-[0.24em] text-amber-300 font-bold mb-3">
                  TOP BRANDS
                </p>
                <h2 className="font-luxury text-2xl sm:text-3xl font-bold text-white">Shop by Brand</h2>
                <p className="mt-2 text-sm text-emerald-100/70 max-w-xl">Only 100% authentic stock from the world's most trusted manufacturers.</p>
              </div>
            </div>
            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: "none" }}>
              {brands.map((b, i) => (
                <motion.button
                  key={b}
                  initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: Math.min(i * 0.07, 0.35) }}
                  onClick={() => {
                    setSelectedBrands([b]);
                    document.getElementById("collection-grid-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="group relative shrink-0 snap-start w-[200px] sm:w-[230px] rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur p-5 sm:p-6 text-left overflow-hidden hover:bg-white/[0.1] hover:border-amber-400/50 hover:shadow-[0_16px_40px_-12px_rgba(245,158,11,0.35)] transition-all duration-300 active:scale-[0.98]"
                >
                  <span className="absolute -bottom-4 -right-2 font-luxury text-[92px] sm:text-[104px] leading-none font-bold text-white/[0.05] group-hover:text-amber-400/10 transition-colors select-none">
                    {b.charAt(0)}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-amber-400/15 border border-amber-400/30 px-2.5 py-1 text-[11px] font-extrabold text-amber-300">
                    {brandCounts[b]} product{brandCounts[b] === 1 ? "" : "s"}
                  </span>
                  <p className="relative mt-4 font-luxury text-xl sm:text-2xl font-bold text-white leading-tight">{b}</p>
                  <p className="relative mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-100/60 group-hover:text-amber-300 transition-colors">
                    Shop now <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </p>
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-400 to-amber-500 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* ============ FLAVOUR HIGHLIGHTS ============ */}
        <section className="mt-12 sm:mt-16">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-cinzel text-[11px] tracking-[0.24em] text-amber-600 font-bold mb-2">TASTE PROFILES</p>
              <h2 className="font-luxury text-2xl sm:text-3xl font-bold text-emerald-950">Explore Flavours</h2>
              <p className="mt-2 text-sm text-neutral-500 max-w-xl">From icy fruit blends to rich tobacco — find the taste profile that becomes your all-day vape.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {flavorFamilies.map((f, i) => {
              const themes: Record<string, { bg: string; glow: string; accent: string }> = {
                "fruit-ice": { bg: "from-sky-600 via-cyan-700 to-blue-900", glow: "bg-cyan-300/30", accent: "text-cyan-200" },
                "menthol-mint": { bg: "from-emerald-600 via-teal-700 to-emerald-900", glow: "bg-emerald-300/30", accent: "text-emerald-200" },
                "tobacco": { bg: "from-amber-700 via-yellow-800 to-stone-900", glow: "bg-amber-300/30", accent: "text-amber-200" },
                "dessert-sweet": { bg: "from-rose-600 via-pink-700 to-purple-900", glow: "bg-rose-300/30", accent: "text-rose-200" },
              };
              const t = themes[f.id] || { bg: "from-emerald-700 via-emerald-800 to-[#022c22]", glow: "bg-emerald-300/30", accent: "text-emerald-200" };
              return (
              <motion.button
                key={f.id}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.35, delay: Math.min(i * 0.05, 0.3) }}
                onClick={() => {
                  setSelectedFlavorFamilies([f.id]);
                  document.getElementById("collection-grid-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`group relative rounded-3xl overflow-hidden bg-gradient-to-br ${t.bg} text-left shadow-[0_16px_36px_-14px_rgba(0,0,0,0.4)] hover:shadow-[0_24px_50px_-14px_rgba(0,0,0,0.5)] hover:-translate-y-1.5 transition-all duration-300 active:scale-[0.98]`}
              >
                <div className={`absolute -top-10 -right-10 h-36 w-36 rounded-full ${t.glow} blur-[50px] pointer-events-none`} />
                <div className="relative h-44 sm:h-56 overflow-hidden">
                  {f.image ? (
                    <Image src={f.image} alt={f.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" sizes="320px" />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                  <div className="absolute top-3 right-3 rounded-full bg-white/95 backdrop-blur px-3 py-1 text-[11px] font-extrabold text-emerald-950 shadow-lg">
                    {flavorFamilyCounts[f.id] || 0} products
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                    <p className={`font-cinzel text-[10px] tracking-[0.22em] font-bold ${t.accent} mb-1`}>TASTE PROFILE</p>
                    <p className="font-luxury text-xl sm:text-2xl font-bold text-white leading-tight">{f.name}</p>
                  </div>
                </div>
                <div className="relative p-4 sm:p-5 bg-black/25 backdrop-blur-[2px]">
                  <p className="text-xs sm:text-sm text-white/85 leading-relaxed line-clamp-2 min-h-[2.5em]">{f.desc}</p>
                  <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold text-white bg-white/15 border border-white/25 rounded-full px-3.5 py-2 group-hover:bg-amber-400 group-hover:text-emerald-950 group-hover:border-amber-400 transition-all">
                    Shop flavours <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </p>
                </div>
              </motion.button>
              );
            })}
          </div>
        </section>

        {/* ============ SEO EDITORIAL ============ */}
        <section className="mt-14 sm:mt-20 overflow-hidden rounded-3xl border border-emerald-900/10 bg-white">
          {/* Guide header — emerald banner */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#064e3b] via-[#043e2e] to-[#022c22] px-6 py-10 sm:px-10 sm:py-14">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-amber-400/15 blur-[90px] pointer-events-none" />
            <div className="absolute -bottom-24 -left-16 h-60 w-60 rounded-full bg-emerald-400/10 blur-[80px] pointer-events-none" />
            <div className="relative z-10 max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1.5 font-cinzel text-[11px] tracking-[0.24em] text-amber-300 font-bold">
                <BookOpen size={13} /> BUYING GUIDE
              </p>
              <h2 className="mt-4 font-luxury text-3xl sm:text-4xl font-bold text-white leading-tight">
                {category ? `Why Buy ${category.name} from Vape Mart UAE?` : "The Vape Mart UAE Buying Guide"}
              </h2>
              <p className="mt-4 text-[15px] sm:text-base leading-relaxed text-emerald-100/85 max-w-2xl">
                {category ? category.description : "The Emirates' trusted destination for 100% authentic vaping hardware — every device sourced through licensed UAE importers, ESMA-compliant, and backed by our authenticity guarantee."}
              </p>
            </div>
          </div>

          {/* Intro lead */}
          <div className="px-6 sm:px-10 pt-8 sm:pt-10">
            <div className="grid lg:grid-cols-[1fr_320px] gap-6 lg:gap-8 items-start">
              <div>
                <p className="text-base sm:text-lg leading-relaxed text-emerald-950 font-medium">
                  Whether you are switching from cigarettes or upgrading your setup, choose by <span className="text-amber-600 font-bold">puff count first</span> (5,000–10,000 for casual use, 20,000+ for heavy daily vaping), then match your nicotine strength — <span className="text-amber-600 font-bold">20mg (2%)</span> for a balanced throat hit or <span className="text-amber-600 font-bold">50mg (5%)</span> for maximum satisfaction.
                </p>
                <p className="mt-4 text-sm sm:text-[15px] leading-relaxed text-neutral-600">
                  All orders placed before 9pm qualify for same-day dispatch in Dubai, Sharjah and Ajman, with cash on delivery available across the UAE. Below is everything you need to buy with confidence — from puff counts to flavour families.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {["5,000–40,000 puffs", "20mg & 50mg nic salts", "Dual-mesh coils", "Type-C charging"].map((t) => (
                    <span key={t} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-900/5 border border-emerald-900/10 px-3 py-1.5 text-xs font-semibold text-emerald-900">
                      <Check size={13} className="text-amber-600" /> {t}
                    </span>
                  ))}
                </div>
              </div>
              <aside className="rounded-2xl bg-gradient-to-br from-[#064e3b] to-[#022c22] p-5 sm:p-6 text-white relative overflow-hidden">
                <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-amber-400/20 blur-[50px] pointer-events-none" />
                <p className="relative font-cinzel text-[10px] tracking-[0.22em] text-amber-300 font-bold mb-4">WHY VAPE MART</p>
                <ul className="relative space-y-3.5">
                  {[
                    { icon: BadgeCheck, t: "100% Authentic", d: "Licensed UAE importer stock" },
                    { icon: Truck, t: "Same-Day Dispatch", d: "Order before 9pm, Dubai express 2–3h" },
                    { icon: CreditCard, t: "Cash on Delivery", d: "Pay cash or card at your door" },
                    { icon: Headset, t: "24/7 Expert Help", d: "Real humans on WhatsApp" },
                  ].map((f) => (
                    <li key={f.t} className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-amber-300">
                        <f.icon size={16} />
                      </span>
                      <span>
                        <span className="block text-sm font-bold">{f.t}</span>
                        <span className="block text-xs text-emerald-100/70 mt-0.5">{f.d}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
          </div>

          {/* Guide chapters — numbered premium cards */}
          <div className="px-6 sm:px-10 py-8 sm:py-10">
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
              {[
                {
                  n: "01", icon: Zap, title: "Understanding Puff Counts: How Long Will Your Vape Last?",
                  body: [
                    <>Puff count is the single most useful number when comparing {category ? category.name.toLowerCase() : "vapes"}. It tells you roughly how many draws you get before the e-liquid or battery runs out. A 600-puff device suits a weekend trial, while 10,000–15,000 puffs comfortably cover one to two weeks of moderate daily use. Heavy vapers who switched from a pack-a-day habit usually land happiest in the 20,000–40,000 puff range, where the cost per puff drops dramatically.</>,
                    <>Treat manufacturer puff counts as estimates — your real-world total depends on draw length. Short mouth-to-lung puffs stretch a device further, while long direct-lung draws consume e-liquid faster. As a rule of thumb, divide the advertised puffs by your daily cigarette count times ten to estimate days of use.</>,
                  ]
                },
                {
                  n: "02", icon: Droplets, title: "Nicotine Strengths Explained: 20mg vs 50mg",
                  body: [
                    <>In the UAE, disposable and pod devices typically come in 20mg (2%) or 50mg (5%) nicotine salt formulations. If you smoked up to half a pack a day, 20mg delivers a smooth, cigarette-like throat hit without harshness — it is the strength most ex-smokers settle on. Former pack-a-day (or heavier) smokers usually prefer 50mg, which satisfies cravings faster with fewer puffs.</>,
                    <>Nicotine salts (the "mg" on your device) absorb faster and feel smoother than the freebase nicotine in older e-liquids, which is why even 50mg vapes surprisingly gentle. If you ever feel dizzy or nauseous, you are vaping too much too fast — put the device down, drink water, and consider stepping down to 20mg.</>,
                  ]
                },
                {
                  n: "03", icon: Cpu, title: "Disposable vs Pod vs Mod: Which Device Type Suits You?",
                  body: [
                    <><strong className="text-emerald-900">Disposables</strong> are draw-activated, pre-filled and pre-charged — zero setup, zero maintenance. They dominate the UAE market because they are perfect for beginners, travellers, and anyone who wants flavour variety without commitment. When the puffs run out, you responsibly recycle the unit and open a fresh one.</>,
                    <><strong className="text-emerald-900">Pod systems</strong> (like JUUL, XROS or Nord) use a rechargeable battery with replaceable or refillable pods. The upfront cost is higher, but the long-term cost per puff is far lower, and you get tighter draw control plus refillable freedom. <strong className="text-emerald-900">Mods and kits</strong> are for enthusiasts who want adjustable wattage, rebuildable coils and maximum vapour — overkill for most switchers, heaven for hobbyists.</>,
                  ]
                },
                {
                  n: "04", icon: Leaf, title: "Flavour Families: Finding Your All-Day Vape",
                  body: [
                    <><strong className="text-emerald-900">Fruit ice</strong> (mango ice, blue razz, watermelon chill) is the UAE's best-selling profile — sweet fruit finished with a cool menthol exhale that stays refreshing in the heat. <strong className="text-emerald-900">Menthol &amp; mint</strong> strips it back to pure coolness for ex-menthol cigarette smokers. <strong className="text-emerald-900">Tobacco</strong> blends mimic the earthy richness of cigarettes and help traditional smokers transition without flavour shock.</>,
                    <><strong className="text-emerald-900">Dessert &amp; sweet</strong> (vanilla custard, candy, bakery) suits evening vaping when you want something indulgent. Pro tip: buy two flavour families at once — flavour fatigue is real, and rotating between a fruit ice and a menthol keeps every puff tasting fresh.</>,
                  ]
                },
                {
                  n: "05", icon: ShieldCheck, title: "100% Authentic, ESMA-Compliant Stock",
                  body: [
                    <>Every product at Vape Mart UAE is imported through licensed UAE distributors and complies with Emirates Authority for Standardization and Metrology (ESMA) requirements, including Arabic/English labelling and child-resistant packaging. Each unit carries verifiable authenticity markings — scratch codes, holograms or QR verification depending on the brand.</>,
                    <>Why does this matter? Counterfeit vapes are the industry's biggest safety problem: unknown e-liquid ingredients, overstated puff counts, and batteries without protection circuits. Our authenticity guarantee means the flavour, nicotine strength and puff count printed on the box are exactly what is inside it.</>,
                  ]
                },
                {
                  n: "06", icon: Truck, title: "Delivery, Payment & Support Across the UAE",
                  body: [
                    <>Order before 9pm and your {category ? category.name.toLowerCase() : "vape"} ships the same day. Dubai customers get express 2–3 hour delivery in most areas; Sharjah, Ajman and Abu Dhabi are next-day; the Northern Emirates follow within 48 hours. Every parcel is discreetly packed with no product branding on the outside.</>,
                    <>Pay your way: cash on delivery, card on delivery, or a secure online payment link sent to your WhatsApp. And if you are ever unsure which device or flavour to pick, our vape experts reply on WhatsApp around the clock — real humans, not bots, who actually vape and know the catalog.</>,
                  ]
                },
              ].map((c, i) => (
                <motion.article
                  key={c.n}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: Math.min(i * 0.06, 0.3) }}
                  className="group relative rounded-2xl border border-emerald-900/10 bg-gradient-to-b from-emerald-50/60 to-white p-5 sm:p-7 overflow-hidden hover:border-amber-400/50 hover:shadow-[0_16px_36px_-16px_rgba(6,78,59,0.3)] transition-all duration-300"
                >
                  <span className="absolute -top-2 right-4 font-luxury text-6xl sm:text-7xl font-bold text-emerald-900/[0.06] select-none group-hover:text-amber-500/10 transition-colors">{c.n}</span>
                  <div className="relative">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#064e3b] to-[#022c22] text-amber-300 shadow-[0_8px_18px_-8px_rgba(6,78,59,0.6)]">
                        <c.icon size={20} />
                      </span>
                      <span className="font-cinzel text-[11px] tracking-[0.2em] text-amber-600 font-bold">CHAPTER {c.n}</span>
                    </div>
                    <h3 className="mt-4 font-luxury text-lg sm:text-xl font-bold text-emerald-950 leading-snug">{c.title}</h3>
                    <div className="mt-3 space-y-3 text-sm leading-relaxed text-neutral-600">
                      {c.body.map((p, j) => <p key={j}>{p}</p>)}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>

          {/* comparison table */}
          {products.length > 0 && (
            <div className="px-6 sm:px-10 pb-2">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/15 text-amber-600">
                  <Star size={18} />
                </span>
                <h3 className="font-luxury text-xl font-bold text-emerald-950">Top Rated Right Now</h3>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-emerald-900/10">
              <table className="w-full text-sm min-w-[560px]">
                <thead>
                  <tr className="bg-emerald-950 text-left">
                    <th className="font-cinzel text-[11px] tracking-[0.14em] text-amber-300 px-4 py-3">PRODUCT</th>
                    <th className="font-cinzel text-[11px] tracking-[0.14em] text-amber-300 px-4 py-3">PUFFS</th>
                    <th className="font-cinzel text-[11px] tracking-[0.14em] text-amber-300 px-4 py-3">NICOTINE</th>
                    <th className="font-cinzel text-[11px] tracking-[0.14em] text-amber-300 px-4 py-3">RATING</th>
                    <th className="font-cinzel text-[11px] tracking-[0.14em] text-amber-300 px-4 py-3 text-right">PRICE</th>
                  </tr>
                </thead>
                <tbody>
                  {[...products].sort((a, b) => b.rating - a.rating).slice(0, 5).map((p, i) => (
                    <tr key={p.id} className={i % 2 ? "bg-emerald-50/50" : "bg-white"}>
                      <td className="px-4 py-3 font-semibold text-emerald-950">
                        <Link href={`/product/${p.slug}`} className="hover:text-amber-600">{p.title}</Link>
                      </td>
                      <td className="px-4 py-3 text-neutral-600">{p.puffs ? p.puffs.toLocaleString() : "—"}</td>
                      <td className="px-4 py-3 text-neutral-600">{p.nicotineStrength}</td>
                      <td className="px-4 py-3"><span className="inline-flex items-center gap-1"><Stars rating={p.rating} size={12} /><span className="text-xs text-neutral-500">({p.revs})</span></span></td>
                      <td className="px-4 py-3 text-right font-extrabold text-emerald-900">{formatAED(p.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}

        </section>

        {/* ============ FAQ (standalone section) ============ */}
        <section className="mt-12 sm:mt-16">
          <div className="mb-6 max-w-2xl">
            <p className="font-cinzel text-[11px] tracking-[0.24em] text-amber-600 font-bold mb-2">NEED HELP?</p>
            <h2 className="font-luxury text-2xl sm:text-3xl font-bold text-emerald-950">Frequently Asked Questions</h2>
            <p className="mt-2 text-sm text-neutral-500">Everything you need to know about authenticity, delivery, nicotine strengths and more.</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-3 sm:gap-4">
            {[...(category?.faqs || []),
              { q: "Are your vapes 100% authentic?", a: "Yes — without exception. Every product at Vape Mart UAE is sourced from licensed UAE importers and carries verifiable authenticity packaging: scratch-to-verify codes, holograms or QR checks depending on the brand. We never sell clones, refills or grey-market stock. If any unit ever fails a brand authenticity check, we replace it free and investigate the batch." },
              { q: "How fast is delivery in the UAE?", a: "Dubai orders placed before 9pm are delivered the same day, with express 2–3 hour delivery available in most areas including Marina, JLT, Deira, Bur Dubai and Business Bay. Sharjah, Ajman and Abu Dhabi are next-day. Ras Al Khaimah, Fujairah and Umm Al Quwain arrive within 48 hours. Every parcel is packed discreetly with no product branding visible on the outside." },
              { q: "What nicotine strength should I choose?", a: "20mg (2%) suits most people switching from up to half a pack a day — it gives a smooth, cigarette-like throat hit. 50mg (5%) is for heavier smokers (a pack or more daily) who want maximum satisfaction with fewer puffs. Both use nicotine salts, which feel smoother and absorb faster than old freebase e-liquids. If you feel dizzy, you are vaping too much too fast — pause, drink water, and consider dropping to 20mg." },
              { q: "Do you offer cash on delivery?", a: "Yes — pay cash or by card when your order arrives, anywhere in the UAE. No prepayment needed and no account required. We also send secure online payment links via WhatsApp if you prefer to pay in advance by card or Apple Pay." },
              { q: "How do I know which puff count I need?", a: "Match it to your smoking habit. A 600–5,000 puff device is ideal for trying vaping or as a backup. Moderate daily vapers (ex-half-pack smokers) are happiest at 10,000–15,000 puffs, roughly one to two weeks of use. Heavy vapers should look at 20,000–40,000 puff devices, where the cost per puff is lowest. Remember: long direct-lung draws use e-liquid faster than short mouth-to-lung puffs." },
              { q: "What is the difference between disposable vapes and pod systems?", a: "Disposables are pre-filled, pre-charged and draw-activated — you open the pack and vape, with zero setup or maintenance. Pod systems (like JUUL, XROS or Nord) pair a rechargeable battery with replaceable or refillable pods: higher upfront cost, but much cheaper per puff over time and more control over your draw and flavours. Beginners usually start disposable; regular vapers often graduate to pods within a few months." },
              { q: "Are vapes legal in the UAE?", a: "Yes. Since 2019, the UAE regulates e-cigarettes and vaping products through ESMA (Emirates Authority for Standardization and Metrology). Legal products must meet UAE standards for labelling, packaging and nicotine content — which is exactly what we stock. You must be 18 or older to purchase, and vaping is restricted in the same public places as smoking." },
              { q: "What if my device arrives faulty or I get the wrong flavour?", a: "Contact us on WhatsApp within 48 hours with a short video of the issue and your order number. Faulty devices are replaced free — no need to return the unit in most cases. Wrong flavours or products are exchanged on the next delivery run. Our support team replies around the clock, seven days a week." },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.3) }}
                className={`rounded-2xl border bg-white overflow-hidden transition-all ${openFaq === i ? "border-amber-400/60 shadow-[0_14px_30px_-14px_rgba(6,78,59,0.3)]" : "border-emerald-900/10 hover:border-emerald-900/25"}`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold transition-colors ${openFaq === i ? "bg-amber-400 text-emerald-950" : "bg-emerald-900/10 text-emerald-800"}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm sm:text-[15px] font-semibold text-emerald-950">{f.q}</span>
                  </span>
                  <ChevronDown size={18} className={`shrink-0 text-amber-600 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                      <p className="px-5 pb-5 pl-[60px] text-sm text-neutral-600 leading-relaxed">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ============ TRUST BADGES ============ */}
        <section className="mt-12 sm:mt-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {[
              { icon: BadgeCheck, t: "100% Authentic", d: "Licensed UAE importer, ESMA compliant" },
              { icon: Truck, t: "Express Delivery", d: "2–3 hour Dubai express, same-day UAE" },
              { icon: ShieldCheck, t: "Secure Checkout", d: "COD, card & online link payment" },
              { icon: Headset, t: "24/7 Support", d: "Real humans on WhatsApp, anytime" },
            ].map((b, i) => (
              <motion.div
                key={b.t} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="rounded-2xl bg-gradient-to-br from-[#064e3b] to-[#022c22] p-4 sm:p-6 text-white"
              >
                <b.icon size={26} className="text-amber-400 mb-3" />
                <p className="font-bold text-sm sm:text-base">{b.t}</p>
                <p className="text-xs sm:text-sm text-emerald-100/75 mt-1">{b.d}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ============ REVIEWS ============ */}
        {allReviews.length > 0 && (
          <section className="mt-12 sm:mt-16 overflow-hidden rounded-3xl bg-gradient-to-br from-[#064e3b] via-[#043e2e] to-[#022c22] relative">
            <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-amber-400/10 blur-[90px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-16 h-60 w-60 rounded-full bg-emerald-400/10 blur-[80px] pointer-events-none" />
            <div className="relative z-10 p-6 sm:p-10">
              <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
                <div>
                  <p className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1.5 font-cinzel text-[11px] tracking-[0.24em] text-amber-300 font-bold mb-3">
                    VERIFIED BUYERS
                  </p>
                  <h2 className="font-luxury text-2xl sm:text-3xl font-bold text-white">Customer Reviews</h2>
                  <p className="mt-2 text-sm text-emerald-100/70 max-w-lg">Real feedback from verified customers across the UAE — unedited and unfiltered.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-4 rounded-2xl bg-white/[0.07] border border-white/10 backdrop-blur px-5 py-4">
                    <span className="font-luxury text-4xl font-bold text-amber-300">{avgRating.toFixed(1)}</span>
                    <div>
                      <Stars rating={avgRating} size={15} />
                      <p className="text-xs text-emerald-100/70 mt-1">{totalRevs.toLocaleString()} verified reviews</p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <button
                      onClick={() => document.getElementById("reviews-track")?.scrollBy({ left: -360, behavior: "smooth" })}
                      aria-label="Previous reviews"
                      className="w-11 h-11 rounded-full border border-white/20 text-white flex items-center justify-center hover:bg-amber-400 hover:border-amber-400 hover:text-emerald-950 transition-all"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => document.getElementById("reviews-track")?.scrollBy({ left: 360, behavior: "smooth" })}
                      aria-label="Next reviews"
                      className="w-11 h-11 rounded-full border border-white/20 text-white flex items-center justify-center hover:bg-amber-400 hover:border-amber-400 hover:text-emerald-950 transition-all"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
              <div id="reviews-track" className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
                {allReviews.map((r, i) => (
                  <motion.figure
                    key={r.id}
                    initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: Math.min(i * 0.06, 0.3) }}
                    className="group relative shrink-0 snap-start w-[300px] sm:w-[340px] rounded-2xl bg-white p-5 sm:p-6 flex flex-col overflow-hidden hover:shadow-[0_20px_44px_-16px_rgba(0,0,0,0.45)] transition-all duration-300"
                  >
                    <span className="absolute top-4 right-5 font-luxury text-5xl text-amber-400/25 select-none leading-none">&rdquo;</span>
                    <div className="flex items-center justify-between">
                      <Stars rating={r.rating} size={14} />
                      {r.verified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-900/5 border border-emerald-900/10 px-2.5 py-1 text-[11px] text-emerald-700 font-bold">
                          <BadgeCheck size={12} /> Verified
                        </span>
                      )}
                    </div>
                    <blockquote className="mt-3 flex-1">
                      <p className="text-[15px] font-bold text-emerald-950 leading-snug">{r.title}</p>
                      <p className="mt-2 text-sm text-neutral-600 leading-relaxed line-clamp-4">{r.comment}</p>
                    </blockquote>
                    <figcaption className="mt-4 pt-4 border-t border-emerald-900/10 flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#064e3b] to-[#022c22] text-amber-300 font-luxury font-bold text-sm">
                        {r.author.charAt(0)}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-emerald-950 truncate">{r.author}</span>
                        <span className="block text-xs text-neutral-500 truncate">{r.location}</span>
                      </span>
                    </figcaption>
                  </motion.figure>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ============ WHATSAPP CTA ============ */}
        <section className="mt-12 sm:mt-16 mb-4 rounded-3xl overflow-hidden bg-gradient-to-r from-[#064e3b] to-[#022c22] text-white p-6 sm:p-10 relative">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-400/15 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="flex-1">
              <p className="font-cinzel text-[11px] tracking-[0.24em] text-amber-300 font-bold mb-2">LIVE WHATSAPP SUPPORT</p>
              <h2 className="font-luxury text-2xl sm:text-3xl font-bold">Need Help Choosing? Talk to a Vape Expert.</h2>
              <ul className="mt-3 space-y-1.5 text-sm text-emerald-100/85">
                <li className="flex items-center gap-2"><Check size={15} className="text-amber-400" /> Flavor & nicotine guidance in minutes</li>
                <li className="flex items-center gap-2"><Check size={15} className="text-amber-400" /> Order directly on WhatsApp — COD available</li>
                <li className="flex items-center gap-2"><Check size={15} className="text-amber-400" /> Bulk & wholesale pricing on request</li>
              </ul>
            </div>
            <a
              href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer"
              className="shrink-0 h-[52px] px-7 rounded-2xl bg-[#25D366] text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2.5 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg"
            >
              <MessageCircle size={20} /> CHAT ON WHATSAPP
            </a>
          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomNav />

      {/* ============ MOBILE FILTER DRAWER ============ */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-emerald-950/60 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 w-[86vw] max-w-[340px] bg-[#f8fafc] z-[61] lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-5 h-16 border-b border-emerald-900/10 bg-white shrink-0">
                <span className="font-cinzel text-sm tracking-[0.18em] font-bold text-emerald-950">FILTERS</span>
                <button onClick={() => setIsMobileFilterOpen(false)} aria-label="Close filters" className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-emerald-50">
                  <X size={20} className="text-emerald-900" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">{filterPanel}</div>
              <div className="p-4 border-t border-emerald-900/10 bg-white shrink-0" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full h-[52px] rounded-2xl bg-emerald-900 text-white font-bold text-sm tracking-wide"
                >
                  SHOW {filtered.length} PRODUCTS
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ============ QUICK VIEW MODAL ============ */}
      <AnimatePresence>
        {quickViewProduct && (
          <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setQuickViewProduct(null)} className="absolute inset-0 bg-emerald-950/60 backdrop-blur-sm" />
            <motion.div
              initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative w-full sm:max-w-3xl bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[92dvh] flex flex-col"
            >
              <button onClick={() => setQuickViewProduct(null)} aria-label="Close quick view" className="absolute top-3 right-3 z-10 w-11 h-11 rounded-full bg-white/90 border border-emerald-900/10 flex items-center justify-center">
                <X size={18} className="text-emerald-950" />
              </button>
              <div className="grid sm:grid-cols-2 overflow-y-auto">
                <div className="relative aspect-square bg-gradient-to-br from-[#f8fafc] to-emerald-50/60">
                  <Image src={quickViewProduct.primaryImage} alt={quickViewProduct.title} fill className="object-contain p-8" sizes="50vw" />
                </div>
                <div className="p-5 sm:p-7 flex flex-col" style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}>
                  <p className="font-cinzel text-[10px] tracking-[0.2em] text-emerald-700/80 font-bold">{quickViewProduct.brand}</p>
                  <h3 className="mt-1 font-luxury text-xl font-bold text-emerald-950 leading-snug">{quickViewProduct.title}</h3>
                  <div className="mt-2 flex items-center gap-2">
                    <Stars rating={quickViewProduct.rating} />
                    <span className="text-xs text-neutral-500">({quickViewProduct.revs} reviews)</span>
                  </div>
                  <p className="mt-3 text-2xl font-extrabold text-emerald-900">{formatAED(quickViewProduct.price)}</p>
                  {quickViewProduct.flavors.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-bold tracking-wide text-emerald-900 mb-2">FLAVOR</p>
                      <div className="flex flex-wrap gap-2">
                        {quickViewProduct.flavors.map((f) => (
                          <button
                            key={f.id}
                            onClick={() => setQuickViewFlavor(f.id)}
                            disabled={!f.inStock}
                            className={`min-h-[40px] px-3.5 rounded-full text-xs font-semibold border-2 transition-colors flex items-center gap-2 ${quickViewFlavor === f.id ? "border-amber-500 bg-amber-50 text-emerald-950" : "border-emerald-900/15 text-emerald-900"} ${!f.inStock ? "opacity-40 line-through" : ""}`}
                          >
                            <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: f.color }} />
                            {f.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-5 flex items-center gap-3">
                    <div className="flex items-center rounded-xl border-2 border-emerald-900/15 h-[52px]">
                      <button onClick={() => setQuickViewQty(Math.max(1, quickViewQty - 1))} aria-label="Decrease quantity" className="w-12 h-full flex items-center justify-center text-emerald-900"><Minus size={16} /></button>
                      <span className="w-8 text-center font-bold text-emerald-950">{quickViewQty}</span>
                      <button onClick={() => setQuickViewQty(quickViewQty + 1)} aria-label="Increase quantity" className="w-12 h-full flex items-center justify-center text-emerald-900"><Plus size={16} /></button>
                    </div>
                    <button
                      onClick={() => { addToCart(quickViewProduct, quickViewFlavor, quickViewQty); setQuickViewProduct(null); }}
                      className="flex-1 h-[52px] rounded-2xl bg-emerald-800 text-white font-bold text-sm tracking-wide hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      <ShoppingBag size={17} /> ADD TO CART
                    </button>
                  </div>
                  <Link href={`/product/${quickViewProduct.slug}`} className="mt-3 text-center text-sm font-bold text-amber-600 hover:text-amber-700 py-2">
                    View full details →
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============ VAPE FINDER QUIZ MODAL ============ */}
      <AnimatePresence>
        {quizOpen && (
          <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setQuizOpen(false)} className="absolute inset-0 bg-emerald-950/60 backdrop-blur-sm" />
            <motion.div
              initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[92dvh] flex flex-col"
            >
              <div className="bg-gradient-to-br from-[#064e3b] to-[#022c22] px-6 pt-6 pb-5 text-white relative">
                <button onClick={() => setQuizOpen(false)} aria-label="Close quiz" className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
                  <X size={18} />
                </button>
                <p className="font-cinzel text-[10px] tracking-[0.24em] text-amber-300 font-bold mb-1.5">VAPE FINDER</p>
                <h3 className="font-luxury text-xl sm:text-2xl font-bold">
                  {quizStep === 0 ? "How much do you vape?" : quizStep === 1 ? "Pick your nicotine strength" : "Choose your flavour vibe"}
                </h3>
                <div className="mt-4 flex items-center gap-2">
                  {[0, 1, 2].map((s) => (
                    <span key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= quizStep ? "bg-amber-400" : "bg-white/20"}`} />
                  ))}
                </div>
              </div>
              <div className="p-5 sm:p-6 overflow-y-auto" style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}>
                {quizStep === 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {puffBuckets.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => { setQuizPuffs(b.id); setQuizStep(1); }}
                        className={`min-h-[76px] rounded-2xl border-2 p-3 text-left transition-all active:scale-[0.98] ${quizPuffs === b.id ? "border-amber-500 bg-amber-50" : "border-emerald-900/15 hover:border-amber-500/60"}`}
                      >
                        <p className="text-sm font-extrabold text-emerald-950">{b.label}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">puffs</p>
                        <p className="text-[11px] font-bold text-emerald-700 mt-1">{b.count} matches</p>
                      </button>
                    ))}
                  </div>
                )}
                {quizStep === 1 && (
                  <QuizDropdown
                    value={quizNicotine}
                    placeholder="Select nicotine strength"
                    options={nicotines.map((n) => ({ value: n, label: n, count: nicotineCounts[n] }))}
                    onSelect={(v) => { setQuizNicotine(v); setQuizStep(2); }}
                  />
                )}
                {quizStep === 2 && (
                  <QuizDropdown
                    value={quizFlavor}
                    placeholder="Select your flavour vibe"
                    options={flavorFamilies.map((f) => ({ value: f.id, label: f.name, sub: f.desc, count: flavorFamilyCounts[f.id] || 0, image: f.image }))}
                    onSelect={(v) => setQuizFlavor(v)}
                  />
                )}
                <div className="mt-6 flex items-center gap-3">
                  {quizStep > 0 && (
                    <button
                      onClick={() => setQuizStep(quizStep - 1)}
                      className="h-[52px] px-5 rounded-2xl border-2 border-emerald-900/15 text-emerald-900 font-bold text-sm flex items-center gap-2 hover:border-amber-500"
                    >
                      <ArrowLeft size={16} /> Back
                    </button>
                  )}
                  <div className="flex-1 rounded-2xl bg-emerald-50 px-4 h-[52px] flex items-center justify-center">
                    <p className="text-sm font-bold text-emerald-900"><span className="text-amber-600 text-base">{quizMatches}</span> match{quizMatches === 1 ? "" : "es"} found</p>
                  </div>
                </div>
                {quizStep === 2 && (
                  <button
                    onClick={applyQuiz}
                    disabled={quizMatches === 0}
                    className="mt-3 w-full h-[54px] rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 font-extrabold text-sm tracking-wide hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    SHOW MY {quizMatches} RESULT{quizMatches === 1 ? "" : "S"}
                  </button>
                )}
                <button onClick={() => setQuizOpen(false)} className="mt-2 w-full py-2 text-xs font-semibold text-neutral-400 hover:text-neutral-600">
                  Skip — browse everything
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============ COMPARE FLOATING BAR ============ */}
      <AnimatePresence>
        {compareIds.length > 0 && !compareOpen && (
          <motion.div
            initial={{ y: 90, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 90, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className="fixed z-40 left-3 right-3 bottom-[calc(84px+env(safe-area-inset-bottom))] sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:bottom-6 sm:w-auto"
          >
            <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-950/95 backdrop-blur border border-emerald-700/40 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.5)] p-2.5 pl-3">
              <div className="flex -space-x-2">
                {compareProducts.map((p) => (
                  <span key={p.id} className="w-10 h-10 rounded-xl bg-white border-2 border-emerald-950 overflow-hidden inline-block">
                    <Image src={p.primaryImage} alt="" width={40} height={40} className="w-full h-full object-contain p-0.5" />
                  </span>
                ))}
              </div>
              <button
                onClick={() => setCompareOpen(true)}
                className="h-11 px-5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 font-extrabold text-sm whitespace-nowrap hover:brightness-105 active:scale-[0.98] transition-all"
              >
                Compare ({compareIds.length})
              </button>
              <button onClick={() => setCompareIds([])} aria-label="Clear compare" className="w-11 h-11 rounded-xl text-emerald-100/70 hover:text-white hover:bg-white/10 flex items-center justify-center">
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ COMPARE MODAL ============ */}
      <AnimatePresence>
        {compareOpen && compareProducts.length > 0 && (
          <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCompareOpen(false)} className="absolute inset-0 bg-emerald-950/60 backdrop-blur-sm" />
            <motion.div
              initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative w-full sm:max-w-3xl bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[92dvh] flex flex-col"
            >
              <div className="flex items-center justify-between px-5 sm:px-7 h-16 border-b border-emerald-900/10 shrink-0">
                <h3 className="font-luxury text-lg sm:text-xl font-bold text-emerald-950">Compare Products</h3>
                <button onClick={() => setCompareOpen(false)} aria-label="Close compare" className="w-11 h-11 rounded-full hover:bg-emerald-50 flex items-center justify-center">
                  <X size={20} className="text-emerald-950" />
                </button>
              </div>
              <div className="overflow-auto p-5 sm:p-7" style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-sm">
                    <thead>
                      <tr>
                        <th className="w-24" />
                        {compareProducts.map((p) => (
                          <th key={p.id} className="align-top pb-4 px-2 min-w-[160px]">
                            <div className="relative rounded-2xl bg-gradient-to-br from-[#f8fafc] to-emerald-50/60 border border-emerald-900/10 p-3">
                              <button onClick={() => toggleCompare(p.id)} aria-label={`Remove ${p.title}`} className="absolute top-1.5 right-1.5 w-8 h-8 rounded-full bg-white border border-emerald-900/10 flex items-center justify-center text-neutral-400 hover:text-red-500">
                                <X size={14} />
                              </button>
                              <Image src={p.primaryImage} alt={p.title} width={120} height={120} className="w-24 h-24 object-contain mx-auto" />
                            </div>
                            <p className="mt-2 text-[13px] font-bold text-emerald-950 leading-snug text-left">{p.title}</p>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="[&_td]:px-2 [&_td]:py-2.5 [&_td]:border-t [&_td]:border-emerald-900/10 [&_th]:px-2 [&_th]:py-2.5 [&_th]:border-t [&_th]:border-emerald-900/10 [&_th]:text-left [&_th]:text-xs [&_th]:font-bold [&_th]:text-emerald-900/60 [&_th]:uppercase [&_th]:tracking-wide">
                      <tr>
                        <th scope="row">Price</th>
                        {compareProducts.map((p) => (
                          <td key={p.id}>
                            <span className="font-extrabold text-emerald-900">{formatAED(p.price)}</span>
                            {p.originalPrice > p.price && <span className="block text-xs text-neutral-400 line-through">{formatAED(p.originalPrice)}</span>}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <th scope="row">Puffs</th>
                        {compareProducts.map((p) => <td key={p.id} className="font-semibold text-emerald-950">{p.puffs ? p.puffs.toLocaleString() : "—"}</td>)}
                      </tr>
                      <tr>
                        <th scope="row">Nicotine</th>
                        {compareProducts.map((p) => <td key={p.id} className="text-neutral-600">{p.nicotineStrength}</td>)}
                      </tr>
                      <tr>
                        <th scope="row">Rating</th>
                        {compareProducts.map((p) => (
                          <td key={p.id}><span className="inline-flex items-center gap-1.5"><Stars rating={p.rating} size={12} /><span className="text-xs text-neutral-500">({p.revs})</span></span></td>
                        ))}
                      </tr>
                      <tr>
                        <th scope="row">Battery</th>
                        {compareProducts.map((p) => <td key={p.id} className="text-neutral-600">{p.batteryCapacity || "—"}</td>)}
                      </tr>
                      <tr>
                        <th scope="row">Flavours</th>
                        {compareProducts.map((p) => <td key={p.id} className="text-neutral-600">{p.flavors.length} options</td>)}
                      </tr>
                      <tr>
                        <th scope="row" />
                        {compareProducts.map((p) => (
                          <td key={p.id}>
                            <button
                              onClick={() => { setCompareOpen(false); addToCart(p); }}
                              disabled={!p.inStock}
                              className="w-full h-11 rounded-xl bg-emerald-800 text-white text-xs font-bold whitespace-nowrap hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
                            >
                              <ShoppingBag size={14} /> ADD TO CART
                            </button>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============ FLY TO CART LAYER ============ */}
      <AnimatePresence>
        {flyItem && (
          <motion.img
            key={`${flyItem.p.id}-${flyItem.x}`}
            src={flyItem.p.primaryImage}
            alt=""
            aria-hidden
            initial={{ x: flyItem.x - 32, y: flyItem.y - 32, scale: 1, opacity: 1, rotate: 0 }}
            animate={{ x: flyItem.tx - 32, y: flyItem.ty - 32, scale: 0.22, opacity: 0.5, rotate: 18 }}
            transition={{ duration: 0.65, ease: [0.32, 0.72, 0.35, 1] }}
            onAnimationComplete={() => { const it = flyItem; setFlyItem(null); addToCart(it.p); }}
            className="fixed top-0 left-0 w-16 h-16 rounded-2xl object-contain bg-white shadow-2xl z-[80] pointer-events-none border border-emerald-900/15"
          />
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
