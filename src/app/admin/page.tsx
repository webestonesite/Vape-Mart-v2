"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sliders,
  Layout,
  Menu,
  Layers,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Phone,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  ShoppingBag,
  Heart,
  User,
  ShieldCheck,
  Eye,
  Lock,
  Tag,
  Truck,
  Star,
  FolderPlus,
  Grid,
} from "lucide-react";
import defaultTheme from "@/data/theme-published.json";

export interface SubMenuItem {
  title: string;
  href: string;
  badge?: string;
  desc?: string;
}

export interface MegaMenuColumn {
  heading: string;
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

export interface NavItemConfig {
  label: string;
  href: string;
  badge?: string;
  hasDropdown?: boolean;
  columns?: MegaMenuColumn[];
  featuredBanner?: MegaMenuBanner;
}

export interface HeaderConfig {
  topBar: {
    enabled: boolean;
    announcements: string[];
    phone: string;
    phoneHref?: string;
    links: { label: string; href: string }[];
  };
  logo: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
  search: {
    placeholder: string;
  };
  navItems: NavItemConfig[];
  actions?: {
    showWishlist?: boolean;
    showAccount?: boolean;
    showCart?: boolean;
  };
}

export default function AdminPage() {
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>(() => {
    return (
      (defaultTheme as { header?: HeaderConfig }).header || {
        topBar: {
          enabled: true,
          announcements: [
            "Secure Payment | COD Available",
            "Exclusive offer up to 10% OFF",
            "100% Authentic Products - Original Brands Guaranteed",
            "Free Delivery on Orders Above AED 350",
            "20,000+ Happy Customers",
          ],
          phone: "+971 55 168 8299",
          phoneHref: "tel:+971551688299",
          links: [
            { label: "About Us", href: "#" },
            { label: "Contact Us", href: "#" },
          ],
        },
        logo: {
          src: "/vape-mart-text-logo-white.png",
          alt: "Vape Mart Logo",
          width: 170,
          height: 40,
        },
        search: {
          placeholder: "Search for vapes, e-liquids, brands...",
        },
        navItems: [
          { label: "HOME", href: "/", badge: "Main" },
          { label: "SHOP", href: "#", badge: "Hot" },
          { label: "DISPOSABLE VAPE", href: "#", badge: "Popular", hasDropdown: true },
          { label: "NICOTINE POUCHES", href: "#", badge: "Fresh" },
          { label: "SHISHA/HOOKAH", href: "#", badge: "", hasDropdown: true },
          { label: "PODS SYSTEM", href: "#", badge: "Sale", hasDropdown: true },
          { label: "E-LIQUID", href: "#", badge: "Top", hasDropdown: true },
          { label: "VAPE KIT", href: "#", badge: "" },
          { label: "BRANDS", href: "#", badge: "" },
          { label: "OFFERS", href: "#", badge: "10% OFF" },
        ],
        actions: {
          showWishlist: true,
          showAccount: true,
          showCart: true,
        },
      }
    );
  });

  const [activeTab, setActiveTab] = useState<"topbar" | "logo" | "nav" | "preview">("nav");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [expandedDropdownIdx, setExpandedDropdownIdx] = useState<number | null>(2); // Default expand 1st dropdown (DISPOSABLE VAPE)

  // Fetch current stored theme on mount
  useEffect(() => {
    fetch("/api/admin/theme")
      .then((res) => res.json())
      .then((data) => {
        if (data?.data?.header) {
          setHeaderConfig(data.data.header);
        }
      })
      .catch((err) => {
        console.error("Failed to load header config from API:", err);
      });
  }, []);

  const handleSave = async () => {
    setSaveStatus("saving");
    setErrorMessage("");

    try {
      const res = await fetch("/api/admin/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ header: headerConfig }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save header configuration");
      }

      setSaveStatus("success");
      setTimeout(() => {
        setSaveStatus("idle");
      }, 3500);
    } catch (err: unknown) {
      setSaveStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Network error");
    }
  };

  const handleReset = () => {
    if (confirm("Reset edits back to original settings?")) {
      startTransition(() => {
        fetch("/api/admin/theme")
          .then((res) => res.json())
          .then((data) => {
            if (data?.data?.header) {
              setHeaderConfig(data.data.header);
            }
          });
      });
    }
  };

  // Top Bar Handlers
  const handleAnnouncementChange = (index: number, val: string) => {
    const list = [...headerConfig.topBar.announcements];
    list[index] = val;
    setHeaderConfig({
      ...headerConfig,
      topBar: { ...headerConfig.topBar, announcements: list },
    });
  };

