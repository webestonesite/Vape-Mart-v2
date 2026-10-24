"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  LayoutDashboard, Package, FolderOpen, ShoppingBag, FileText, Menu as MenuIcon,
  Search, Plus, ExternalLink, LogOut, RefreshCw, Megaphone,
  Image as ImageIcon, Layers, Star, HelpCircle, PenLine, MessageSquare, Droplets,
  Palette, ShoppingCart, LayoutTemplate, LayoutGrid, User, Tag, ArrowRight,
} from "lucide-react";

const tabLoading = () => <p className="text-neutral-500">Loading…</p>;
const ProductsManager = dynamic(() => import("./products-manager").then((m) => m.ProductsManager), { loading: tabLoading });
const OrdersTab = dynamic(() => import("./products-manager").then((m) => m.OrdersTab), { loading: tabLoading });
const ProductReviewsTab = dynamic(() => import("./manage-tabs").then((m) => m.ProductReviewsTab), { loading: tabLoading });
const CollectionsManager = dynamic(() => import("./manage-tabs").then((m) => m.CollectionsManager), { loading: tabLoading });
const FlavorsTab = dynamic(() => import("./manage-tabs").then((m) => m.FlavorsTab), { loading: tabLoading });
const MediaTab = dynamic(() => import("./manage-tabs").then((m) => m.MediaTab), { loading: tabLoading });
const CartTab = dynamic(() => import("./settings-tabs").then((m) => m.CartTab), { loading: tabLoading });
const ProductPageTab = dynamic(() => import("./settings-tabs").then((m) => m.ProductPageTab), { loading: tabLoading });
const CollectionPageTab = dynamic(() => import("./settings-tabs").then((m) => m.CollectionPageTab), { loading: tabLoading });
const ThemeTab = dynamic(() => import("./settings-tabs").then((m) => m.ThemeTab), { loading: tabLoading });
const HomeTab = dynamic(() => import("./settings-tabs").then((m) => m.HomeTab), { loading: tabLoading });
const BlogSettingsTab = dynamic(() => import("./settings-tabs").then((m) => m.BlogSettingsTab), { loading: tabLoading });
const InfoPagesTab = dynamic(() => import("./settings-tabs").then((m) => m.InfoPagesTab), { loading: tabLoading });
const DraftsTab = dynamic(() => import("./ops-tabs").then((m) => m.DraftsTab), { loading: tabLoading });
const CustomersTab = dynamic(() => import("./ops-tabs").then((m) => m.CustomersTab), { loading: tabLoading });
const DiscountsTab = dynamic(() => import("./ops-tabs").then((m) => m.DiscountsTab), { loading: tabLoading });
const RedirectsTab = dynamic(() => import("./ops-tabs").then((m) => m.RedirectsTab), { loading: tabLoading });
const SettingsTab = dynamic(() => import("./content-tabs").then((m) => m.SettingsTab), { loading: tabLoading });
const HeroTab = dynamic(() => import("./content-tabs").then((m) => m.HeroTab), { loading: tabLoading });
const SectionsTab = dynamic(() => import("./content-tabs").then((m) => m.SectionsTab), { loading: tabLoading });
const ShowcaseTab = dynamic(() => import("./content-tabs").then((m) => m.ShowcaseTab), { loading: tabLoading });
const ReviewsTab = dynamic(() => import("./content-tabs").then((m) => m.ReviewsTab), { loading: tabLoading });
const FaqTab = dynamic(() => import("./content-tabs").then((m) => m.FaqTab), { loading: tabLoading });
const BlogTab = dynamic(() => import("./content-tabs").then((m) => m.BlogTab), { loading: tabLoading });
const PagesTab = dynamic(() => import("./content-tabs").then((m) => m.PagesTab), { loading: tabLoading });
const MenuTab = dynamic(() => import("./content-tabs").then((m) => m.MenuTab), { loading: tabLoading });

/* ------------------------------------------------------------------ */
/*  Vape Mart Admin — Shopify-style dashboard                          */
/*  Everything the storefront reads from Shopify, managed here:        */
/*  products (full CRUD + uploads), collections, orders, content,      */
/*  blog, pages, menu and shop settings. No Shopify login needed.      */
/* ------------------------------------------------------------------ */

