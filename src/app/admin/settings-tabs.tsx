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
  fields: { key: string; label: string; placeholder?: string; options?: { value: string; label: string; swatch: string }[] }[];
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
              f.options ? (
                <span key={f.key} className="flex-1 min-w-[160px] flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded-full border border-neutral-300 shrink-0"
                    style={{ backgroundColor: (f.options.find((o) => o.value === row[f.key]) || {}).swatch || "#e5e7eb" }}
                    title={row[f.key] || "No colour picked"}
                  />
                  <select
                    value={row[f.key] ?? ""}
                    onChange={(e) => set(i, f.key, e.target.value)}
                    className="flex-1 min-w-[120px] rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm"
                  >
                    <option value="">Pick a colour…</option>
                    {f.options.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </span>
              ) : (
                <input
                  key={f.key}
                  value={row[f.key] ?? ""}
                  onChange={(e) => set(i, f.key, e.target.value)}
                  placeholder={f.placeholder || f.label}
                  className="flex-1 min-w-[120px] rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm"
                />
              )
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
        Delivery charge, free-delivery limit, VAT note and city-wise delivery promise — leave blank to keep the site's current rules (AED 350 free delivery, AED 25 fee).
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
        The product page trust badge, shipping/return text and spec table order — leave blank to keep the current text/order.
      </p>
      <Card title="Trust badges (the 4 under the buy box)">
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
      <Card title="Shipping & return texts (the tab next to DESCRIPTION)">
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
      <Card title="Spec table order" sub={`Comma-separated. Available keys: ${SPEC_KEYS.join(", ")}. Leave blank to keep the current order.`}>
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
        Collection page rules: how many products per page, compare limit, sort options, puff filter, flavour family and the Shop All hero — leave blank to keep the current rules (12 per page, compare 3).
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
          label="ID → label → min puffs → max puffs (blank = no limit)"
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
      <Card title="Shop All hero (hero text for the page without a category)">
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
  const [preset, setPreset] = useState(s.colors?.preset || "emerald");
  const [headingFont, setHeadingFont] = useState(s.fonts?.heading || "playfair");
  const [bodyFont, setBodyFont] = useState(s.fonts?.body || "system");

  const PRESETS = [
    { id: "emerald", label: "Emerald & Gold (akhonkar ta)", dot: "#064e3b" },
    { id: "sapphire", label: "Sapphire Night (neel)", dot: "#1e3a8a" },
    { id: "ruby", label: "Ruby Noir (laal)", dot: "#881337" },
  ];

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
        Header/footer text: search box placeholder, top-bar link, footer link groups, newsletter text and store logo — leave blank to keep the current design.
      </p>
      <Card title="Header">
        <div className="grid gap-3">
          <div>
            <Lbl>Search placeholder</Lbl>
            <Inp value={placeholder} onChange={(e) => setPlaceholder(e.target.value)} placeholder="Search vapes, brands, flavours…" />
          </div>
          <div>
            <Lbl>Store logo image URL (leave blank to keep the current logo)</Lbl>
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
      <Card title="Footer link groups" sub='Write the links for each group on separate lines as "Label|/url".'>
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
      <Card title="Site colour & fonts">
        <p className="text-xs text-neutral-500 mb-3">Changing the main colour changes the header, buttons and dark sections — everywhere. The gold accent stays the same in every theme. Changes show on the site about 10 minutes after saving.</p>
        <div className="grid gap-3">
          <div>
            <Lbl>Site-er main colour</Lbl>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPreset(p.id)}
                  className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${preset === p.id ? "border-emerald-900 bg-emerald-50 font-semibold" : "border-neutral-300 bg-white"}`}
                >
                  <span className="inline-block h-4 w-4 rounded-full" style={{ backgroundColor: p.dot }} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Lbl>Heading lekhar font</Lbl>
            <select value={headingFont} onChange={(e) => setHeadingFont(e.target.value)} className="w-full rounded-md border border-neutral-300 bg-white px-2 py-2 text-sm">
              <option value="playfair">Playfair Display (akhonkar ta)</option>
              <option value="cinzel">Cinzel</option>
              <option value="outfit">Outfit</option>
            </select>
          </div>
          <div>
            <Lbl>Body lekhar font</Lbl>
            <select value={bodyFont} onChange={(e) => setBodyFont(e.target.value)} className="w-full rounded-md border border-neutral-300 bg-white px-2 py-2 text-sm">
              <option value="system">System default (akhonkar ta)</option>
              <option value="inter">Inter</option>
              <option value="outfit">Outfit</option>
              <option value="poppins">Poppins</option>
            </select>
          </div>
        </div>
      </Card>
      <Card title="Mega-menu promo banner (DISPOSABLE)">
        <p className="text-xs text-neutral-500 mb-3">The promo banner shown under the DISPOSABLE menu — leave the title blank to hide the banner.</p>
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
        colors: { preset }, fonts: { heading: headingFont, body: bodyFont },
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
  const HOME_SECTIONS = [
    { id: "hero", label: "Hero" },
    { id: "banners", label: "Promo banners" },
    { id: "categories", label: "Shop by Category" },
    { id: "features", label: "Features strip" },
    { id: "brand", label: "Featured brand (TEREA / JUUL)" },
    { id: "flavors", label: "Flavours (arc dial)" },
    { id: "faq", label: "FAQ" },
    { id: "trust", label: "Trust & Reviews Hub" },
    { id: "blog", label: "Blog carousel" },
  ];
  const HOME_SECTION_IDS = HOME_SECTIONS.map((x) => x.id);
  const [order, setOrder] = useState<string[]>(() => {
    const saved = Array.isArray(s.sectionOrder) ? s.sectionOrder.filter((id: string) => HOME_SECTION_IDS.includes(id)) : [];
    return [...saved, ...HOME_SECTION_IDS.filter((id) => !saved.includes(id))];
  });
  const moveSection = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next);
  };

  return (
    <div>
      <p className="text-sm text-neutral-500 mb-4">
        Home page banner, category tiles, features strip and trust numbers — leave blank to keep the current design/text. To hide a section, turn its checkbox off.
      </p>
      <Card title="Promo banners" sub="The 2 banners on the home page. Leave the image blank to keep the current image. Leave the button link blank and the button will do nothing.">
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
      <Card title="Shop by Category tiles" sub="6 tiles. Leave the colour blank to keep the current gradient (e.g. from-emerald-900/80 to-black/90).">
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
      <Card title="Features strip" sub="Icon name: Truck, Headset, RotateCcw, CreditCard, ShieldCheck, Zap, Clock, Star.">
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
      <Card title="Section visibility" sub="Turn a section off and it will not show on the home page. All are on by default.">
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
      <Card title="Section order" sub="Use the up and down buttons to change the order of the home page sections. Changes show on the site about 10 minutes after saving. Only the order changes, not the design.">
        <div className="space-y-2">
          {order.map((id, i) => {
            const label = HOME_SECTIONS.find((x) => x.id === id)?.label || id;
            return (
              <div key={id} className="flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm">
                <span className="text-neutral-400 font-semibold w-6">{i + 1}.</span>
                <span className="flex-1">{label}</span>
                <button onClick={() => moveSection(i, -1)} disabled={i === 0} className="rounded border border-neutral-300 px-2 py-1 text-xs disabled:opacity-40">↑</button>
                <button onClick={() => moveSection(i, 1)} disabled={i === order.length - 1} className="rounded border border-neutral-300 px-2 py-1 text-xs disabled:opacity-40">↓</button>
              </div>
            );
          })}
        </div>
      </Card>
      <SaveBar onSave={() => save("home.save", {
        promoBanners: banners, categoryTiles: tiles, features,
        trustStats: { customers: parseInt(customers, 10) || 0, reviews: parseInt(reviews, 10) || 0 },
        sectionVisibility: vis,
        sectionOrder: order,
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
        The blog category filter list and each category&apos;s badge colour. Tap the colour box to pick from the palette — no need to type anything.
      </p>
      <Card title="Categories (one per line)">
        <TA rows={6} value={catsText} onChange={(e) => setCatsText(e.target.value)} placeholder={"Buying Guides\nSafety\nEducation\nRegulations"} />
      </Card>
      <Card title="Category badge colors">
        <JsonListEditor
          label="Category → badge colour"
          rows={colors}
          setRows={setColors}
          fields={[
            { key: "category", label: "Category" },
            {
              key: "cls", label: "Badge colour",
              options: [
                { value: "bg-emerald-600", label: "Emerald", swatch: "#059669" },
                { value: "bg-red-600", label: "Red", swatch: "#dc2626" },
                { value: "bg-blue-600", label: "Blue", swatch: "#2563eb" },
                { value: "bg-amber-500", label: "Amber", swatch: "#f59e0b" },
                { value: "bg-teal-600", label: "Teal", swatch: "#0d9488" },
                { value: "bg-purple-600", label: "Purple", swatch: "#9333ea" },
                { value: "bg-rose-600", label: "Rose", swatch: "#e11d48" },
                { value: "bg-orange-500", label: "Orange", swatch: "#f97316" },
                { value: "bg-cyan-600", label: "Cyan", swatch: "#0891b2" },
                { value: "bg-slate-600", label: "Slate", swatch: "#475569" },
              ],
            },
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
        About/Contact page cards and hero subtitle — leave blank to keep the current text. Icon name: BadgeCheck, ShieldCheck, Truck, Headset, PackageCheck, Award, Timer, Phone, Mail, MapPin, Clock.
      </p>
      <Card title="About — values (4 cards)">
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
      <Card title="About — stats (3)">
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
      <Card title="Contact — cards (4)">
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
              <Inp value={subs[k] || ""} onChange={(e) => setSubs({ ...subs, [k]: e.target.value })} placeholder="Leave blank to keep the current subtitle" />
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