  const handleAddAnnouncement = () => {
    setHeaderConfig({
      ...headerConfig,
      topBar: {
        ...headerConfig.topBar,
        announcements: [...headerConfig.topBar.announcements, "New promotional notice"],
      },
    });
  };

  const handleRemoveAnnouncement = (index: number) => {
    const list = headerConfig.topBar.announcements.filter((_, i) => i !== index);
    setHeaderConfig({
      ...headerConfig,
      topBar: { ...headerConfig.topBar, announcements: list },
    });
  };

  const handleMoveAnnouncement = (index: number, direction: "up" | "down") => {
    const list = [...headerConfig.topBar.announcements];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    setHeaderConfig({
      ...headerConfig,
      topBar: { ...headerConfig.topBar, announcements: list },
    });
  };

  // Nav Items Handlers
  const handleNavItemChange = (index: number, field: keyof NavItemConfig, val: unknown) => {
    const list = [...headerConfig.navItems];
    list[index] = { ...list[index], [field]: val };

    // If enabling dropdown and no columns exist, provide a sensible default template
    if (field === "hasDropdown" && val === true && (!list[index].columns || list[index].columns?.length === 0)) {
      list[index].columns = [
        {
          heading: "Popular Categories",
          items: [
            { title: "Best Sellers", href: "#", badge: "HOT" },
            { title: "New Arrivals", href: "#" },
          ],
        },
        {
          heading: "Shop By Type",
          items: [
            { title: "Premium Series", href: "#" },
            { title: "Standard Kits", href: "#" },
          ],
        },
      ];
      list[index].featuredBanner = {
        title: `${list[index].label} Special`,
        subtitle: "Exclusive deals with same-day delivery in UAE",
        badge: "SALE",
        image: "/images/disposable_vape.png",
        href: "#",
      };
      setExpandedDropdownIdx(index);
    }

    setHeaderConfig({ ...headerConfig, navItems: list });
  };

  const handleAddNavItem = () => {
    setHeaderConfig({
      ...headerConfig,
      navItems: [
        ...headerConfig.navItems,
        { label: "NEW LINK", href: "#", badge: "", hasDropdown: false },
      ],
    });
  };

  const handleRemoveNavItem = (index: number) => {
    const list = headerConfig.navItems.filter((_, i) => i !== index);
    setHeaderConfig({ ...headerConfig, navItems: list });
    if (expandedDropdownIdx === index) {
      setExpandedDropdownIdx(null);
    }
  };

  const handleMoveNavItem = (index: number, direction: "up" | "down") => {
    const list = [...headerConfig.navItems];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    setHeaderConfig({ ...headerConfig, navItems: list });
    if (expandedDropdownIdx === index) setExpandedDropdownIdx(target);
  };

  // Mega Menu Handlers
  const handleAddColumn = (navIdx: number) => {
    const list = [...headerConfig.navItems];
    const item = { ...list[navIdx] };
    const cols = [...(item.columns || [])];
    cols.push({
      heading: "New Column",
      items: [
        { title: "Sub Category 1", href: "#" },
        { title: "Sub Category 2", href: "#" },
      ],
    });
    item.columns = cols;
    list[navIdx] = item;
    setHeaderConfig({ ...headerConfig, navItems: list });
  };

  const handleRemoveColumn = (navIdx: number, colIdx: number) => {
    const list = [...headerConfig.navItems];
    const item = { ...list[navIdx] };
    item.columns = (item.columns || []).filter((_, i) => i !== colIdx);
    list[navIdx] = item;
    setHeaderConfig({ ...headerConfig, navItems: list });
  };

  const handleColumnHeadingChange = (navIdx: number, colIdx: number, heading: string) => {
    const list = [...headerConfig.navItems];
    const item = { ...list[navIdx] };
    const cols = [...(item.columns || [])];
    cols[colIdx] = { ...cols[colIdx], heading };
    item.columns = cols;
    list[navIdx] = item;
    setHeaderConfig({ ...headerConfig, navItems: list });
  };

  const handleAddSubItem = (navIdx: number, colIdx: number) => {
    const list = [...headerConfig.navItems];
    const item = { ...list[navIdx] };
    const cols = [...(item.columns || [])];
    const subItems = [...(cols[colIdx].items || [])];
    subItems.push({ title: "New Item", href: "#", badge: "" });
    cols[colIdx] = { ...cols[colIdx], items: subItems };
    item.columns = cols;
    list[navIdx] = item;
    setHeaderConfig({ ...headerConfig, navItems: list });
  };

