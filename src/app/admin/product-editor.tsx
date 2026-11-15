"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Search,
  Plus,
  Trash2,
  Save,
  X,
  Upload,
  Link2,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Layers,
  Tag,
  Droplets,
  Zap,
  HelpCircle,
  Star,
  ExternalLink,
  Sliders,
  ArrowLeft,
} from "lucide-react";
import { RichText } from "./rich-text";

async function api(body: any): Promise<any> {
  const res = await fetch("/api/admin-panel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { ok: false, error: text || `Request failed (HTTP ${res.status}).` };
  }
}

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const COMPRESS_FROM_BYTES = 3.5 * 1024 * 1024;
const MAX_IMAGE_EDGE = 1600;

async function prepareImageFile(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.size <= COMPRESS_FROM_BYTES) return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" } as any);
    const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    if (typeof bitmap.close === "function") bitmap.close();
    const outType = file.type === "image/png" ? "image/png" : "image/jpeg";
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, outType, 0.82));
    if (!blob || blob.size >= file.size) return file;
    const name =
      outType === "image/jpeg" && !/\.jpe?g$/i.test(file.name)
        ? file.name.replace(/\.[^.]+$/, "") + ".jpg"
        : file.name;
    return new File([blob], name, { type: outType });
  } catch {
    return file;
  }
}

async function uploadFile(file: File): Promise<string> {
  const ready = await prepareImageFile(file);
  if (ready.size > MAX_UPLOAD_BYTES)
    throw new Error("This image is too large — please use an image under 4 MB.");
  const form = new FormData();
  form.append("file", ready);
  const res = await fetch("/api/admin-panel/upload", { method: "POST", body: form });
  if (!res.ok) {
    const text = await res.text();
    let msg = text;
    try {
      const j = JSON.parse(text);
      if (j && j.error) msg = j.error;
    } catch {
      /* keep plain text */
    }
    throw new Error(msg || `Upload failed (HTTP ${res.status}).`);
  }
  const j = await res.json();
  if (!j.ok) throw new Error(j.error || "Upload failed");
  return j.resourceUrl as string;
}

const inputCls =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600";
const labelCls = "block text-xs font-semibold text-neutral-700 mb-1";

function Lbl({ children }: { children: React.ReactNode }) {
  return <label className={labelCls}>{children}</label>;
}
function Inp(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputCls} />;
}
function Sel(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={inputCls} />;
}

/* Quick specs presets */
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
    { value: "beverage", label: "Beverage" },
  ],
  nicotine_strength: ["0mg", "20mg", "30mg", "50mg", "2%", "5%"].map((v) => ({ value: v, label: v })),
  badge: [
    { value: "BEST SELLER", label: "BEST SELLER" },
    { value: "NEW ARRIVAL", label: "NEW ARRIVAL" },
    { value: "TOP RATED", label: "TOP RATED" },
    { value: "HOT", label: "HOT" },
  ],
};

const NICOTINE_PRESETS = ["0mg", "20mg", "30mg", "50mg"];
const PUFF_PRESETS = ["5000", "8000", "10000", "15000", "20000", "50000"];
const CAPACITY_PRESETS = ["2ml", "10ml", "14ml", "16ml", "18ml", "20ml"];
const BATTERY_PRESETS = ["500mAh", "650mAh", "850mAh", "1000mAh", "Rechargeable"];
const CHARGING_PRESETS = ["Type-C", "Micro-USB", "Fast Charging"];

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

