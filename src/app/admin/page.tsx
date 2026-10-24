"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Save, Plus, Trash2, LogOut, RefreshCw, Search } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Vape Mart Admin Panel                                              */
/*  Manages everything the storefront reads from Shopify — top bar,    */
/*  hero, sections, showcase cards, reviews, FAQ, blog, pages, menu    */
/*  and basic product price/stock — without opening Shopify admin.     */
/* ------------------------------------------------------------------ */

async function api(body: any): Promise<any> {
  const res = await fetch("/api/admin-panel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

const inputCls =
  "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-emerald-400/60";
const labelCls = "block text-[11px] font-semibold uppercase tracking-wider text-emerald-300/80 mb-1";

function Lbl({ children }: { children: React.ReactNode }) {
  return <label className={labelCls}>{children}</label>;
}
function Inp(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputCls} />;
}
function TA(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={inputCls} />;
}
function SaveBtn({ onClick, children }: { onClick: () => void; children?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-2 text-sm font-semibold text-white hover:bg-emerald-400 transition"
    >
      <Save size={15} /> {children || "Save"}
    </button>
  );
}
function DelBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/15 border border-red-400/30 px-3 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/25 transition"
    >
      <Trash2 size={15} /> Delete
    </button>
  );
}
function Card({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 mb-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-white">{title}</h3>
        {right}
      </div>
      {children}
    </div>
  );
}

const TABS = [
  { key: "settings", label: "Top Bar & Footer" },
  { key: "hero", label: "Hero Slides" },
  { key: "sections", label: "Home Sections" },
  { key: "showcase", label: "TEREA / JUUL Cards" },
  { key: "reviews", label: "Reviews" },
  { key: "faq", label: "FAQ" },
  { key: "blog", label: "Blog Posts" },
  { key: "pages", label: "Pages" },
  { key: "menu", label: "Menu" },
  { key: "products", label: "Products" },
] as const;

