"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Trash2, Save, X, Upload, Table } from "lucide-react";
import { BulkSheet } from "./bulk-sheet";

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

/* ------------------------------------------------------------------ */
/*  Products: list + full create/edit form                             */
/* ------------------------------------------------------------------ */

const KNOWN_SPECS: { key: string; label: string; type?: string }[] = [
  { key: "badge", label: "Badge (BEST SELLER / NEW)" },
  { key: "subtitle", label: "Subtitle" },
  { key: "short_description", label: "Short description" },
  { key: "puffs", label: "Puff count", type: "number" },
  { key: "puff_range", label: "Puff range (e.g. 10000 Puffs)" },
  { key: "nicotine_strength", label: "Nicotine strength (20mg)" },
  { key: "battery_capacity", label: "Battery" },
  { key: "coil_type", label: "Coil" },
  { key: "charging_type", label: "Charging" },
  { key: "e_liquid_capacity", label: "E-liquid" },
  { key: "activation", label: "Activation" },
  { key: "vg_pg_ratio", label: "VG/PG ratio" },
  { key: "flavor_family", label: "Flavor family (fruit_ice / menthol / tobacco / dessert)" },
  { key: "sweetness", label: "Sweetness (1-5)", type: "number" },
  { key: "cooling", label: "Cooling (1-5)", type: "number" },
  { key: "throat_hit", label: "Throat hit (1-5)", type: "number" },
  { key: "top_note", label: "Top note" },
  { key: "heart_note", label: "Heart note" },
  { key: "base_note", label: "Base note" },
];
// NOTE: vape.rating / vape.review_count are deliberately NOT editable rows:
// reviews now come from the vm_product_review metaobjects (PR47).

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