/* Link builder */
function LinkHelper({ value, onApply }: { value: string; onApply: (html: string) => void }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  if (!open) {
    return (
      <button
        type="button"
        title="Insert link"
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
      <Inp placeholder="Link text" value={text} onChange={(e) => setText(e.target.value)} />
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
        Insert
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
            className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition ${
              on ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50"
            }`}
          >
            {fl.name} {on ? "✓" : "+"}
          </button>
        );
      })}
      {!(flavors || []).length && <span className="text-xs text-neutral-500">No flavours defined yet.</span>}
    </div>
  );
}

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
          <span key={v} className="inline-flex items-center gap-1 rounded-full bg-neutral-900 text-white px-3 py-1 text-xs font-semibold">
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
/*  Progressive Disclosure Collapsible Card                            */
/* ------------------------------------------------------------------ */

function CollapsibleCard({
  icon: Icon,
  title,
  subtitle,
  badge,
  enabled,
  onToggle,
  children,
}: {
  icon: any;
  title: string;
  subtitle: string;
  badge?: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border transition-all ${
        enabled ? "border-neutral-300 bg-white shadow-2xs" : "border-neutral-200 bg-neutral-50/60 hover:bg-neutral-50"
      }`}
    >
      <div
        className="flex items-center justify-between p-4 cursor-pointer select-none"
        onClick={() => onToggle(!enabled)}
      >
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onToggle(e.target.checked)}
            onClick={(e) => e.stopPropagation()}
            className="h-4 w-4 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
          />
          <div className="flex items-center gap-2">
            <Icon size={16} className={enabled ? "text-emerald-700" : "text-neutral-500"} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-neutral-900">{title}</span>
                {badge && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    {badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500">{subtitle}</p>
            </div>
          </div>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-md border transition ${
            enabled
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-white text-neutral-600 border-neutral-200"
          }`}
        >
          {enabled ? "Active (Hide)" : "+ Enable / Expand"}
        </span>
      </div>
      {enabled && (
        <div className="p-4 border-t border-neutral-200 animate-in fade-in duration-150 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Product Editor: Streamlined 80/20 Entry + Progressive Disclosure   */
/* ------------------------------------------------------------------ */

export function ProductEditor({ productId, cloneFromId, data, notify, reload, back }: any) {
  const isNew = !productId;
  const isCloning = !productId && !!cloneFromId;
  const fetchId = productId || cloneFromId;
  const [loading, setLoading] = useState(!!fetchId);

  // Progressive Disclosure Toggles
  const [showVariants, setShowVariants] = useState(false);
  const [showTaste, setShowTaste] = useState(false);
  const [showSeo, setShowSeo] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showFaqs, setShowFaqs] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [showRelated, setShowRelated] = useState(false);
  const [showCustomSpecs, setShowCustomSpecs] = useState(false);

  const [form, setForm] = useState<any>({
    title: "",
    handle: "",
    descriptionHtml: "",
    vendor: "",
    productType: "",
    tags: "",
    status: "ACTIVE",
    price: "",
    compareAtPrice: "",
    sku: "",
    barcode: "",
    inventoryQuantity: "",
    cost: "",
    weightKg: "",
    taxable: true,
    requiresShipping: true,
    tracked: true,
    seoTitle: "",
    seoDescription: "",
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
    if (!fetchId) return;
    api({ action: "productDetail", id: fetchId }).then((r) => {
      if (!r.ok) {
        notify("Error: " + (r.error || "could not load product"));
        back();
        return;
      }
      const d = r.detail;
      setForm({
        title: isCloning ? `${d.title} (Copy)` : d.title,
        handle: isCloning ? "" : d.handle,
        descriptionHtml: d.descriptionHtml,
        vendor: d.vendor,
        productType: d.productType,
        tags: d.tags,
        status: isCloning ? "DRAFT" : d.status,
        price: isCloning ? (d.variants?.[0]?.price || "") : "",
        compareAtPrice: isCloning ? (d.variants?.[0]?.compareAtPrice || "") : "",
        sku: isCloning ? "" : (d.variants?.[0]?.sku || ""),
        barcode: isCloning ? "" : (d.variants?.[0]?.barcode || ""),
        inventoryQuantity: isCloning ? (d.variants?.[0]?.inventoryQuantity ?? "50") : "",
        cost: isCloning ? "" : (d.variants?.[0]?.cost || ""),
        weightKg: isCloning ? "" : (d.variants?.[0]?.weightKg || ""),
        taxable: d.variants?.[0]?.taxable !== false,
        requiresShipping: d.variants?.[0]?.requiresShipping !== false,
        tracked: d.variants?.[0]?.tracked !== false,
        seoTitle: isCloning ? "" : (d.seoTitle || ""),
        seoDescription: isCloning ? "" : (d.seoDescription || ""),
      });

      if (isCloning) {
        setVariants([]);
        setNewVariants(
          (d.variants || []).map((v: any) => ({
            options: (v.selectedOptions || []).map((s: any) => s.value),
            price: v.price,
            compareAtPrice: v.compareAtPrice,
            sku: "",
            barcode: "",
            inventoryQuantity: v.inventoryQuantity ?? "50",
            cost: v.cost || "",
            weightKg: v.weightKg || "",
            taxable: v.taxable ?? true,
            requiresShipping: v.requiresShipping ?? true,
            tracked: v.tracked ?? true,
          }))
        );
        setMedia(d.media || []);
      } else {
        setVariants(d.variants || []);
        setMedia(d.media || []);
      }

      setCollectionIds(d.collections || []);
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
        if (Array.isArray(custom)) {
          for (const r of custom) {
            if (r?.name && r?.value) {
              rows.push({ key: null, label: String(r.name), value: String(r.value) });
              setShowCustomSpecs(true);
            }
          }
        }
      } catch {
        /* ignore */
      }
      setSpecRows(rows);
      setOrigSpecKeys(isCloning ? [] : presentKeys);
      setNicOpts(parseJsonList(d.vape?.nicotine_options).join(", "));
      setSelFlavors(parseJsonList(d.vape?.flavors));
      setFaqs((d.faqs || []).map((f: any) => ({ id: isCloning ? undefined : f.id, question: f.question, answer: f.answer })));
      setReviews(
        (d.reviews || []).map((rv: any) => ({
          id: isCloning ? undefined : rv.id,
          author: rv.author,
          rating: rv.rating,
          title: rv.title,
          body: rv.body,
          verified: rv.verified,
        }))
      );
      setRelated(d.related || []);

      const vi: Record<string, any> = {};
      for (const v of d.variants || []) {
        const t = (v.selectedOptions || []).map((s: any) => s.value);
        vi[tupleKey(t)] = v.media && v.media[0] ? { mediaId: v.media[0].id } : null;
      }
      setVariantImages(vi);

      // Auto-detect & expand active modules
      if ((d.options || []).length > 0) setShowVariants(true);
      if (!isCloning && (d.seoTitle || d.seoDescription || (d.handle && d.handle !== ""))) setShowSeo(true);
      if (
        d.vape?.flavor_family ||
        d.vape?.sweetness ||
        d.vape?.cooling ||
        d.vape?.throat_hit ||
        d.vape?.top_note ||
        (d.vape?.flavors && d.vape.flavors !== "[]")
      ) {
        setShowTaste(true);
      }
      if (d.variants?.some((v: any) => v.sku || v.barcode || v.cost || v.weightKg)) setShowInventory(true);
      if ((d.faqs || []).length > 0) setShowFaqs(true);
      if ((d.reviews || []).length > 0) setShowReviews(true);
      if ((d.related || []).length > 0) setShowRelated(true);

      setLoading(false);
    });
  }, [fetchId, isCloning, notify, back]);

  const set = (k: string, v: any) => setForm({ ...form, [k]: v });

  const MAIN_HANDLES = ["disposable-vape", "e-liquids", "terea", "iqos", "juul"];
  const mainCollections = (data.collections || []).filter((c: any) => MAIN_HANDLES.includes(c.handle));
  const toggleCollection = (id: string) =>
    setCollectionIds(collectionIds.includes(id) ? collectionIds.filter((x) => x !== id) : [...collectionIds, id]);

  // Variant calculations
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
      v: {
        options: tuple,
        price: basePrice,
        compareAtPrice: isNew ? form.compareAtPrice : "",
        sku: "",
        barcode: "",
        inventoryQuantity: baseStock,
        cost: "",
        weightKg: "",
        taxable: true,
        requiresShipping: true,
        tracked: true,
      },
    };
  };

  const setRowField = (tuple: string[], field: string, value: any) => {
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
      notify("Keep at least one variant — you cannot delete them all.");
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
  const setFirstVariant = (field: string, value: any) =>
    setVariants(variants.map((x: any, i: number) => (i === 0 ? { ...x, [field]: value } : x)));

  const simplePrice = isNew ? form.price : (firstVariant?.price ?? "");
  const simpleCompare = isNew ? form.compareAtPrice : (firstVariant?.compareAtPrice ?? "");
  const simpleStock = isNew ? form.inventoryQuantity : (firstVariant?.inventoryQuantity ?? "");
  const simpleCost = isNew ? (form.cost ?? "") : (firstVariant?.cost ?? "");
  const simpleWeightKg = isNew ? (form.weightKg ?? "") : (firstVariant?.weightKg ?? "");
  const simpleTaxable = isNew ? (form.taxable !== false) : (firstVariant?.taxable !== false);
  const simpleRequiresShipping = isNew ? (form.requiresShipping !== false) : (firstVariant?.requiresShipping !== false);
  const simpleTracked = isNew ? (form.tracked !== false) : (firstVariant?.tracked !== false);

  const setSimplePrice = (v: string) => (isNew ? set("price", v) : setFirstVariant("price", v));
  const setSimpleCompare = (v: string) => (isNew ? set("compareAtPrice", v) : setFirstVariant("compareAtPrice", v));
  const setSimpleStock = (v: string) => (isNew ? set("inventoryQuantity", v) : setFirstVariant("inventoryQuantity", v));
  const setSimpleCost = (v: string) => (isNew ? set("cost", v) : setFirstVariant("cost", v));
  const setSimpleWeightKg = (v: string) => (isNew ? set("weightKg", v) : setFirstVariant("weightKg", v));
  const setSimpleFlag = (field: string, v: boolean) =>
    isNew ? set(field, v) : setVariants(variants.map((x: any, i: number) => (i === 0 ? { ...x, [field]: v } : x)));

  // Specs helper
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
      notify("Image uploaded — click Save to attach.");
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
      notify("Product title is required.");
      return;
    }
    if (!collectionIds.length) {
      notify("Select at least one collection so this product shows in the store.");
      return;
    }
    setSaving(true);

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
      title: form.title,
      handle: form.handle || undefined,
      descriptionHtml: form.descriptionHtml,
      vendor: form.vendor,
      productType: form.productType,
      tags: form.tags,
      status: form.status,
      seoTitle: form.seoTitle,
      seoDescription: form.seoDescription,
      collectionIds,
      vape: vapePayload,
      vapeDeleteKeys,
      locationId: data.locationId,
      mediaSources: newMedia.map((m) => m.source),
      mediaAlts: newMedia.map((m) => m.alt || ""),
      mediaAltUpdates,
      variantMedia,
      faqs: faqs.map((f: any, i: number) => ({ id: f.id, question: f.question, answer: f.answer, position: i })),
      reviews: reviews.map((r: any, i: number) => ({
        id: r.id,
        author: r.author,
        rating: r.rating,
        title: r.title,
        body: r.body,
        verified: r.verified,
        position: i,
      })),
      relatedHandles: related.map((r: any) => r.handle),
    };

    let r: any;
    if (isNew) {
      const cleanOptions = showVariants ? liveOptions.map((o: any) => ({ name: o.name, values: o.values })) : [];
      const comboList = showVariants ? visibleCombos() : [[]];
      const payload: any = {
        ...base,
        price: form.price,
        compareAtPrice: form.compareAtPrice,
        sku: form.sku,
        barcode: form.barcode,
        inventoryQuantity: form.inventoryQuantity,
        cost: form.cost,
        weightKg: form.weightKg,
        taxable: form.taxable,
        requiresShipping: form.requiresShipping,
        tracked: form.tracked,
        options: cleanOptions,
      };

      if (cleanOptions.length) {
        const toOptionValues = (t: string[]) =>
          t.map((val: string, i: number) => ({ optionName: cleanOptions[i].name, name: val }));
        payload.variants = comboList.map((t) => {
          const nv = newVariantFor(t);
          return {
            options: t,
            optionValues: toOptionValues(t),
            price: nv ? nv.price : form.price || "0",
            compareAtPrice: nv ? nv.compareAtPrice : form.compareAtPrice || "",
            sku: nv ? nv.sku : "",
            barcode: nv ? nv.barcode : "",
            inventoryQuantity: nv ? nv.inventoryQuantity : form.inventoryQuantity || "0",
            cost: nv ? nv.cost : form.cost || "",
            weightKg: nv ? nv.weightKg : form.weightKg || "",
            taxable: nv ? nv.taxable : form.taxable ?? true,
            requiresShipping: nv ? nv.requiresShipping : form.requiresShipping ?? true,
            tracked: nv ? nv.tracked : form.tracked ?? true,
          };
        });
      }

      r = await api({ action: "product.create", payload });
    } else {
      const comboList = showVariants ? visibleCombos() : [[]];
      const matchedIds = new Set<string>();
      const newFromCombos: any[] = [];
      for (const t of comboList) {
        const m = matchVariant(t);
        if (m) {
          matchedIds.add(m.id);
          continue;
        }
        const nv = newVariantFor(t);
        if (nv) {
          if (nv.price !== "") newFromCombos.push(nv);
          continue;
        }
        newFromCombos.push({
          options: t,
          price: variants[0]?.price || "0",
          compareAtPrice: "",
          sku: "",
          barcode: "",
          inventoryQuantity: variants[0]?.inventoryQuantity ?? "",
          cost: variants[0]?.cost ?? "",
          weightKg: variants[0]?.weightKg ?? "",
          taxable: variants[0]?.taxable ?? true,
          requiresShipping: variants[0]?.requiresShipping ?? true,
          tracked: variants[0]?.tracked ?? true,
        });
      }

      const kept = variants.filter((v: any) => matchedIds.has(v.id));
      const orphans = variants.filter((v: any) => !matchedIds.has(v.id));
      const toOptionValues = (t: string[]) =>
        t.map((val: string, i: number) => ({ optionName: liveOptions[i]?.name || "", name: val })).filter((x: any) => x.optionName);
      const newWithValues = newFromCombos.map((nv: any) => ({
        ...nv,
        optionValues: toOptionValues(nv.options || []),
      }));

      r = await api({
        action: "product.update",
        payload: {
          ...base,
          id: productId,
          variantUpdates: kept.map((v: any) => ({
            id: v.id,
            price: v.price,
            compareAtPrice: v.compareAtPrice,
            sku: v.sku,
            barcode: v.barcode,
            taxable: v.taxable,
          })),
          inventoryUpdates: kept.map((v: any) => ({
            inventoryItemId: v.inventoryItemId,
            quantity: v.inventoryQuantity,
            cost: v.cost,
            weightKg: v.weightKg,
            requiresShipping: v.requiresShipping,
            tracked: v.tracked,
          })),
          newVariants: newWithValues,
          deleteVariantIds: [...deleteVariantIds, ...orphans.map((v: any) => v.id)],
          deleteMediaIds,
        },
      });
    }

    setSaving(false);
    if (r.ok) {
      notify(r.message || "Product saved successfully.");
      reload();
      back();
    } else {
      notify("Error: " + (r.error || "Save failed"));
    }
  };

  const doDelete = async () => {
    if (!window.confirm(`Delete "${form.title}" permanently? This cannot be undone.`)) return;
    const r = await api({ action: "product.delete", id: productId });
    if (r.ok) {
      notify(r.message);
      reload();
      back();
    } else {
      notify("Error: " + (r.error || "delete failed"));
    }
  };

  if (loading) return <p className="text-neutral-500 py-8 text-center">Loading product data…</p>;

  const liveMedia = media.filter((m: any) => !deleteMediaIds.includes(m.id));
  const imageOptions = [
    ...liveMedia.map((m: any) => ({ key: `id:${m.id}`, label: m.altText || m.url.split("/").pop(), url: m.url })),
    ...newMedia.map((m: any) => ({ key: `src:${m.source}`, label: m.source.split("/").pop(), url: m.preview })),
  ];
  const variantImageKey = (t: string[]) => {
    const p = variantImages[tupleKey(t)];
    if (!p) return "";
    if (p.mediaId) return `id:${p.mediaId}`;
    if (p.mediaSource) return `src:${p.mediaSource}`;
    return "";
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-16">
      {/* Sticky Top Action Bar */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-neutral-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={back}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-neutral-900 truncate max-w-sm sm:max-w-md">
                {isNew ? (isCloning ? "Duplicate Product" : "New Product") : form.title}
              </h1>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  form.status === "ACTIVE"
                    ? "bg-emerald-100 text-emerald-800"
                    : form.status === "DRAFT"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-neutral-200 text-neutral-700"
                }`}
              >
                {form.status}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              {isCloning ? "Prefilled with clone specs. Update title and save." : "80/20 Express Entry: Core specs ready in 30 seconds."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isNew && (
            <button
              type="button"
              onClick={doDelete}
              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
            >
              <Trash2 size={13} /> Delete
            </button>
          )}
          <button
            type="button"
            onClick={doSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 transition disabled:opacity-50"
          >
            <Save size={15} /> {saving ? "Saving…" : isNew ? "Create Product" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. PRIMARY ESSENTIALS CARD (Above the fold - what 80% of entries need) */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-white text-xs font-bold">1</span>
            <h2 className="text-base font-bold text-neutral-900">Core Product Information</h2>
          </div>
          <span className="text-xs text-neutral-500 font-medium">Standard E-Commerce Fields</span>
        </div>

        {/* Title & Category */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1">
            <Lbl>Product Title *</Lbl>
            <Inp
              placeholder="e.g. Elfbar BC10000 Puffs Disposable Vape"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Lbl>Store Status</Lbl>
            <Sel value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="ACTIVE">Active (Live in store)</option>
              <option value="DRAFT">Draft (Staff only)</option>
              <option value="ARCHIVED">Archived (Hidden)</option>
            </Sel>
          </div>
        </div>

        {/* Collections / Categories */}
        <div className="space-y-2">
          <Lbl>Collections & Categories * (Tap to pick)</Lbl>
          <div className="flex flex-wrap gap-1.5">
            {mainCollections.map((c: any) => {
              const on = collectionIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCollection(c.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold border transition ${
                    on
                      ? "bg-emerald-700 text-white border-emerald-700 shadow-2xs"
                      : "bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50"
                  }`}
                >
                  {c.title} {on ? "✓" : "+"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="space-y-1">
            <Lbl>Selling Price (AED) *</Lbl>
            <Inp
              type="number"
              placeholder="e.g. 120"
              value={liveOptions.length === 0 ? simplePrice : (form.price || variants[0]?.price || "")}
              onChange={(e) => setSimplePrice(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Lbl>Old / Strikethrough Price (Optional)</Lbl>
            <Inp
              type="number"
              placeholder="e.g. 150"
              value={liveOptions.length === 0 ? simpleCompare : (form.compareAtPrice || variants[0]?.compareAtPrice || "")}
              onChange={(e) => setSimpleCompare(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Lbl>Stock Quantity (Inventory)</Lbl>
            <Inp
              type="number"
              placeholder="e.g. 50"
              value={liveOptions.length === 0 ? simpleStock : (form.inventoryQuantity || variants[0]?.inventoryQuantity || "")}
              onChange={(e) => setSimpleStock(e.target.value)}
            />
          </div>
        </div>

        {/* Photos */}
        <div className="space-y-2 pt-1 border-t border-neutral-100">
          <Lbl>Product Photos</Lbl>
          <div className="flex flex-wrap items-center gap-3">
            {liveMedia.map((m: any) => (
              <div key={m.id} className="relative group h-20 w-20 rounded-xl overflow-hidden border border-neutral-200 bg-white">
                <Image src={m.url} alt="" fill sizes="80px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => setDeleteMediaIds([...deleteMediaIds, m.id])}
                  className="absolute inset-0 bg-red-900/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  title="Remove image"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {newMedia.map((m: any, i: number) => (
              <div key={i} className="relative group h-20 w-20 rounded-xl overflow-hidden border-2 border-emerald-500 bg-white">
                <Image src={m.preview} alt="" fill sizes="80px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => setNewMedia(newMedia.filter((_: any, j: number) => j !== i))}
                  className="absolute inset-0 bg-red-900/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            <label className="flex h-20 w-32 flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 hover:bg-neutral-100 cursor-pointer transition">
              <Upload size={16} className="text-neutral-500 mb-1" />
              <span className="text-[11px] font-bold text-neutral-700">{uploading ? "Uploading…" : "+ Add Image"}</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onUpload(e.target.files)} />
            </label>
          </div>
        </div>

        {/* Essential Hardware Specs */}
        <div className="space-y-3 pt-3 border-t border-neutral-100">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800">Key Vape Specifications</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <Lbl>Puff Count</Lbl>
              <Inp
                placeholder="e.g. 10000"
                value={specValue("puffs")}
                onChange={(e) => setSpec("puffs", e.target.value, "Puff count")}
              />
              <div className="flex flex-wrap gap-1 mt-1">
                {PUFF_PRESETS.slice(0, 4).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSpec("puffs", p, "Puff count")}
                    className="text-[10px] bg-neutral-100 hover:bg-neutral-200 rounded px-1 text-neutral-600"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Lbl>Nicotine Strength</Lbl>
              <Inp
                placeholder="e.g. 50mg"
                value={specValue("nicotine_strength")}
                onChange={(e) => setSpec("nicotine_strength", e.target.value, "Nicotine strength")}
              />
              <div className="flex flex-wrap gap-1 mt-1">
                {NICOTINE_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSpec("nicotine_strength", p, "Nicotine strength")}
                    className="text-[10px] bg-neutral-100 hover:bg-neutral-200 rounded px-1 text-neutral-600"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Lbl>E-liquid Capacity</Lbl>
              <Inp
                placeholder="e.g. 16ml"
                value={specValue("e_liquid_capacity")}
                onChange={(e) => setSpec("e_liquid_capacity", e.target.value, "E-liquid")}
              />
              <div className="flex flex-wrap gap-1 mt-1">
                {CAPACITY_PRESETS.slice(0, 3).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSpec("e_liquid_capacity", p, "E-liquid")}
                    className="text-[10px] bg-neutral-100 hover:bg-neutral-200 rounded px-1 text-neutral-600"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Lbl>Battery & Charging</Lbl>
              <Inp
                placeholder="e.g. 650mAh (Type-C)"
                value={specValue("battery_capacity")}
                onChange={(e) => setSpec("battery_capacity", e.target.value, "Battery")}
              />
              <div className="flex flex-wrap gap-1 mt-1">
                {BATTERY_PRESETS.slice(0, 3).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSpec("battery_capacity", p, "Battery")}
                    className="text-[10px] bg-neutral-100 hover:bg-neutral-200 rounded px-1 text-neutral-600"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1 pt-2 border-t border-neutral-100">
          <Lbl>Product Description</Lbl>
          <RichText
            value={form.descriptionHtml}
            onChange={(v) => set("descriptionHtml", v)}
            placeholder="Authentic manufacturer description and feature points…"
            minHeight={110}
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PROGRESSIVE DISCLOSURE: OPTIONAL MODULES (Collapsed by default)       */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 text-neutral-800 text-xs font-bold">2</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-700">Optional & Advanced Modules</h2>
          </div>
          <span className="text-xs text-neutral-400">Enable only what this product needs</span>
        </div>

        {/* 1. Variants Module */}
        <CollapsibleCard
          icon={Layers}
          title="Product Variants & Multi-Option Matrix"
          subtitle="Add options like Flavors, Colors, or Pack Sizes with distinct price & stock"
          badge={liveOptions.length ? `${liveOptions.length} Options (${visibleCombos().length} Combos)` : undefined}
          enabled={showVariants}
          onToggle={setShowVariants}
        >
          {options.map((o: any, oi: number) => (
            <div key={oi} className="grid sm:grid-cols-[160px_1fr_auto] gap-2 mb-2">
              <Inp
                value={o.name}
                placeholder="Option name (e.g. Flavor)"
                onChange={(e) => setOptions(options.map((x: any, j: number) => (j === oi ? { ...x, name: e.target.value } : x)))}
              />
              <ValueChips
                values={o.values || []}
                onChange={(next) => setOptions(options.map((x: any, j: number) => (j === oi ? { ...x, values: next } : x)))}
                placeholder="Type a value and press Enter"
                emptyText="No values yet."
              />
              <button
                type="button"
                onClick={() => setOptions(options.filter((_: any, j: number) => j !== oi))}
                className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-700 hover:bg-red-100"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => options.length < 3 && setOptions([...options, { name: "", values: [] }])}
            disabled={options.length >= 3}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 disabled:opacity-40"
          >
            <Plus size={14} /> Add option {options.length >= 3 ? "(Max 3)" : ""}
          </button>

          {visibleCombos().length > 0 && (
            <div className="mt-4 space-y-2 border-t pt-3">
              <span className="text-xs font-bold text-neutral-700">Variant Matrix ({visibleCombos().length}):</span>
              {visibleCombos().map((t) => {
                const v = rowFor(t).v;
                return (
                  <div key={tupleKey(t)} className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-lg border border-neutral-200 bg-neutral-50">
                    <span className="font-bold text-neutral-900 text-xs min-w-[120px]">{tupleLabel(t)}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24">
                        <Inp
                          type="number"
                          placeholder="Price"
                          value={v.price ?? ""}
                          onChange={(e) => setRowField(t, "price", e.target.value)}
                        />
                      </div>
                      <div className="w-24">
                        <Inp
                          type="number"
                          placeholder="Stock"
                          value={v.inventoryQuantity ?? ""}
                          onChange={(e) => setRowField(t, "inventoryQuantity", e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteTuple(t)}
                        className="rounded p-1 text-neutral-400 hover:text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CollapsibleCard>

        {/* 2. Sensory & Taste Profile Module */}
        <CollapsibleCard
          icon={Droplets}
          title="Sensory & Taste Profile"
          subtitle="Sweetness, cooling, throat hit scores, notes & flavor links"
          badge={specValue("flavor_family") ? "Taste Active" : undefined}
          enabled={showTaste}
          onToggle={setShowTaste}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <Lbl>Flavor Family</Lbl>
              <Sel
                value={specValue("flavor_family")}
                onChange={(e) => setSpec("flavor_family", e.target.value, "Flavor family")}
              >
                <option value="">Select…</option>
                {PRESET_CHOICES.flavor_family.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Sel>
            </div>
            <div>
              <Lbl>Sweetness (1-5)</Lbl>
              <Inp
                type="number"
                min={1}
                max={5}
                placeholder="1-5"
                value={specValue("sweetness")}
                onChange={(e) => setSpec("sweetness", e.target.value, "Sweetness")}
              />
            </div>
            <div>
              <Lbl>Cooling (1-5)</Lbl>
              <Inp
                type="number"
                min={1}
                max={5}
                placeholder="1-5"
                value={specValue("cooling")}
                onChange={(e) => setSpec("cooling", e.target.value, "Cooling")}
              />
            </div>
            <div>
              <Lbl>Throat Hit (1-5)</Lbl>
              <Inp
                type="number"
                min={1}
                max={5}
                placeholder="1-5"
                value={specValue("throat_hit")}
                onChange={(e) => setSpec("throat_hit", e.target.value, "Throat hit")}
              />
            </div>
          </div>

          <div className="pt-2">
            <Lbl>Connected Flavors from Library</Lbl>
            <FlavourPicker
              flavors={data.flavors}
              selected={selFlavors}
              onToggle={(id: string, on: boolean) =>
                setSelFlavors(on ? selFlavors.filter((x) => x !== id) : [...selFlavors, id])
              }
            />
          </div>
        </CollapsibleCard>

        {/* 3. SEO & Search Engine Listing Module */}
        <CollapsibleCard
          icon={Tag}
          title="SEO & Search Engine Listing"
          subtitle="Custom meta title, meta description, and URL slug"
          badge={form.seoTitle ? "Custom SEO" : undefined}
          enabled={showSeo}
          onToggle={setShowSeo}
        >
          <div className="space-y-3">
            <div>
              <Lbl>Search Page Title (Meta Title)</Lbl>
              <Inp
                placeholder="Leave blank to use product title"
                value={form.seoTitle}
                onChange={(e) => set("seoTitle", e.target.value)}
              />
            </div>
            <div>
              <Lbl>Search Short Description (Meta Description)</Lbl>
              <Inp
                placeholder="Brief summary for Google snippets"
                value={form.seoDescription}
                onChange={(e) => set("seoDescription", e.target.value)}
              />
            </div>
            <div>
              <Lbl>Custom URL Slug (Handle)</Lbl>
              <Inp
                placeholder="e.g. elfbar-bc10000-disposable-vape"
                value={form.handle}
                onChange={(e) => set("handle", e.target.value)}
              />
              <span className="text-[11px] text-neutral-400 mt-0.5 block">
                URL: /products/{form.handle || "…"}
              </span>
            </div>
          </div>
        </CollapsibleCard>

        {/* 4. Detailed Inventory & Shipping */}
        <CollapsibleCard
          icon={Sliders}
          title="Detailed Inventory, Shipping & Tax"
          subtitle="SKU, barcode, unit cost, weight, tax & tracking flags"
          badge={form.sku ? `SKU: ${form.sku}` : undefined}
          enabled={showInventory}
          onToggle={setShowInventory}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <Lbl>SKU</Lbl>
              <Inp value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="SKU" />
            </div>
            <div>
              <Lbl>Barcode</Lbl>
              <Inp value={form.barcode} onChange={(e) => set("barcode", e.target.value)} placeholder="Barcode" />
            </div>
            <div>
              <Lbl>Cost per item (AED)</Lbl>
              <Inp type="number" value={simpleCost} onChange={(e) => setSimpleCost(e.target.value)} placeholder="Cost" />
            </div>
            <div>
              <Lbl>Weight (kg)</Lbl>
              <Inp type="number" value={simpleWeightKg} onChange={(e) => setSimpleWeightKg(e.target.value)} placeholder="kg" />
            </div>
          </div>
          <div className="flex flex-wrap gap-4 pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700 cursor-pointer">
              <input type="checkbox" checked={simpleTaxable} onChange={(e) => setSimpleFlag("taxable", e.target.checked)} />
              Charge tax on this product
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700 cursor-pointer">
              <input type="checkbox" checked={simpleRequiresShipping} onChange={(e) => setSimpleFlag("requiresShipping", e.target.checked)} />
              Physical product (Requires shipping)
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700 cursor-pointer">
              <input type="checkbox" checked={simpleTracked} onChange={(e) => setSimpleFlag("tracked", e.target.checked)} />
              Track inventory quantity
            </label>
          </div>
        </CollapsibleCard>

        {/* 5. Product FAQs */}
        <CollapsibleCard
          icon={HelpCircle}
          title="Product FAQs"
          subtitle="Specific questions and answers for this product accordion"
          badge={faqs.length ? `${faqs.length} FAQs` : undefined}
          enabled={showFaqs}
          onToggle={setShowFaqs}
        >
          <div className="space-y-3">
            {faqs.map((f: any, i: number) => (
              <div key={f.id || `faq-${i}`} className="rounded-lg border border-neutral-200 p-3 bg-neutral-50 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Inp
                    placeholder="Question"
                    value={f.question}
                    onChange={(e) => setFaqs(faqs.map((x: any, j: number) => (j === i ? { ...x, question: e.target.value } : x)))}
                  />
                  <button
                    type="button"
                    onClick={() => setFaqs(faqs.filter((_: any, j: number) => j !== i))}
                    className="p-1 text-neutral-400 hover:text-red-600"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <RichText
                  value={f.answer}
                  onChange={(v) => setFaqs(faqs.map((x: any, j: number) => (j === i ? { ...x, answer: v } : x)))}
                  placeholder="Answer…"
                  minHeight={70}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFaqs([...faqs, { question: "", answer: "" }])}
              className="inline-flex items-center gap-1 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              <Plus size={13} /> Add FAQ
            </button>
          </div>
        </CollapsibleCard>

        {/* 6. Customer Reviews */}
        <CollapsibleCard
          icon={Star}
          title="Customer Testimonials & Reviews"
          subtitle="Manual review entries and buyer ratings"
          badge={reviews.length ? `${reviews.length} Reviews` : undefined}
          enabled={showReviews}
          onToggle={setShowReviews}
        >
          <div className="space-y-3">
            {reviews.map((r: any, i: number) => (
              <div key={r.id || `rev-${i}`} className="rounded-lg border border-neutral-200 p-3 bg-neutral-50 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    <Inp
                      placeholder="Author name"
                      value={r.author}
                      onChange={(e) => setReviews(reviews.map((x: any, j: number) => (j === i ? { ...x, author: e.target.value } : x)))}
                    />
                    <Sel
                      value={String(r.rating ?? 5)}
                      onChange={(e) => setReviews(reviews.map((x: any, j: number) => (j === i ? { ...x, rating: parseInt(e.target.value, 10) } : x)))}
                    >
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>{n} Stars</option>
                      ))}
                    </Sel>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReviews(reviews.filter((_: any, j: number) => j !== i))}
                    className="p-1 text-neutral-400 hover:text-red-600"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <Inp
                  placeholder="Review title"
                  value={r.title}
                  onChange={(e) => setReviews(reviews.map((x: any, j: number) => (j === i ? { ...x, title: e.target.value } : x)))}
                />
                <RichText
                  value={r.body}
                  onChange={(v) => setReviews(reviews.map((x: any, j: number) => (j === i ? { ...x, body: v } : x)))}
                  placeholder="Review comment…"
                  minHeight={70}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setReviews([...reviews, { author: "", rating: 5, title: "", body: "", verified: true }])}
              className="inline-flex items-center gap-1 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              <Plus size={13} /> Add Review
            </button>
          </div>
        </CollapsibleCard>

        {/* 7. Related Products */}
        <CollapsibleCard
          icon={ExternalLink}
          title="Related Products & Recommendations"
          subtitle="Hand-picked cross-sells shown on the product page"
          badge={related.length ? `${related.length} Products` : undefined}
          enabled={showRelated}
          onToggle={setShowRelated}
        >
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {related.map((r: any) => (
                <span key={r.handle} className="inline-flex items-center gap-1 rounded-md bg-neutral-900 text-white px-2.5 py-1 text-xs font-semibold">
                  {r.title}
                  <button type="button" onClick={() => setRelated(related.filter((x: any) => x.handle !== r.handle))}>
                    <X size={12} />
                  </button>
                </span>
              ))}
              {!related.length && <span className="text-xs text-neutral-500">No related products selected.</span>}
            </div>

            <div className="flex gap-2">
              <Inp
                placeholder="Search product by title…"
                value={relQuery}
                onChange={(e) => setRelQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchRelated()}
              />
              <button
                type="button"
                onClick={searchRelated}
                className="shrink-0 rounded-md bg-neutral-900 px-3 py-2 text-xs font-bold text-white"
              >
                {relSearching ? "Searching…" : "Search"}
              </button>
            </div>

            {relResults.length > 0 && (
              <div className="rounded-lg border border-neutral-200 divide-y divide-neutral-100 max-h-40 overflow-y-auto">
                {relResults.map((p: any) => {
                  const added = related.some((x: any) => x.handle === p.handle);
                  return (
                    <div key={p.handle} className="flex items-center justify-between p-2 text-xs">
                      <span className="font-medium text-neutral-800">{p.title}</span>
                      <button
                        type="button"
                        disabled={added}
                        onClick={() => !added && setRelated([...related, { handle: p.handle, title: p.title }])}
                        className="rounded px-2 py-1 font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-40"
                      >
                        {added ? "✓ Added" : "+ Add"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CollapsibleCard>
      </div>

      {/* Sticky Bottom Bar on Mobile/Desktop */}
      <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
        <button
          type="button"
          onClick={back}
          className="text-xs font-semibold text-neutral-600 hover:text-neutral-900"
        >
          Cancel & Return to list
        </button>
        <button
          type="button"
          onClick={doSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-neutral-800 transition disabled:opacity-50"
        >
          <Save size={16} /> {saving ? "Saving…" : isNew ? "Create Product" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
