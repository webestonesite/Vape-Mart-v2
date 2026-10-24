"use client";

import { useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { Lbl, Inp, TA, PrimaryBtn } from "./panel-ui";

/* ------------------------------------------------------------------ */
/*  Phase 3 settings managers: theme, cart & checkout, product page,   */
/*  collection page. Everything saves into shop metafields and the     */
/*  storefront reads them with its code literals as fallback, so       */
/*  nothing changes until the owner edits something here.              */
/* ------------------------------------------------------------------ */

function Card({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm mb-4">
      <h2 className="font-bold text-neutral-900">{title}</h2>
      {sub && <p className="text-xs text-neutral-500 mt-0.5 mb-3">{sub}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}

/** Generic list-of-objects editor: rows of text inputs + add/delete. */
function JsonListEditor({
  label, rows, setRows, fields, addLabel,
}: {
  label: string;
  rows: any[];
  setRows: (rows: any[]) => void;
  fields: { key: string; label: string; placeholder?: string }[];
  addLabel?: string;
}) {
  const set = (i: number, key: string, v: string) => {
    const next = [...rows];
    next[i] = { ...next[i], [key]: v };
    setRows(next);
  };
  return (
    <div>
      <Lbl>{label}</Lbl>
      <div className="space-y-2">
        {(rows || []).map((row, i) => (
          <div key={i} className="flex flex-wrap gap-2 items-center rounded-lg border border-neutral-100 p-2">
            {fields.map((f) => (
              <input
                key={f.key}
                value={row[f.key] ?? ""}
                onChange={(e) => set(i, f.key, e.target.value)}
                placeholder={f.placeholder || f.label}
                className="flex-1 min-w-[120px] rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm"
              />
            ))}
            <button
              onClick={() => setRows(rows.filter((_, j) => j !== i))}
              className="text-red-500 hover:text-red-700 p-1"
              aria-label="Remove row"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() => setRows([...(rows || []), Object.fromEntries(fields.map((f) => [f.key, ""]))])}
        className="mt-2 inline-flex items-center gap-1 rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
      >
        <Plus size={13} /> {addLabel || "Add row"}
      </button>
    </div>
  );
}

function SaveBar({ onSave }: { onSave: () => void }) {
  return (
    <div className="mt-4">
      <PrimaryBtn onClick={onSave}><Save size={15} /> Save settings</PrimaryBtn>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Cart & checkout                                                    */
/* ------------------------------------------------------------------ */

export function CartTab({ data, save }: any) {
  const s = data.settings?.checkout || {};
  const [threshold, setThreshold] = useState(String(s.freeShippingThreshold || ""));
  const [fee, setFee] = useState(String(s.deliveryFee || ""));
  const [vatNote, setVatNote] = useState(s.vatNote || "");
  const [cities, setCities] = useState<any[]>(s.cityPromises || []);
  const [payments, setPayments] = useState<any[]>(s.paymentLabels || []);

  return (
    <div>
      <p className="text-sm text-neutral-500 mb-4">
        Delivery charge, free-delivery limit, VAT note ar city-wise delivery promise — khali rakhle site-er ager niyom (AED 350 free delivery, AED 25 fee) cholbe.
      </p>
      <Card title="Delivery & fees">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Lbl>Free shipping above (AED)</Lbl>
            <Inp type="number" value={threshold} onChange={(e) => setThreshold(e.target.value)} placeholder="350" />
          </div>
          <div>
            <Lbl>Delivery fee (AED)</Lbl>
            <Inp type="number" value={fee} onChange={(e) => setFee(e.target.value)} placeholder="25" />
          </div>
          <div className="sm:col-span-2">
            <Lbl>VAT note (shown in cart)</Lbl>
            <Inp value={vatNote} onChange={(e) => setVatNote(e.target.value)} placeholder="e.g. Prices include 5% VAT" />
          </div>
        </div>
      </Card>
      <Card title="City delivery promises">
        <JsonListEditor
          label="City → promise"
          rows={cities}
          setRows={setCities}
          fields={[
            { key: "city", label: "City", placeholder: "Dubai" },
            { key: "promise", label: "Promise", placeholder: "Same-day before 9pm" },
          ]}
        />
      </Card>
      <Card title="Payment labels">
        <JsonListEditor
          label="Key → label shown at checkout"
          rows={payments}
          setRows={setPayments}
          fields={[
            { key: "key", label: "Key", placeholder: "cod" },
            { key: "label", label: "Label", placeholder: "Cash on Delivery" },
          ]}
        />
      </Card>
      <SaveBar onSave={() => save("checkout.save", {
        freeShippingThreshold: threshold, deliveryFee: fee, vatNote, cityPromises: cities, paymentLabels: payments,
      })} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Product page                                                       */
/* ------------------------------------------------------------------ */

const SPEC_KEYS = ["Puff Count", "Nicotine", "E-Liquid", "Battery", "Charging", "Coil", "Activation", "VG/PG"];

export function ProductPageTab({ data, save }: any) {
  const s = data.settings?.productPage || {};
  const [badges, setBadges] = useState<any[]>(s.trustBadges || []);
  const [shipping, setShipping] = useState(s.shippingText || "");
  const [returns, setReturns] = useState(s.returnText || "");
  const [specOrder, setSpecOrder] = useState<string>((s.specOrder || []).join(", "));

  return (
    <div>
      <p className="text-sm text-neutral-500 mb-4">
        Product page-er trust badge, shipping/return lekha ar spec table-er order — khali rakhle ager lekha/order-i thakbe.
      </p>
      <Card title="Trust badges (buy box-er niche 4-ti)">
        <JsonListEditor
          label="Icon name → title → subtitle"
          rows={badges}
          setRows={setBadges}
          fields={[
            { key: "icon", label: "Icon", placeholder: "Truck" },
            { key: "title", label: "Title", placeholder: "Free Shipping" },
            { key: "sub", label: "Subtitle", placeholder: "On orders above AED 350" },
          ]}
        />
      </Card>
      <Card title="Shipping & return texts (DESCRIPTION tab-er pasher tab)">
        <div className="grid gap-3">
          <div>
            <Lbl>Shipping text</Lbl>
            <TA rows={4} value={shipping} onChange={(e) => setShipping(e.target.value)} />
          </div>
          <div>
            <Lbl>Return text</Lbl>
            <TA rows={4} value={returns} onChange={(e) => setReturns(e.target.value)} />
          </div>
        </div>
      </Card>
      <Card title="Spec table order" sub={`Comma-separated. Available keys: ${SPEC_KEYS.join(", ")}. Khali rakhle ager order-i thakbe.`}>
        <Inp value={specOrder} onChange={(e) => setSpecOrder(e.target.value)} placeholder="Puff Count, Nicotine, E-Liquid, Battery, Charging, Coil, Activation, VG/PG" />
      </Card>
      <SaveBar onSave={() => save("productPage.save", {
        trustBadges: badges, shippingText: shipping, returnText: returns,
        specOrder: specOrder.split(",").map((x) => x.trim()).filter(Boolean),
      })} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Collection page                                                    */
/* ------------------------------------------------------------------ */

export function CollectionPageTab({ data, save }: any) {
  const s = data.settings?.collectionPage || {};
  const [items, setItems] = useState(String(s.itemsPerPage || ""));
  const [compare, setCompare] = useState(String(s.compareLimit || ""));
  const [sorts, setSorts] = useState<any[]>(s.sortOptions || []);
  const [buckets, setBuckets] = useState<any[]>(s.puffBuckets || []);
  const [families, setFamilies] = useState<any[]>(s.flavorFamilies || []);
  const [hero, setHero] = useState<any>(s.shopAllHero || { title: "", subtitle: "" });
  // Quiz modal step titles (options stay data-driven: puff buckets, nicotine, flavour families).
  const quizDefaults = ["How much do you vape?", "Pick your nicotine strength", "Choose your flavour vibe"];
  const [quizTitles, setQuizTitles] = useState<string[]>((s.quizSteps || []).map((q: any) => typeof q === "string" ? q : q.title || ""));

  const doSave = () => {
    save("collectionPage.save", {
      itemsPerPage: items, compareLimit: compare, sortOptions: sorts,
      puffBuckets: buckets.map((b) => ({ ...b, min: b.min === "" || b.min == null ? null : parseInt(String(b.min), 10), max: b.max === "" || b.max == null ? null : parseInt(String(b.max), 10) })),
      flavorFamilies: families, quizSteps: quizTitles.map((t) => ({ title: t })), shopAllHero: hero,
    });
  };

  return (
    <div>
      <p className="text-sm text-neutral-500 mb-4">
        Collection page-er niyom: proti page-e koyta product, compare limit, sort option, puff filter, flavour family ar Shop All hero — khali rakhle ager niyom cholbe (12 per page, compare 3).
      </p>
      <Card title="Paging & compare">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Lbl>Products per page</Lbl>
            <Inp type="number" value={items} onChange={(e) => setItems(e.target.value)} placeholder="12" />
          </div>
          <div>
            <Lbl>Compare limit</Lbl>
            <Inp type="number" value={compare} onChange={(e) => setCompare(e.target.value)} placeholder="3" />
          </div>
        </div>
      </Card>
      <Card title="Sort options">
        <JsonListEditor
          label="Value → label"
          rows={sorts}
          setRows={setSorts}
          fields={[
            { key: "value", label: "Value", placeholder: "featured" },
            { key: "label", label: "Label", placeholder: "Featured" },
          ]}
        />
      </Card>
      <Card title="Puff buckets (filter)">
        <JsonListEditor
          label="ID → label → min puffs → max puffs (khali = kono sima nei)"
          rows={buckets}
          setRows={setBuckets}
          fields={[
            { key: "id", label: "ID", placeholder: "10k-20k" },
            { key: "label", label: "Label", placeholder: "10,000 – 20,000" },
            { key: "min", label: "Min", placeholder: "10000" },
            { key: "max", label: "Max", placeholder: "20000" },
          ]}
        />
      </Card>
      <Card title="Flavor families (filter)">
        <JsonListEditor
          label="ID → name → description"
          rows={families}
          setRows={setFamilies}
          fields={[
            { key: "id", label: "ID", placeholder: "fruit_ice" },
            { key: "name", label: "Name", placeholder: "Fruit Ice" },
            { key: "desc", label: "Description", placeholder: "Icy fruit blends" },
          ]}
        />
      </Card>
      <Card title="Shop All hero (category chara page-er hero lekha)">
        <div className="grid gap-3">
          <div>
            <Lbl>Title</Lbl>
            <Inp value={hero.title || ""} onChange={(e) => setHero({ ...hero, title: e.target.value })} />
          </div>
          <div>
            <Lbl>Subtitle</Lbl>
            <Inp value={hero.subtitle || ""} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} />
          </div>
        </div>
      </Card>
      <Card title="Vape Finder quiz — step titles">
        <p className="text-xs text-neutral-500 mb-3">Quiz-er 3-ti step-er shironam bodlano jay. Option gulo filter thekei asbe (puff bucket, nicotine, flavour family).</p>
        <div className="grid gap-3">
          {quizDefaults.map((d, i) => (
            <div key={i}>
              <Lbl>Step {i + 1}</Lbl>
              <Inp value={quizTitles[i] || ""} onChange={(e) => { const next = [...quizTitles]; next[i] = e.target.value; setQuizTitles(next); }} placeholder={d} />
            </div>
          ))}
        </div>
      </Card>
      <SaveBar onSave={doSave} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Theme & brand                                                      */
/* ------------------------------------------------------------------ */

export function ThemeTab({ data, save }: any) {
  const s = data.settings?.theme || {};
  const [placeholder, setPlaceholder] = useState(s.searchPlaceholder || "");
  const [topbar, setTopbar] = useState<any[]>(s.topbarLinks || []);
  const [footerGroups, setFooterGroups] = useState<any[]>(s.footerLinks || []);
  const [newsletter, setNewsletter] = useState(s.newsletterText || "");
  const [logoUrl, setLogoUrl] = useState("");
  const [mega, setMega] = useState<any>(s.megaBanner || { title: "", subtitle: "", badge: "", href: "" });

  // Footer groups editor keeps links as "Label|/url" pairs per line for simplicity.
  const groupsForSave = footerGroups.map((g) => ({
    title: g.title || "",
    links: String(g.linksText || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [label, url] = line.split("|").map((x) => x.trim());
        return { label: label || "", url: url || "/" };
      }),
  }));

  return (
    <div>
      <p className="text-sm text-neutral-500 mb-4">
        Header/footer-er lekha: search box-er placeholder, top-bar link, footer link group, newsletter lekha ar store logo — khali rakhle ager design-i thakbe.
      </p>
      <Card title="Header">
        <div className="grid gap-3">
          <div>
            <Lbl>Search placeholder</Lbl>
            <Inp value={placeholder} onChange={(e) => setPlaceholder(e.target.value)} placeholder="Search vapes, brands, flavours…" />
          </div>
          <div>
            <Lbl>Store logo image URL (khali rakhle logo bodlabe na)</Lbl>
            <Inp value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://…" />
            <p className="text-xs text-neutral-500 mt-1">Current logo: {data.settings?.logoUrl ? "set in Shopify" : "theme file logo"}</p>
          </div>
        </div>
        <div className="mt-3">
          <JsonListEditor
            label="Top-bar links"
            rows={topbar}
            setRows={setTopbar}
            fields={[
              { key: "label", label: "Label", placeholder: "Track Order" },
              { key: "url", label: "URL", placeholder: "/track" },
            ]}
          />
        </div>
      </Card>
      <Card title="Footer link groups" sub='Prottek group-er link-gulo alada line-e "Label|/url" akare likhun.'>
        <div className="space-y-3">
          {footerGroups.map((g, i) => (
            <div key={i} className="rounded-lg border border-neutral-100 p-3">
              <div className="flex gap-2 items-center mb-2">
                <input
                  value={g.title || ""}
                  onChange={(e) => {
                    const next = [...footerGroups];
                    next[i] = { ...next[i], title: e.target.value };
                    setFooterGroups(next);
                  }}
                  placeholder="Group title (e.g. Explore)"
                  className="flex-1 rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm"
                />
                <button onClick={() => setFooterGroups(footerGroups.filter((_, j) => j !== i))} className="text-red-500 hover:text-red-700 p-1">
                  <Trash2 size={14} />
                </button>
              </div>
              <TA
                rows={3}
                value={g.linksText ?? (g.links || []).map((l: any) => `${l.label}|${l.url}`).join("\n")}
                onChange={(e) => {
                  const next = [...footerGroups];
                  next[i] = { ...next[i], linksText: e.target.value };
                  setFooterGroups(next);
                }}
                placeholder={"About Us|/about\nContact|/contact"}
              />
            </div>
          ))}
        </div>
        <button
          onClick={() => setFooterGroups([...footerGroups, { title: "", linksText: "" }])}
          className="mt-2 inline-flex items-center gap-1 rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          <Plus size={13} /> Add group
        </button>
      </Card>
      <Card title="Newsletter">
        <Lbl>Newsletter section text</Lbl>
        <Inp value={newsletter} onChange={(e) => setNewsletter(e.target.value)} placeholder="e.g. Get 10% off your first order" />
      </Card>
      <Card title="Mega-menu promo banner (DISPOSABLE)">
        <p className="text-xs text-neutral-500 mb-3">DISPOSABLE menu khulle niche je promo banner dekhay — title khali rakhle banner dekhabe na.</p>
        <div className="grid gap-3">
          <div>
            <Lbl>Badge</Lbl>
            <Inp value={mega.badge || ""} onChange={(e) => setMega({ ...mega, badge: e.target.value })} placeholder="e.g. BEST SELLER" />
          </div>
          <div>
            <Lbl>Title</Lbl>
            <Inp value={mega.title || ""} onChange={(e) => setMega({ ...mega, title: e.target.value })} placeholder="e.g. Mega Max Deals" />
          </div>
          <div>
            <Lbl>Subtitle</Lbl>
            <Inp value={mega.subtitle || ""} onChange={(e) => setMega({ ...mega, subtitle: e.target.value })} placeholder="e.g. Up to 40,000 puffs" />
          </div>
          <div>
            <Lbl>Link</Lbl>
            <Inp value={mega.href || ""} onChange={(e) => setMega({ ...mega, href: e.target.value })} placeholder="/collections/disposable-vape" />
          </div>
        </div>
      </Card>
      <SaveBar onSave={() => save("theme.save", {
        searchPlaceholder: placeholder, topbarLinks: topbar, footerLinks: groupsForSave,
        newsletterText: newsletter, logoUrl: logoUrl.trim() || undefined, megaBanner: mega,
      })} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Home page                                                          */
/* ------------------------------------------------------------------ */

export function HomeTab({ data, save }: any) {
  const s = data.settings?.home || {};
  const [banners, setBanners] = useState<any[]>(s.promoBanners || []);
  const [tiles, setTiles] = useState<any[]>(s.categoryTiles || []);
  const [features, setFeatures] = useState<any[]>(s.features || []);
  const [customers, setCustomers] = useState(String(s.trustStats?.customers || ""));
  const [reviews, setReviews] = useState(String(s.trustStats?.reviews || ""));
  const [vis, setVis] = useState<any>(s.sectionVisibility || {});
  const toggle = (key: string) => setVis((v: any) => ({ ...v, [key]: !(v[key] !== false) }));

  return (
    <div>
      <p className="text-sm text-neutral-500 mb-4">
        Home page-er banner, category tile, features strip ar trust number — khali rakhle ager design/lekha-i thakbe. Section lukate chaile checkbox off korun.
      </p>
      <Card title="Promo banners" sub="Home page-er 2-ti banner. Image khali rakhle ager chhobi-i thakbe. Button link khali rakhle button kichu korbe na.">
        <JsonListEditor
          label="Banner (eyebrow → title → description → button text → button link → image URL)"
          rows={banners}
          setRows={setBanners}
          fields={[
            { key: "eyebrow", label: "Eyebrow" },
            { key: "title", label: "Title" },
            { key: "desc", label: "Description" },
            { key: "buttonText", label: "Button" },
            { key: "buttonLink", label: "Button link" },
            { key: "image", label: "Image URL" },
          ]}
          addLabel="Add banner"
        />
      </Card>
      <Card title="Shop by Category tiles" sub="6-ti tile. Color khali rakhle ager gradient-i thakbe (e.g. from-emerald-900/80 to-black/90).">
        <JsonListEditor
          label="Tile (title → subtitle → image → tag → gradient)"
          rows={tiles}
          setRows={setTiles}
          fields={[
            { key: "title", label: "Title" },
            { key: "subtitle", label: "Subtitle" },
            { key: "img", label: "Image URL" },
            { key: "tag", label: "Tag" },
            { key: "color", label: "Gradient" },
          ]}
          addLabel="Add tile"
        />
      </Card>
      <Card title="Features strip" sub="Icon nam: Truck, Headset, RotateCcw, CreditCard, ShieldCheck, Zap, Clock, Star.">
        <JsonListEditor
          label="Feature (icon → title → description)"
          rows={features}
          setRows={setFeatures}
          fields={[
            { key: "icon", label: "Icon" },
            { key: "title", label: "Title" },
            { key: "desc", label: "Description" },
          ]}
          addLabel="Add feature"
        />
      </Card>
      <Card title="Trust & Reviews Hub numbers">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Lbl>Customers (number)</Lbl>
            <Inp type="number" value={customers} onChange={(e) => setCustomers(e.target.value)} placeholder="160000" />
          </div>
          <div>
            <Lbl>Reviews (number)</Lbl>
            <Inp type="number" value={reviews} onChange={(e) => setReviews(e.target.value)} placeholder="1200" />
          </div>
        </div>
      </Card>
      <Card title="Section visibility" sub="Off korle sei section home page-e dekhabe na. Default shob on.">
        <div className="space-y-2">
          {[
            { key: "banners", label: "Promo banners" },
            { key: "categories", label: "Shop by Category" },
            { key: "features", label: "Features strip" },
            { key: "trust", label: "Trust & Reviews Hub" },
          ].map((v) => (
            <label key={v.key} className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
              <input type="checkbox" checked={vis[v.key] !== false} onChange={() => toggle(v.key)} />
              {v.label}
            </label>
          ))}
        </div>
      </Card>
      <SaveBar onSave={() => save("home.save", {
        promoBanners: banners, categoryTiles: tiles, features,
        trustStats: { customers: parseInt(customers, 10) || 0, reviews: parseInt(reviews, 10) || 0 },
        sectionVisibility: vis,
      })} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Blog settings + info pages                                         */
/* ------------------------------------------------------------------ */

export function BlogSettingsTab({ data, save }: any) {
  const s = data.settings?.blog || {};
  const [catsText, setCatsText] = useState((s.categories || []).join("\n"));
  const [colors, setColors] = useState<any[]>(Object.entries(s.categoryColors || {}).map(([category, cls]) => ({ category, cls })));

  return (
    <div>
      <p className="text-sm text-neutral-500 mb-4">
        Blog-er category filter list ar protita category-r badge rong. Rong shudhu ei palette theke beche nin (Tailwind class): bg-emerald-600, bg-red-600, bg-blue-600, bg-amber-500, bg-teal-600, bg-purple-600, bg-rose-600, bg-orange-500, bg-cyan-600, bg-slate-600.
      </p>
      <Card title="Categories (proti line-e ekti)">
        <TA rows={6} value={catsText} onChange={(e) => setCatsText(e.target.value)} placeholder={"Buying Guides\nSafety\nEducation\nRegulations"} />
      </Card>
      <Card title="Category badge colors">
        <JsonListEditor
          label="Category → badge class"
          rows={colors}
          setRows={setColors}
          fields={[
            { key: "category", label: "Category" },
            { key: "cls", label: "Badge class" },
          ]}
          addLabel="Add color"
        />
      </Card>
      <SaveBar onSave={() => save("blogSettings.save", {
        categories: catsText.split("\n").map((x: string) => x.trim()).filter(Boolean),
        categoryColors: Object.fromEntries(colors.map((c) => [c.category, c.cls])),
      })} />
    </div>
  );
}

export function InfoPagesTab({ data, save }: any) {
  const s = data.settings?.pages || {};
  const [values, setValues] = useState<any[]>(s.aboutValues || []);
  const [stats, setStats] = useState<any[]>(s.aboutStats || []);
  const [cards, setCards] = useState<any[]>(s.contactCards || []);
  const [subs, setSubs] = useState<any>(s.pageHeroSubtitles || {});

  return (
    <div>
      <p className="text-sm text-neutral-500 mb-4">
        About/Contact page-er card ar hero subtitle — khali rakhle ager lekha-i thakbe. Icon nam: BadgeCheck, ShieldCheck, Truck, Headset, PackageCheck, Award, Timer, Phone, Mail, MapPin, Clock.
      </p>
      <Card title="About — values (4-ti card)">
        <JsonListEditor
          label="Value (icon → title → text)"
          rows={values}
          setRows={setValues}
          fields={[
            { key: "icon", label: "Icon" },
            { key: "title", label: "Title" },
            { key: "text", label: "Text" },
          ]}
          addLabel="Add value"
        />
      </Card>
      <Card title="About — stats (3-ti)">
        <JsonListEditor
          label="Stat (icon → value → label)"
          rows={stats}
          setRows={setStats}
          fields={[
            { key: "icon", label: "Icon" },
            { key: "value", label: "Value" },
            { key: "label", label: "Label" },
          ]}
          addLabel="Add stat"
        />
      </Card>
      <Card title="Contact — cards (4-ti)">
        <JsonListEditor
          label="Card (icon → title → value → sub → link)"
          rows={cards}
          setRows={setCards}
          fields={[
            { key: "icon", label: "Icon" },
            { key: "title", label: "Title" },
            { key: "value", label: "Value" },
            { key: "sub", label: "Sub" },
            { key: "href", label: "Link" },
          ]}
          addLabel="Add card"
        />
      </Card>
      <Card title="Page hero subtitles">
        <div className="grid gap-3">
          {(["about", "contact", "privacy-policy", "terms-conditions"] as const).map((k) => (
            <div key={k}>
              <Lbl>{k}</Lbl>
              <Inp value={subs[k] || ""} onChange={(e) => setSubs({ ...subs, [k]: e.target.value })} placeholder="Khali rakhle ager subtitle-i thakbe" />
            </div>
          ))}
        </div>
      </Card>
      <SaveBar onSave={() => save("pages.save", {
        aboutValues: values, aboutStats: stats, contactCards: cards, pageHeroSubtitles: subs,
      })} />
    </div>
  );
}