export function ProductsManager({ data, notify, reload, initialQuery }: any) {
  const [view, setView] = useState<any>({ name: "list" });
  const [q, setQ] = useState(initialQuery || "");
  const [status, setStatus] = useState("ALL");
  const shown = (data.products || [])
    .filter((p: any) => (status === "ALL" || p.status === status) && (!q || p.title.toLowerCase().includes(q.toLowerCase())))
    .slice(0, 100);

  if (view.name === "bulk") {
    return <BulkSheet notify={notify} back={() => setView({ name: "list" })} />;
  }

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
        <div className="flex gap-2">
          <button
            onClick={() => setView({ name: "bulk" })}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
          >
            <Table size={15} /> Bulk Edit
          </button>
          <PrimaryBtn onClick={() => setView({ name: "new" })}>
            <Plus size={15} /> Add product
          </PrimaryBtn>
        </div>
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

function FlavourPicker({ flavors, selected, onToggle }: any) {
  return (
    <div className="flex flex-wrap gap-2">
      {(flavors || []).map((fl: any) => {
        const on = selected.includes(fl.id);
        return (
          <button
            key={fl.id}
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
  const [collectionIds, setCollectionIds] = useState<string[]>([]);
  // Shopify-style variant options (max 3): [{ name: "Flavor", values: ["Mango Ice", "Mint"] }]
  const [options, setOptions] = useState<any[]>([]);
  // Spec rows: known vape.* keys + free-form custom rows (key null).
  const [specRows, setSpecRows] = useState<any[]>([]);
  const [origSpecKeys, setOrigSpecKeys] = useState<string[]>([]);
  // Tuples the owner deleted this session (hidden until save).
  const [hiddenTuples, setHiddenTuples] = useState<string[]>([]);
  const [nicOpts, setNicOpts] = useState("");
  const [selFlavors, setSelFlavors] = useState<string[]>([]);
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
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const set = (k: string, v: any) => setForm({ ...form, [k]: v });

  // Simple mode: the elderly / non-technical owner only sees these fields.
  // Everything else (variants, SKU, barcode, 19 spec fields, SEO, handle)
  // stays untouched under Advanced.
  const [simple, setSimple] = useState(true);
  const MAIN_HANDLES = ["juul", "terea", "iqos", "disposable-vape", "e-liquids"];
  const mainCollections = (data.collections || []).filter((c: any) => MAIN_HANDLES.includes(c.handle));
  const toggleCollection = (id: string) =>
    setCollectionIds(collectionIds.includes(id) ? collectionIds.filter((x) => x !== id) : [...collectionIds, id]);
  const firstVariant = variants[0];
  const setFirstVariant = (field: string, value: string) =>
    setVariants(variants.map((x: any, i: number) => (i === 0 ? { ...x, [field]: value } : x)));
  const simplePrice = isNew ? form.price : (firstVariant?.price ?? "");
  const simpleCompare = isNew ? form.compareAtPrice : (firstVariant?.compareAtPrice ?? "");
  const simpleStock = isNew ? form.inventoryQuantity : (firstVariant?.inventoryQuantity ?? "");
  const setSimplePrice = (v: string) => (isNew ? set("price", v) : setFirstVariant("price", v));
  const setSimpleCompare = (v: string) => (isNew ? set("compareAtPrice", v) : setFirstVariant("compareAtPrice", v));
  const setSimpleStock = (v: string) => (isNew ? set("inventoryQuantity", v) : setFirstVariant("inventoryQuantity", v));

  // ---- Variant helpers (Shopify-style) ----
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
  // Row values for one combination: existing variant, edited new row, or defaults.
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
    vapePayload.nicotine_options = nicOpts.split(",").map((x: string) => x.trim()).filter(Boolean);
    vapePayload.flavors = selFlavors;
    const vapeDeleteKeys = origSpecKeys.filter(
      (k) => !specRows.some((r: any) => r.key === k && r.value && String(r.value).trim() !== "")
    );
    const base = {
      title: form.title, handle: form.handle || undefined, descriptionHtml: form.descriptionHtml,
      vendor: form.vendor, productType: form.productType, tags: form.tags, status: form.status,
      seoTitle: form.seoTitle, seoDescription: form.seoDescription,
      collectionIds, vape: vapePayload, vapeDeleteKeys, locationId: data.locationId,
      mediaSources: [...newMedia.map((m) => m.source), ...(imgUrl.trim() ? [imgUrl.trim()] : [])],
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
      // Options bodle gele purano variant gulo orphan hoy — segulo delete hobe,
      // notun combination gulo toiri hobe. Kintu shob variant ekbare delete noy:
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

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSimple(true)}
          className={`rounded-full px-4 py-2 text-sm font-bold ${simple ? "bg-neutral-900 text-white" : "bg-white border border-neutral-300 text-neutral-700"}`}
        >
          Shohoj (Simple)
        </button>
        <button
          onClick={() => setSimple(false)}
          className={`rounded-full px-4 py-2 text-sm font-bold ${!simple ? "bg-neutral-900 text-white" : "bg-white border border-neutral-300 text-neutral-700"}`}
        >
          Sob kichu (Advanced)
        </button>
      </div>

      {simple ? (
      <div className="max-w-2xl space-y-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h2 className="font-bold text-neutral-900 mb-1">1. Chhobi</h2>
          <p className="text-xs text-neutral-500 mb-3">Product-er chhobi dao — prothom chhobi-tai dokane boro kore dekhabe.</p>
          <div className="flex flex-wrap gap-3 mb-3">
            {media.filter((m: any) => !deleteMediaIds.includes(m.id)).map((m: any) => (
              <div key={m.id} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt="" className="h-24 w-24 rounded-lg object-cover border border-neutral-200" />
                <button onClick={() => setDeleteMediaIds([...deleteMediaIds, m.id])} className="absolute -top-2 -right-2 rounded-full bg-red-600 p-1 text-white shadow">
                  <X size={12} />
                </button>
              </div>
            ))}
            {newMedia.map((m: any, i: number) => (
              <div key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.preview} alt="" className="h-24 w-24 rounded-lg object-cover border border-emerald-300" />
                <button onClick={() => setNewMedia(newMedia.filter((_: any, j: number) => j !== i))} className="absolute -top-2 -right-2 rounded-full bg-red-600 p-1 text-white shadow">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          <label className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 cursor-pointer">
            <Upload size={15} /> {uploading ? "Uploading…" : "Chhobi dao"}
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onUpload(e.target.files)} />
          </label>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h2 className="font-bold text-neutral-900 mb-3">2. Product-er nam *</h2>
          <Inp value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="jemon: Juul Pods Menthol 4-Pack" />
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h2 className="font-bold text-neutral-900 mb-3">3. Dam (AED)</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Lbl>Bikri dam *</Lbl>
              <Inp type="number" value={simplePrice} onChange={(e) => setSimplePrice(e.target.value)} placeholder="100" />
            </div>
            <div>
              <Lbl>Ager dam (kete dekhabe — na dileo cholbe)</Lbl>
              <Inp type="number" value={simpleCompare} onChange={(e) => setSimpleCompare(e.target.value)} placeholder="120" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h2 className="font-bold text-neutral-900 mb-3">4. Stock — kotota ache</h2>
          <Inp type="number" value={simpleStock} onChange={(e) => setSimpleStock(e.target.value)} placeholder="100" />
          <p className="text-xs text-neutral-500 mt-1">0 dile &quot;Out of stock&quot; dekhabe.</p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h2 className="font-bold text-neutral-900 mb-3">5. Category — konta?</h2>
          <div className="flex flex-wrap gap-2">
            {mainCollections.map((c: any) => {
              const on = collectionIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleCollection(c.id)}
                  className={`rounded-full px-4 py-2 text-sm font-bold border ${on ? "bg-emerald-700 text-white border-emerald-700" : "bg-white text-neutral-700 border-neutral-300"}`}
                >
                  {c.title}
                </button>
              );
            })}
            {!mainCollections.length && <span className="text-xs text-neutral-500">Category load hoy nai — Advanced-e dekho.</span>}
          </div>
          <p className="text-xs text-neutral-500 mt-2">Sub-category (Juul 1/2, brand) lagle Advanced-e giye tick dao.</p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h2 className="font-bold text-neutral-900 mb-3">6. Biboron</h2>
          <TA rows={4} value={form.descriptionHtml} onChange={(e) => set("descriptionHtml", e.target.value)} placeholder="Product-ta ki, keno valo — 2-3 line-e likho" />
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h2 className="font-bold text-neutral-900 mb-3">7. Puff ar Nicotine</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Lbl>Puff kotota (shudhu number)</Lbl>
              <Inp type="number" value={specValue("puffs")} onChange={(e) => setSpec("puffs", e.target.value, "Puff count")} placeholder="15000" />
            </div>
            <div>
              <Lbl>Nicotine (jemon 20mg)</Lbl>
              <Inp value={specValue("nicotine_strength")} onChange={(e) => setSpec("nicotine_strength", e.target.value, "Nicotine strength (20mg)")} placeholder="20mg" />
            </div>
          </div>
        </div>

        {!isNew && options.length > 0 && (
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h2 className="font-bold text-neutral-900 mb-3">Variant-er dam/stock</h2>
          <p className="text-xs text-neutral-500 mb-3">Prottek flavour/pack-er dam ar stock ekhan theke bodlano jabe.</p>
          <div className="space-y-2">
            {visibleCombos().map((t) => {
              const v = rowFor(t).v;
              return (
                <div key={tupleKey(t)} className="grid grid-cols-[1fr_90px_80px] gap-2 items-center">
                  <span className="text-sm font-semibold text-neutral-700 truncate">{tupleLabel(t)}</span>
                  <Inp type="number" value={v.price ?? ""} onChange={(e) => setRowField(t, "price", e.target.value)} placeholder="Dam" />
                  <Inp type="number" value={v.inventoryQuantity ?? ""} onChange={(e) => setRowField(t, "inventoryQuantity", e.target.value)} placeholder="Stock" />
                </div>
              );
            })}
          </div>
        </div>
        )}

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h2 className="font-bold text-neutral-900 mb-3">8. Flavour — konta konta ache?</h2>
          <FlavourPicker flavors={data.flavors} selected={selFlavors} onToggle={(id: string, on: boolean) => setSelFlavors(on ? selFlavors.filter((x) => x !== id) : [...selFlavors, id])} />
          <p className="text-xs text-neutral-500 mt-2">Notun flavour add korte Flavors tab-e jao.</p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h2 className="font-bold text-neutral-900 mb-3">9. Dokane dekhabe?</h2>
          <div className="flex gap-2">
            <button
              onClick={() => set("status", "ACTIVE")}
              className={`rounded-full px-4 py-2 text-sm font-bold border ${form.status === "ACTIVE" ? "bg-emerald-700 text-white border-emerald-700" : "bg-white text-neutral-700 border-neutral-300"}`}
            >
              Ha, live koro
            </button>
            <button
              onClick={() => set("status", "DRAFT")}
              className={`rounded-full px-4 py-2 text-sm font-bold border ${form.status !== "ACTIVE" ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-700 border-neutral-300"}`}
            >
              Na, draft rakho
            </button>
          </div>
        </div>

        <PrimaryBtn onClick={doSave}>
          <Save size={15} /> {saving ? "Saving…" : "Save product"}
        </PrimaryBtn>
        <p className="text-xs text-neutral-500">Baki shob kichu (variant option, spec, SEO, barcode) Advanced-e ache — na bodleleo cholbe.</p>
      </div>
      ) : (
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
              <div>
                <Lbl>SEO title (Google search title — khali rakhle auto title hobe)</Lbl>
                <Inp value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} placeholder="e.g. Juul Pods Menthol 4-Pack | Vape Mart UAE" />
              </div>
              <div>
                <Lbl>SEO description (Google search snippet — khali rakhle auto description hobe)</Lbl>
                <TA rows={3} value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} placeholder="e.g. 100% authentic Juul pods with same-day Dubai delivery..." />
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

          {isNew && (
            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <h2 className="font-bold text-neutral-900 mb-3">Base price & stock</h2>
              <p className="text-xs text-neutral-500 mb-3">Variant thakle prottek variant-er dam Variants card-e alada kore bosbe; ekhane ja diba seta notun variant-er default hobe.</p>
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
            </div>
          )}

          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <h2 className="font-bold text-neutral-900 mb-3">Variants — Shopify-er moto</h2>
              <p className="text-xs text-neutral-500 mb-3">
                Option add koro (Flavor, Color, Pack Size — ja khushi, sorbochcho 3-ta), value gulo comma diye dao.
                Prottek combination-er nijer dam, ager dam, SKU ar stock hobe — jemon Mango Ice-er dam ek, 10 pcs box-er dam arek.
              </p>
              {options.map((o: any, oi: number) => (
                <div key={oi} className="grid sm:grid-cols-[160px_1fr_auto] gap-2 mb-2">
                  <Inp
                    value={o.name}
                    placeholder="Option nam (Flavor)"
                    onChange={(e) => setOptions(options.map((x: any, j: number) => (j === oi ? { ...x, name: e.target.value } : x)))}
                  />
                  <Inp
                    value={(o.values || []).join(", ")}
                    placeholder="Value gulo (Mango Ice, Mint)"
                    onChange={(e) => setOptions(options.map((x: any, j: number) => (j === oi ? { ...x, values: e.target.value.split(",").map((v: string) => v.trim()).filter(Boolean) } : x)))}
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

              <div className="mt-4 space-y-2">
                {visibleCombos().map((t) => {
                  const row = rowFor(t);
                  const v = row.v;
                  return (
                    <div key={tupleKey(t)} className="grid grid-cols-2 sm:grid-cols-[1fr_90px_90px_110px_80px_40px] gap-2 items-end">
                      <div>
                        <Lbl>{tupleLabel(t)}</Lbl>
                        <span className="block text-xs font-semibold text-neutral-700 truncate">{tupleLabel(t)}</span>
                      </div>
                      <div>
                        <Lbl>Dam</Lbl>
                        <Inp type="number" value={v.price ?? ""} onChange={(e) => setRowField(t, "price", e.target.value)} />
                      </div>
                      <div>
                        <Lbl>Ager dam</Lbl>
                        <Inp type="number" value={v.compareAtPrice ?? ""} onChange={(e) => setRowField(t, "compareAtPrice", e.target.value)} />
                      </div>
                      <div>
                        <Lbl>SKU</Lbl>
                        <Inp value={v.sku ?? ""} onChange={(e) => setRowField(t, "sku", e.target.value)} />
                      </div>
                      <div>
                        <Lbl>Stock</Lbl>
                        <Inp type="number" value={v.inventoryQuantity ?? ""} onChange={(e) => setRowField(t, "inventoryQuantity", e.target.value)} />
                      </div>
                      <button
                        onClick={() => deleteTuple(t)}
                        className="rounded-md border border-red-200 bg-red-50 px-2 py-2 text-red-700 hover:bg-red-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
                {!visibleCombos().length && (
                  <p className="text-xs text-neutral-500">Option-e value dao — tarpor ekhane prottek combination-er dam/stock bosate parba.</p>
                )}
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                Option nam/value bodle purano variant delete hoye notun combination toiri hobe. Notun combination-er dam khali thakle
                (age theke edit kora na thakle) base price bosbe.
              </p>
            </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <h2 className="font-bold text-neutral-900 mb-3">Specs — prottek product-e ja dorkar sudhu tai</h2>
            <p className="text-xs text-neutral-500 mb-3">
              Shob product-er spec same na — tai fixed form uthiye dilam. Ja dorkar sudhu tai rakho, baki delete koro,
              notun spec lagle Add spec-e nam + value likho. Egulo product page-er spec table-e dekhabe.
            </p>
            <div className="space-y-2">
              {specRows.map((r: any, i: number) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_40px] gap-2">
                  {r.key ? (
                    <span className="flex items-center text-sm font-semibold text-neutral-700">{r.label}</span>
                  ) : (
                    <Inp
                      value={r.label}
                      placeholder="Spec nam (jemon: Coil)"
                      onChange={(e) => setSpecRows(specRows.map((x: any, j: number) => (j === i ? { ...x, label: e.target.value } : x)))}
                    />
                  )}
                  <Inp
                    type={KNOWN_SPECS.find((f) => f.key === r.key)?.type === "number" ? "number" : "text"}
                    value={r.value}
                    placeholder="Value"
                    onChange={(e) => setSpecRows(specRows.map((x: any, j: number) => (j === i ? { ...x, value: e.target.value } : x)))}
                  />
                  <button
                    onClick={() => setSpecRows(specRows.filter((_: any, j: number) => j !== i))}
                    className="rounded-md border border-red-200 bg-red-50 px-2 py-2 text-red-700 hover:bg-red-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setSpecRows([...specRows, { key: null, label: "", value: "" }])}
              className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 mt-2"
            >
              <Plus size={14} /> Add spec
            </button>
            <div className="mt-3">
              <Lbl>Nicotine dropdown options (comma separated) — sudhu jokhon kono variant option nai</Lbl>
              <Inp value={nicOpts} onChange={(e) => setNicOpts(e.target.value)} placeholder="18mg, 20mg, 50mg" />
            </div>
            <div className="mt-3">
              <Lbl>Flavours (tap to select)</Lbl>
              <FlavourPicker flavors={data.flavors} selected={selFlavors} onToggle={(id: string, on: boolean) => setSelFlavors(on ? selFlavors.filter((x) => x !== id) : [...selFlavors, id])} />
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
      </div>)}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Collections & Orders                                               */
/* ------------------------------------------------------------------ */

export function CollectionsTab({ data, notify, reload }: any) {
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

export function OrdersTab({ data }: any) {
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
