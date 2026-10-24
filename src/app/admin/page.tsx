"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard, Package, FolderOpen, ShoppingBag, FileText, Menu as MenuIcon,
  Search, Plus, Trash2, Save, X, Upload, ExternalLink, LogOut, RefreshCw, Megaphone,
  Image as ImageIcon, Layers, Star, HelpCircle, PenLine,
} from "lucide-react";
import {
  SettingsTab, HeroTab, SectionsTab, ShowcaseTab, ReviewsTab, FaqTab, BlogTab, PagesTab, MenuTab,
} from "./content-tabs";

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
    ],
  },
  {
    group: "Content",
    items: [
      { key: "settings", label: "Top Bar & Footer", icon: Megaphone },
      { key: "hero", label: "Hero Slides", icon: ImageIcon },
      { key: "sections", label: "Home Sections", icon: Layers },
      { key: "showcase", label: "TEREA / JUUL Cards", icon: Star },
      { key: "reviews", label: "Reviews", icon: Star },
      { key: "faq", label: "FAQ", icon: HelpCircle },
    ],
  },
  {
    group: "Store",
    items: [
      { key: "blog", label: "Blog Posts", icon: PenLine },
      { key: "pages", label: "Pages", icon: FileText },
      { key: "menu", label: "Menu", icon: MenuIcon },
      { key: "orders", label: "Orders", icon: ShoppingBag },
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
              {tab === "collections" && <CollectionsTab data={data} notify={notify} reload={loadData} />}
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

/* ------------------------------------------------------------------ */
/*  Products: list + full create/edit form                             */
/* ------------------------------------------------------------------ */

const VAPE_FIELDS: { key: string; label: string; type?: string }[] = [
  { key: "badge", label: "Badge (BEST SELLER / NEW)" },
  { key: "subtitle", label: "Subtitle" },
  { key: "puff_count", label: "Puff count", type: "number" },
  { key: "nicotine_strength", label: "Nicotine strength (20mg)" },
  { key: "battery", label: "Battery" },
  { key: "coil", label: "Coil" },
  { key: "charging", label: "Charging" },
  { key: "e_liquid", label: "E-liquid" },
  { key: "sweetness", label: "Sweetness (1–5)", type: "number" },
  { key: "cooling", label: "Cooling (1–5)", type: "number" },
  { key: "throat_hit", label: "Throat hit (1–5)", type: "number" },
  { key: "top_note", label: "Top note" },
  { key: "heart_note", label: "Heart note" },
  { key: "base_note", label: "Base note" },
  { key: "rating", label: "Rating (4.8)" },
  { key: "review_count", label: "Review count", type: "number" },
];

function parseJsonList(v: any): string[] {
  if (!v) return [];
  try {
    const x = JSON.parse(v);
    return Array.isArray(x) ? x.map(String) : [];
  } catch {
    return String(v).split(",").map((s) => s.trim()).filter(Boolean);
  }
}

function ProductsManager({ data, notify, reload, initialQuery }: any) {
  const [view, setView] = useState<any>({ name: "list" });
  const [q, setQ] = useState(initialQuery || "");
  const [status, setStatus] = useState("ALL");
  const shown = (data.products || [])
    .filter((p: any) => (status === "ALL" || p.status === status) && (!q || p.title.toLowerCase().includes(q.toLowerCase())))
    .slice(0, 100);

  if (view.name === "edit" || view.name === "new") {
    return (
      <ProductEditor
        key={view.id || "new"}
        productId={view.id}
        data={data}
        notify={notify}
        reload={reload}
        back={() => setView({ name: "list" })}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="text-xl font-bold text-neutral-900">Products</h1>
        <PrimaryBtn onClick={() => setView({ name: "new" })}>
          <Plus size={15} /> Add product
        </PrimaryBtn>
      </div>
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input className={`${inputCls} pl-9`} placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="ALL">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="DRAFT">Draft</option>
        </select>
      </div>
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
              <th className="px-3 py-2.5 font-semibold">Product</th>
              <th className="px-3 py-2.5 font-semibold hidden sm:table-cell">Status</th>
              <th className="px-3 py-2.5 font-semibold hidden sm:table-cell">Inventory</th>
              <th className="px-3 py-2.5 font-semibold">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {shown.map((p: any) => (
              <tr key={p.id} className="hover:bg-neutral-50 cursor-pointer" onClick={() => setView({ name: "edit", id: p.id })}>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt="" className="h-10 w-10 rounded-md object-cover border border-neutral-200" />
                    ) : (
                      <div className="h-10 w-10 rounded-md bg-neutral-100 border border-neutral-200" />
                    )}
                    <span className="font-medium text-neutral-900">{p.title}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 hidden sm:table-cell">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      p.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-neutral-200 text-neutral-700"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-3 py-2.5 hidden sm:table-cell text-neutral-700">{p.inventoryQuantity}</td>
                <td className="px-3 py-2.5 font-medium text-neutral-900">AED {p.price}</td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-neutral-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-neutral-500 mt-3">First 100 matching products shown.</p>
    </div>
  );
}

function ProductEditor({ productId, data, notify, reload, back }: any) {
  const isNew = !productId;
  const [loading, setLoading] = useState(!isNew);
  const [form, setForm] = useState<any>({
    title: "", handle: "", descriptionHtml: "", vendor: "", productType: "", tags: "", status: "DRAFT",
    price: "", compareAtPrice: "", sku: "", barcode: "", inventoryQuantity: "",
    optionName: "", optionValues: "",
  });
  const [variants, setVariants] = useState<any[]>([]);
  const [newVariants, setNewVariants] = useState<any[]>([]);
  const [deleteVariantIds, setDeleteVariantIds] = useState<string[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [newMedia, setNewMedia] = useState<any[]>([]);
  const [deleteMediaIds, setDeleteMediaIds] = useState<string[]>([]);
  const [collectionIds, setCollectionIds] = useState<string[]>([]);
  const [vape, setVape] = useState<any>({});
  const [nicOpts, setNicOpts] = useState("");
  const [flavours, setFlavours] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    api({ action: "productDetail", id: productId }).then((r) => {
      if (!r.ok) {
        notify("Error: " + (r.error || "could not load product"));
        back();
        return;
      }
      const d = r.detail;
      setForm({
        title: d.title, handle: d.handle, descriptionHtml: d.descriptionHtml, vendor: d.vendor,
        productType: d.productType, tags: d.tags, status: d.status,
        price: "", compareAtPrice: "", sku: "", barcode: "", inventoryQuantity: "",
        optionName: d.options?.[0]?.name || "", optionValues: (d.options?.[0]?.values || []).join(", "),
      });
      setVariants(d.variants);
      setMedia(d.media);
      setCollectionIds(d.collections);
      setVape(d.vape || {});
      setNicOpts(parseJsonList(d.vape?.nicotine_options).join(", "));
      setFlavours(parseJsonList(d.vape?.flavours));
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const set = (k: string, v: any) => setForm({ ...form, [k]: v });

  const onUpload = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setUploading(true);
    try {
      for (const f of Array.from(files)) {
        const resourceUrl = await uploadFile(f);
        setNewMedia((prev) => [...prev, { preview: URL.createObjectURL(f), source: resourceUrl }]);
      }
      notify("Image uploaded — save the product to attach it.");
    } catch (e: any) {
      notify("Upload error: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  const doSave = async () => {
    if (!form.title.trim()) {
      notify("Title is required.");
      return;
    }
    setSaving(true);
    const vapePayload: any = { ...vape };
    vapePayload.nicotine_options = nicOpts.split(",").map((s) => s.trim()).filter(Boolean);
    vapePayload.flavours = flavours;
    const base = {
      title: form.title, handle: form.handle || undefined, descriptionHtml: form.descriptionHtml,
      vendor: form.vendor, productType: form.productType, tags: form.tags, status: form.status,
      collectionIds, vape: vapePayload, locationId: data.locationId,
      mediaSources: [...newMedia.map((m) => m.source), ...(imgUrl.trim() ? [imgUrl.trim()] : [])],
    };
    let r: any;
    if (isNew) {
      const optionName = form.optionName.trim();
      const values = form.optionValues.split(",").map((s: string) => s.trim()).filter(Boolean);
      r = await api({
        action: "product.create",
        payload: {
          ...base,
          price: form.price, compareAtPrice: form.compareAtPrice, sku: form.sku, barcode: form.barcode,
          inventoryQuantity: form.inventoryQuantity,
          options: optionName && values.length ? [{ name: optionName, values }] : [],
          optionValues: optionName && values.length ? [values[0]] : undefined,
        },
      });
    } else {
      r = await api({
        action: "product.update",
        payload: {
          ...base, id: productId,
          variantUpdates: variants.map((v: any) => ({
            id: v.id, price: v.price, compareAtPrice: v.compareAtPrice, sku: v.sku, barcode: v.barcode,
          })),
          inventoryUpdates: variants.map((v: any) => ({ inventoryItemId: v.inventoryItemId, quantity: v.inventoryQuantity })),
          newVariants, deleteVariantIds, deleteMediaIds,
        },
      });
    }
    setSaving(false);
    if (r.ok) {
      notify(r.message || "Saved");
      reload();
      back();
    } else notify("Error: " + (r.error || "save failed"));
  };

  const doDelete = async () => {
    if (!window.confirm(`Delete "${form.title}" permanently? This cannot be undone.`)) return;
    const r = await api({ action: "product.delete", id: productId });
    if (r.ok) {
      notify(r.message);
      reload();
      back();
    } else notify("Error: " + (r.error || "delete failed"));
  };

  if (loading) return <p className="text-neutral-500">Loading product…</p>;

  return (
    <div>
      <button onClick={back} className="text-sm font-medium text-neutral-600 hover:text-neutral-900 mb-3">
        ← Back to products
      </button>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="text-xl font-bold text-neutral-900">{isNew ? "Add product" : form.title}</h1>
        <div className="flex gap-2">
          {!isNew && (
            <button
              onClick={doDelete}
              className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              <Trash2 size={15} /> Delete
            </button>
          )}
          <PrimaryBtn onClick={doSave}>
            <Save size={15} /> {saving ? "Saving…" : "Save product"}
          </PrimaryBtn>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <h2 className="font-bold text-neutral-900 mb-3">Basic info</h2>
            <div className="space-y-3">
              <div>
                <Lbl>Title *</Lbl>
                <Inp value={form.title} onChange={(e) => set("title", e.target.value)} />
              </div>
              <div>
                <Lbl>Description (HTML allowed)</Lbl>
                <TA rows={6} value={form.descriptionHtml} onChange={(e) => set("descriptionHtml", e.target.value)} />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Lbl>Vendor / Brand</Lbl>
                  <Inp value={form.vendor} onChange={(e) => set("vendor", e.target.value)} />
                </div>
                <div>
                  <Lbl>Product type</Lbl>
                  <Inp value={form.productType} onChange={(e) => set("productType", e.target.value)} />
                </div>
                <div>
                  <Lbl>Tags (comma separated)</Lbl>
                  <Inp value={form.tags} onChange={(e) => set("tags", e.target.value)} />
                </div>
                <div>
                  <Lbl>Status</Lbl>
                  <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
                    <option value="ACTIVE">Active</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <h2 className="font-bold text-neutral-900 mb-3">Media — images upload</h2>
            <div className="flex flex-wrap gap-3 mb-3">
              {media
                .filter((m: any) => !deleteMediaIds.includes(m.id))
                .map((m: any) => (
                  <div key={m.id} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.url} alt="" className="h-24 w-24 rounded-lg object-cover border border-neutral-200" />
                    <button
                      onClick={() => setDeleteMediaIds([...deleteMediaIds, m.id])}
                      className="absolute -top-2 -right-2 rounded-full bg-red-600 p-1 text-white shadow"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              {newMedia.map((m: any, i: number) => (
                <div key={i} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.preview} alt="" className="h-24 w-24 rounded-lg object-cover border border-emerald-300" />
                  <button
                    onClick={() => setNewMedia(newMedia.filter((_: any, j: number) => j !== i))}
                    className="absolute -top-2 -right-2 rounded-full bg-red-600 p-1 text-white shadow"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            <label className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 cursor-pointer">
              <Upload size={15} /> {uploading ? "Uploading…" : "Upload images"}
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onUpload(e.target.files)} />
            </label>
            <div className="flex gap-2 mt-3">
              <Inp placeholder="Or paste an image URL…" value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} />
              <button
                onClick={() => {
                  if (imgUrl.trim()) {
                    setNewMedia([...newMedia, { preview: imgUrl.trim(), source: imgUrl.trim() }]);
                    setImgUrl("");
                  }
                }}
                className="shrink-0 rounded-md border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
              >
                Add URL
              </button>
            </div>
          </div>

          {isNew ? (
            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <h2 className="font-bold text-neutral-900 mb-3">Pricing & inventory (first variant)</h2>
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <Lbl>Price (AED)</Lbl>
                  <Inp value={form.price} onChange={(e) => set("price", e.target.value)} />
                </div>
                <div>
                  <Lbl>Compare at price</Lbl>
                  <Inp value={form.compareAtPrice} onChange={(e) => set("compareAtPrice", e.target.value)} />
                </div>
                <div>
                  <Lbl>Stock quantity</Lbl>
                  <Inp type="number" value={form.inventoryQuantity} onChange={(e) => set("inventoryQuantity", e.target.value)} />
                </div>
                <div>
                  <Lbl>SKU</Lbl>
                  <Inp value={form.sku} onChange={(e) => set("sku", e.target.value)} />
                </div>
                <div>
                  <Lbl>Barcode</Lbl>
                  <Inp value={form.barcode} onChange={(e) => set("barcode", e.target.value)} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mt-3">
                <div>
                  <Lbl>Variant option name (optional, e.g. Flavor)</Lbl>
                  <Inp value={form.optionName} onChange={(e) => set("optionName", e.target.value)} placeholder="Flavor" />
                </div>
                <div>
                  <Lbl>Option values (comma separated)</Lbl>
                  <Inp value={form.optionValues} onChange={(e) => set("optionValues", e.target.value)} placeholder="Mango Ice, Mint" />
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <h2 className="font-bold text-neutral-900 mb-3">Variants</h2>
              {variants.map((v: any, i: number) => (
                <div key={v.id} className="grid grid-cols-2 sm:grid-cols-6 gap-2 mb-2 items-end">
                  <div className="col-span-2">
                    <Lbl>{v.title}</Lbl>
                    <Inp value={v.price} onChange={(e) => setVariants(variants.map((x: any, j: number) => (j === i ? { ...x, price: e.target.value } : x)))} />
                  </div>
                  <div>
                    <Lbl>Compare</Lbl>
                    <Inp value={v.compareAtPrice} onChange={(e) => setVariants(variants.map((x: any, j: number) => (j === i ? { ...x, compareAtPrice: e.target.value } : x)))} />
                  </div>
                  <div>
                    <Lbl>SKU</Lbl>
                    <Inp value={v.sku} onChange={(e) => setVariants(variants.map((x: any, j: number) => (j === i ? { ...x, sku: e.target.value } : x)))} />
                  </div>
                  <div>
                    <Lbl>Stock</Lbl>
                    <Inp type="number" value={v.inventoryQuantity} onChange={(e) => setVariants(variants.map((x: any, j: number) => (j === i ? { ...x, inventoryQuantity: e.target.value } : x)))} />
                  </div>
                  <button
                    onClick={() => {
                      setDeleteVariantIds([...deleteVariantIds, v.id]);
                      setVariants(variants.filter((_: any, j: number) => j !== i));
                    }}
                    className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-700 hover:bg-red-100"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setNewVariants([...newVariants, { price: "", sku: "", inventoryQuantity: "" }])}
                className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 mt-1"
              >
                <Plus size={14} /> Add variant
              </button>
              {newVariants.map((v: any, i: number) => (
                <div key={i} className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                  <Inp placeholder="Price" value={v.price} onChange={(e) => setNewVariants(newVariants.map((x: any, j: number) => (j === i ? { ...x, price: e.target.value } : x)))} />
                  <Inp placeholder="SKU" value={v.sku} onChange={(e) => setNewVariants(newVariants.map((x: any, j: number) => (j === i ? { ...x, sku: e.target.value } : x)))} />
                  <Inp placeholder="Stock" type="number" value={v.inventoryQuantity} onChange={(e) => setNewVariants(newVariants.map((x: any, j: number) => (j === i ? { ...x, inventoryQuantity: e.target.value } : x)))} />
                  <button
                    onClick={() => setNewVariants(newVariants.filter((_: any, j: number) => j !== i))}
                    className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-700 hover:bg-red-100"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              <p className="text-xs text-neutral-500 mt-2">
                Option structure (e.g. Flavor values) Shopify thekei ashe — notun option structure add korte hole
                product-ta Shopify-te ekbar khule option set koro, tarpor ekhane variant edit korte parba.
              </p>
            </div>
          )}

          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <h2 className="font-bold text-neutral-900 mb-3">Vape specs (product page-er spec table)</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {VAPE_FIELDS.map((f) => (
                <div key={f.key}>
                  <Lbl>{f.label}</Lbl>
                  <Inp
                    type={f.type === "number" ? "number" : "text"}
                    value={vape[f.key] ?? ""}
                    onChange={(e) => setVape({ ...vape, [f.key]: e.target.value })}
                  />
                </div>
              ))}
              <div className="sm:col-span-2">
                <Lbl>Nicotine options (comma separated)</Lbl>
                <Inp value={nicOpts} onChange={(e) => setNicOpts(e.target.value)} placeholder="18mg, 20mg, 50mg" />
              </div>
            </div>
            <div className="mt-3">
              <Lbl>Flavours (tap to select)</Lbl>
              <div className="flex flex-wrap gap-2">
                {(data.flavors || []).map((fl: any) => {
                  const on = flavours.includes(fl.id);
                  return (
                    <button
                      key={fl.id}
                      onClick={() => setFlavours(on ? flavours.filter((x) => x !== fl.id) : [...flavours, fl.id])}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold border ${
                        on ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-700 border-neutral-300"
                      }`}
                    >
                      {fl.name}
                    </button>
                  );
                })}
                {!(data.flavors || []).length && <span className="text-xs text-neutral-500">No flavours defined yet.</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <h2 className="font-bold text-neutral-900 mb-3">Collections</h2>
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {(data.collections || []).map((c: any) => (
                <label key={c.id} className="flex items-center gap-2 text-sm text-neutral-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={collectionIds.includes(c.id)}
                    onChange={(e) =>
                      setCollectionIds(e.target.checked ? [...collectionIds, c.id] : collectionIds.filter((x) => x !== c.id))
                    }
                    className="accent-neutral-900"
                  />
                  {c.title} <span className="text-neutral-400 text-xs">({c.productCount})</span>
                </label>
              ))}
            </div>
          </div>
          {!isNew && (
            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <h2 className="font-bold text-neutral-900 mb-2">Handle</h2>
              <Inp value={form.handle} onChange={(e) => set("handle", e.target.value)} />
              <p className="text-xs text-neutral-500 mt-1">URL: /products/{form.handle || "…"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Collections & Orders                                               */
/* ------------------------------------------------------------------ */

function CollectionsTab({ data, notify, reload }: any) {
  const [title, setTitle] = useState("");
  const add = async () => {
    if (!title.trim()) return;
    const r = await api({ action: "collection.create", title: title.trim() });
    if (r.ok) {
      notify(r.message);
      setTitle("");
      reload();
    } else notify("Error: " + (r.error || "failed"));
  };
  const del = async (c: any) => {
    if (!window.confirm(`Delete collection "${c.title}"? Products stay, only the collection is removed.`)) return;
    const r = await api({ action: "collection.delete", id: c.id });
    if (r.ok) {
      notify(r.message);
      reload();
    } else notify("Error: " + (r.error || "failed"));
  };
  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-900 mb-4">Collections</h1>
      <div className="flex gap-2 mb-4 max-w-md">
        <Inp placeholder="New collection name…" value={title} onChange={(e) => setTitle(e.target.value)} />
        <PrimaryBtn onClick={add}>
          <Plus size={15} /> Create
        </PrimaryBtn>
      </div>
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
              <th className="px-3 py-2.5 font-semibold">Collection</th>
              <th className="px-3 py-2.5 font-semibold">Products</th>
              <th className="px-3 py-2.5 font-semibold"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {(data.collections || []).map((c: any) => (
              <tr key={c.id} className="hover:bg-neutral-50">
                <td className="px-3 py-2.5">
                  <span className="font-medium text-neutral-900">{c.title}</span>
                  <span className="text-neutral-400 text-xs"> /{c.handle}</span>
                </td>
                <td className="px-3 py-2.5 text-neutral-700">{c.productCount}</td>
                <td className="px-3 py-2.5 text-right">
                  <button onClick={() => del(c)} className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-neutral-500 mt-3">Collection-e product add/remove korte product editor-er Collections box use koro.</p>
    </div>
  );
}

function OrdersTab({ data }: any) {
  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-900 mb-4">Orders (view only)</h1>
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
              <th className="px-3 py-2.5 font-semibold">Order</th>
              <th className="px-3 py-2.5 font-semibold">Customer</th>
              <th className="px-3 py-2.5 font-semibold">Fulfillment</th>
              <th className="px-3 py-2.5 font-semibold">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {(data.orders || []).map((o: any) => (
              <tr key={o.id} className="hover:bg-neutral-50">
                <td className="px-3 py-2.5 font-medium text-neutral-900">{o.name}</td>
                <td className="px-3 py-2.5 text-neutral-700">{o.customer}</td>
                <td className="px-3 py-2.5 text-neutral-700">{o.fulfillment || "—"}</td>
                <td className="px-3 py-2.5 font-medium text-neutral-900">
                  {o.currency} {o.total}
                </td>
              </tr>
            ))}
            {!(data.orders || []).length && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-neutral-500">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-neutral-500 mt-3">Order fulfill/refund Shopify app theke korte hobe — panel-e shudhu dekha jay.</p>
    </div>
  );
}