export default function AdminPage() {
  const [phase, setPhase] = useState<"loading" | "setup" | "login" | "app">("loading");
  const [authError, setAuthError] = useState("");
  const [setupCode, setSetupCode] = useState("");
  const [password, setPassword] = useState("");
  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState<string>("settings");
  const [toast, setToast] = useState("");

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
    return <div className="flex min-h-screen items-center justify-center text-neutral-400">Loading panel…</div>;
  }

  if (phase === "setup" || phase === "login") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h1 className="text-xl font-bold text-white mb-1">Vape Mart Admin</h1>
          <p className="text-sm text-neutral-400 mb-5">
            {phase === "setup"
              ? "First time setup: enter the setup code you received and choose a panel password."
              : "Enter your panel password to manage the whole site from here."}
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
          {authError && <p className="text-sm text-red-300 mb-3">{authError}</p>}
          <button
            onClick={phase === "setup" ? doSetup : doLogin}
            className="w-full rounded-lg bg-emerald-500 py-2.5 font-semibold text-white hover:bg-emerald-400 transition"
          >
            {phase === "setup" ? "Set password & enter" : "Log in"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-5 py-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Vape Mart Admin Panel</h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Sob content ekhan thekei manage hobe. Save korle site-e 5–10 minute-er moddhe update hoy.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-sm text-neutral-200 hover:bg-white/5"
          >
            <RefreshCw size={15} /> Reload
          </button>
          <button
            onClick={doLogout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-sm text-neutral-200 hover:bg-white/5"
          >
            <LogOut size={15} /> Log out
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === t.key ? "bg-emerald-500 text-white" : "bg-white/5 text-neutral-300 hover:bg-white/10"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!data ? (
        <p className="text-neutral-400">Loading content…</p>
      ) : (
        <>
          {tab === "settings" && <SettingsTab data={data} save={save} />}
          {tab === "hero" && <HeroTab data={data} save={save} />}
          {tab === "sections" && <SectionsTab data={data} save={save} />}
          {tab === "showcase" && <ShowcaseTab data={data} save={save} />}
          {tab === "reviews" && <ReviewsTab data={data} save={save} />}
          {tab === "faq" && <FaqTab data={data} save={save} />}
          {tab === "blog" && <BlogTab data={data} save={save} />}
          {tab === "pages" && <PagesTab data={data} save={save} />}
          {tab === "menu" && <MenuTab data={data} save={save} />}
          {tab === "products" && <ProductsTab data={data} save={save} />}
        </>
      )}

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xl max-w-[92vw] text-center">
          {toast}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Settings: announcements, phone, footer                             */
/* ------------------------------------------------------------------ */

function SettingsTab({ data, save }: any) {
  const [ann, setAnn] = useState<string[]>(data.settings.announcements || []);
  const [phone, setPhone] = useState(data.settings.phone || "");
  const [footerText, setFooterText] = useState(data.settings.footerText || "");
  useEffect(() => {
    setAnn(data.settings.announcements || []);
    setPhone(data.settings.phone || "");
    setFooterText(data.settings.footerText || "");
  }, [data]);

  return (
    <Card title="Top bar, phone & footer">
      <Lbl>Announcements (top bar-e ghure)</Lbl>
      {ann.map((a, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <Inp value={a} onChange={(e) => setAnn(ann.map((x, j) => (j === i ? e.target.value : x)))} />
          <button
            onClick={() => setAnn(ann.filter((_, j) => j !== i))}
            className="shrink-0 rounded-lg border border-red-400/30 px-3 text-red-300 hover:bg-red-500/10"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}
      <button
        onClick={() => setAnn([...ann, ""])}
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-sm text-neutral-200 hover:bg-white/5 mb-4"
      >
        <Plus size={15} /> Add announcement
      </button>
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <Lbl>Phone number</Lbl>
          <Inp value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <Lbl>Footer text (copyright line)</Lbl>
          <Inp value={footerText} onChange={(e) => setFooterText(e.target.value)} />
        </div>
      </div>
      <SaveBtn onClick={() => save("settings", { announcements: ann, phone, footerText })} />
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero slides                                                        */
/* ------------------------------------------------------------------ */

function HeroTab({ data, save }: any) {
  const [slides, setSlides] = useState<any[]>(data.heroSlides || []);
  useEffect(() => setSlides(data.heroSlides || []), [data]);
  const upd = (i: number, k: string, v: any) =>
    setSlides(slides.map((s, j) => (j === i ? { ...s, [k]: v } : s)));

  return (
    <div>
      {slides.map((s, i) => (
        <Card
          key={s.id || i}
          title={`Slide ${i + 1}: ${s.title || "(untitled)"}`}
          right={<DelBtn onClick={() => s.id && save("hero.delete", { id: s.id })} />}
        >
          <div className="grid sm:grid-cols-2 gap-4 mb-3">
            <div className="sm:col-span-2">
              <Lbl>Title (\n dile line break hobe)</Lbl>
              <Inp value={s.title} onChange={(e) => upd(i, "title", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Lbl>Description</Lbl>
              <TA rows={2} value={s.description} onChange={(e) => upd(i, "description", e.target.value)} />
            </div>
            <div>
              <Lbl>Badge</Lbl>
              <Inp value={s.badge} onChange={(e) => upd(i, "badge", e.target.value)} />
            </div>
            <div>
              <Lbl>Position</Lbl>
              <Inp type="number" value={s.position} onChange={(e) => upd(i, "position", e.target.value)} />
            </div>
            <div>
              <Lbl>Button text</Lbl>
              <Inp value={s.buttonText} onChange={(e) => upd(i, "buttonText", e.target.value)} />
            </div>
            <div>
              <Lbl>Button link</Lbl>
              <Inp value={s.buttonLink} onChange={(e) => upd(i, "buttonLink", e.target.value)} />
            </div>
          </div>
          <div className="flex items-start gap-4 mb-4">
            {s.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.imageUrl} alt="" className="h-20 w-32 rounded-lg object-cover border border-white/10" />
            ) : (
              <div className="h-20 w-32 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-neutral-500">
                No image
              </div>
            )}
            <div className="flex-1">
              <Lbl>New image URL (paste korle save-er somoy upload hobe)</Lbl>
              <Inp
                placeholder="https://…"
                value={s.newImageUrl || ""}
                onChange={(e) => upd(i, "newImageUrl", e.target.value)}
              />
              <p className="text-xs text-neutral-500 mt-1">Khali rakhle purano chobi-i thakbe.</p>
            </div>
          </div>
          <SaveBtn
            onClick={() =>
              save("hero.save", {
                id: s.id || undefined,
                title: s.title,
                description: s.description,
                badge: s.badge,
                buttonText: s.buttonText,
                buttonLink: s.buttonLink,
                position: Number(s.position) || 0,
                imageUrl: s.newImageUrl || undefined,
              })
            }
          />
        </Card>
      ))}
      <button
        onClick={() =>
          setSlides([
            ...slides,
            { title: "", description: "", badge: "", buttonText: "Shop Now", buttonLink: "/collections", position: slides.length + 1 },
          ])
        }
        className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/15 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
      >
        <Plus size={15} /> Add slide
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Home sections + product picker                                     */
/* ------------------------------------------------------------------ */

function SectionsTab({ data, save }: any) {
  const [sections, setSections] = useState<any[]>(data.sections || []);
  const [query, setQuery] = useState<Record<string, string>>({});
  useEffect(() => setSections(data.sections || []), [data]);
  const upd = (i: number, k: string, v: any) =>
    setSections(sections.map((s, j) => (j === i ? { ...s, [k]: v } : s)));
  const byId = useMemo(() => {
    const m: Record<string, any> = {};
    for (const p of data.products || []) m[p.id] = p;
    return m;
  }, [data]);

  return (
    <div>
      <p className="text-sm text-neutral-400 mb-4">
        Prottek section-er title/subtitle/badge ar kon product dekhabe ekhan theke control hoy. TEREA ar JUUL
        section-e product dile shei asol product-i dekhabe; na dile nicher “TEREA / JUUL Cards” tab-er card gula
        dekhabe.
      </p>
      {sections.map((s, i) => {
        const q = (query[s.id] || "").toLowerCase();
        const results = q
          ? (data.products || []).filter((p: any) => p.title.toLowerCase().includes(q)).slice(0, 8)
          : [];
        return (
          <Card key={s.id} title={`Section: ${s.key}`}>
            <div className="grid sm:grid-cols-3 gap-4 mb-4">
              <div>
                <Lbl>Title</Lbl>
                <Inp value={s.title} onChange={(e) => upd(i, "title", e.target.value)} />
              </div>
              <div>
                <Lbl>Subtitle</Lbl>
                <Inp value={s.subtitle} onChange={(e) => upd(i, "subtitle", e.target.value)} />
              </div>
              <div>
                <Lbl>Badge text</Lbl>
                <Inp value={s.badgeText} onChange={(e) => upd(i, "badgeText", e.target.value)} />
              </div>
            </div>
            <Lbl>Products ({(s.productIds || []).length} selected)</Lbl>
            <div className="flex flex-wrap gap-2 mb-3">
              {(s.productIds || []).map((pid: string, idx: number) => (
                <span
                  key={pid}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-400/30 px-3 py-1.5 text-xs text-emerald-100"
                >
                  {byId[pid]?.title || pid}
                  <button
                    className="text-emerald-300 hover:text-white"
                    onClick={() => {
                      const arr = [...s.productIds];
                      if (idx > 0) [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
                      upd(i, "productIds", arr);
                    }}
                  >
                    ↑
                  </button>
                  <button
                    className="text-emerald-300 hover:text-white"
                    onClick={() => {
                      const arr = [...s.productIds];
                      if (idx < arr.length - 1) [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
                      upd(i, "productIds", arr);
                    }}
                  >
                    ↓
                  </button>
                  <button
                    className="text-red-300 hover:text-white"
                    onClick={() => upd(i, "productIds", s.productIds.filter((x: string) => x !== pid))}
                  >
                    ✕
                  </button>
                </span>
              ))}
              {!(s.productIds || []).length && (
                <span className="text-xs text-neutral-500">Kono product select kora nai</span>
              )}
            </div>
            <div className="relative mb-4 max-w-md">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                className={`${inputCls} pl-9`}
                placeholder="Product search kore add koro…"
                value={query[s.id] || ""}
                onChange={(e) => setQuery({ ...query, [s.id]: e.target.value })}
              />
              {results.length > 0 && (
                <div className="absolute z-20 mt-1 w-full rounded-lg border border-white/10 bg-[#0c1512] shadow-xl overflow-hidden">
                  {results.map((p: any) => (
                    <button
                      key={p.id}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-neutral-200 hover:bg-white/5"
                      onClick={() => {
                        if (!s.productIds.includes(p.id)) upd(i, "productIds", [...s.productIds, p.id]);
                        setQuery({ ...query, [s.id]: "" });
                      }}
                    >
                      {p.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image} alt="" className="h-8 w-8 rounded object-cover" />
                      )}
                      {p.title}
                      <span className="ml-auto text-xs text-neutral-500">AED {p.price}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <SaveBtn
              onClick={() =>
                save("section.save", {
                  id: s.id,
                  title: s.title,
                  subtitle: s.subtitle,
                  badgeText: s.badgeText,
                  productIds: s.productIds,
                })
              }
            />
          </Card>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Showcase cards (TEREA & JUUL carousels)                            */
/* ------------------------------------------------------------------ */

function ShowcaseTab({ data, save }: any) {
  const [cards, setCards] = useState<any[]>(data.showcase || []);
  const [filter, setFilter] = useState("tereaHeets");
  useEffect(() => setCards(data.showcase || []), [data]);
  const upd = (id: string, k: string, v: any) =>
    setCards(cards.map((c) => (c.id === id || c._tmp === id ? { ...c, [k]: v } : c)));
  const shown = cards.filter((c) => c.sectionKey === filter);

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {[
          { k: "tereaHeets", l: "TEREA & HEETS cards" },
          { k: "juulProducts", l: "JUUL cards" },
        ].map((t) => (
          <button
            key={t.k}
            onClick={() => setFilter(t.k)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              filter === t.k ? "bg-emerald-500 text-white" : "bg-white/5 text-neutral-300"
            }`}
          >
            {t.l}
          </button>
        ))}
      </div>
      {shown.map((c) => {
        const key = c.id || c._tmp;
        return (
          <Card
            key={key}
            title={c.title || "New card"}
            right={c.id ? <DelBtn onClick={() => save("showcase.delete", { id: c.id })} /> : undefined}
          >
            <div className="grid sm:grid-cols-3 gap-4 mb-3">
              <div className="sm:col-span-2">
                <Lbl>Title</Lbl>
                <Inp value={c.title} onChange={(e) => upd(key, "title", e.target.value)} />
              </div>
              <div>
                <Lbl>Position</Lbl>
                <Inp type="number" value={c.position} onChange={(e) => upd(key, "position", e.target.value)} />
              </div>
              <div>
                <Lbl>Price (AED)</Lbl>
                <Inp value={c.price} onChange={(e) => upd(key, "price", e.target.value)} />
              </div>
              <div>
                <Lbl>Reviews count</Lbl>
                <Inp type="number" value={c.revs} onChange={(e) => upd(key, "revs", e.target.value)} />
              </div>
              <div>
                <Lbl>Badge</Lbl>
                <Inp value={c.badge} onChange={(e) => upd(key, "badge", e.target.value)} />
              </div>
              <div>
                <Lbl>Brand label</Lbl>
                <Inp value={c.brand} onChange={(e) => upd(key, "brand", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Lbl>Image URL</Lbl>
                <Inp value={c.imageUrl} onChange={(e) => upd(key, "imageUrl", e.target.value)} />
              </div>
            </div>
            <SaveBtn
              onClick={() =>
                save("showcase.save", {
                  id: c.id || undefined,
                  sectionKey: c.sectionKey,
                  title: c.title,
                  price: c.price,
                  revs: Number(c.revs) || 0,
                  badge: c.badge,
                  brand: c.brand,
                  imageUrl: c.imageUrl,
                  position: Number(c.position) || 0,
                })
              }
            />
          </Card>
        );
      })}
      <button
        onClick={() =>
          setCards([
            ...cards,
            {
              _tmp: `new-${Date.now()}`,
              sectionKey: filter,
              title: "",
              price: "",
              revs: 0,
              badge: "",
              brand: "",
              imageUrl: "",
              position: shown.length + 1,
            },
          ])
        }
        className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/15 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
      >
        <Plus size={15} /> Add card
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reviews & FAQ                                                      */
/* ------------------------------------------------------------------ */

function ReviewsTab({ data, save }: any) {
  const [items, setItems] = useState<any[]>(data.testimonials || []);
  useEffect(() => setItems(data.testimonials || []), [data]);
  const upd = (i: number, k: string, v: any) => setItems(items.map((t, j) => (j === i ? { ...t, [k]: v } : t)));
  return (
    <div>
      {items.map((t, i) => (
        <Card
          key={t.id || i}
          title={t.name || "New review"}
          right={t.id ? <DelBtn onClick={() => save("testimonial.delete", { id: t.id })} /> : undefined}
        >
          <div className="grid sm:grid-cols-3 gap-4 mb-3">
            <div>
              <Lbl>Name</Lbl>
              <Inp value={t.name} onChange={(e) => upd(i, "name", e.target.value)} />
            </div>
            <div>
              <Lbl>Role</Lbl>
              <Inp value={t.role} onChange={(e) => upd(i, "role", e.target.value)} />
            </div>
            <div>
              <Lbl>Position</Lbl>
              <Inp type="number" value={t.position} onChange={(e) => upd(i, "position", e.target.value)} />
            </div>
            <div className="sm:col-span-3">
              <Lbl>Review title</Lbl>
              <Inp value={t.title} onChange={(e) => upd(i, "title", e.target.value)} />
            </div>
            <div className="sm:col-span-3">
              <Lbl>Review text</Lbl>
              <TA rows={3} value={t.review} onChange={(e) => upd(i, "review", e.target.value)} />
            </div>
          </div>
          <SaveBtn
            onClick={() =>
              save("testimonial.save", {
                id: t.id || undefined,
                name: t.name,
                role: t.role,
                title: t.title,
                review: t.review,
                position: Number(t.position) || 0,
              })
            }
          />
        </Card>
      ))}
      <button
        onClick={() => setItems([...items, { name: "", role: "Verified Buyer", title: "", review: "", position: items.length + 1 }])}
        className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/15 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
      >
        <Plus size={15} /> Add review
      </button>
    </div>
  );
}

function FaqTab({ data, save }: any) {
  const [items, setItems] = useState<any[]>(data.faqs || []);
  useEffect(() => setItems(data.faqs || []), [data]);
  const upd = (i: number, k: string, v: any) => setItems(items.map((t, j) => (j === i ? { ...t, [k]: v } : t)));
  return (
    <div>
      {items.map((t, i) => (
        <Card
          key={t.id || i}
          title={t.question || "New FAQ"}
          right={t.id ? <DelBtn onClick={() => save("faq.delete", { id: t.id })} /> : undefined}
        >
          <div className="grid sm:grid-cols-4 gap-4 mb-3">
            <div className="sm:col-span-3">
              <Lbl>Question</Lbl>
              <Inp value={t.question} onChange={(e) => upd(i, "question", e.target.value)} />
            </div>
            <div>
              <Lbl>Position</Lbl>
              <Inp type="number" value={t.position} onChange={(e) => upd(i, "position", e.target.value)} />
            </div>
            <div className="sm:col-span-4">
              <Lbl>Answer</Lbl>
              <TA rows={3} value={t.answer} onChange={(e) => upd(i, "answer", e.target.value)} />
            </div>
          </div>
          <SaveBtn
            onClick={() =>
              save("faq.save", {
                id: t.id || undefined,
                question: t.question,
                answer: t.answer,
                position: Number(t.position) || 0,
              })
            }
          />
        </Card>
      ))}
      <button
        onClick={() => setItems([...items, { question: "", answer: "", position: items.length + 1 }])}
        className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/15 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
      >
        <Plus size={15} /> Add FAQ
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Blog                                                               */
/* ------------------------------------------------------------------ */

function BlogTab({ data, save }: any) {
  const [sel, setSel] = useState<string>("new");
  const [form, setForm] = useState<any>({
    title: "", body: "", summary: "", tags: "", category: "", quickAnswer: "", productSlugs: "", imageUrl: "",
  });
  const loadPost = (id: string) => {
    setSel(id);
    if (id === "new") {
      setForm({ title: "", body: "", summary: "", tags: "", category: "", quickAnswer: "", productSlugs: "", imageUrl: "" });
    } else {
      const p = (data.blogPosts || []).find((x: any) => x.id === id);
      if (p) setForm({ ...p, imageUrl: "" });
    }
  };
  const set = (k: string, v: any) => setForm({ ...form, [k]: v });

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        <button
          onClick={() => loadPost("new")}
          className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${
            sel === "new" ? "bg-emerald-500 text-white" : "bg-white/5 text-neutral-300"
          }`}
        >
          + New post
        </button>
        {(data.blogPosts || []).map((p: any) => (
          <button
            key={p.id}
            onClick={() => loadPost(p.id)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${
              sel === p.id ? "bg-emerald-500 text-white" : "bg-white/5 text-neutral-300"
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>
      <Card title={sel === "new" ? "New blog post" : `Edit: ${form.title}`}>
        <div className="grid sm:grid-cols-2 gap-4 mb-3">
          <div className="sm:col-span-2">
            <Lbl>Title</Lbl>
            <Inp value={form.title} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Lbl>Body (HTML — &lt;p&gt;, &lt;h2&gt;, &lt;strong&gt; use kora jay)</Lbl>
            <TA rows={12} value={form.body} onChange={(e) => set("body", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Lbl>Summary (list page-er choto lekha)</Lbl>
            <TA rows={2} value={form.summary} onChange={(e) => set("summary", e.target.value)} />
          </div>
          <div>
            <Lbl>Category</Lbl>
            <Inp value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="Buying Guides / Safety / Education" />
          </div>
          <div>
            <Lbl>Tags (comma diye)</Lbl>
            <Inp value={form.tags} onChange={(e) => set("tags", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Lbl>Quick Answer</Lbl>
            <TA rows={2} value={form.quickAnswer} onChange={(e) => set("quickAnswer", e.target.value)} />
          </div>
          <div>
            <Lbl>Related product slugs (comma diye)</Lbl>
            <Inp value={form.productSlugs} onChange={(e) => set("productSlugs", e.target.value)} />
          </div>
          <div>
            <Lbl>Featured image URL</Lbl>
            <Inp value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://…" />
          </div>
        </div>
        <div className="flex gap-2">
          <SaveBtn
            onClick={() =>
              save("blog.save", {
                id: sel === "new" ? undefined : sel,
                title: form.title,
                body: form.body,
                summary: form.summary,
                tags: form.tags,
                category: form.category,
                quickAnswer: form.quickAnswer,
                productSlugs: form.productSlugs,
                imageUrl: form.imageUrl || undefined,
              })
            }
          >
            {sel === "new" ? "Publish post" : "Save post"}
          </SaveBtn>
          {sel !== "new" && <DelBtn onClick={() => save("blog.delete", { id: sel })} />}
        </div>
        <p className="text-xs text-neutral-500 mt-3">
          Post save korlei publish hoye jay ebong site-e 5–10 minute-er moddhe dekhabe.
        </p>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Pages                                                              */
/* ------------------------------------------------------------------ */

function PagesTab({ data, save }: any) {
  const [sel, setSel] = useState<string>("");
  const [body, setBody] = useState("");
  const page = (data.pages || []).find((p: any) => p.id === sel) || (data.pages || [])[0];
  useEffect(() => {
    if (page) {
      setSel(page.id);
      setBody(page.body || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  if (!page) return <p className="text-neutral-400">No pages found.</p>;
  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {(data.pages || []).map((p: any) => (
          <button
            key={p.id}
            onClick={() => {
              setSel(p.id);
              setBody(p.body || "");
            }}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${
              page.id === p.id ? "bg-emerald-500 text-white" : "bg-white/5 text-neutral-300"
            }`}
          >
            {p.title} (/{p.handle})
          </button>
        ))}
      </div>
      <Card title={`${page.title} — body (HTML)`}>
        <TA rows={16} value={body} onChange={(e) => setBody(e.target.value)} className={inputCls} />
        <p className="text-xs text-neutral-500 my-3">
          Privacy/Terms-e prottek section &lt;h2&gt; diye shuru koro. About-er body = story ongsho, Contact-er
          body = form-er uporer intro.
        </p>
        <SaveBtn onClick={() => save("page.save", { id: page.id, title: page.title, body })} />
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Menu editor (3 levels)                                             */
/* ------------------------------------------------------------------ */

function MenuItems({ items, onChange, depth }: any) {
  const upd = (i: number, patch: any) =>
    onChange(items.map((it: any, j: number) => (j === i ? { ...it, ...patch } : it)));
  const move = (i: number, dir: number) => {
    const arr = [...items];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    onChange(arr);
  };
  return (
    <div className={depth > 0 ? "ml-5 border-l border-white/10 pl-3" : ""}>
      {items.map((it: any, i: number) => (
        <div key={i} className="mb-2">
          <div className="flex gap-2 items-center">
            <input
              className={`${inputCls} max-w-[220px]`}
              value={it.title}
              placeholder="Menu name"
              onChange={(e) => upd(i, { title: e.target.value })}
            />
            <input
              className={`${inputCls} max-w-[260px]`}
              value={it.url}
              placeholder="/link"
              onChange={(e) => upd(i, { url: e.target.value })}
            />
            <button onClick={() => move(i, -1)} className="px-2 py-2 rounded-lg border border-white/10 text-neutral-300 hover:bg-white/5">↑</button>
            <button onClick={() => move(i, 1)} className="px-2 py-2 rounded-lg border border-white/10 text-neutral-300 hover:bg-white/5">↓</button>
            <button
              onClick={() => onChange(items.filter((_: any, j: number) => j !== i))}
              className="px-2 py-2 rounded-lg border border-red-400/30 text-red-300 hover:bg-red-500/10"
            >
              <Trash2 size={14} />
            </button>
            {depth < 2 && (
              <button
                onClick={() => upd(i, { children: [...(it.children || []), { title: "", url: "/", children: [] }] })}
                className="px-2.5 py-2 rounded-lg border border-white/15 text-xs text-neutral-200 hover:bg-white/5 whitespace-nowrap"
              >
                + Sub-item
              </button>
            )}
          </div>
          {(it.children || []).length > 0 && (
            <MenuItems items={it.children} depth={depth + 1} onChange={(ch: any) => upd(i, { children: ch })} />
          )}
        </div>
      ))}
      <button
        onClick={() => onChange([...items, { title: "", url: "/", children: [] }])}
        className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-neutral-200 hover:bg-white/5 mt-1"
      >
        <Plus size={13} /> Add item
      </button>
    </div>
  );
}

function MenuTab({ data, save }: any) {
  const [menu, setMenu] = useState<any>(data.menu);
  useEffect(() => setMenu(data.menu), [data]);
  if (!menu) return <p className="text-neutral-400">Menu not found.</p>;
  return (
    <Card title={`Menu: ${menu.title}`}>
      <p className="text-sm text-neutral-400 mb-4">
        Header navigation. Uporer item gulo main menu; sub-item diye dropdown/column banao.
      </p>
      <MenuItems items={menu.items || []} depth={0} onChange={(items: any) => setMenu({ ...menu, items })} />
      <div className="mt-4">
        <SaveBtn onClick={() => save("menu.save", { id: menu.id, title: menu.title, handle: menu.handle, items: menu.items })} />
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Products (price / compare price / stock / status)                */
/* ------------------------------------------------------------------ */

function ProductsTab({ data, save }: any) {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<any[]>(data.products || []);
  useEffect(() => setRows(data.products || []), [data]);
  const upd = (id: string, k: string, v: any) =>
    setRows(rows.map((r) => (r.id === id ? { ...r, [k]: v } : r)));
  const shown = rows.filter((r) => !q || r.title.toLowerCase().includes(q.toLowerCase())).slice(0, 60);

  return (
    <div>
      <div className="relative mb-4 max-w-md">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
        <input className={`${inputCls} pl-9`} placeholder="Product search…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <p className="text-xs text-neutral-500 mb-3">
        Prothom 60 ta product dekhacche. Price/stock first variant-er upor apply hoy.
      </p>
      {shown.map((r) => (
        <div key={r.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 mb-3">
          <div className="flex items-center gap-3 mb-3">
            {r.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.image} alt="" className="h-11 w-11 rounded-lg object-cover border border-white/10" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{r.title}</p>
              <p className="text-xs text-neutral-500">
                /{r.handle} · {r.status}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end">
            <div>
              <Lbl>Price (AED)</Lbl>
              <Inp value={r.price} onChange={(e) => upd(r.id, "price", e.target.value)} />
            </div>
            <div>
              <Lbl>Compare price</Lbl>
              <Inp value={r.compareAtPrice} onChange={(e) => upd(r.id, "compareAtPrice", e.target.value)} />
            </div>
            <div>
              <Lbl>Stock</Lbl>
              <Inp type="number" value={r.inventoryQuantity} onChange={(e) => upd(r.id, "inventoryQuantity", e.target.value)} />
            </div>
            <div>
              <Lbl>Status</Lbl>
              <select
                className={inputCls}
                value={r.status}
                onChange={(e) => upd(r.id, "status", e.target.value)}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="DRAFT">DRAFT</option>
              </select>
            </div>
            <SaveBtn
              onClick={() =>
                save("product.save", {
                  id: r.id,
                  variantId: r.variantId,
                  price: r.price,
                  compareAtPrice: r.compareAtPrice,
                  status: r.status,
                  inventoryItemId: r.inventoryItemId,
                  locationId: data.locationId,
                  inventoryQuantity: r.inventoryQuantity,
                })
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
}
