"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Heart,
  User,
  ShoppingBag,
  Phone,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Lock,
  Truck
} from "lucide-react";
import themePublished from "@/data/theme-published.json";

export interface SubMenuItem {
  title: string;
  href: string;
  badge?: string;
  desc?: string;
}

export interface MegaMenuColumn {
  heading: string;
  badge?: string;
  items: SubMenuItem[];
}

export interface MegaMenuBanner {
  title: string;
  subtitle?: string;
  image?: string;
  badge?: string;
  href?: string;
  buttonText?: string;
}

export interface HeaderNavItem {
  label: string;
  href: string;
  badge?: string;
  hasDropdown?: boolean;
  columns?: MegaMenuColumn[];
  featuredBanner?: MegaMenuBanner;
}

export interface ThemeHeaderConfig {
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

export interface HeaderProps {
  onCartClick?: () => void;
  cartCount?: number;
}

export function Header({ onCartClick, cartCount = 0 }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [hoveredNavIdx, setHoveredNavIdx] = useState<number | null>(null);
  const [dropPositions, setDropPositions] = useState<Record<number, { left: number; top: number; width: number }>>({});
  const [expandedMobileMenuIdx, setExpandedMobileMenuIdx] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [headerData, setHeaderData] = useState<ThemeHeaderConfig | undefined>(
    themePublished.header as unknown as ThemeHeaderConfig
  );

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetch("/api/admin/theme")
      .then((res) => res.json())
      .then((resData) => {
        if (resData?.data?.header) {
          setHeaderData(resData.data.header);
        }
      })
      .catch(() => {});
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/collections?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/collections");
    }
    setIsMobileSearchOpen(false);
  };

  return (
    <>
      {/* Top Announcement Strip (Infinite Marquee) */}
      {headerData?.topBar?.enabled !== false && (
        <div className="bg-[#022c22] text-white text-[11px] font-medium tracking-wide py-2.5 px-6 flex justify-between items-center relative overflow-hidden">
          <div className="flex-1 overflow-hidden relative flex items-center h-full">
            <div className="flex gap-8 whitespace-nowrap animate-[marquee_25s_linear_infinite] hover:![animation-play-state:paused] cursor-default w-max">
              {(
                headerData?.topBar?.announcements || [
                  "Secure Payment | COD Available",
                  "Exclusive offer up to 10% OFF",
                  "100% Authentic Products - Original Brands Guaranteed",
                  "Free Delivery on Orders Above AED 350",
                  "20,000+ Happy Customers"
                ]
              ).map((ann, idx) => (
                <span key={`ann-1-${idx}`} className="flex items-center gap-1.5 opacity-90">
                  <Lock size={12} className="text-amber-400" /> {ann}
                </span>
              ))}
              {/* Duplicated for smooth infinite scroll */}
              {(
                headerData?.topBar?.announcements || [
                  "Secure Payment | COD Available",
                  "Exclusive offer up to 10% OFF",
                  "100% Authentic Products - Original Brands Guaranteed",
                  "Free Delivery on Orders Above AED 350",
                  "20,000+ Happy Customers"
                ]
              ).map((ann, idx) => (
                <span key={`ann-2-${idx}`} className="flex items-center gap-1.5 opacity-90">
                  <Lock size={12} className="text-amber-400" /> {ann}
                </span>
              ))}
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-6 ml-6 border-l border-white/10 pl-6 z-10 bg-[#022c22]">
            <a
              href={
                headerData?.topBar?.phoneHref ||
                `tel:${headerData?.topBar?.phone?.replace(/[^0-9+]/g, "") || "+971551688299"}`
              }
              className="flex items-center gap-1.5 text-emerald-100 hover:text-amber-300 font-semibold transition-colors no-underline"
            >
              <Phone size={12} className="text-amber-400 shrink-0" />
              <span>{headerData?.topBar?.phone || "+971 55 168 8299"}</span>
            </a>
            {(
              headerData?.topBar?.links || [
                { label: "About Us", href: "#" },
                { label: "Contact Us", href: "#" }
              ]
            ).map((lnk, lIdx) => (
              <a
                key={lIdx}
                href={lnk.href}
                className="text-emerald-100/80 hover:text-white transition-colors no-underline"
              >
                {lnk.label}
              </a>
            ))}
            <a
              href="/admin"
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold hover:bg-emerald-500/30 transition-colors no-underline"
            >
              Admin Panel
            </a>
          </div>
        </div>
      )}

      {/* Ultra-Premium Main Header */}
      <header
        className={`sticky top-0 z-50 bg-[#064e3b] border-b border-emerald-800 transition-all duration-300 ${
          isScrolled
            ? "shadow-[0_12px_40px_rgba(0,0,0,0.3)] bg-[#064e3b]/95 backdrop-blur-xl"
            : "shadow-[0_10px_40px_-15px_rgba(6,78,59,0.3)]"
        }`}
      >
        <div
          className={`max-w-[1400px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-3 sm:gap-6 md:gap-10 transition-all duration-300 ${
            isScrolled ? "h-[68px] sm:h-[76px] lg:h-[82px]" : "h-[82px] sm:h-[94px] lg:h-[104px]"
          }`}
        >
          {/* Left: Mobile Menu Toggle + Brand Logo */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Standard Brand Logo */}
            <Link href="/" className="flex-shrink-0 group cursor-pointer block py-1">
              <Image
                src={headerData?.logo?.src || "/Vape mart 4.png"}
                alt={headerData?.logo?.alt || "Vape Mart Logo"}
                width={headerData?.logo?.width || 360}
                height={headerData?.logo?.height || 110}
                className="h-14 sm:h-16 md:h-20 lg:h-[88px] xl:h-[94px] w-auto max-w-[220px] sm:max-w-[280px] md:max-w-[360px] lg:max-w-[420px] object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-md"
                priority
                unoptimized
              />
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden sm:block flex-1 max-w-2xl relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-emerald-100/50 group-focus-within:text-white transition-colors">
              <Search size={18} strokeWidth={2.5} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={headerData?.search?.placeholder || "Search for vapes, e-liquids, brands..."}
              className="w-full h-11 md:h-12 bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-transparent focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 rounded-full pl-12 pr-14 text-sm md:text-[15px] font-medium text-white placeholder-emerald-100/50 outline-none transition-all duration-300 backdrop-blur-md"
            />
            <button
              type="submit"
              aria-label="Submit search"
              className="absolute inset-y-1 right-1 md:inset-y-1.5 md:right-1.5 w-9 h-9 flex items-center justify-center bg-white hover:bg-emerald-50 text-[#064e3b] rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)] transition-all cursor-pointer"
            >
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </form>

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

            <Link
              href="/collections"
              className="hidden md:flex w-10 h-10 md:w-11 md:h-11 items-center justify-center rounded-full bg-white/10 text-white hover:text-[#064e3b] hover:bg-white transition-colors duration-300 backdrop-blur-md cursor-pointer"
              aria-label="Wishlist"
            >
              <Heart size={20} strokeWidth={2} />
            </Link>

            <Link
              href="/collections"
              className="hidden sm:flex w-10 h-10 md:w-11 md:h-11 items-center justify-center rounded-full bg-white/10 text-white hover:text-[#064e3b] hover:bg-white transition-colors duration-300 backdrop-blur-md cursor-pointer"
              aria-label="My Account"
            >
              <User size={20} strokeWidth={2} />
            </Link>

            {onCartClick ? (
              <button
                type="button"
                onClick={onCartClick}
                className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-full bg-white/10 text-white hover:text-[#064e3b] hover:bg-white transition-colors duration-300 relative group backdrop-blur-md cursor-pointer"
                aria-label="Cart"
              >
                <ShoppingBag size={20} strokeWidth={2} />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 text-neutral-900 text-[11px] font-bold flex items-center justify-center rounded-full shadow-sm group-hover:scale-110 transition-transform">
                  {cartCount}
                </span>
              </button>
            ) : (
              <Link
                href="/collections"
                className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-full bg-white/10 text-white hover:text-[#064e3b] hover:bg-white transition-colors duration-300 relative group backdrop-blur-md cursor-pointer"
                aria-label="Cart"
              >
                <ShoppingBag size={20} strokeWidth={2} />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 text-neutral-900 text-[11px] font-bold flex items-center justify-center rounded-full shadow-sm group-hover:scale-110 transition-transform">
                  {cartCount}
                </span>
              </Link>
            )}
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
              <form onSubmit={handleSearchSubmit} className="relative mt-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={headerData?.search?.placeholder || "Search for vapes, e-liquids..."}
                  className="w-full h-11 bg-white/15 border border-white/20 rounded-full pl-11 pr-12 text-sm text-white placeholder-emerald-100/60 focus:outline-none focus:border-amber-400"
                  autoFocus
                />
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/60" />
                <button
                  type="button"
                  onClick={() => setIsMobileSearchOpen(false)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white cursor-pointer"
                >
                  <X size={14} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Navigation (Hidden on Mobile) */}
        <nav className="hidden lg:block border-t border-emerald-800 bg-[#064e3b] relative">
          <ul className="max-w-[1400px] mx-auto px-6 h-[50px] flex items-center justify-center gap-8 text-[13px] font-bold tracking-wider">
            {(headerData?.navItems || []).map((item, i) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || (item.href && pathname.startsWith(item.href));

              return (
                <li
                  key={i}
                  className="h-full flex items-center group cursor-pointer"
                  onMouseEnter={(e) => {
                    setHoveredNavIdx(i);
                    if (item.hasDropdown) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const cols = item.columns?.length || 0;
                      const baseW = cols >= 3 ? 1020 : cols === 2 ? 720 : 420;
                      const width = Math.min(baseW, window.innerWidth * 0.94);
                      const center = rect.left + rect.width / 2;
                      const left = Math.min(
                        Math.max(12, center - width / 2),
                        Math.max(12, window.innerWidth - width - 12)
                      );
                      setDropPositions((prev) => ({ ...prev, [i]: { left, top: rect.bottom - 2, width } }));
                    }
                  }}
                  onMouseLeave={() => setHoveredNavIdx(null)}
                >
                  <Link
                    href={item.href || "/"}
                    className={`flex items-center gap-1 hover:text-amber-400 transition-colors py-3 ${
                      isActive ? "text-amber-400" : "text-white"
                    }`}
                  >
                    {item.label}
                    {item.badge && (
                      <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.2 rounded-full uppercase ml-1">
                        {item.badge}
                      </span>
                    )}
                    {item.hasDropdown && (
                      <ChevronDown
                        size={14}
                        strokeWidth={2.5}
                        className={`transition-transform duration-300 ${
                          hoveredNavIdx === i ? "rotate-180 text-amber-400" : "group-hover:rotate-180"
                        }`}
                      />
                    )}
                  </Link>

                  {/* Mega Menu Flyout Dropdown — white card, emerald/gold grading */}
                  <AnimatePresence>
                    {hoveredNavIdx === i && item.hasDropdown && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="fixed bg-white rounded-2xl shadow-[0_25px_60px_rgba(6,78,59,0.18)] border border-emerald-100 p-4 sm:p-5 z-50"
                        style={{
                          left: dropPositions[i]?.left ?? 0,
                          top: dropPositions[i]?.top ?? 0,
                          width: dropPositions[i]?.width ?? 420,
                        }}
                      >
                        <div
                          className="grid gap-3 text-left"
                          style={{
                            gridTemplateColumns: `repeat(${Math.min(item.columns?.length || 1, 3)}, minmax(0, 1fr))`
                          }}
                        >
                          {/* Columns */}
                          {(item.columns && item.columns.length > 0
                            ? item.columns
                            : [
                                {
                                  heading: "Categories",
                                  items: [{ title: "View All Products", href: item.href || "#" }]
                                }
                              ]
                          ).map((col, cIdx) => (
                            <div
                              key={cIdx}
                              className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3"
                            >
                              <div className="flex items-center justify-between px-1 pb-2">
                                <h4 className="text-[11px] font-extrabold text-emerald-800 tracking-[0.14em] uppercase">
                                  {col.heading}
                                </h4>
                                {col.badge && (
                                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-neutral-900">
                                    {col.badge}
                                  </span>
                                )}
                              </div>
                              <ul className="space-y-1.5">
                                {col.items.map((sub, sIdx) => (
                                  <li key={sIdx}>
                                    <Link
                                      href={sub.href || "#"}
                                      className="group/item flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 transition-all duration-300 hover:bg-emerald-600 hover:border-emerald-600 hover:shadow-[0_8px_20px_rgba(6,95,70,0.28)] hover:translate-x-1"
                                    >
                                      <span className="min-w-0">
                                        <span className="block text-[13px] font-bold text-neutral-900 truncate group-hover/item:text-white transition-colors duration-300">
                                          {sub.title}
                                        </span>
                                        {sub.desc && (
                                          <span className="block text-[11px] text-neutral-500 truncate group-hover/item:text-emerald-100 transition-colors duration-300">
                                            {sub.desc}
                                          </span>
                                        )}
                                      </span>
                                      <span className="flex items-center gap-2 shrink-0">
                                        {sub.badge && (
                                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                            {sub.badge}
                                          </span>
                                        )}
                                        <span className="w-7 h-7 rounded-full border border-emerald-200 text-emerald-700 flex items-center justify-center transition-all duration-300 group-hover/item:bg-white group-hover/item:text-emerald-700 group-hover/item:border-white">
                                          <ArrowRight size={13} strokeWidth={2.5} className="transition-transform duration-300 group-hover/item:translate-x-0.5" />
                                        </span>
                                      </span>
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}

                        </div>

                        {/* Featured promo banner — full width below the columns */}
                        {item.featuredBanner && (
                          <div className="mt-3 relative rounded-xl overflow-hidden bg-gradient-to-r from-[#064e3b] via-[#065f46] to-[#022c22] px-5 py-4 flex items-center justify-between gap-4">
                            <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />
                            <div className="relative flex items-center gap-4 min-w-0">
                              {item.featuredBanner.badge && (
                                <span className="shrink-0 text-[10px] font-black tracking-[0.14em] uppercase px-2.5 py-1 rounded-full bg-amber-400 text-neutral-900">
                                  {item.featuredBanner.badge}
                                </span>
                              )}
                              <div className="min-w-0">
                                <h5 className="text-base font-extrabold text-white truncate">
                                  {item.featuredBanner.title}
                                </h5>
                                {item.featuredBanner.subtitle && (
                                  <p className="text-[11px] text-emerald-100/80 truncate">
                                    {item.featuredBanner.subtitle}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Link
                              href={item.featuredBanner.href || "#"}
                              className="relative shrink-0 px-6 py-2.5 rounded-full text-xs font-extrabold bg-amber-400 hover:bg-amber-300 text-neutral-900 transition-colors"
                            >
                              SHOP NOW →
                            </Link>
                          </div>
                        )}

                        {/* Bottom trust strip */}
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-50/70 border border-emerald-100 px-4 py-2.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 bg-white border border-emerald-200 rounded-full px-2.5 py-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              100% Genuine UAE Verified Stock
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 bg-white border border-emerald-200 rounded-full px-2.5 py-1">
                              <Truck size={11} className="text-amber-600" />
                              Dubai Express 3-Hour Delivery
                            </span>
                          </div>
                          <Link
                            href={item.href || "/collections"}
                            className="text-[11px] font-extrabold tracking-wider text-neutral-900 bg-amber-400 hover:bg-amber-300 rounded-full px-5 py-2 transition-colors"
                          >
                            VIEW ALL →
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
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
              <div className="p-4 border-b border-emerald-800 flex items-center justify-between bg-[#064e3b]">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center">
                  <Image
                    src={headerData?.logo?.src || "/Vape mart 4.png"}
                    alt={headerData?.logo?.alt || "Vape Mart Logo"}
                    width={260}
                    height={80}
                    className="h-13 sm:h-14 w-auto object-contain drop-shadow-sm"
                    unoptimized
                  />
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Links */}
              <div className="p-4 flex-1">
                <span className="font-cinzel text-[10px] tracking-[0.2em] text-emerald-400 font-extrabold uppercase px-3 mb-2 block">
                  Categories & Shop
                </span>
                <ul className="flex flex-col gap-1.5">
                  {(headerData?.navItems || []).map((item, idx) => {
                    const isExpanded = expandedMobileMenuIdx === idx;
                    return (
                      <li key={idx} className="rounded-xl overflow-hidden bg-white/[0.03]">
                        <div className="flex items-center justify-between px-3.5 py-3 hover:bg-white/10 transition-colors text-sm font-semibold text-emerald-50 hover:text-white">
                          <Link
                            href={item.href || "/"}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex-1 cursor-pointer"
                          >
                            {item.label}
                          </Link>
                          <div className="flex items-center gap-2">
                            {item.badge && (
                              <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                                {item.badge}
                              </span>
                            )}
                            {item.hasDropdown ? (
                              <button
                                onClick={() => setExpandedMobileMenuIdx(isExpanded ? null : idx)}
                                aria-label={isExpanded ? "Collapse submenu" : "Expand submenu"}
                                className="w-8 h-8 -mr-1 flex items-center justify-center rounded-full hover:bg-white/10 cursor-pointer"
                              >
                                <ChevronDown
                                  size={16}
                                  className={`text-emerald-400/80 transition-transform duration-300 ${
                                    isExpanded ? "rotate-180 text-amber-400" : ""
                                  }`}
                                />
                              </button>
                            ) : (
                              <ChevronRight size={15} className="text-emerald-400/60" />
                            )}
                          </div>
                        </div>

                        {/* Mobile Dropdown Accordion Content */}
                        {item.hasDropdown && isExpanded && (
                          <div className="px-4 pb-3 pt-1 bg-black/20 border-t border-emerald-800/40 space-y-3">
                            {(item.columns || []).map((col, cIdx) => (
                              <div key={cIdx} className="space-y-1.5 pt-1">
                                <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                                  {col.heading}
                                </div>
                                <ul className="space-y-1 pl-2 border-l border-emerald-800">
                                  {col.items.map((sub, sIdx) => (
                                    <li key={sIdx}>
                                      <Link
                                        href={sub.href || "#"}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center justify-between py-1 text-xs text-neutral-300 hover:text-white"
                                      >
                                        <span>{sub.title}</span>
                                        {sub.badge && (
                                          <span className="text-[9px] font-bold text-amber-300 bg-amber-400/20 px-1.5 py-0.2 rounded">
                                            {sub.badge}
                                          </span>
                                        )}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )}
                      </li>
                    );
                  })}
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
    </>
  );
}
