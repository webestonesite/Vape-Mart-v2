"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Filter,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  X,
  Star,
  Heart,
  ShoppingBag,
  Check,
  Search,
  Grid,
  List,
  Flame,
  Zap,
  Droplets,
  ShieldCheck,
  Truck,
  RotateCcw,
  ArrowRight,
  Clock,
  ChevronRight,
  HelpCircle,
  ThumbsUp,
  MessageCircle,
  Layers,
  Eye,
  Plus,
  Minus,
  CheckSquare,
  Square
} from "lucide-react";
import { ProductItem, CollectionCategory, CartItem } from "@/types/product";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { CartDrawer } from "@/components/CartDrawer";

interface CollectionPageViewProps {
  category?: CollectionCategory;
  allCategories: CollectionCategory[];
  products: ProductItem[];
}

export function CollectionPageView({ category, allCategories, products }: CollectionPageViewProps) {
  // View mode: Grid vs List
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState<number>(20);
  const [priceMax, setPriceMax] = useState<number>(200);
  const [selectedPuffRanges, setSelectedPuffRanges] = useState<string[]>([]);
  const [selectedNicotines, setSelectedNicotines] = useState<string[]>([]);
  const [selectedFlavorFamilies, setSelectedFlavorFamilies] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"popular" | "price_asc" | "price_desc" | "rating" | "newest">("popular");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Sidebar Accordion Collapse States
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    price: true,
    availability: true,
    brand: true,
    puffs: true,
    nicotine: true,
    flavor: true,
    features: true
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Quick View Modal State
  const [quickViewProduct, setQuickViewProduct] = useState<ProductItem | null>(null);
  const [quickViewFlavor, setQuickViewFlavor] = useState<string>("");
  const [quickViewQuantity, setQuickViewQuantity] = useState(1);

  // Cart Drawer State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Derived Brand Counts
  const brandCounts = useMemo(() => {
    const counts: { [brand: string]: number } = {};
    products.forEach((p) => {
      counts[p.brand] = (counts[p.brand] || 0) + 1;
    });
    return counts;
  }, [products]);

  const availableBrands = useMemo(() => Object.keys(brandCounts), [brandCounts]);

  // Derived Puff Counts
  const puffOptions = [
    { id: "under-10k", label: "< 10,000 Puffs" },
    { id: "10k-20k", label: "10,000 - 20,000 Puffs" },
    { id: "20k-30k", label: "20,000 - 30,000 Puffs" },
    { id: "30k-40k", label: "30,000 - 40,000 Puffs" },
    { id: "40k-plus", label: "40,000+ Puffs" }
  ];

  const puffCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    products.forEach((p) => {
      if (!p.puffs) return;
      if (p.puffs < 10000) counts["under-10k"] = (counts["under-10k"] || 0) + 1;
      else if (p.puffs >= 10000 && p.puffs <= 20000) counts["10k-20k"] = (counts["10k-20k"] || 0) + 1;
      else if (p.puffs > 20000 && p.puffs <= 30000) counts["20k-30k"] = (counts["20k-30k"] || 0) + 1;
      else if (p.puffs > 30000 && p.puffs <= 40000) counts["30k-40k"] = (counts["30k-40k"] || 0) + 1;
      else if (p.puffs > 40000) counts["40k-plus"] = (counts["40k-plus"] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Nicotine Strength Options
  const nicotineOptions = [
    { id: "20mg", label: "20mg / 2% (Standard SaltNic)" },
    { id: "50mg", label: "50mg / 5% (Strong SaltNic)" },
    { id: "3mg", label: "3mg (Low Nicotine / Direct Lung)" },
    { id: "0mg", label: "0mg (Nicotine Free)" }
  ];

  // Flavor Family Options
  const flavorFamilyOptions = [
    { id: "fruit_ice", label: "Fruity & Arctic Ice" },
    { id: "mint_ice", label: "Pure Mint & Spearmint" },
    { id: "tobacco", label: "Classic Cured Tobacco" },
    { id: "drink", label: "Beverages & Energy Drinks" },
    { id: "dessert", label: "Creamy & Dessert" }
  ];

  // Hardware Feature Options
  const featureOptions = [
    { id: "screen", label: "Smart HD Screen Display" },
    { id: "dual_mesh", label: "Dual Mesh Coil Matrix" },
    { id: "type_c", label: "Type-C Rechargeable" },
    { id: "airflow", label: "Adjustable Airflow Valve" }
  ];

  // Toggle Handlers
  const toggleBrand = (b: string) => {
    setSelectedBrands((prev) =>
      prev.includes(b) ? prev.filter((item) => item !== b) : [...prev, b]
    );
    setCurrentPage(1);
  };

  const togglePuffRange = (range: string) => {
    setSelectedPuffRanges((prev) =>
      prev.includes(range) ? prev.filter((item) => item !== range) : [...prev, range]
    );
    setCurrentPage(1);
  };

  const toggleNicotine = (nic: string) => {
    setSelectedNicotines((prev) =>
      prev.includes(nic) ? prev.filter((item) => item !== nic) : [...prev, nic]
    );
    setCurrentPage(1);
  };

  const toggleFlavorFamily = (fl: string) => {
    setSelectedFlavorFamilies((prev) =>
      prev.includes(fl) ? prev.filter((item) => item !== fl) : [...prev, fl]
    );
    setCurrentPage(1);
  };

  const toggleFeature = (feat: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feat) ? prev.filter((item) => item !== feat) : [...prev, feat]
    );
    setCurrentPage(1);
  };

  const resetAllFilters = () => {
    setSearchQuery("");
    setSelectedBrands([]);
    setPriceMin(20);
    setPriceMax(200);
    setSelectedPuffRanges([]);
    setSelectedNicotines([]);
    setSelectedFlavorFamilies([]);
    setSelectedFeatures([]);
    setInStockOnly(false);
    setCurrentPage(1);
  };

  // Active Filter Count
  const activeFilterCount =
    (searchQuery.trim() ? 1 : 0) +
    selectedBrands.length +
    (priceMin > 20 || priceMax < 200 ? 1 : 0) +
    selectedPuffRanges.length +
    selectedNicotines.length +
    selectedFlavorFamilies.length +
    selectedFeatures.length +
    (inStockOnly ? 1 : 0);

  // Reactive Filter Algorithm
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = prod.title.toLowerCase().includes(query);
        const matchesBrand = prod.brand.toLowerCase().includes(query);
        const matchesCategory = prod.category.toLowerCase().includes(query);
        if (!matchesTitle && !matchesBrand && !matchesCategory) return false;
      }

      // Brand Checkbox Multi-Select
      if (selectedBrands.length > 0 && !selectedBrands.includes(prod.brand)) {
        return false;
      }

      // Price Range Filter
      if (prod.price < priceMin || prod.price > priceMax) {
        return false;
      }

      // Puff Range Multi-Select
      if (selectedPuffRanges.length > 0) {
        if (!prod.puffs) return false;
        const matchesAnyPuff = selectedPuffRanges.some((range) => {
          if (range === "under-10k") return prod.puffs! < 10000;
          if (range === "10k-20k") return prod.puffs! >= 10000 && prod.puffs! <= 20000;
          if (range === "20k-30k") return prod.puffs! > 20000 && prod.puffs! <= 30000;
          if (range === "30k-40k") return prod.puffs! > 30000 && prod.puffs! <= 40000;
          if (range === "40k-plus") return prod.puffs! > 40000;
          return false;
        });
        if (!matchesAnyPuff) return false;
      }

      // Nicotine Multi-Select
      if (selectedNicotines.length > 0) {
        const matchesAnyNic = selectedNicotines.some((nic) => {
          if (nic === "20mg") return prod.nicotineStrength.includes("20mg") || prod.nicotineStrength.includes("2%");
          if (nic === "50mg") return prod.nicotineStrength.includes("50mg") || prod.nicotineStrength.includes("5%");
          if (nic === "3mg") return prod.nicotineStrength.includes("3mg") || prod.nicotineStrength.includes("0.3%");
          if (nic === "0mg") return prod.nicotineStrength.includes("0mg") || prod.nicotineStrength.includes("Zero");
          return false;
        });
        if (!matchesAnyNic) return false;
      }

      // Flavor Family Multi-Select
      if (selectedFlavorFamilies.length > 0 && !selectedFlavorFamilies.includes(prod.flavorFamily)) {
        return false;
      }

      // Features Multi-Select
      if (selectedFeatures.length > 0) {
        const fullDesc = `${prod.title} ${prod.shortDescription} ${prod.fullDescription}`.toLowerCase();
        const matchesFeatures = selectedFeatures.every((feat) => {
          if (feat === "screen") return fullDesc.includes("screen") || fullDesc.includes("oled") || fullDesc.includes("display");
          if (feat === "dual_mesh") return fullDesc.includes("mesh") || fullDesc.includes("dual");
          if (feat === "type_c") return fullDesc.includes("type-c") || fullDesc.includes("rechargeable") || prod.chargingType?.includes("Type-C");
          if (feat === "airflow") return fullDesc.includes("airflow");
          return true;
        });
        if (!matchesFeatures) return false;
      }

      // In Stock
      if (inStockOnly && !prod.inStock) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "newest") return b.revs - a.revs;
      return b.revs - a.revs; // popular default
    });
  }, [
    products,
    searchQuery,
    selectedBrands,
    priceMin,
    priceMax,
    selectedPuffRanges,
    selectedNicotines,
    selectedFlavorFamilies,
    selectedFeatures,
    inStockOnly,
    sortBy
  ]);

  // Paginated Slices
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Direct Add to Cart Action
  const handleAddToCartDirect = (prod: ProductItem) => {
    const itemFlavor = prod.flavors[0]?.name || "Standard";
    const newItem: CartItem = {
      id: `${prod.id}-default`,
      productId: prod.id,
      title: prod.title,
      brand: prod.brand,
      price: prod.price,
      image: prod.primaryImage,
      quantity: 1,
      flavor: itemFlavor,
      nicotine: prod.nicotineStrength
    };

    setCartItems((prev) => {
      const idx = prev.findIndex((i) => i.id === newItem.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx].quantity += 1;
        return copy;
      }
      return [...prev, newItem];
    });

    setIsCartOpen(true);
  };

  // Quick View Modal
  const openQuickView = (prod: ProductItem) => {
    setQuickViewProduct(prod);
    setQuickViewFlavor(prod.flavors[0]?.id || "");
    setQuickViewQuantity(1);
  };

  const handleAddQuickViewToCart = () => {
    if (!quickViewProduct) return;
    const chosenFlavorName = quickViewProduct.flavors.find(f => f.id === quickViewFlavor)?.name || quickViewProduct.flavors[0]?.name;
    const newItem: CartItem = {
      id: `${quickViewProduct.id}-${quickViewFlavor}`,
      productId: quickViewProduct.id,
      title: quickViewProduct.title,
      brand: quickViewProduct.brand,
      price: quickViewProduct.price,
      image: quickViewProduct.primaryImage,
      quantity: quickViewQuantity,
      flavor: chosenFlavorName,
      nicotine: quickViewProduct.nicotineStrength
    };

    setCartItems(prev => {
      const idx = prev.findIndex(i => i.id === newItem.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx].quantity += quickViewQuantity;
        return copy;
      }
      return [...prev, newItem];
    });

    setQuickViewProduct(null);
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const pageTitle = category ? category.title : "All Vape Products & Collections";
  const pageSubtitle = category
    ? category.subtitle
    : "Explore the complete collection of 100% authentic disposable vapes, pod systems, e-liquids, and IQOS TEREA in the UAE.";

  // Reusable Filter Sidebar Content Component
  const FilterControls = () => (
    <div className="space-y-4 text-xs">
      {/* Filter Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-[#064e3b]" />
          <h3 className="font-bold text-sm text-neutral-900 tracking-tight">Filter Products</h3>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#064e3b] text-white text-[10px] font-black flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={resetAllFilters}
            className="text-[11px] font-bold text-red-600 hover:text-red-700 underline cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {/* 1. Availability */}
      <div className="border-b border-neutral-100 pb-3.5">
        <button
          type="button"
          onClick={() => toggleSection("availability")}
          className="w-full flex items-center justify-between font-bold text-neutral-900 text-xs py-1"
        >
          <span>Availability</span>
          {openSections.availability ? <ChevronUp size={14} className="text-neutral-500" /> : <ChevronDown size={14} className="text-neutral-500" />}
        </button>
        {openSections.availability && (
          <div className="mt-2.5 space-y-2">
            <label className="flex items-center justify-between text-neutral-700 hover:text-neutral-900 cursor-pointer select-none">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => {
                    setInStockOnly(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="w-4 h-4 rounded text-[#064e3b] focus:ring-[#064e3b] accent-[#064e3b] cursor-pointer"
                />
                <span className="font-medium">In Stock Only</span>
              </div>
              <span className="text-[10px] text-neutral-400 bg-neutral-100 px-1.5 py-0.2 rounded font-mono">
                {products.filter(p => p.inStock).length}
              </span>
            </label>
          </div>
        )}
      </div>

      {/* 2. Price Range */}
      <div className="border-b border-neutral-100 pb-3.5">
        <button
          type="button"
          onClick={() => toggleSection("price")}
          className="w-full flex items-center justify-between font-bold text-neutral-900 text-xs py-1"
        >
          <span>Price Range (AED)</span>
          {openSections.price ? <ChevronUp size={14} className="text-neutral-500" /> : <ChevronDown size={14} className="text-neutral-500" />}
        </button>
        {openSections.price && (
          <div className="mt-2.5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 bg-neutral-50 rounded-xl border border-neutral-200 p-2">
                <span className="text-[9px] font-bold text-neutral-400 uppercase block">Min</span>
                <div className="flex items-center text-xs font-bold text-neutral-900">
                  <span className="text-[10px] text-neutral-500 mr-1">AED</span>
                  <input
                    type="number"
                    min={20}
                    max={priceMax}
                    value={priceMin}
                    onChange={(e) => {
                      setPriceMin(Math.max(20, Number(e.target.value)));
                      setCurrentPage(1);
                    }}
                    className="w-full bg-transparent focus:outline-none text-xs font-bold"
                  />
                </div>
              </div>
              <span className="text-neutral-400 font-bold">-</span>
              <div className="flex-1 bg-neutral-50 rounded-xl border border-neutral-200 p-2">
                <span className="text-[9px] font-bold text-neutral-400 uppercase block">Max</span>
                <div className="flex items-center text-xs font-bold text-neutral-900">
                  <span className="text-[10px] text-neutral-500 mr-1">AED</span>
                  <input
                    type="number"
                    min={priceMin}
                    max={300}
                    value={priceMax}
                    onChange={(e) => {
                      setPriceMax(Math.min(300, Number(e.target.value)));
                      setCurrentPage(1);
                    }}
                    className="w-full bg-transparent focus:outline-none text-xs font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Slider Bar */}
            <input
              type="range"
              min={20}
              max={200}
              value={priceMax}
              onChange={(e) => {
                setPriceMax(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full accent-[#064e3b] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-400 font-semibold">
              <span>AED 20</span>
              <span>AED 200+</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Brands Checkbox List */}
      <div className="border-b border-neutral-100 pb-3.5">
        <button
          type="button"
          onClick={() => toggleSection("brand")}
          className="w-full flex items-center justify-between font-bold text-neutral-900 text-xs py-1"
        >
          <span>Brands</span>
          {openSections.brand ? <ChevronUp size={14} className="text-neutral-500" /> : <ChevronDown size={14} className="text-neutral-500" />}
        </button>
        {openSections.brand && (
          <div className="mt-2.5 space-y-2 max-h-48 overflow-y-auto no-scrollbar pr-1">
            {availableBrands.map((b) => (
              <label
                key={b}
                className="flex items-center justify-between text-neutral-700 hover:text-neutral-900 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(b)}
                    onChange={() => toggleBrand(b)}
                    className="w-4 h-4 rounded text-[#064e3b] focus:ring-[#064e3b] accent-[#064e3b] cursor-pointer"
                  />
                  <span className="font-medium text-xs">{b}</span>
                </div>
                <span className="text-[10px] text-neutral-400 bg-neutral-100 px-1.5 py-0.2 rounded font-mono">
                  {brandCounts[b] || 0}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 4. Puff Count Range */}
      <div className="border-b border-neutral-100 pb-3.5">
        <button
          type="button"
          onClick={() => toggleSection("puffs")}
          className="w-full flex items-center justify-between font-bold text-neutral-900 text-xs py-1"
        >
          <span>Puff Capacity</span>
          {openSections.puffs ? <ChevronUp size={14} className="text-neutral-500" /> : <ChevronDown size={14} className="text-neutral-500" />}
        </button>
        {openSections.puffs && (
          <div className="mt-2.5 space-y-2">
            {puffOptions.map((p) => (
              <label
                key={p.id}
                className="flex items-center justify-between text-neutral-700 hover:text-neutral-900 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedPuffRanges.includes(p.id)}
                    onChange={() => togglePuffRange(p.id)}
                    className="w-4 h-4 rounded text-[#064e3b] focus:ring-[#064e3b] accent-[#064e3b] cursor-pointer"
                  />
                  <span className="font-medium text-xs">{p.label}</span>
                </div>
                <span className="text-[10px] text-neutral-400 bg-neutral-100 px-1.5 py-0.2 rounded font-mono">
                  {puffCounts[p.id] || 0}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 5. Nicotine Strength */}
      <div className="border-b border-neutral-100 pb-3.5">
        <button
          type="button"
          onClick={() => toggleSection("nicotine")}
          className="w-full flex items-center justify-between font-bold text-neutral-900 text-xs py-1"
        >
          <span>Nicotine Strength</span>
          {openSections.nicotine ? <ChevronUp size={14} className="text-neutral-500" /> : <ChevronDown size={14} className="text-neutral-500" />}
        </button>
        {openSections.nicotine && (
          <div className="mt-2.5 space-y-2">
            {nicotineOptions.map((nic) => (
              <label
                key={nic.id}
                className="flex items-center justify-between text-neutral-700 hover:text-neutral-900 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedNicotines.includes(nic.id)}
                    onChange={() => toggleNicotine(nic.id)}
                    className="w-4 h-4 rounded text-[#064e3b] focus:ring-[#064e3b] accent-[#064e3b] cursor-pointer"
                  />
                  <span className="font-medium text-xs">{nic.label}</span>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 6. Flavor Family */}
      <div className="border-b border-neutral-100 pb-3.5">
        <button
          type="button"
          onClick={() => toggleSection("flavor")}
          className="w-full flex items-center justify-between font-bold text-neutral-900 text-xs py-1"
        >
          <span>Flavor Profile</span>
          {openSections.flavor ? <ChevronUp size={14} className="text-neutral-500" /> : <ChevronDown size={14} className="text-neutral-500" />}
        </button>
        {openSections.flavor && (
          <div className="mt-2.5 space-y-2">
            {flavorFamilyOptions.map((fl) => (
              <label
                key={fl.id}
                className="flex items-center justify-between text-neutral-700 hover:text-neutral-900 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedFlavorFamilies.includes(fl.id)}
                    onChange={() => toggleFlavorFamily(fl.id)}
                    className="w-4 h-4 rounded text-[#064e3b] focus:ring-[#064e3b] accent-[#064e3b] cursor-pointer"
                  />
                  <span className="font-medium text-xs">{fl.label}</span>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 7. Hardware & Engineering Features */}
      <div>
        <button
          type="button"
          onClick={() => toggleSection("features")}
          className="w-full flex items-center justify-between font-bold text-neutral-900 text-xs py-1"
        >
          <span>Device Features</span>
          {openSections.features ? <ChevronUp size={14} className="text-neutral-500" /> : <ChevronDown size={14} className="text-neutral-500" />}
        </button>
        {openSections.features && (
          <div className="mt-2.5 space-y-2">
            {featureOptions.map((feat) => (
              <label
                key={feat.id}
                className="flex items-center justify-between text-neutral-700 hover:text-neutral-900 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedFeatures.includes(feat.id)}
                    onChange={() => toggleFeature(feat.id)}
                    className="w-4 h-4 rounded text-[#064e3b] focus:ring-[#064e3b] accent-[#064e3b] cursor-pointer"
                  />
                  <span className="font-medium text-xs">{feat.label}</span>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#ffffff] text-neutral-900 flex flex-col font-sans">
      <Header
        onCartClick={() => setIsCartOpen(true)}
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
      />

      {/* SECTION 1: LUXURY HERO BANNER */}
      <section className="bg-gradient-to-br from-[#064e3b] via-[#043e2e] to-[#022c22] text-white py-10 sm:py-14 md:py-16 relative overflow-hidden border-b border-emerald-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/15 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-400/15 rounded-full blur-[90px] pointer-events-none" />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-emerald-200/70 text-xs font-semibold mb-3">
            <Link href="/" className="hover:text-amber-300 transition-colors">Home</Link>
            <ChevronRight size={12} className="text-emerald-400/60" />
            <Link href="/collections" className="hover:text-amber-300 transition-colors">Collections</Link>
            {category && (
              <>
                <ChevronRight size={12} className="text-emerald-400/60" />
                <span className="text-white font-bold">{category.name}</span>
              </>
            )}
          </nav>

          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-0.5 w-6 bg-amber-400 rounded-full" />
              <span className="font-cinzel text-xs font-bold text-amber-300 uppercase tracking-[0.22em]">
                {category?.badge || "CURATED CATALOG"}
              </span>
            </div>

            <h1 className="font-luxury text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
              {pageTitle}
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium mb-5">
              {pageSubtitle}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <span className="bg-white/10 backdrop-blur-md border border-white/20 text-emerald-100 px-3 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {filteredProducts.length} Premium Products Available
              </span>
              <span className="bg-white/10 backdrop-blur-md border border-white/20 text-emerald-100 px-3 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-xs">
                <Truck size={13} className="text-amber-300" />
                2-Hour Dubai Express Delivery
              </span>
              <span className="bg-white/10 backdrop-blur-md border border-white/20 text-emerald-100 px-3 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-xs">
                <ShieldCheck size={13} className="text-amber-300" />
                100% Authentic UAE Tax-Paid
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: VISUAL CATEGORY CHIPS SCROLLER */}
      <section className="bg-neutral-50 border-b border-neutral-200/80 py-3 px-4 sm:px-6 sticky top-[58px] sm:top-[66px] z-30 backdrop-blur-md bg-white/95 shadow-xs">
        <div className="max-w-[1400px] mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <Link
            href="/collections"
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
              !category
                ? "bg-[#064e3b] text-white border-[#064e3b] shadow-xs"
                : "bg-white text-neutral-700 border-neutral-200 hover:border-emerald-300"
            }`}
          >
            All Products ({products.length})
          </Link>
          {allCategories.map((cat) => {
            const isActive = category?.slug === cat.slug;
            return (
              <Link
                key={cat.slug}
                href={`/collections/${cat.slug}`}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 ${
                  isActive
                    ? "bg-[#064e3b] text-white border-[#064e3b] shadow-xs"
                    : "bg-white text-neutral-700 border-neutral-200 hover:border-emerald-300"
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  {cat.count}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* MAIN TWO-COLUMN E-COMMERCE WORKSPACE */}
      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1">
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-start">
          
          {/* LEFT SIDEBAR (DESKTOP STICKY FILTER PANEL) */}
          <aside className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-[130px] self-start bg-white border border-neutral-200/90 rounded-3xl p-5 shadow-xs">
            <FilterControls />
          </aside>

          {/* RIGHT PRODUCT CATALOG WORKSPACE */}
          <main className="flex-1 min-w-0 w-full space-y-4">
            
            {/* Top Toolbar: Search, Sort, View Modes, Mobile Filter Trigger */}
            <div className="bg-white border border-neutral-200/90 rounded-2xl p-3 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-1 max-w-md">
                {/* Mobile Filter Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0"
                >
                  <SlidersHorizontal size={14} className="text-[#064e3b]" />
                  <span>Filter {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
                </button>

                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search by brand, flavor, or puffs..."
                    className="w-full h-8.5 pl-8 pr-3 rounded-xl border border-neutral-200 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#064e3b] focus:ring-1 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Sort & Grid / List View Toggle */}
              <div className="flex items-center justify-between sm:justify-end gap-2.5">
                <span className="text-[11px] text-neutral-500 font-semibold hidden md:inline">
                  Showing {filteredProducts.length} of {products.length}
                </span>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="h-8.5 px-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-800 bg-white focus:outline-none focus:border-[#064e3b] cursor-pointer"
                >
                  <option value="popular">Sort: Best Selling</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Most Reviews</option>
                </select>

                <div className="flex items-center border border-neutral-200 rounded-xl p-0.5 bg-neutral-50">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === "grid" ? "bg-white text-[#064e3b] shadow-xs" : "text-neutral-400 hover:text-neutral-700"
                    }`}
                    aria-label="Grid view"
                  >
                    <Grid size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === "list" ? "bg-white text-[#064e3b] shadow-xs" : "text-neutral-400 hover:text-neutral-700"
                    }`}
                    aria-label="List view"
                  >
                    <List size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters Chip Row */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 py-1 text-xs">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mr-1">Active:</span>
                {selectedBrands.map((b) => (
                  <span
                    key={b}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-[#064e3b] border border-emerald-200 text-[11px] font-bold"
                  >
                    {b}
                    <button type="button" onClick={() => toggleBrand(b)} className="hover:text-red-500">
                      <X size={11} />
                    </button>
                  </span>
                ))}
                {(priceMin > 20 || priceMax < 200) && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-[#064e3b] border border-emerald-200 text-[11px] font-bold">
                    AED {priceMin} - {priceMax}
                    <button
                      type="button"
                      onClick={() => {
                        setPriceMin(20);
                        setPriceMax(200);
                      }}
                      className="hover:text-red-500"
                    >
                      <X size={11} />
                    </button>
                  </span>
                )}
                {selectedPuffRanges.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-[#064e3b] border border-emerald-200 text-[11px] font-bold"
                  >
                    {puffOptions.find((opt) => opt.id === p)?.label || p}
                    <button type="button" onClick={() => togglePuffRange(p)} className="hover:text-red-500">
                      <X size={11} />
                    </button>
                  </span>
                ))}
                {selectedNicotines.map((nic) => (
                  <span
                    key={nic}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-[#064e3b] border border-emerald-200 text-[11px] font-bold"
                  >
                    {nic}
                    <button type="button" onClick={() => toggleNicotine(nic)} className="hover:text-red-500">
                      <X size={11} />
                    </button>
                  </span>
                ))}
                {inStockOnly && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-[#064e3b] border border-emerald-200 text-[11px] font-bold">
                    In Stock Only
                    <button type="button" onClick={() => setInStockOnly(false)} className="hover:text-red-500">
                      <X size={11} />
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-[11px] text-red-600 font-bold hover:underline ml-2"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* PRODUCT SHOWCASE (GRID VS LIST) */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200 shadow-xs">
                <div className="w-14 h-14 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3">
                  <Search size={22} />
                </div>
                <h3 className="font-bold text-base text-neutral-900 mb-1">No products match your filters</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
                  Try adjusting or resetting your brand, price, or puff count filters.
                </p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="px-5 py-2 bg-[#064e3b] text-white text-xs font-bold rounded-xl hover:bg-[#022c22] transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : viewMode === "grid" ? (
              /* RESPONSIVE 3-COLUMN DESKTOP GRID (Matches reference layout) */
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-5">
                {paginatedProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="group bg-white rounded-3xl border border-neutral-200/90 p-3 sm:p-4 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
                  >
                    {/* Top Badges */}
                    <div className="flex items-center justify-between w-full mb-1 z-10">
                      {prod.badge ? (
                        <span className="bg-red-600 text-white text-[8.5px] sm:text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                          {prod.badge}
                        </span>
                      ) : <span />}

                      <button
                        type="button"
                        onClick={() => openQuickView(prod)}
                        className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-[#064e3b] hover:text-white text-neutral-600 flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Quick view"
                        title="Quick Preview"
                      >
                        <Eye size={13} />
                      </button>
                    </div>

                    {/* Image Stage with smooth hover */}
                    <Link
                      href={`/product/${prod.slug}`}
                      className="relative w-full aspect-square max-h-[220px] mx-auto flex items-center justify-center p-2 my-1 overflow-hidden block"
                    >
                      <Image
                        src={prod.primaryImage}
                        alt={prod.title}
                        fill
                        className="object-contain group-hover:scale-108 transition-transform duration-500"
                      />
                    </Link>

                    {/* Brand Tag */}
                    <div className="w-full bg-neutral-900 text-amber-300 text-[8.5px] font-black uppercase tracking-wider py-1 px-2 text-center rounded-md my-1 truncate">
                      {prod.brand}
                    </div>

                    {/* Product Title */}
                    <Link
                      href={`/product/${prod.slug}`}
                      className="font-bold text-neutral-900 text-[12.5px] sm:text-[13.5px] leading-snug line-clamp-2 text-center my-1 hover:text-[#064e3b] transition-colors min-h-[36px] flex items-center justify-center"
                    >
                      {prod.title}
                    </Link>

                    {/* Star Rating */}
                    <div className="flex items-center justify-center gap-0.5 my-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} size={11} fill="#fbbf24" color="#fbbf24" />
                      ))}
                      <span className="text-[10px] text-neutral-400 font-medium ml-1">({prod.revs})</span>
                    </div>

                    {/* Price */}
                    <div className="text-center my-1 flex items-baseline justify-center gap-1.5">
                      <span className="text-[14px] sm:text-[16px] font-black text-neutral-900 tracking-tight">
                        AED {prod.price.toFixed(2)}
                      </span>
                      {prod.originalPrice > prod.price && (
                        <span className="text-[11px] text-neutral-400 line-through">
                          AED {prod.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* 1-Click Instant Cart Button */}
                    <button
                      type="button"
                      onClick={() => handleAddToCartDirect(prod)}
                      className="w-full py-2.5 bg-[#064e3b] hover:bg-[#022c22] text-white text-[11px] font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer mt-1 active:scale-95"
                    >
                      <ShoppingBag size={13} />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              /* RESPONSIVE LIST VIEW */
              <div className="space-y-3.5">
                {paginatedProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-white rounded-3xl border border-neutral-200/90 p-4 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row items-center gap-5"
                  >
                    <Link
                      href={`/product/${prod.slug}`}
                      className="w-28 h-28 relative shrink-0 bg-neutral-50 rounded-2xl p-2"
                    >
                      <Image
                        src={prod.primaryImage}
                        alt={prod.title}
                        fill
                        className="object-contain"
                      />
                    </Link>

                    <div className="flex-1 text-center sm:text-left">
                      <span className="text-[9px] font-black text-neutral-900 uppercase tracking-widest bg-neutral-100 px-2 py-0.5 rounded">
                        {prod.brand}
                      </span>
                      <Link
                        href={`/product/${prod.slug}`}
                        className="font-bold text-sm sm:text-base text-neutral-900 hover:text-[#064e3b] transition-colors block mt-1"
                      >
                        {prod.title}
                      </Link>
                      <p className="text-xs text-neutral-500 line-clamp-2 mt-1">
                        {prod.shortDescription}
                      </p>

                      <div className="flex items-center justify-center sm:justify-start gap-4 mt-3">
                        <span className="font-black text-base text-neutral-900">
                          AED {prod.price.toFixed(2)}
                        </span>
                        {prod.puffs && (
                          <span className="text-xs text-neutral-600 font-bold bg-neutral-100 px-2 py-0.5 rounded">
                            {prod.puffs.toLocaleString()} Puffs
                          </span>
                        )}
                        <span className="text-xs text-emerald-800 font-medium">In Stock (UAE)</span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => openQuickView(prod)}
                        className="flex-1 sm:flex-none px-4 py-2 border border-neutral-300 hover:border-neutral-400 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Eye size={13} />
                        <span>Preview</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddToCartDirect(prod)}
                        className="flex-1 sm:flex-none px-5 py-2 bg-[#064e3b] hover:bg-[#022c22] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <ShoppingBag size={13} />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* NUMERICAL PAGINATION BAR (Matches reference layout) */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6 pb-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className="w-9 h-9 rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
                >
                  &lt;
                </button>
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  return (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => setCurrentPage(pNum)}
                      className={`w-9 h-9 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        currentPage === pNum
                          ? "bg-[#064e3b] text-white shadow-xs font-black"
                          : "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100"
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  className="w-9 h-9 rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
                >
                  &gt;
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* MOBILE SLIDE-OVER FILTER DRAWER */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 w-full max-w-xs bg-white z-50 shadow-2xl flex flex-col justify-between overflow-hidden lg:hidden"
            >
              <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-[#064e3b]" />
                  <span className="font-bold text-sm text-neutral-900">Filters</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-600"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-4 flex-1 overflow-y-auto">
                <FilterControls />
              </div>

              <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex gap-2">
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="flex-1 py-2.5 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-700 hover:bg-white"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 py-2.5 bg-[#064e3b] text-white rounded-xl text-xs font-bold hover:bg-[#022c22]"
                >
                  View ({filteredProducts.length})
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* SECTION 6: CURATED COMPARISON MATRIX TABLES (MATCHES USER SCREENSHOT IN EMERALD/GOLD) */}
      <section className="bg-neutral-50/80 border-t border-neutral-200/80 py-12 sm:py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <span className="font-cinzel text-xs font-bold text-[#064e3b] uppercase tracking-widest">
              EXPERT SELECTION MATRIX
            </span>
            <h2 className="font-luxury text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-1">
              Popular Disposable Vapes Comparison
            </h2>
            <div className="flex items-center justify-center gap-3 my-2.5">
              <div className="h-px w-12 bg-[#064e3b]"></div>
              <div className="w-1.5 h-1.5 rotate-45 bg-amber-500"></div>
              <div className="h-px w-12 bg-[#064e3b]"></div>
            </div>
            <p className="text-xs text-neutral-600">
              Benchmark comparing top-selling high puff disposables in UAE across battery, coil architecture, and daily cost efficiency.
            </p>
          </div>

          {/* TABLE 1: Model Comparison */}
          <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-xs overflow-x-auto mb-8">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead>
                <tr className="bg-[#064e3b] text-white font-bold border-b border-emerald-800">
                  <th className="p-4">Model Name</th>
                  <th className="p-4">Output / Puffs</th>
                  <th className="p-4">Coil Type</th>
                  <th className="p-4">Battery Spec</th>
                  <th className="p-4">Nicotine Strength</th>
                  <th className="p-4">Best Suited For</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                <tr className="hover:bg-emerald-50/30">
                  <td className="p-4 font-bold text-neutral-900">Kief King 35000</td>
                  <td className="p-4 font-bold text-[#064e3b]">35,000 Puffs</td>
                  <td className="p-4">Dual Mesh Matrix</td>
                  <td className="p-4">850mAh Type-C Fast</td>
                  <td className="p-4">20mg / 50mg / 3mg</td>
                  <td className="p-4 font-semibold text-neutral-700">Long-term heavy daily vapers</td>
                </tr>
                <tr className="hover:bg-emerald-50/30">
                  <td className="p-4 font-bold text-neutral-900">Vozol Star 40000</td>
                  <td className="p-4 font-bold text-[#064e3b]">40,000 Puffs</td>
                  <td className="p-4">S.i.L.C Mesh Chamber</td>
                  <td className="p-4">1000mAh Type-C Fast</td>
                  <td className="p-4">20mg / 50mg</td>
                  <td className="p-4 font-semibold text-neutral-700">Maximum longevity and travel</td>
                </tr>
                <tr className="hover:bg-emerald-50/30">
                  <td className="p-4 font-bold text-neutral-900">Elf Bar JoinOne 25K</td>
                  <td className="p-4 font-bold text-[#064e3b]">25,000 Puffs</td>
                  <td className="p-4">QUAQ Neo Mesh</td>
                  <td className="p-4">800mAh Fast Recharge</td>
                  <td className="p-4">20mg / 50mg</td>
                  <td className="p-4 font-semibold text-neutral-700">Crisp fruit flavor connoisseurs</td>
                </tr>
                <tr className="hover:bg-emerald-50/30">
                  <td className="p-4 font-bold text-neutral-900">Myle Meta Max 18K</td>
                  <td className="p-4 font-bold text-[#064e3b]">18,000 Puffs</td>
                  <td className="p-4">Dual Tank Coil</td>
                  <td className="p-4">850mAh Type-C</td>
                  <td className="p-4">20mg / 50mg</td>
                  <td className="p-4 font-semibold text-neutral-700">Discreet executive pocket form</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION 7: SEO DEEP DIVE EDITORIAL & BUYING GUIDE (MATCHES USER SCREENSHOT) */}
      <section className="bg-white border-t border-neutral-200/80 py-12 sm:py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="bg-neutral-50/70 border border-neutral-200/90 rounded-3xl p-6 sm:p-10 space-y-6 text-neutral-700 leading-relaxed text-xs sm:text-sm">
            <div>
              <span className="font-cinzel text-xs font-bold text-[#064e3b] uppercase tracking-widest block mb-1">
                EXPERT BUYER GUIDE
              </span>
              <h2 className="font-luxury text-xl sm:text-2xl md:text-3xl font-extrabold text-neutral-900">
                Buy Disposable Vapes in UAE - Dubai, Abu Dhabi & Sharjah (2026 Guide)
              </h2>
            </div>

            <p>
              Disposable vapes have surged in popularity across the United Arab Emirates thanks to unmatched convenience, authentic salt nicotine formulation, and advanced coil engineering. Unlike older generation e-cigarettes that suffered from frequent spit-back and premature coil burnout, modern high-puff disposables feature twin organic mesh chambers, high-density pure cobalt batteries, and intelligent power modulation chips.
            </p>

            <h3 className="font-bold text-base text-neutral-900 pt-2 border-t border-neutral-200">
              Understanding Puff Count & Real-World Longevity in UAE
            </h3>
            <p>
              When evaluating high-capacity devices ranging from 10,000 to 40,000 puffs, the key determining factors are e-liquid volume (ml) and battery efficiency. A standard 20ml to 28ml pre-filled reservoir paired with Type-C recharging comfortably sustains an average vaper taking 300 to 400 puffs per day for 3 to 5 full weeks. Devices like the Kief King 35K and Vozol Star 40K also integrate digital smart displays that monitor real-time battery percentage and juice levels.
            </p>

            <h3 className="font-bold text-base text-neutral-900 pt-2 border-t border-neutral-200">
              UAE ESMA Regulation, Digital Tax Stamp & Authenticity
            </h3>
            <p>
              In compliance with UAE Federal Standard UAE.S 5030, all electronic smoking devices sold legally within the Emirates must feature verified child-resistant packaging, authentic ingredients transparency, and official Federal Tax Authority (FTA) digital tax stamps. Purchasing from authorized distributors like Vape Mart guarantees you receive 100% genuine products with security scratch verification seals.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 8: FAQ ACCORDION IN LUXURY EMERALD & GOLD */}
      <section className="py-12 sm:py-16 max-w-[1100px] mx-auto px-4 sm:px-6 w-full">
        <div className="text-center mb-8">
          <span className="font-cinzel text-xs font-bold text-[#064e3b] uppercase tracking-widest">
            BUYER ASSISTANCE
          </span>
          <h2 className="font-luxury text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-1">
            Frequently Asked Questions (UAE Vaping)
          </h2>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "Are disposable vapes legal in the UAE?",
              a: "Yes. Vaping is fully legal for adults aged 18 and over in the UAE, provided devices comply with ESMA standards (UAE.S 5030) and bear the official digital tax stamp."
            },
            {
              q: "How fast is delivery to Dubai, Abu Dhabi, and Sharjah?",
              a: "We offer 2 to 3-hour express courier delivery in Dubai. Orders to Abu Dhabi, Sharjah, and Ajman placed before 5 PM arrive the same evening. Other Emirates arrive within 24 hours."
            },
            {
              q: "Can I pay using Cash on Delivery (COD) or Card on Delivery?",
              a: "Yes! Both Cash on Delivery and Wireless POS Card on Delivery are supported across all 7 Emirates with zero hidden surcharge."
            },
            {
              q: "How do I know my device is original and not a counterfeit?",
              a: "Every product we ship carries an authentic manufacturer QR scratch seal and official UAE tax stamp. You can scratch the security code and verify it directly on the manufacturer portal."
            },
            {
              q: "How should I recharge my disposable vape safely?",
              a: "Use the included Type-C port connected to a standard 5V/1A wall adapter or computer port. Avoid leaving the device on high-speed phone fast-chargers overnight to preserve battery health."
            },
            {
              q: "What should I do if my disposable device arrives defective?",
              a: "We offer a 24-hour Dead-On-Arrival (DOA) replacement warranty. If a device fails to fire or leaks upon unboxing, contact our WhatsApp support team for an immediate free exchange."
            }
          ].map((faq, idx) => (
            <div key={idx} className="border border-neutral-200 rounded-2xl bg-white overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-bold text-xs sm:text-sm text-neutral-900 hover:text-[#064e3b] transition-colors cursor-pointer"
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
                    <div className="px-4 sm:px-5 pb-5 text-xs text-neutral-600 leading-relaxed border-t border-neutral-100 pt-3">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 9: 3 LUXURY TRUST CARDS (MATCHES REFERENCE FOOTER BANNER) */}
      <section className="bg-gradient-to-br from-[#064e3b] to-[#022c22] py-10 sm:py-12 text-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col items-center md:items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-400 text-neutral-950 flex items-center justify-center shadow-xs">
                <Truck size={24} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white mb-1">2-3 Hour Dubai Express</h4>
                <p className="text-xs text-emerald-100/80 leading-relaxed">
                  Temperature-controlled dispatch across Dubai, plus same-day courier across Abu Dhabi and Sharjah.
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col items-center md:items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-400 text-neutral-950 flex items-center justify-center shadow-xs">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white mb-1">100% Genuine ESMA Certified</h4>
                <p className="text-xs text-emerald-100/80 leading-relaxed">
                  Official UAE tax stamps and holographic anti-counterfeit scratch seals on every single box.
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col items-center md:items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-400 text-neutral-950 flex items-center justify-center shadow-xs">
                <MessageCircle size={24} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white mb-1">Cash & Card on Delivery</h4>
                <p className="text-xs text-emerald-100/80 leading-relaxed">
                  Pay securely at your doorstep with cash or wireless card terminal. 24/7 WhatsApp concierge available.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK VIEW MODAL (UX EXCELLENCE) */}
      <AnimatePresence>
        {quickViewProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickViewProduct(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[90vw] sm:max-w-2xl bg-white rounded-3xl z-50 p-6 shadow-2xl overflow-y-auto max-h-[90vh] flex flex-col justify-between"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-neutral-900 text-amber-300 px-2 py-0.5 rounded">
                    {quickViewProduct.brand}
                  </span>
                  <h3 className="font-luxury text-xl font-bold text-neutral-900 mt-1">
                    {quickViewProduct.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setQuickViewProduct(null)}
                  className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center my-4">
                <div className="relative aspect-square w-full max-h-[220px] bg-neutral-50 rounded-2xl p-4">
                  <Image
                    src={quickViewProduct.primaryImage}
                    alt={quickViewProduct.title}
                    fill
                    className="object-contain p-2"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-2xl font-black text-neutral-900 block">
                      AED {quickViewProduct.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-emerald-800 font-bold">VAT Included • UAE Express Delivery</span>
                  </div>

                  {quickViewProduct.flavors.length > 0 && (
                    <div>
                      <span className="text-xs font-bold text-neutral-700 block mb-1.5">Select Flavor:</span>
                      <div className="grid grid-cols-2 gap-2">
                        {quickViewProduct.flavors.slice(0, 4).map(f => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setQuickViewFlavor(f.id)}
                            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 ${
                              quickViewFlavor === f.id
                                ? "border-[#064e3b] bg-emerald-50 text-[#064e3b] font-bold"
                                : "border-neutral-200"
                            }`}
                          >
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: f.color }} />
                            <span className="truncate">{f.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-neutral-300 rounded-xl p-1 bg-white">
                      <button
                        type="button"
                        onClick={() => setQuickViewQuantity(Math.max(1, quickViewQuantity - 1))}
                        className="w-7 h-7 flex items-center justify-center text-neutral-600"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-8 text-center text-xs font-bold">{quickViewQuantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuickViewQuantity(quickViewQuantity + 1)}
                        className="w-7 h-7 flex items-center justify-center text-neutral-600"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddQuickViewToCart}
                      className="flex-1 py-3 bg-[#064e3b] hover:bg-[#022c22] text-white font-bold text-xs uppercase rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <ShoppingBag size={15} />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                <Link
                  href={`/product/${quickViewProduct.slug}`}
                  className="font-bold text-[#064e3b] hover:underline"
                >
                  Go to Full Product Page &rarr;
                </Link>
                <span className="text-neutral-500 font-medium">Same-Day Courier across UAE</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* REUSABLE CART DRAWER */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => setCartItems([])}
      />

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
