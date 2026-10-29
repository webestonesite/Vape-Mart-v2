"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Trash2, Save, X, Upload, Link2 } from "lucide-react";
import { RichText } from "./rich-text";

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
function Sel(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={inputCls} />;
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
function Section({ n, title, hint, children }: any) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <h2 className="font-bold text-neutral-900 mb-1">
        {n}. {title}
      </h2>
      {hint && <p className="text-xs text-neutral-500 mb-3">{hint}</p>}
      {children}
    </div>
  );
}

/* Spec rows. flavor_family / nicotine_strength / badge have preset choices
   in Shopify (set 2026-10-28), so the panel offers them as dropdowns —
   typing anything else would be rejected on save. */
const KNOWN_SPECS: { key: string; label: string; type?: string }[] = [
  { key: "badge", label: "Badge" },
  { key: "subtitle", label: "Subtitle" },
  { key: "short_description", label: "Short description" },
  { key: "puffs", label: "Puff count", type: "number" },
  { key: "puff_range", label: "Puff range" },
  { key: "nicotine_strength", label: "Nicotine strength" },
  { key: "battery_capacity", label: "Battery" },
  { key: "coil_type", label: "Coil" },
  { key: "charging_type", label: "Charging" },
  { key: "e_liquid_capacity", label: "E-liquid" },
  { key: "activation", label: "Activation" },
  { key: "vg_pg_ratio", label: "VG/PG ratio" },
  { key: "flavor_family", label: "Flavor family" },
  { key: "sweetness", label: "Sweetness (1-5)", type: "number" },
  { key: "cooling", label: "Cooling (1-5)", type: "number" },
  { key: "throat_hit", label: "Throat hit (1-5)", type: "number" },
  { key: "top_note", label: "Top note" },
  { key: "heart_note", label: "Heart note" },
  { key: "base_note", label: "Base note" },
];
const PRESET_CHOICES: Record<string, { value: string; label: string }[]> = {
  flavor_family: [
    { value: "fruit_ice", label: "Fruit Ice" },
    { value: "menthol", label: "Menthol" },
    { value: "tobacco", label: "Tobacco" },
    { value: "dessert", label: "Dessert" },
  ],
  nicotine_strength: ["2%", "20mg", "30mg", "3mg", "50mg", "5%", "50mg (5%)"].map((v) => ({ value: v, label: v })),
  badge: [{ value: "BEST SELLER", label: "BEST SELLER" }],
};
const NICOTINE_PRESETS = ["0mg", "20mg", "30mg", "50mg"];

function cartesian(lists: string[][]): string[][] {
  if (!lists.length) return [[]];
  let out: string[][] = [[]];
  for (const list of lists) {
    const next: string[][] = [];
    for (const prefix of out) for (const v of list) next.push([...prefix, v]);
    out = next;
  }
  return out;
}

const tupleKey = (t: string[]): string => JSON.stringify(t);
const tupleLabel = (t: string[]): string => (t.length ? t.join(" / ") : "Default");

function parseJsonList(v: any): string[] {
  if (!v) return [];
  try {
    const x = JSON.parse(v);
    return Array.isArray(x) ? x.map(String) : [];
  } catch {
    return String(v).split(",").map((s) => s.trim()).filter(Boolean);
  }
}

function stripTags(s: string): string {
  return String(s || "").replace(/<[^>]*>/g, "");
}

/* Small link builder for short spec values: pick link text + URL, and the
   value becomes a real hyperlink (the product page renders it as a link). */
function LinkHelper({ value, onApply }: { value: string; onApply: (html: string) => void }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  if (!open) {
    return (
      <button
        type="button"
        title="Link bosao"
        className="rounded-md border border-neutral-300 bg-white px-2 py-2 text-neutral-700 hover:bg-neutral-50"
        onClick={() => {
          setText(stripTags(value));
          setUrl("");
          setOpen(true);
        }}
      >
        <Link2 size={14} />
      </button>
    );
  }
  return (
    <div className="flex gap-1 col-span-3">
      <Inp placeholder="Link — https://…" value={url} onChange={(e) => setUrl(e.target.value)} />
      <Inp placeholder="Kisher upor link" value={text} onChange={(e) => setText(e.target.value)} />
      <button
        type="button"
        className="shrink-0 rounded-md bg-neutral-900 px-3 py-2 text-xs font-bold text-white"
        onClick={() => {
          const u = url.trim();
          if (!u) {
            setOpen(false);
            return;
          }
          const href = /^https?:\/\//i.test(u) ? u : `https://${u}`;
          onApply(`<a href="${href}">${(text.trim() || stripTags(value) || href).replace(/"/g, "")}</a>`);
          setOpen(false);
        }}
      >
        Bosao
      </button>
      <button
        type="button"
        className="shrink-0 rounded-md border border-neutral-300 px-2 py-2 text-neutral-700"
        onClick={() => setOpen(false)}
      >
        <X size={14} />
      </button>
    </div>
  );
}