  const handleRemoveSubItem = (navIdx: number, colIdx: number, subIdx: number) => {
    const list = [...headerConfig.navItems];
    const item = { ...list[navIdx] };
    const cols = [...(item.columns || [])];
    cols[colIdx] = {
      ...cols[colIdx],
      items: cols[colIdx].items.filter((_, i) => i !== subIdx),
    };
    item.columns = cols;
    list[navIdx] = item;
    setHeaderConfig({ ...headerConfig, navItems: list });
  };

  const handleSubItemChange = (
    navIdx: number,
    colIdx: number,
    subIdx: number,
    field: keyof SubMenuItem,
    val: string
  ) => {
    const list = [...headerConfig.navItems];
    const item = { ...list[navIdx] };
    const cols = [...(item.columns || [])];
    const subItems = [...cols[colIdx].items];
    subItems[subIdx] = { ...subItems[subIdx], [field]: val };
    cols[colIdx] = { ...cols[colIdx], items: subItems };
    item.columns = cols;
    list[navIdx] = item;
    setHeaderConfig({ ...headerConfig, navItems: list });
  };

  const handleBannerChange = (
    navIdx: number,
    field: keyof MegaMenuBanner,
    val: string
  ) => {
    const list = [...headerConfig.navItems];
    const item = { ...list[navIdx] };
    item.featuredBanner = {
      title: "",
      ...item.featuredBanner,
      [field]: val,
    };
    list[navIdx] = item;
    setHeaderConfig({ ...headerConfig, navItems: list });
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 bg-[#031c15] border-b lg:border-b-0 lg:border-r border-emerald-900/60 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-emerald-900/40 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-bold">
                  VM
                </div>
                <div>
                  <h1 className="text-base font-bold text-white tracking-wide">Vape Mart</h1>
                  <span className="text-[10px] text-emerald-400/80 font-mono tracking-widest uppercase">Admin Panel</span>
                </div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => setActiveTab("nav")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === "nav"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40"
                  : "text-neutral-300 hover:bg-emerald-950/40 hover:text-white"
              }`}
            >
              <Menu size={16} />
              <span>Navigation & Mega Menu</span>
              <span className="ml-auto bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-mono border border-emerald-800/40">
                {headerConfig.navItems.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("topbar")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === "topbar"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40"
                  : "text-neutral-300 hover:bg-emerald-950/40 hover:text-white"
              }`}
            >
              <Layout size={16} />
              <span>Top Bar & Ticker</span>
            </button>