async function api(body: any): Promise<any> {
  const res = await fetch("/api/admin-panel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/admin-panel/upload", { method: "POST", body: form });
  const j = await res.json();
  if (!j.ok) throw new Error(j.error || "Upload failed");
  return j.resourceUrl as string;
}

const inputCls =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600";
const labelCls = "block text-xs font-semibold text-neutral-600 mb-1";

function Lbl({ children }: { children: React.ReactNode }) {
  return <label className={labelCls}>{children}</label>;
}
function Inp(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputCls} />;
}
function TA(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={inputCls} />;
}
function PrimaryBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700 transition"
    >
      {children}
    </button>
  );
}
function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-neutral-900">{value}</p>
      {sub && <p className="text-xs text-neutral-500 mt-0.5">{sub}</p>}
    </div>
  );
}

const NAV = [
  { group: "Home", items: [{ key: "dashboard", label: "Dashboard", icon: LayoutDashboard }] },
  {
    group: "Catalog",
    items: [
      { key: "products", label: "Products", icon: Package },
      { key: "collections", label: "Collections", icon: FolderOpen },
      { key: "flavors", label: "Flavors", icon: Droplets },
      { key: "product-reviews", label: "Product Reviews", icon: MessageSquare },
    ],
  },
  {
    group: "Content",
    items: [
      { key: "settings", label: "Top Bar & Footer", icon: Megaphone },
      { key: "hero", label: "Hero Slides", icon: ImageIcon },
      { key: "sections", label: "Home Sections", icon: Layers },
      { key: "showcase", label: "TEREA / JUUL Cards", icon: Star },
      { key: "reviews", label: "Testimonials", icon: Star },
      { key: "faq", label: "FAQ", icon: HelpCircle },
      { key: "media", label: "Media Library", icon: ImageIcon },
    ],
  },
  {
    group: "Store",
    items: [
      { key: "blog", label: "Blog Posts", icon: PenLine },
      { key: "pages", label: "Pages", icon: FileText },
      { key: "menu", label: "Menu", icon: MenuIcon },
      { key: "orders", label: "Orders", icon: ShoppingBag },
      { key: "drafts", label: "Draft Orders", icon: ShoppingBag },
      { key: "customers", label: "Customers", icon: User },
      { key: "discounts", label: "Discounts", icon: Tag },
      { key: "redirects", label: "Redirects", icon: ArrowRight },
    ],
  },
  {
    group: "Site Settings",
    items: [
      { key: "theme", label: "Theme & Brand", icon: Palette },
      { key: "home", label: "Home Page", icon: LayoutGrid },
      { key: "cart", label: "Cart & Checkout", icon: ShoppingCart },
      { key: "product-page", label: "Product Page", icon: LayoutTemplate },
      { key: "collection-page", label: "Collection Page", icon: LayoutGrid },
      { key: "blog-settings", label: "Blog Settings", icon: PenLine },
      { key: "info-pages", label: "Info Pages", icon: FileText },
    ],
  },
];