function FlavourPicker({ flavors, selected, onToggle }: any) {
  return (
    <div className="flex flex-wrap gap-2">
      {(flavors || []).map((fl: any) => {
        const on = selected.includes(fl.id);
        return (
          <button
            key={fl.id}
            type="button"
            onClick={() => onToggle(fl.id, on)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold border ${
              on ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-700 border-neutral-300"
            }`}
          >
            {fl.name}
          </button>
        );
      })}
      {!(flavors || []).length && <span className="text-xs text-neutral-500">No flavours defined yet.</span>}
    </div>
  );
}

/* Tap-to-add chips — one value at a time, never a comma-joined text box.
   Used for variant option values and tags, so a simple person never has
   to type commas. The saved data is unchanged (arrays / comma string). */
function ValueChips({
  values,
  onChange,
  placeholder,
  emptyText,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  emptyText: string;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    if (!(values || []).includes(v)) onChange([...(values || []), v]);
    setDraft("");
  };
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {(values || []).map((v: string) => (
          <span key={v} className="inline-flex items-center gap-1 rounded-full bg-neutral-900 text-white px-3 py-1.5 text-xs font-semibold">
            {v}
            <button type="button" onClick={() => onChange((values || []).filter((x: string) => x !== v))}>
              <X size={12} />
            </button>
          </span>
        ))}
        {!(values || []).length && <span className="text-xs text-neutral-500">{emptyText}</span>}
      </div>
      <div className="flex gap-2">
        <Inp
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <button
          type="button"
          onClick={add}
          className="shrink-0 rounded-md border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
        >
          Add
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Unified product entry page — every field on one page, in order.    */
/*  Nothing here is demo: empty means empty, and every field really    */
/*  saves to Shopify through the single Save button.                   */
/* ------------------------------------------------------------------ */

export function ProductEditor({ productId, data, notify, reload, back }: any) {
  const isNew = !productId;
  const [loading, setLoading] = useState(!isNew);
  const [form, setForm] = useState<any>({
    title: "", handle: "", descriptionHtml: "", vendor: "", productType: "", tags: "", status: "DRAFT",
    price: "", compareAtPrice: "", sku: "", barcode: "", inventoryQuantity: "",
    seoTitle: "", seoDescription: "",
  });
  const [variants, setVariants] = useState<any[]>([]);
  const [newVariants, setNewVariants] = useState<any[]>([]);
  const [deleteVariantIds, setDeleteVariantIds] = useState<string[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [newMedia, setNewMedia] = useState<any[]>([]);
  const [deleteMediaIds, setDeleteMediaIds] = useState<string[]>([]);
  const [mediaAltEdits, setMediaAltEdits] = useState<Record<string, string>>({});
  const [collectionIds, setCollectionIds] = useState<string[]>([]);
  const [options, setOptions] = useState<any[]>([]);
  const [specRows, setSpecRows] = useState<any[]>([]);
  const [origSpecKeys, setOrigSpecKeys] = useState<string[]>([]);
  const [hiddenTuples, setHiddenTuples] = useState<string[]>([]);
  const [nicOpts, setNicOpts] = useState("");
  const [nicCustom, setNicCustom] = useState("");
  const [selFlavors, setSelFlavors] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [related, setRelated] = useState<any[]>([]);
  const [relQuery, setRelQuery] = useState("");
  const [relResults, setRelResults] = useState<any[]>([]);
  const [relSearching, setRelSearching] = useState(false);
  const [variantImages, setVariantImages] = useState<Record<string, any>>({});

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
        seoTitle: d.seoTitle || "", seoDescription: d.seoDescription || "",
      });
      setVariants(d.variants);
      setMedia(d.media);
      setCollectionIds(d.collections);
      setOptions((d.options || []).map((o: any) => ({ name: o.name, values: [...(o.values || [])] })));
      const rows: any[] = [];
      const presentKeys: string[] = [];
      for (const f of KNOWN_SPECS) {
        const v = d.vape?.[f.key];
        if (v !== undefined && v !== null && String(v) !== "") {
          rows.push({ key: f.key, label: f.label, value: String(v) });
          presentKeys.push(f.key);
        }
      }
      try {
        const custom = JSON.parse(d.vape?.custom_specs || "[]");
        if (Array.isArray(custom))
          for (const r of custom)
            if (r?.name && r?.value) rows.push({ key: null, label: String(r.name), value: String(r.value) });
      } catch { /* ignore malformed custom specs */ }
      setSpecRows(rows);
      setOrigSpecKeys(presentKeys);
      setNicOpts(parseJsonList(d.vape?.nicotine_options).join(", "));
      setSelFlavors(parseJsonList(d.vape?.flavors));
      setFaqs((d.faqs || []).map((f: any) => ({ id: f.id, question: f.question, answer: f.answer })));
      setReviews((d.reviews || []).map((rv: any) => ({
        id: rv.id, author: rv.author, rating: rv.rating, title: rv.title, body: rv.body, verified: rv.verified,
      })));
      setRelated(d.related || []);
      const vi: Record<string, any> = {};
      for (const v of d.variants || []) {
        const t = (v.selectedOptions || []).map((s: any) => s.value);
        vi[tupleKey(t)] = (v.media && v.media[0]) ? { mediaId: v.media[0].id } : null;
      }
      setVariantImages(vi);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const set = (k: string, v: any) => setForm({ ...form, [k]: v });

  const MAIN_HANDLES = ["juul", "terea", "iqos", "disposable-vape", "e-liquids"];
  const mainCollections = (data.collections || []).filter((c: any) => MAIN_HANDLES.includes(c.handle));
  const toggleCollection = (id: string) =>
    setCollectionIds(collectionIds.includes(id) ? collectionIds.filter((x) => x !== id) : [...collectionIds, id]);

  // ---- Variant helpers (Shopify-style, max 3 options) ----
  const liveOptions = options
    .map((o: any) => ({ name: String(o.name || "").trim(), values: (o.values || []).map((v: string) => String(v).trim()).filter(Boolean) }))
    .filter((o: any) => o.name && o.values.length);
  const combos = (): string[][] => {
    if (!liveOptions.length) return [[]];
    return cartesian(liveOptions.map((o: any) => o.values));
  };
  const visibleCombos = (): string[][] => combos().filter((t) => !hiddenTuples.includes(tupleKey(t)));
  const matchVariant = (tuple: string[]) =>
    variants.find((v: any) => {
      const sel = (v.selectedOptions || []).map((o: any) => o.value);
      return sel.length === tuple.length && sel.every((val: string, i: number) => val === tuple[i]);
    });
  const newVariantFor = (tuple: string[]) =>
    newVariants.find((nv: any) => tupleKey(nv.options || []) === tupleKey(tuple));
  const basePrice = isNew ? form.price : (variants[0]?.price ?? "");
  const baseStock = isNew ? form.inventoryQuantity : (variants[0]?.inventoryQuantity ?? "");
  const rowFor = (tuple: string[]) => {
    const m = matchVariant(tuple);
    if (m) return { kind: "existing" as const, v: m };
    const nv = newVariantFor(tuple);
    if (nv) return { kind: "new" as const, v: nv };
    return {
      kind: "fresh" as const,
      v: { options: tuple, price: basePrice, compareAtPrice: isNew ? form.compareAtPrice : "", sku: "", barcode: "", inventoryQuantity: baseStock },
    };
  };
  const setRowField = (tuple: string[], field: string, value: string) => {
    const row = rowFor(tuple);
    if (row.kind === "existing") {
      setVariants(variants.map((x: any) => (x.id === row.v.id ? { ...x, [field]: value } : x)));
    } else if (row.kind === "new") {
      setNewVariants(newVariants.map((x: any) => (tupleKey(x.options || []) === tupleKey(tuple) ? { ...x, [field]: value } : x)));
    } else {
      setNewVariants([...newVariants, { ...row.v, [field]: value }]);
    }
  };
  const deleteTuple = (tuple: string[]) => {
    if (visibleCombos().length <= 1 && tuple.length === 0) {
      notify("Ekta variant ontoto rakhte hobe — shob delete kora jabe na.");
      return;
    }
    const m = matchVariant(tuple);
    if (m) {
      setDeleteVariantIds([...deleteVariantIds, m.id]);
      setVariants(variants.filter((x: any) => x.id !== m.id));
    } else {
      setNewVariants(newVariants.filter((x: any) => tupleKey(x.options || []) !== tupleKey(tuple)));
    }
    setHiddenTuples([...hiddenTuples, tupleKey(tuple)]);
  };
  const firstVariant = variants[0];
  const setFirstVariant = (field: string, value: string) =>
    setVariants(variants.map((x: any, i: number) => (i === 0 ? { ...x, [field]: value } : x)));
  const simplePrice = isNew ? form.price : (firstVariant?.price ?? "");
  const simpleCompare = isNew ? form.compareAtPrice : (firstVariant?.compareAtPrice ?? "");
  const simpleStock = isNew ? form.inventoryQuantity : (firstVariant?.inventoryQuantity ?? "");
  const setSimplePrice = (v: string) => (isNew ? set("price", v) : setFirstVariant("price", v));
  const setSimpleCompare = (v: string) => (isNew ? set("compareAtPrice", v) : setFirstVariant("compareAtPrice", v));
  const setSimpleStock = (v: string) => (isNew ? set("inventoryQuantity", v) : setFirstVariant("inventoryQuantity", v));

  // ---- Spec-row helpers ----
  const specValue = (key: string) => specRows.find((r: any) => r.key === key)?.value ?? "";
  const setSpec = (key: string, value: string, label: string) => {
    const i = specRows.findIndex((r: any) => r.key === key);
    if (i > -1) setSpecRows(specRows.map((r: any, j: number) => (j === i ? { ...r, value } : r)));
    else setSpecRows([...specRows, { key, label, value }]);
  };

  const onUpload = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setUploading(true);
    try {
      for (const f of Array.from(files)) {
        const resourceUrl = await uploadFile(f);
        setNewMedia((prev) => [...prev, { preview: URL.createObjectURL(f), source: resourceUrl, alt: "" }]);
      }
      notify("Image uploaded — save the product to attach it.");
    } catch (e: any) {
      notify("Upload error: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  const searchRelated = async () => {
    const q = relQuery.trim();
    if (!q) return;
    setRelSearching(true);
    const r = await api({ action: "bulk.search", search: q });
    setRelSearching(false);
    if (r.ok) setRelResults(r.products || []);
    else notify(r.error || "Search failed");
  };

  const nicList = () => nicOpts.split(",").map((x: string) => x.trim()).filter(Boolean);
  const toggleNic = (v: string) => {
    const list = nicList();
    setNicOpts((list.includes(v) ? list.filter((x) => x !== v) : [...list, v]).join(", "));
  };

  const doSave = async () => {
    if (!form.title.trim()) {
      notify("Title is required.");
      return;
    }
    setSaving(true);
    // Specs: known keys write back to their vape.* metafields, free rows go
    // to vape.custom_specs JSON, removed known keys get deleted from Shopify.
    const vapePayload: any = {};
    const customSpecs: any[] = [];
    for (const r of specRows) {
      if (!r.value || String(r.value).trim() === "") continue;
      if (r.key) vapePayload[r.key] = r.value;
      else if (r.label && String(r.label).trim() !== "") customSpecs.push({ name: r.label.trim(), value: r.value });
    }
    vapePayload.custom_specs = customSpecs;
    vapePayload.nicotine_options = nicList();
    vapePayload.flavors = selFlavors;
    const vapeDeleteKeys = origSpecKeys.filter(
      (k) => !specRows.some((r: any) => r.key === k && r.value && String(r.value).trim() !== "")
    );
    const liveMedia = media.filter((m: any) => !deleteMediaIds.includes(m.id));
    const mediaAltUpdates = liveMedia
      .filter((m: any) => mediaAltEdits[m.id] !== undefined && mediaAltEdits[m.id] !== (m.altText || ""))
      .map((m: any) => ({ id: m.id, alt: mediaAltEdits[m.id] }));
    const variantMedia = visibleCombos()
      .map((t) => {
        const picked = variantImages[tupleKey(t)];
        if (picked === undefined) return null;
        const m = matchVariant(t);
        return {
          variantId: m?.id,
          options: t,
          mediaId: picked ? picked.mediaId ?? null : null,
          mediaSource: picked ? picked.mediaSource : undefined,
        };
      })
      .filter(Boolean);
    const base = {
      title: form.title, handle: form.handle || undefined, descriptionHtml: form.descriptionHtml,
      vendor: form.vendor, productType: form.productType, tags: form.tags, status: form.status,
      seoTitle: form.seoTitle, seoDescription: form.seoDescription,
      collectionIds, vape: vapePayload, vapeDeleteKeys, locationId: data.locationId,
      mediaSources: newMedia.map((m) => m.source),
      mediaAlts: newMedia.map((m) => m.alt || ""),
      mediaAltUpdates,
      variantMedia,
      faqs: faqs.map((f: any, i: number) => ({ id: f.id, question: f.question, answer: f.answer, position: i })),
      reviews: reviews.map((r: any, i: number) => ({
        id: r.id, author: r.author, rating: r.rating, title: r.title, body: r.body, verified: r.verified, position: i,
      })),
      relatedHandles: related.map((r: any) => r.handle),
    };
    let r: any;
    if (isNew) {
      const cleanOptions = liveOptions.map((o: any) => ({ name: o.name, values: o.values }));
      const comboList = visibleCombos();
      const payload: any = {
        ...base,
        price: form.price, compareAtPrice: form.compareAtPrice, sku: form.sku, barcode: form.barcode,
        inventoryQuantity: form.inventoryQuantity,
        options: cleanOptions,
      };
      if (cleanOptions.length) {
        const toOptionValues = (t: string[]) => t.map((val: string, i: number) => ({ optionName: cleanOptions[i].name, name: val }));
        payload.variants = comboList.map((t) => {
          const nv = newVariantFor(t);
          return {
            optionValues: toOptionValues(t),
            price: nv?.price ?? form.price,
            compareAtPrice: nv?.compareAtPrice ?? form.compareAtPrice,
            sku: nv?.sku ?? "",
            barcode: nv?.barcode ?? "",
            inventoryQuantity: nv?.inventoryQuantity ?? form.inventoryQuantity,
          };
        });
      }
      r = await api({ action: "product.create", payload });
    } else {
      const comboList = visibleCombos();
      const matchedIds = new Set<string>();
      const newFromCombos: any[] = [];
      for (const t of comboList) {
        const m = matchVariant(t);
        if (m) { matchedIds.add(m.id); continue; }
        const nv = newVariantFor(t);
        if (nv) { if (nv.price !== "") newFromCombos.push(nv); continue; }
        newFromCombos.push({ options: t, price: variants[0]?.price || "0", compareAtPrice: "", sku: "", barcode: "", inventoryQuantity: variants[0]?.inventoryQuantity ?? "" });
      }
      const kept = variants.filter((v: any) => matchedIds.has(v.id));
      const orphans = variants.filter((v: any) => !matchedIds.has(v.id));
      const toOptionValues = (t: string[]) => t.map((val: string, i: number) => ({ optionName: liveOptions[i]?.name || "", name: val })).filter((x: any) => x.optionName);
      const newWithValues = newFromCombos.map((nv: any) => ({ ...nv, optionValues: toOptionValues(nv.options || []) }));
      if (kept.length === 0 && newFromCombos.length === 0) {
        setSaving(false);
        notify("Ekta variant ontoto rakhte hobe — age ekta combination-er dam dao.");
        return;
      }
      r = await api({
        action: "product.update",
        payload: {
          ...base, id: productId,
          variantUpdates: kept.map((v: any) => ({
            id: v.id, price: v.price, compareAtPrice: v.compareAtPrice, sku: v.sku, barcode: v.barcode,
          })),
          inventoryUpdates: kept.map((v: any) => ({ inventoryItemId: v.inventoryItemId, quantity: v.inventoryQuantity })),
          newVariants: newWithValues, deleteVariantIds: [...deleteVariantIds, ...orphans.map((v: any) => v.id)], deleteMediaIds,
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

  const liveMedia = media.filter((m: any) => !deleteMediaIds.includes(m.id));
  const imageOptions = [
    ...liveMedia.map((m: any) => ({ key: `id:${m.id}`, label: m.altText || m.url.split("/").pop(), url: m.url })),
    ...newMedia.map((m: any) => ({ key: `src:${m.source}`, label: m.source.split("/").pop(), url: m.preview })),
  ];
  // Key of the image picked for a variant combination ("id:…" / "src:…"),
  // or "" when no image is picked. Used by the thumbnail picker grid.
  const variantImageKey = (t: string[]) => {
    const p = variantImages[tupleKey(t)];
    if (!p) return "";
    if (p.mediaId) return `id:${p.mediaId}`;
    if (p.mediaSource) return `src:${p.mediaSource}`;
    return "";
  };

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

      <div className="max-w-3xl space-y-4">
        <Section n={1} title="Title">
          <Inp value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Product-er nam" />
        </Section>

        <Section n={2} title="Description" hint="Dokane product page-e dekhabe. Toolbar diye bold, list ar link bosano jabe.">
          <RichText value={form.descriptionHtml} onChange={(v) => set("descriptionHtml", v)} placeholder="Product-ta ki, keno valo — 2-3 line-e likho" minHeight={140} />
        </Section>

        <Section n={3} title="Meta title" hint="Google search-e je title dekhabe. Khali rakhle product-er nam hobe.">
          <Inp value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} placeholder="Search-er title" />
        </Section>

        <Section n={4} title="Meta description" hint="Google search-er niche je chhoto lekha dekhabe.">
          <Inp value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} placeholder="Search-er chhoto biboron" />
        </Section>

        <Section n={5} title="Product image" hint="Prothom chhobi-tai dokane boro kore dekhabe. Prottek chhobir alt text dao — Google ar screen reader-er jonno.">
          <div className="space-y-3 mb-3">
            {liveMedia.map((m: any) => (
              <div key={m.id} className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt="" className="h-16 w-16 rounded-lg object-cover border border-neutral-200 shrink-0" />
                <Inp
                  placeholder="Alt text — chhobi-te ki ache"
                  value={mediaAltEdits[m.id] !== undefined ? mediaAltEdits[m.id] : m.altText || ""}
                  onChange={(e) => setMediaAltEdits({ ...mediaAltEdits, [m.id]: e.target.value })}
                />
                <button
                  onClick={() => setDeleteMediaIds([...deleteMediaIds, m.id])}
                  className="rounded-md border border-red-200 bg-red-50 px-2 py-2 text-red-700 hover:bg-red-100 shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {newMedia.map((m: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.preview} alt="" className="h-16 w-16 rounded-lg object-cover border border-emerald-300 shrink-0" />
                <Inp
                  placeholder="Alt text — chhobi-te ki ache"
                  value={m.alt}
                  onChange={(e) => setNewMedia(newMedia.map((x: any, j: number) => (j === i ? { ...x, alt: e.target.value } : x)))}
                />
                <button
                  onClick={() => setNewMedia(newMedia.filter((_: any, j: number) => j !== i))}
                  className="rounded-md border border-red-200 bg-red-50 px-2 py-2 text-red-700 hover:bg-red-100 shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <label className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 cursor-pointer">
            <Upload size={15} /> {uploading ? "Uploading…" : "Chhobi dao"}
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onUpload(e.target.files)} />
          </label>
          <div className="flex gap-2 mt-3">
            <Inp placeholder="Or paste an image URL…" value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} />
            <button
              onClick={() => {
                if (imgUrl.trim()) {
                  setNewMedia([...newMedia, { preview: imgUrl.trim(), source: imgUrl.trim(), alt: "" }]);
                  setImgUrl("");
                }
              }}
              className="shrink-0 rounded-md border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
            >
              Add URL
            </button>
          </div>
        </Section>

        <Section n={6} title="Variant" hint="Option add koro (Flavor, Color, Pack Size — ja khushi, sorbochcho 3-ta). Prottek combination-er nijer dam, ager dam, SKU, stock ar chhobi hobe.">
          {options.map((o: any, oi: number) => (
            <div key={oi} className="grid sm:grid-cols-[160px_1fr_auto] gap-2 mb-2">
              <Inp
                value={o.name}
                placeholder="Option nam"
                onChange={(e) => setOptions(options.map((x: any, j: number) => (j === oi ? { ...x, name: e.target.value } : x)))}
              />
              <ValueChips
                values={o.values || []}
                onChange={(next) => setOptions(options.map((x: any, j: number) => (j === oi ? { ...x, values: next } : x)))}
                placeholder="Ekta value likho (jemon: Mango Ice)"
                emptyText="Ekhono kono value nai — niche likhe Add chaple chip hobe."
              />
              <button
                onClick={() => setOptions(options.filter((_: any, j: number) => j !== oi))}
                className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-700 hover:bg-red-100"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          <button
            onClick={() => options.length < 3 && setOptions([...options, { name: "", values: [] }])}
            disabled={options.length >= 3}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 disabled:opacity-40 mt-1"
          >
            <Plus size={14} /> Add option {options.length >= 3 ? "(sorbochcho 3-ta)" : ""}
          </button>

          <div className="mt-4 space-y-3">
            {visibleCombos().map((t) => {
              const v = rowFor(t).v;
              const pickedKey = variantImageKey(t);
              return (
                <div key={tupleKey(t)} className="rounded-lg border border-neutral-200 p-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-sm font-bold text-neutral-800">{tupleLabel(t)}</span>
                    <button
                      onClick={() => deleteTuple(t)}
                      className="rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-red-700 hover:bg-red-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <Lbl>Dam</Lbl>
                      <Inp type="number" value={v.price ?? ""} onChange={(e) => setRowField(t, "price", e.target.value)} placeholder="Dam" />
                    </div>
                    <div>
                      <Lbl>Ager dam</Lbl>
                      <Inp type="number" value={v.compareAtPrice ?? ""} onChange={(e) => setRowField(t, "compareAtPrice", e.target.value)} placeholder="Ager dam" />
                    </div>
                    <div>
                      <Lbl>SKU</Lbl>
                      <Inp value={v.sku ?? ""} onChange={(e) => setRowField(t, "sku", e.target.value)} placeholder="SKU" />
                    </div>
                    <div>
                      <Lbl>Stock</Lbl>
                      <Inp type="number" value={v.inventoryQuantity ?? ""} onChange={(e) => setRowField(t, "inventoryQuantity", e.target.value)} placeholder="Stock" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <Lbl>Variant-er chhobi — chhobi dekhe tap koro</Lbl>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setVariantImages({ ...variantImages, [tupleKey(t)]: null })}
                        className={`flex h-16 w-16 items-center justify-center rounded-lg border text-xs font-semibold ${
                          pickedKey === ""
                            ? "border-neutral-900 ring-2 ring-neutral-900 bg-neutral-50 text-neutral-900"
                            : "border-dashed border-neutral-300 text-neutral-500"
                        }`}
                      >
                        Chhobi nai
                      </button>
                      {imageOptions.map((o: any) => {
                        const selected = pickedKey === o.key;
                        return (
                          <button
                            key={o.key}
                            type="button"
                            title={o.label}
                            onClick={() => {
                              if (o.key.startsWith("id:"))
                                setVariantImages({ ...variantImages, [tupleKey(t)]: { mediaId: o.key.slice(3) } });
                              else if (o.key.startsWith("src:"))
                                setVariantImages({ ...variantImages, [tupleKey(t)]: { mediaSource: o.key.slice(4) } });
                            }}
                            className={`relative h-16 w-16 overflow-hidden rounded-lg border ${
                              selected ? "border-neutral-900 ring-2 ring-neutral-900" : "border-neutral-200"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={o.url} alt={o.label} className="h-full w-full object-cover" />
                            {selected && (
                              <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-white text-[11px] font-bold">
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {!imageOptions.length && (
                      <p className="text-xs text-neutral-500 mt-1">
                        Age section 5-e chhobi add koro, tarpor ekhane chhobi dekhe pick korte parba.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            {!visibleCombos().length && (
              <p className="text-xs text-neutral-500">Option-e value dao — tarpor ekhane prottek combination-er dam/stock/chhobi bosate parba.</p>
            )}
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Option nam/value bodle purano variant delete hoye notun combination toiri hobe.
          </p>
        </Section>

        <Section n={7} title="Slug" hint="Product-er link-er shesh ongsho. Khali rakhle nam theke auto hobe.">
          <Inp value={form.handle} onChange={(e) => set("handle", e.target.value)} placeholder="Khali rakhle auto hobe" />
          <p className="text-xs text-neutral-500 mt-1">URL: /products/{form.handle || "…"}</p>
        </Section>

        {liveOptions.length === 0 && (
          <Section n={8} title="Price" hint="Variant option na thakle ekhaner dam-i product-er dam.">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Lbl>Bikri dam (AED) *</Lbl>
                <Inp type="number" value={simplePrice} onChange={(e) => setSimplePrice(e.target.value)} placeholder="Dam" />
              </div>
              <div>
                <Lbl>Ager dam (kete dekhabe — na dileo cholbe)</Lbl>
                <Inp type="number" value={simpleCompare} onChange={(e) => setSimpleCompare(e.target.value)} placeholder="Ager dam" />
              </div>
              <div>
                <Lbl>Stock — kotota ache</Lbl>
                <Inp type="number" value={simpleStock} onChange={(e) => setSimpleStock(e.target.value)} placeholder="Stock" />
              </div>
              {isNew && (
                <>
                  <div>
                    <Lbl>SKU</Lbl>
                    <Inp value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="SKU" />
                  </div>
                  <div>
                    <Lbl>Barcode</Lbl>
                    <Inp value={form.barcode} onChange={(e) => set("barcode", e.target.value)} placeholder="Barcode" />
                  </div>
                </>
              )}
            </div>
          </Section>
        )}

        <Section n={9} title="Collection" hint="Product-ta kon category-te dekhabe — tap kore tick dao.">
          <div className="flex flex-wrap gap-2 mb-3">
            {mainCollections.map((c: any) => {
              const on = collectionIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCollection(c.id)}
                  className={`rounded-full px-4 py-2 text-sm font-bold border ${on ? "bg-emerald-700 text-white border-emerald-700" : "bg-white text-neutral-700 border-neutral-300"}`}
                >
                  {c.title}
                </button>
              );
            })}
          </div>
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 border-t border-neutral-100 pt-3">
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
        </Section>

        <Section n={10} title="Brand" hint="Brand, type ar tag — khali rakhleo cholbe.">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Lbl>Brand</Lbl>
              <Inp value={form.vendor} onChange={(e) => set("vendor", e.target.value)} placeholder="Brand-er nam" />
            </div>
            <div>
              <Lbl>Product type</Lbl>
              <Inp value={form.productType} onChange={(e) => set("productType", e.target.value)} placeholder="Type" />
            </div>
            <div className="sm:col-span-2">
              <Lbl>Tag</Lbl>
              <ValueChips
                values={form.tags.split(",").map((s: string) => s.trim()).filter(Boolean)}
                onChange={(next) => set("tags", next.join(", "))}
                placeholder="Ekta tag likho"
                emptyText="Ekhono kono tag nai — niche likhe Add chaple chip hobe."
              />
            </div>
          </div>
        </Section>

        <Section n={11} title="Dokane dekhabe?" hint="Live korle dokane dekhabe, draft rakhle shudhu tumi dekhba.">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => set("status", "ACTIVE")}
              className={`rounded-full px-4 py-2 text-sm font-bold border ${form.status === "ACTIVE" ? "bg-emerald-700 text-white border-emerald-700" : "bg-white text-neutral-700 border-neutral-300"}`}
            >
              Ha, live koro
            </button>
            <button
              type="button"
              onClick={() => set("status", "DRAFT")}
              className={`rounded-full px-4 py-2 text-sm font-bold border ${form.status !== "ACTIVE" ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-700 border-neutral-300"}`}
            >
              Na, draft rakho
            </button>
          </div>
        </Section>

        <Section n={12} title="Spec table" hint="Shob product-er spec same na — ja dorkar sudhu tai rakho, baki delete koro. Egulo product page-er spec table-e dekhabe. Link icon diye value-te link bosano jabe.">
          <div className="space-y-2">
            {specRows.map((r: any, i: number) => {
              const preset = r.key ? PRESET_CHOICES[r.key] : null;
              const isNumber = KNOWN_SPECS.find((f) => f.key === r.key)?.type === "number";
              // Links belong on free-form spec rows only: short labels and
              // SEO-fed fields (subtitle, short description) stay plain text.
              const showLink = r.key === null;
              return (
                <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-start">
                  {r.key ? (
                    <span className="flex items-center text-sm font-semibold text-neutral-700 pt-2">{r.label}</span>
                  ) : (
                    <Inp
                      value={r.label}
                      placeholder="Spec nam"
                      onChange={(e) => setSpecRows(specRows.map((x: any, j: number) => (j === i ? { ...x, label: e.target.value } : x)))}
                    />
                  )}
                  {preset ? (
                    <Sel
                      value={r.value}
                      onChange={(e) => setSpecRows(specRows.map((x: any, j: number) => (j === i ? { ...x, value: e.target.value } : x)))}
                    >
                      <option value="">Select…</option>
                      {preset.map((o: any) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                      {r.value && !preset.some((o: any) => o.value === r.value) && <option value={r.value}>{r.value}</option>}
                    </Sel>
                  ) : (
                    <Inp
                      type={isNumber ? "number" : "text"}
                      value={r.value}
                      placeholder="Value"
                      onChange={(e) => setSpecRows(specRows.map((x: any, j: number) => (j === i ? { ...x, value: e.target.value } : x)))}
                    />
                  )}
                  <div className="flex gap-1">
                    {showLink && (
                      <LinkHelper
                        value={r.value}
                        onApply={(html) => setSpecRows(specRows.map((x: any, j: number) => (j === i ? { ...x, value: html } : x)))}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => setSpecRows(specRows.filter((_: any, j: number) => j !== i))}
                      className="rounded-md border border-red-200 bg-red-50 px-2 py-2 text-red-700 hover:bg-red-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setSpecRows([...specRows, { key: null, label: "", value: "" }])}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 mt-2"
          >
            <Plus size={14} /> Add spec
          </button>
        </Section>

        <Section n={13} title="Flavor" hint="Kon flavour-gulo ache tap kore dao. Nicotine strength-gulo tap kore dao, na thakle likhe add koro.">
          <FlavourPicker flavors={data.flavors} selected={selFlavors} onToggle={(id: string, on: boolean) => setSelFlavors(on ? selFlavors.filter((x) => x !== id) : [...selFlavors, id])} />
          <p className="text-xs text-neutral-500 mt-2 mb-2">Notun flavour add korte Flavors tab-e jao.</p>
          <Lbl>Nicotine strength</Lbl>
          <div className="flex flex-wrap gap-2">
            {NICOTINE_PRESETS.map((v: string) => {
              const on = nicList().includes(v);
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => toggleNic(v)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold border ${on ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-700 border-neutral-300"}`}
                >
                  {v}
                </button>
              );
            })}
            {nicList()
              .filter((v: string) => !NICOTINE_PRESETS.includes(v))
              .map((v: string) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => toggleNic(v)}
                  className="rounded-full px-3 py-1.5 text-xs font-semibold border bg-neutral-900 text-white border-neutral-900"
                >
                  {v} ×
                </button>
              ))}
          </div>
          <div className="flex gap-2 mt-2">
            <Inp placeholder="Onno strength likho" value={nicCustom} onChange={(e) => setNicCustom(e.target.value)} />
            <button
              type="button"
              onClick={() => {
                const v = nicCustom.trim();
                if (v && !nicList().includes(v)) setNicOpts([...nicList(), v].join(", "));
                setNicCustom("");
              }}
              className="shrink-0 rounded-md border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
            >
              Add
            </button>
          </div>
        </Section>

        <Section n={14} title="FAQ" hint="Ei product-er nijer proshno-uttor. Product page-er FAQ section-e shobar age egulo dekhabe. Answer-e link bosano jabe.">
          <div className="space-y-3">
            {faqs.map((f: any, i: number) => (
              <div key={f.id || `new-${i}`} className="rounded-lg border border-neutral-200 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Inp
                    placeholder="Proshno"
                    value={f.question}
                    onChange={(e) => setFaqs(faqs.map((x: any, j: number) => (j === i ? { ...x, question: e.target.value } : x)))}
                  />
                  <button
                    type="button"
                    onClick={() => setFaqs(faqs.filter((_: any, j: number) => j !== i))}
                    className="rounded-md border border-red-200 bg-red-50 px-2 py-2 text-red-700 hover:bg-red-100 shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <RichText
                  value={f.answer}
                  onChange={(v) => setFaqs(faqs.map((x: any, j: number) => (j === i ? { ...x, answer: v } : x)))}
                  placeholder="Uttor"
                  minHeight={80}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setFaqs([...faqs, { question: "", answer: "" }])}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 mt-2"
          >
            <Plus size={14} /> Add FAQ
          </button>
        </Section>

        <Section n={15} title="Review" hint="Ei product-er review. Product page-er review carousel-e dekhabe. Lekha-te link bosano jabe.">
          <div className="space-y-3">
            {reviews.map((r: any, i: number) => (
              <div key={r.id || `new-${i}`} className="rounded-lg border border-neutral-200 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    <Inp
                      placeholder="Nam"
                      value={r.author}
                      onChange={(e) => setReviews(reviews.map((x: any, j: number) => (j === i ? { ...x, author: e.target.value } : x)))}
                    />
                    <Sel
                      value={String(r.rating ?? 5)}
                      onChange={(e) => setReviews(reviews.map((x: any, j: number) => (j === i ? { ...x, rating: parseInt(e.target.value, 10) } : x)))}
                    >
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>
                          {n} star
                        </option>
                      ))}
                    </Sel>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReviews(reviews.filter((_: any, j: number) => j !== i))}
                    className="rounded-md border border-red-200 bg-red-50 px-2 py-2 text-red-700 hover:bg-red-100 shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <Inp
                  placeholder="Review title"
                  value={r.title}
                  onChange={(e) => setReviews(reviews.map((x: any, j: number) => (j === i ? { ...x, title: e.target.value } : x)))}
                />
                <div className="mt-2">
                  <RichText
                    value={r.body}
                    onChange={(v) => setReviews(reviews.map((x: any, j: number) => (j === i ? { ...x, body: v } : x)))}
                    placeholder="Review lekha"
                    minHeight={80}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-neutral-800 cursor-pointer mt-2">
                  <input
                    type="checkbox"
                    checked={r.verified !== false}
                    onChange={(e) => setReviews(reviews.map((x: any, j: number) => (j === i ? { ...x, verified: e.target.checked } : x)))}
                    className="accent-neutral-900"
                  />
                  Verified buyer
                </label>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setReviews([...reviews, { author: "", rating: 5, title: "", body: "", verified: true }])}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 mt-2"
          >
            <Plus size={14} /> Add review
          </button>
        </Section>

        <Section n={16} title="Related product" hint="Ei product-er niche je product-gulo dekhabe — nam diye khujo, tap kore add koro.">
          <div className="flex flex-wrap gap-2 mb-3">
            {related.map((r: any) => (
              <span key={r.handle} className="inline-flex items-center gap-1 rounded-full bg-neutral-900 text-white px-3 py-1.5 text-xs font-semibold">
                {r.title}
                <button type="button" onClick={() => setRelated(related.filter((x: any) => x.handle !== r.handle))}>
                  <X size={12} />
                </button>
              </span>
            ))}
            {!related.length && <span className="text-xs text-neutral-500">Kono related product nai.</span>}
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                className={`${inputCls} pl-9`}
                placeholder="Product-er nam likho"
                value={relQuery}
                onChange={(e) => setRelQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    searchRelated();
                  }
                }}
              />
            </div>
            <button
              type="button"
              onClick={searchRelated}
              className="shrink-0 rounded-md border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
            >
              {relSearching ? "Khujchi…" : "Khujo"}
            </button>
          </div>
          {relResults.length > 0 && (
            <div className="mt-2 rounded-lg border border-neutral-200 divide-y divide-neutral-100">
              {relResults.map((p: any) => {
                const added = related.some((x: any) => x.handle === p.handle);
                return (
                  <div key={p.handle} className="flex items-center justify-between gap-2 px-3 py-2">
                    <span className="text-sm text-neutral-800">{p.title}</span>
                    <button
                      type="button"
                      disabled={added}
                      onClick={() => {
                        if (!added) setRelated([...related, { handle: p.handle, title: p.title }]);
                      }}
                      className="shrink-0 rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 disabled:opacity-40"
                    >
                      {added ? "Added" : "Add"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        <PrimaryBtn onClick={doSave}>
          <Save size={15} /> {saving ? "Saving…" : "Save product"}
        </PrimaryBtn>
      </div>
    </div>
  );
}