            <button
              onClick={() => setActiveTab("logo")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === "logo"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40"
                  : "text-neutral-300 hover:bg-emerald-950/40 hover:text-white"
              }`}
            >
              <Sliders size={16} />
              <span>Logo & Search Bar</span>
            </button>

            <button
              onClick={() => setActiveTab("preview")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === "preview"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40"
                  : "text-neutral-300 hover:bg-emerald-950/40 hover:text-white"
              }`}
            >
              <Eye size={16} />
              <span>Live Visual Preview</span>
            </button>
          </nav>
        </div>

        {/* Footer Actions in Sidebar */}
        <div className="p-4 border-t border-emerald-900/40 space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl text-xs font-semibold bg-emerald-950/60 hover:bg-emerald-900/40 text-emerald-200 border border-emerald-800/50 transition-colors"
          >
            <ExternalLink size={14} />
            <span>View Public Storefront</span>
          </Link>
          <div className="text-[11px] text-neutral-400 text-center font-mono">
            Vape Mart Customizer v2.4
          </div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 flex flex-col bg-[#05130f] overflow-y-auto min-h-screen">
        {/* Top Control Bar */}
        <header className="sticky top-0 z-30 bg-[#041a13]/90 backdrop-blur-md border-b border-emerald-900/50 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
              <span>Header & Mega Menu Customizer</span>
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                theme-published.json
              </span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Configure top bar, logo, and multi-column mega menus for categories like Disposable Vapes, Shisha, Pods.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              disabled={isPending || saveStatus === "saving"}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>

            <button
              onClick={handleSave}
              disabled={saveStatus === "saving"}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black shadow-lg shadow-emerald-500/25 transition-all transform active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {saveStatus === "saving" ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Publish Header</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Status Alerts */}
        {saveStatus === "success" && (
          <div className="mx-6 mt-4 p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-3 animate-fade-in shadow-lg">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span>Changes successfully written to <strong>src/data/theme-published.json</strong> and active storefront!</span>
          </div>
        )}

        {saveStatus === "error" && (
          <div className="mx-6 mt-4 p-4 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-center gap-3 animate-fade-in shadow-lg">
            <AlertCircle size={18} className="text-red-400 shrink-0" />
            <span>Error saving changes: {errorMessage}</span>
          </div>
        )}

        {/* Tab Content Body */}
        <div className="p-6 max-w-5xl space-y-6">
          {/* TAB 1: NAVIGATION MENU LINKS & MEGA MENU BUILDER */}
          {activeTab === "nav" && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-[#031d16] border border-emerald-900/60 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Grid size={16} className="text-emerald-400" />
                      <span>Navigation Links & Mega Menu Structure</span>
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Enable <strong>Dropdown</strong> on any link to customize multi-column categories, links, and promo banners.
                    </p>
                  </div>
                  <button
                    onClick={handleAddNavItem}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/50 transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add Nav Link</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {headerConfig.navItems.map((item, idx) => {
                    const isDropdownOpen = expandedDropdownIdx === idx;
                    return (
                      <div
                        key={idx}
                        className="rounded-2xl bg-[#051712] border border-emerald-900/60 hover:border-emerald-700/80 transition-all overflow-hidden"
                      >
                        {/* Top row for nav link details */}
                        <div className="p-4 flex flex-col md:flex-row items-start md:items-center gap-3 bg-[#051712]">
                          <span className="text-xs font-mono text-emerald-400 font-bold w-6 shrink-0">
                            #{idx + 1}
                          </span>

                          {/* Label */}
                          <div className="flex-1 w-full md:w-auto">
                            <label className="text-[10px] text-neutral-400 uppercase font-mono block mb-1">
                              Menu Label
                            </label>
                            <input
                              type="text"
                              value={item.label}
                              onChange={(e) => handleNavItemChange(idx, "label", e.target.value)}
                              className="w-full bg-[#03140f] border border-emerald-900/80 focus:border-emerald-400 rounded-lg px-3 py-1.5 text-xs text-white outline-none font-semibold"
                              placeholder="DISPOSABLE VAPE"
                            />
                          </div>

                          {/* Href */}
                          <div className="w-full md:w-40">
                            <label className="text-[10px] text-neutral-400 uppercase font-mono block mb-1">
                              Link URL
                            </label>
                            <input
                              type="text"
                              value={item.href}
                              onChange={(e) => handleNavItemChange(idx, "href", e.target.value)}
                              className="w-full bg-[#03140f] border border-emerald-900/80 focus:border-emerald-400 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
                              placeholder="# or /collections/vape"
                            />
                          </div>

                          {/* Badge */}
                          <div className="w-full md:w-28">
                            <label className="text-[10px] text-neutral-400 uppercase font-mono block mb-1">
                              Badge (Tag)
                            </label>
                            <input
                              type="text"
                              value={item.badge || ""}
                              onChange={(e) => handleNavItemChange(idx, "badge", e.target.value)}
                              className="w-full bg-[#03140f] border border-emerald-900/80 focus:border-emerald-400 rounded-lg px-3 py-1.5 text-xs text-white outline-none placeholder:text-neutral-600"
                              placeholder="HOT, SALE"
                            />
                          </div>

                          {/* Dropdown Toggle Checkbox */}
                          <div className="flex items-center gap-2 pt-2 md:pt-4">
                            <label className="flex items-center gap-1.5 text-xs text-neutral-300 cursor-pointer bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10 hover:bg-white/10">
                              <input
                                type="checkbox"
                                checked={!!item.hasDropdown}
                                onChange={(e) => handleNavItemChange(idx, "hasDropdown", e.target.checked)}
                                className="rounded accent-emerald-500"
                              />
                              <span className="text-[11px] font-semibold text-emerald-300">Mega Dropdown</span>
                            </label>
                          </div>

                          {/* Reorder and Delete Actions */}
                          <div className="flex items-center gap-1 ml-auto pt-2 md:pt-4">
                            <button
                              onClick={() => handleMoveNavItem(idx, "up")}
                              disabled={idx === 0}
                              className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-30 cursor-pointer"
                              title="Move Up"
                            >
                              <MoveUp size={14} />
                            </button>
                            <button
                              onClick={() => handleMoveNavItem(idx, "down")}
                              disabled={idx === headerConfig.navItems.length - 1}
                              className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-30 cursor-pointer"
                              title="Move Down"
                            >
                              <MoveDown size={14} />
                            </button>
                            <button
                              onClick={() => handleRemoveNavItem(idx)}
                              className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/50 rounded-lg cursor-pointer"
                              title="Delete Link"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Dropdown / Mega Menu Editor Accordion */}
                        {item.hasDropdown && (
                          <div className="border-t border-emerald-900/60 bg-[#021811]">
                            <button
                              onClick={() => setExpandedDropdownIdx(isDropdownOpen ? null : idx)}
                              className="w-full px-5 py-3 flex items-center justify-between text-xs font-bold text-amber-300 bg-emerald-950/40 hover:bg-emerald-950/80 transition-colors"
                            >
                              <span className="flex items-center gap-2">
                                <Layers size={14} />
                                <span>
                                  Configure Mega Menu Dropdown Content for &ldquo;{item.label}&rdquo; (
                                  {(item.columns || []).length} Columns)
                                </span>
                              </span>
                              <ChevronDown
                                size={16}
                                className={`transform transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                              />
                            </button>

                            {isDropdownOpen && (
                              <div className="p-5 space-y-6 border-t border-emerald-900/40">
                                {/* Columns Management */}
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                      <span>Mega Menu Columns</span>
                                      <span className="text-[10px] text-neutral-400 font-normal">
                                        (Organize by brands, puff count, flavor, etc.)
                                      </span>
                                    </h4>
                                    <button
                                      onClick={() => handleAddColumn(idx)}
                                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors cursor-pointer"
                                    >
                                      <Plus size={13} />
                                      <span>Add Column</span>
                                    </button>
                                  </div>

                                  {/* Columns Grid */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {(item.columns || []).map((col, colIdx) => (
                                      <div
                                        key={colIdx}
                                        className="p-4 rounded-xl bg-[#041d15] border border-emerald-900/80 flex flex-col justify-between space-y-3"
                                      >
                                        <div className="space-y-3">
                                          <div className="flex items-center justify-between gap-2">
                                            <input
                                              type="text"
                                              value={col.heading}
                                              onChange={(e) =>
                                                handleColumnHeadingChange(idx, colIdx, e.target.value)
                                              }
                                              placeholder="Column Heading"
                                              className="bg-transparent border-b border-emerald-700 focus:border-amber-400 text-xs font-bold text-amber-300 py-1 outline-none w-full"
                                            />
                                            <button
                                              onClick={() => handleRemoveColumn(idx, colIdx)}
                                              className="text-red-400 hover:text-red-300 p-1"
                                              title="Delete Column"
                                            >
                                              <Trash2 size={13} />
                                            </button>
                                          </div>

                                          {/* Sub-items in this column */}
                                          <div className="space-y-2">
                                            {col.items.map((subItem, subIdx) => (
                                              <div
                                                key={subIdx}
                                                className="flex items-center gap-1.5 p-1.5 bg-[#02140e] rounded-lg border border-emerald-950"
                                              >
                                                <input
                                                  type="text"
                                                  value={subItem.title}
                                                  onChange={(e) =>
                                                    handleSubItemChange(
                                                      idx,
                                                      colIdx,
                                                      subIdx,
                                                      "title",
                                                      e.target.value
                                                    )
                                                  }
                                                  placeholder="Link Title"
                                                  className="flex-1 bg-transparent text-[11px] text-white outline-none"
                                                />
                                                <input
                                                  type="text"
                                                  value={subItem.href}
                                                  onChange={(e) =>
                                                    handleSubItemChange(
                                                      idx,
                                                      colIdx,
                                                      subIdx,
                                                      "href",
                                                      e.target.value
                                                    )
                                                  }
                                                  placeholder="URL (#)"
                                                  className="w-16 bg-transparent text-[10px] text-neutral-400 font-mono outline-none"
                                                />
                                                <input
                                                  type="text"
                                                  value={subItem.badge || ""}
                                                  onChange={(e) =>
                                                    handleSubItemChange(
                                                      idx,
                                                      colIdx,
                                                      subIdx,
                                                      "badge",
                                                      e.target.value
                                                    )
                                                  }
                                                  placeholder="Tag"
                                                  className="w-12 bg-transparent text-[10px] text-amber-300 font-bold outline-none placeholder:text-neutral-700"
                                                />
                                                <button
                                                  onClick={() => handleRemoveSubItem(idx, colIdx, subIdx)}
                                                  className="text-neutral-500 hover:text-red-400 p-1"
                                                >
                                                  <Trash2 size={12} />
                                                </button>
                                              </div>
                                            ))}
                                          </div>
                                        </div>

                                        <button
                                          onClick={() => handleAddSubItem(idx, colIdx)}
                                          className="w-full py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/40 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                                        >
                                          <Plus size={12} />
                                          <span>Add Sub-Item</span>
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Promo Card Configuration */}
                                <div className="p-4 rounded-xl bg-[#041d15] border border-emerald-900/80 space-y-3">
                                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <span>Featured Promotional Card inside Mega Menu</span>
                                    <span className="text-[10px] text-neutral-400 font-normal">
                                      (Visual highlight card on right side of mega dropdown)
                                    </span>
                                  </h4>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                      <label className="text-[10px] text-neutral-400 block mb-1">
                                        Promo Title
                                      </label>
                                      <input
                                        type="text"
                                        value={item.featuredBanner?.title || ""}
                                        onChange={(e) => handleBannerChange(idx, "title", e.target.value)}
                                        className="w-full bg-[#02140e] border border-emerald-900/80 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                                        placeholder="Tugboat Super 24K"
                                      />
                                    </div>

                                    <div>
                                      <label className="text-[10px] text-neutral-400 block mb-1">
                                        Promo Subtitle
                                      </label>
                                      <input
                                        type="text"
                                        value={item.featuredBanner?.subtitle || ""}
                                        onChange={(e) => handleBannerChange(idx, "subtitle", e.target.value)}
                                        className="w-full bg-[#02140e] border border-emerald-900/80 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                                        placeholder="24,000 Puffs with Smart Screen"
                                      />
                                    </div>

                                    <div>
                                      <label className="text-[10px] text-neutral-400 block mb-1">
                                        Badge Label
                                      </label>
                                      <input
                                        type="text"
                                        value={item.featuredBanner?.badge || ""}
                                        onChange={(e) => handleBannerChange(idx, "badge", e.target.value)}
                                        className="w-full bg-[#02140e] border border-emerald-900/80 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                                        placeholder="20% OFF or NEW"
                                      />
                                    </div>

                                    <div className="md:col-span-2">
                                      <label className="text-[10px] text-neutral-400 block mb-1">
                                        Image Path
                                      </label>
                                      <input
                                        type="text"
                                        value={item.featuredBanner?.image || ""}
                                        onChange={(e) => handleBannerChange(idx, "image", e.target.value)}
                                        className="w-full bg-[#02140e] border border-emerald-900/80 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                                        placeholder="/images/disposable_vape.png"
                                      />
                                      <div className="flex gap-2 mt-1.5">
                                        <button
                                          onClick={() =>
                                            handleBannerChange(idx, "image", "/images/disposable_vape.png")
                                          }
                                          className="text-[9px] px-2 py-0.5 rounded bg-white/5 text-emerald-300"
                                        >
                                          Disposable Image
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleBannerChange(idx, "image", "/images/terea_heets.jpg")
                                          }
                                          className="text-[9px] px-2 py-0.5 rounded bg-white/5 text-emerald-300"
                                        >
                                          Terea/IQOS Image
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleBannerChange(idx, "image", "/images/hero_slide_2.jpg")
                                          }
                                          className="text-[9px] px-2 py-0.5 rounded bg-white/5 text-emerald-300"
                                        >
                                          Pod Devices Image
                                        </button>
                                      </div>
                                    </div>

                                    <div>
                                      <label className="text-[10px] text-neutral-400 block mb-1">
                                        Link URL (href)
                                      </label>
                                      <input
                                        type="text"
                                        value={item.featuredBanner?.href || ""}
                                        onChange={(e) => handleBannerChange(idx, "href", e.target.value)}
                                        className="w-full bg-[#02140e] border border-emerald-900/80 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                                        placeholder="# or /collections/vape"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TOP BAR & TICKER */}
          {activeTab === "topbar" && (
            <div className="space-y-6">
              {/* Ticker Enabled Toggle Card */}
              <div className="p-5 rounded-2xl bg-[#031d16] border border-emerald-900/60 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Top Announcement Strip</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Enable or disable the top marquee banner above the header.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={headerConfig.topBar.enabled}
                      onChange={(e) =>
                        setHeaderConfig({
                          ...headerConfig,
                          topBar: { ...headerConfig.topBar, enabled: e.target.checked },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-emerald-900/40">
                  <div>
                    <label className="block text-xs font-semibold text-emerald-200 mb-1.5">
                      Customer Service Phone
                    </label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400/70" />
                      <input
                        type="text"
                        value={headerConfig.topBar.phone}
                        onChange={(e) =>
                          setHeaderConfig({
                            ...headerConfig,
                            topBar: {
                              ...headerConfig.topBar,
                              phone: e.target.value,
                              phoneHref: `tel:${e.target.value.replace(/[^0-9+]/g, "")}`,
                            },
                          })
                        }
                        className="w-full bg-[#051712] border border-emerald-900/80 focus:border-emerald-400 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none transition-colors"
                        placeholder="+971 55 168 8299"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-emerald-200 mb-1.5">
                      Quick Links (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={headerConfig.topBar.links.map((l) => l.label).join(", ")}
                      onChange={(e) => {
                        const labels = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                        setHeaderConfig({
                          ...headerConfig,
                          topBar: {
                            ...headerConfig.topBar,
                            links: labels.map((label) => ({ label, href: "#" })),
                          },
                        });
                      }}
                      className="w-full bg-[#051712] border border-emerald-900/80 focus:border-emerald-400 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-colors"
                      placeholder="About Us, Contact Us"
                    />
                  </div>
                </div>
              </div>

              {/* Announcements List Editor */}
              <div className="p-5 rounded-2xl bg-[#031d16] border border-emerald-900/60 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Marquee Announcement Messages</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Items rotate smoothly in the continuous infinite ticker.
                    </p>
                  </div>
                  <button
                    onClick={handleAddAnnouncement}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/50 transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {headerConfig.topBar.announcements.map((msg, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-[#051712] border border-emerald-900/50 hover:border-emerald-800 transition-colors"
                    >
                      <span className="text-[11px] font-mono text-emerald-400/70 w-6 text-center shrink-0">
                        #{idx + 1}
                      </span>
                      <input
                        type="text"
                        value={msg}
                        onChange={(e) => handleAnnouncementChange(idx, e.target.value)}
                        className="flex-1 bg-transparent border-none text-xs text-white focus:outline-none"
                      />
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveAnnouncement(idx, "up")}
                          disabled={idx === 0}
                          className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="Move Up"
                        >
                          <MoveUp size={14} />
                        </button>
                        <button
                          onClick={() => handleMoveAnnouncement(idx, "down")}
                          disabled={idx === headerConfig.topBar.announcements.length - 1}
                          className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="Move Down"
                        >
                          <MoveDown size={14} />
                        </button>
                        <button
                          onClick={() => handleRemoveAnnouncement(idx)}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/50 rounded-lg cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BRAND LOGO & SEARCH */}
          {activeTab === "logo" && (
            <div className="space-y-6">
              {/* Logo Card */}
              <div className="p-5 rounded-2xl bg-[#031d16] border border-emerald-900/60 shadow-xl space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Brand Logo Configuration</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Select a logo file path or choose one of the available assets in public folder.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-emerald-200 mb-1.5">
                      Logo Image Path
                    </label>
                    <input
                      type="text"
                      value={headerConfig.logo.src}
                      onChange={(e) =>
                        setHeaderConfig({
                          ...headerConfig,
                          logo: { ...headerConfig.logo, src: e.target.value },
                        })
                      }
                      className="w-full bg-[#051712] border border-emerald-900/80 focus:border-emerald-400 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-colors"
                      placeholder="/vape-mart-text-logo-white.png"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() =>
                          setHeaderConfig({
                            ...headerConfig,
                            logo: { ...headerConfig.logo, src: "/vape-mart-text-logo-white.png" },
                          })
                        }
                        className="text-[10px] px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-emerald-300 border border-emerald-800/40"
                      >
                        White Text Logo
                      </button>
                      <button
                        onClick={() =>
                          setHeaderConfig({
                            ...headerConfig,
                            logo: { ...headerConfig.logo, src: "/vape-mart-text-logo.png" },
                          })
                        }
                        className="text-[10px] px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-emerald-300 border border-emerald-800/40"
                      >
                        Color Text Logo
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-emerald-200 mb-1.5">
                      Logo Alt Attribute (SEO)
                    </label>
                    <input
                      type="text"
                      value={headerConfig.logo.alt}
                      onChange={(e) =>
                        setHeaderConfig({
                          ...headerConfig,
                          logo: { ...headerConfig.logo, alt: e.target.value },
                        })
                      }
                      className="w-full bg-[#051712] border border-emerald-900/80 focus:border-emerald-400 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-colors"
                      placeholder="Vape Mart Dubai Logo"
                    />
                  </div>
                </div>

                {/* Logo Preview box */}
                <div className="p-4 rounded-xl bg-[#064e3b] border border-emerald-700/50 flex items-center justify-between">
                  <div className="text-xs text-emerald-100 font-semibold">Live Logo Rendering:</div>
                  <div className="p-2 bg-black/20 rounded-lg">
                    <Image
                      src={headerConfig.logo.src || "/vape-mart-text-logo-white.png"}
                      alt={headerConfig.logo.alt || "Logo"}
                      width={160}
                      height={36}
                      className="h-8 w-auto object-contain"
                      unoptimized
                    />
                  </div>
                </div>
              </div>

              {/* Search Bar Settings */}
              <div className="p-5 rounded-2xl bg-[#031d16] border border-emerald-900/60 shadow-xl space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Search Bar Settings</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Customize the default search input placeholder for your customers.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-200 mb-1.5">
                    Search Input Placeholder Text
                  </label>
                  <div className="relative">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400/70" />
                    <input
                      type="text"
                      value={headerConfig.search?.placeholder || ""}
                      onChange={(e) =>
                        setHeaderConfig({
                          ...headerConfig,
                          search: { placeholder: e.target.value },
                        })
                      }
                      className="w-full bg-[#051712] border border-emerald-900/80 focus:border-emerald-400 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none transition-colors"
                      placeholder="Search for vapes, e-liquids, brands..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LIVE PREVIEW */}
          {activeTab === "preview" && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-[#031d16] border border-emerald-900/60 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Eye size={16} className="text-emerald-400" />
                      <span>Live Header Preview</span>
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Visual simulation of how the header appears to visitors on desktop and tablet.
                    </p>
                  </div>
                </div>

                {/* Simulated Header Container */}
                <div className="rounded-2xl overflow-hidden border border-emerald-800 shadow-2xl bg-[#022c22]">
                  {/* Top Bar Preview */}
                  {headerConfig.topBar.enabled && (
                    <div className="bg-[#022c22] text-white text-[11px] font-medium py-2 px-4 flex justify-between items-center border-b border-emerald-900/60">
                      <div className="flex items-center gap-4 overflow-hidden">
                        {headerConfig.topBar.announcements.slice(0, 2).map((item, idx) => (
                          <span key={idx} className="flex items-center gap-1.5 opacity-90 text-[11px]">
                            <Lock size={12} className="text-amber-400" /> {item}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-[11px]">
                        <span className="flex items-center gap-1 text-emerald-300">
                          <Phone size={12} /> {headerConfig.topBar.phone}
                        </span>
                        {headerConfig.topBar.links.map((link, idx) => (
                          <span key={idx} className="opacity-70 hover:opacity-100">
                            {link.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Main Header Preview */}
                  <div className="bg-[#064e3b] px-6 py-3 flex items-center justify-between gap-6 border-b border-emerald-800">
                    <div className="flex items-center gap-3">
                      <Image
                        src={headerConfig.logo.src || "/vape-mart-text-logo-white.png"}
                        alt={headerConfig.logo.alt || "Logo"}
                        width={140}
                        height={34}
                        className="h-7 w-auto object-contain"
                        unoptimized
                      />
                    </div>

                    {/* Search preview */}
                    <div className="flex-1 max-w-md relative">
                      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-100/60" />
                      <input
                        type="text"
                        readOnly
                        placeholder={headerConfig.search.placeholder}
                        className="w-full h-9 bg-white/10 rounded-full pl-9 pr-4 text-xs text-white placeholder-emerald-100/60 outline-none"
                      />
                    </div>

                    {/* Actions preview */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                        <Heart size={15} />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                        <User size={15} />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white relative">
                        <ShoppingBag size={15} />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 text-black text-[9px] font-bold rounded-full flex items-center justify-center">
                          0
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Bar Preview */}
                  <nav className="bg-[#064e3b] px-6 py-2 border-t border-emerald-800/80">
                    <ul className="flex items-center justify-center gap-6 text-[11px] font-bold tracking-wider text-white overflow-x-auto">
                      {headerConfig.navItems.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-1 hover:text-amber-300 cursor-default whitespace-nowrap">
                          <span className={idx === 0 ? "text-amber-400" : ""}>{item.label}</span>
                          {item.badge && (
                            <span className="text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.2 rounded-full">
                              {item.badge}
                            </span>
                          )}
                          {item.hasDropdown && <ChevronDown size={11} />}
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