export default function AdminPage() {
  const [phase, setPhase] = useState<"loading" | "setup" | "login" | "app">("loading");
  const [authError, setAuthError] = useState("");
  const [setupCode, setSetupCode] = useState("");
  const [password, setPassword] = useState("");
  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState<string>("dashboard");
  const [toast, setToast] = useState("");
  const [topSearch, setTopSearch] = useState("");

  const notify = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4200);
  }, []);

  const loadData = useCallback(async () => {
    const r = await api({ action: "data" });
    if (r.ok) setData(r.data);
    else notify(r.error || "Failed to load data");
  }, [notify]);

  useEffect(() => {
    fetch("/api/admin-panel")
      .then((r) => r.json())
      .then((s) => {
        if (s.setupNeeded) setPhase("setup");
        else if (s.authed) {
          setPhase("app");
          loadData();
        } else setPhase("login");
      })
      .catch(() => setPhase("login"));
  }, [loadData]);

  const doSetup = async () => {
    setAuthError("");
    const r = await api({ action: "setup", code: setupCode.trim(), password });
    if (r.ok) {
      setPhase("app");
      loadData();
    } else setAuthError(r.error || "Setup failed");
  };
  const doLogin = async () => {
    setAuthError("");
    const r = await api({ action: "login", password });
    if (r.ok) {
      setPhase("app");
      loadData();
    } else setAuthError(r.error || "Login failed");
  };
  const doLogout = async () => {
    await api({ action: "logout" });
    setData(null);
    setPhase("login");
  };

  const save = useCallback(
    async (saveAction: string, payload: any) => {
      const r = await api({ action: "save", saveAction, payload });
      if (r.ok) {
        notify(r.message || "Saved");
        loadData();
      } else notify("Error: " + (r.error || "save failed"));
      return r;
    },
    [notify, loadData]
  );

  const stats = useMemo(() => {
    const products = data?.products || [];
    return {
      total: products.length,
      active: products.filter((p: any) => p.status === "ACTIVE").length,
      draft: products.filter((p: any) => p.status === "DRAFT").length,
      low: products.filter((p: any) => (p.inventoryQuantity ?? 99) <= 10 && p.status === "ACTIVE").length,
      collections: (data?.collections || []).length,
      orders: (data?.orders || []).length,
    };
  }, [data]);

  if (phase === "loading") {
    return <div className="flex min-h-screen items-center justify-center text-neutral-500">Loading panel…</div>;
  }

  if (phase === "setup" || phase === "login") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 bg-[#f6f6f7]">
        <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-neutral-900 mb-1">Vape Mart Admin</h1>
          <p className="text-sm text-neutral-500 mb-5">
            {phase === "setup"
              ? "First time setup: enter the setup code and choose a panel password."
              : "Enter your panel password to manage the whole store from here."}
          </p>
          {phase === "setup" && (
            <div className="mb-3">
              <Lbl>Setup code</Lbl>
              <Inp value={setupCode} onChange={(e) => setSetupCode(e.target.value)} placeholder="Setup code" />
            </div>
          )}
          <div className="mb-4">
            <Lbl>{phase === "setup" ? "New panel password (min 8 characters)" : "Password"}</Lbl>
            <Inp
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={(e) => e.key === "Enter" && (phase === "setup" ? doSetup() : doLogin())}
            />
          </div>
          {authError && <p className="text-sm text-red-600 mb-3">{authError}</p>}
          <button
            onClick={phase === "setup" ? doSetup : doLogin}
            className="w-full rounded-md bg-neutral-900 py-2.5 font-semibold text-white hover:bg-neutral-700 transition"
          >
            {phase === "setup" ? "Set password & enter" : "Log in"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-neutral-200 bg-white">
        <div className="px-4 py-4 border-b border-neutral-200">
          <p className="text-base font-bold text-neutral-900">Vape Mart</p>
          <p className="text-xs text-neutral-500">Admin dashboard</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          {NAV.map((g) => (
            <div key={g.group} className="mb-4">
              <p className="px-2 mb-1 text-[11px] font-bold uppercase tracking-wider text-neutral-400">{g.group}</p>
              {g.items.map((it) => {
                const Icon = it.icon;
                const active = tab === it.key;
                return (
                  <button
                    key={it.key}
                    onClick={() => setTab(it.key)}
                    className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition ${
                      active ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    <Icon size={16} /> {it.label}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-neutral-200">
          <button
            onClick={doLogout}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-neutral-200 bg-white px-4 py-3">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              className={`${inputCls} pl-9`}
              placeholder="Search products… (Enter = Products tab)"
              value={topSearch}
              onChange={(e) => setTopSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setTab("products")}
            />
          </div>
          <a
            href="https://vapmart.webestone.net"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-neutral-700 hover:text-neutral-900"
          >
            View store <ExternalLink size={14} />
          </a>
          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
          >
            <RefreshCw size={14} /> Reload
          </button>
        </header>

        {/* Mobile nav */}
        <div className="md:hidden flex gap-2 overflow-x-auto p-3 bg-white border-b border-neutral-200">
          {NAV.flatMap((g) => g.items).map((it) => (
            <button
              key={it.key}
              onClick={() => setTab(it.key)}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium ${
                tab === it.key ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-700"
              }`}
            >
              {it.label}
            </button>
          ))}
        </div>

        <main className="p-4 sm:p-6 max-w-6xl mx-auto">
          {!data ? (
            <p className="text-neutral-500">Loading content…</p>
          ) : (
            <>
              {tab === "dashboard" && <DashboardTab data={data} stats={stats} go={setTab} />}
              {tab === "products" && (
                <ProductsManager data={data} notify={notify} reload={loadData} initialQuery={topSearch} />
              )}
              {tab === "collections" && <CollectionsManager data={data} notify={notify} reload={loadData} />}
              {tab === "flavors" && <FlavorsTab data={data} save={save} />}
              {tab === "product-reviews" && <ProductReviewsTab data={data} save={save} />}
              {tab === "media" && <MediaTab data={data} notify={notify} reload={loadData} />}
              {tab === "theme" && <ThemeTab data={data} save={save} />}
              {tab === "home" && <HomeTab data={data} save={save} />}
              {tab === "blog-settings" && <BlogSettingsTab data={data} save={save} />}
              {tab === "info-pages" && <InfoPagesTab data={data} save={save} />}
              {tab === "drafts" && <DraftsTab data={data} />}
              {tab === "customers" && <CustomersTab data={data} />}
              {tab === "discounts" && <DiscountsTab data={data} />}
              {tab === "redirects" && <RedirectsTab data={data} save={save} />}
              {tab === "cart" && <CartTab data={data} save={save} />}
              {tab === "product-page" && <ProductPageTab data={data} save={save} />}
              {tab === "collection-page" && <CollectionPageTab data={data} save={save} />}
              {tab === "orders" && <OrdersTab data={data} />}
              {tab === "settings" && <SettingsTab data={data} save={save} />}
              {tab === "hero" && <HeroTab data={data} save={save} />}
              {tab === "sections" && <SectionsTab data={data} save={save} />}
              {tab === "showcase" && <ShowcaseTab data={data} save={save} />}
              {tab === "reviews" && <ReviewsTab data={data} save={save} />}
              {tab === "faq" && <FaqTab data={data} save={save} />}
              {tab === "blog" && <BlogTab data={data} save={save} />}
              {tab === "pages" && <PagesTab data={data} save={save} />}
              {tab === "menu" && <MenuTab data={data} save={save} />}
            </>
          )}
        </main>
      </div>

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white shadow-xl max-w-[92vw] text-center">
          {toast}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard home                                                     */
/* ------------------------------------------------------------------ */

function DashboardTab({ data, stats, go }: any) {
  const low = (data.products || [])
    .filter((p: any) => (p.inventoryQuantity ?? 99) <= 10 && p.status === "ACTIVE")
    .slice(0, 8);
  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-900 mb-4">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        <StatCard label="Total products" value={String(stats.total)} sub={`${stats.active} active · ${stats.draft} draft`} />
        <StatCard label="Low stock (≤10)" value={String(stats.low)} sub="Active products running low" />
        <StatCard label="Collections" value={String(stats.collections)} />
        <StatCard label="Recent orders" value={String(stats.orders)} sub="Latest 20 from Shopify" />
        <StatCard label="Blog posts" value={String((data.blogPosts || []).length)} />
        <StatCard label="Hero slides" value={String((data.heroSlides || []).length)} />
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        <PrimaryBtn onClick={() => go("products")}>
          <Plus size={15} /> Add product
        </PrimaryBtn>
        <button
          onClick={() => go("blog")}
          className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
        >
          Write blog post
        </button>
        <button
          onClick={() => go("hero")}
          className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
        >
          Edit hero slides
        </button>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h2 className="font-bold text-neutral-900 mb-3">Low stock</h2>
          {low.length === 0 ? (
            <p className="text-sm text-neutral-500">No low-stock active products.</p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {low.map((p: any) => (
                <li key={p.id} className="flex justify-between py-2 text-sm">
                  <span className="text-neutral-800 truncate pr-3">{p.title}</span>
                  <span className="font-semibold text-red-600 shrink-0">{p.inventoryQuantity} left</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h2 className="font-bold text-neutral-900 mb-3">Recent orders</h2>
          {(data.orders || []).length === 0 ? (
            <p className="text-sm text-neutral-500">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {(data.orders || []).slice(0, 8).map((o: any) => (
                <li key={o.id} className="flex justify-between py-2 text-sm">
                  <span className="text-neutral-800">
                    {o.name} · {o.customer}
                  </span>
                  <span className="font-semibold text-neutral-900 shrink-0">
                    {o.currency} {o.total}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <p className="text-xs text-neutral-500 mt-4">
        Save korle site-e 5–10 minute-er moddhe update hoy (cache). Panel theke shob save Shopify-tei jay.
      </p>
    </div>
  );
}

