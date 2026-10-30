"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Save, X, Plus } from "lucide-react";

async function api(body: any): Promise<any> {
  const res = await fetch("/api/admin-panel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

/* ------------------------------------------------------------------ */
/*  Bulk Edit: an Excel-style sheet for product metafields.            */
/*  Built for a non-technical person: no codes, no comma lists, no     */
/*  link names to type. Flavours, strengths and related products are   */
/*  picked by tapping; family and 1-5 scores are dropdowns; the rest   */
/*  are plain text boxes. One Save writes every changed cell.         */
/* ------------------------------------------------------------------ */

type Field = {
  key: string;
  label: string;
  wide?: boolean;
  kind?: "text" | "select" | "flavors" | "related" | "options";
  options?: { value: string; label: string }[];
};

const FAMILY_OPTIONS = [
  { value: "", label: "Select…" },
  { value: "fruit_ice", label: "Fruit Ice" },
  { value: "menthol", label: "Menthol" },
  { value: "tobacco", label: "Tobacco" },
  { value: "dessert", label: "Dessert" },
];
const SCORE_OPTIONS = [
  { value: "", label: "Select…" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
];
const STRENGTH_PRESETS = ["0mg", "20mg", "30mg", "50mg"];

const GROUPS: { key: string; label: string; color: string; fields: Field[] }[] = [
  {
    key: "specs",
    label: "Specs",
    color: "bg-emerald-700",
    fields: [
      { key: "puffs", label: "Puffs" },
      { key: "puff_range", label: "Puff range" },
      { key: "nicotine_strength", label: "Nicotine" },
      { key: "battery_capacity", label: "Battery" },
      { key: "coil_type", label: "Coil" },
      { key: "charging_type", label: "Charging" },
      { key: "e_liquid_capacity", label: "E-liquid" },
      { key: "activation", label: "Activation" },
      { key: "vg_pg_ratio", label: "VG / PG" },
    ],
  },
  {
    key: "taste",
    label: "Taste",
    color: "bg-amber-600",
    fields: [
      { key: "flavor_family", label: "Flavour family", kind: "select", options: FAMILY_OPTIONS },
      { key: "sweetness", label: "Sweetness (1-5)", kind: "select", options: SCORE_OPTIONS },
      { key: "cooling", label: "Cooling (1-5)", kind: "select", options: SCORE_OPTIONS },
      { key: "throat_hit", label: "Throat hit (1-5)", kind: "select", options: SCORE_OPTIONS },
      { key: "top_note", label: "Top note" },
      { key: "heart_note", label: "Heart note" },
      { key: "base_note", label: "Base note" },
      { key: "nicotine_options", label: "Nicotine options", kind: "options", wide: true },
      { key: "flavors", label: "Flavours", kind: "flavors", wide: true },
    ],
  },
  {
    key: "display",
    label: "Display",
    color: "bg-sky-700",
    fields: [
      { key: "badge", label: "Badge" },
      { key: "subtitle", label: "Subtitle" },
      { key: "short_description", label: "Short description", wide: true },
      { key: "rating", label: "Rating" },
      { key: "review_count", label: "Review count" },
      { key: "related", label: "Related products", kind: "related", wide: true },
    ],
  },
];

// Stored nicotine_options is a JSON list; plain text cells show it as text.
function displayValue(product: any, key: string): string {
  return product.vape?.[key] ?? "";
}

function parseJsonArray(raw: string): string[] {
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.map(String) : [];
  } catch {
    return [];
  }
}

export function BulkSheet({ notify, back, flavors }: any) {
  const [group, setGroup] = useState("specs");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [rows, setRows] = useState<any[]>([]);
  const [pageInfo, setPageInfo] = useState<any>({ hasNextPage: false, endCursor: null });
  const [stack, setStack] = useState<(string | null)[]>([null]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [edits, setEdits] = useState<Record<string, Record<string, string>>>({});
  const [picker, setPicker] = useState<{ pid: string; kind: "flavors" | "related" | "options" } | null>(null);
  const [relQuery, setRelQuery] = useState("");
  const [relResults, setRelResults] = useState<any[]>([]);
  const [relSearching, setRelSearching] = useState(false);
  const [customStrength, setCustomStrength] = useState("");
  const titles = useRef<Record<string, string>>({});
  const relatedTitles = useRef<Record<string, string>>({});

  const shownGroups = group === "all" ? GROUPS : GROUPS.filter((g) => g.key === group);
  const columns: Field[] = shownGroups.flatMap((g) => g.fields);

  // Flavour id -> name, for showing names instead of IDs.
  const flavorMap: Record<string, string> = {};
  for (const fl of flavors || []) {
    if (fl?.id && fl?.name) flavorMap[fl.id] = fl.name;
  }

  const load = useCallback(async (cursor: string | null, q: string, st: string) => {
    setLoading(true);
    const r = await api({ action: "bulk.list", cursor, search: q, status: st });
    if (r.ok) {
      setRows(r.products || []);
      setPageInfo(r.pageInfo || { hasNextPage: false, endCursor: null });
      for (const p of r.products || []) {
        titles.current[p.id] = p.title;
        for (const rel of p.related || []) {
          if (rel?.handle && rel?.title) relatedTitles.current[rel.handle] = rel.title;
        }
      }
    } else {
      notify(r.error || "Failed to load products");
    }
    setLoading(false);
  }, [notify]);

  useEffect(() => {
    load(null, "", "ALL");
  }, [load]);

  const applyFilters = () => {
    setStack([null]);
    load(null, search, status);
  };

  const nextPage = () => {
    if (!pageInfo.hasNextPage) return;
    setStack((s) => [...s, pageInfo.endCursor]);
    load(pageInfo.endCursor, search, status);
  };

  const prevPage = () => {
    if (stack.length < 2) return;
    const next = stack.slice(0, -1);
    setStack(next);
    load(next[next.length - 1], search, status);
  };

  const dirtyCount = Object.values(edits).reduce((n, m) => n + Object.keys(m).length, 0);

  // Plain text / dropdown cells.
  const setCell = (product: any, key: string, value: string) => {
    setEdits((prev) => {
      const next = { ...prev };
      const orig = displayValue(product, key);
      const per = { ...(next[product.id] || {}) };
      if (value === orig) delete per[key];
      else per[key] = value;
      if (Object.keys(per).length) next[product.id] = per;
      else delete next[product.id];
      return next;
    });
  };

  // Picker cells store a JSON list string, so Save sends it unchanged.
  const setListCell = (product: any, key: string, list: string[], orig: string[]) => {
    setEdits((prev) => {
      const next = { ...prev };
      const per = { ...(next[product.id] || {}) };
      if (JSON.stringify(list) === JSON.stringify(orig)) delete per[key];
      else per[key] = JSON.stringify(list);
      if (Object.keys(per).length) next[product.id] = per;
      else delete next[product.id];
      return next;
    });
  };

  const storedFlavorIds = (p: any): string[] => parseJsonArray(p.vape?.flavors ?? "");
  const currentFlavorIds = (p: any): string[] =>
    edits[p.id]?.flavors !== undefined ? parseJsonArray(edits[p.id].flavors) : storedFlavorIds(p);

  const storedRelated = (p: any): { handle: string; title: string }[] =>
    Array.isArray(p.related) ? p.related : [];
  const currentRelated = (p: any): { handle: string; title: string }[] => {
    if (edits[p.id]?.related !== undefined) {
      return parseJsonArray(edits[p.id].related).map((h) => ({
        handle: h,
        title: relatedTitles.current[h] || h,
      }));
    }
    return storedRelated(p);
  };

  const currentStrengths = (p: any): string[] =>
    edits[p.id]?.nicotine_options !== undefined
      ? parseJsonArray(edits[p.id].nicotine_options)
      : parseJsonArray(p.vape?.nicotine_options ?? "");
  const storedStrengths = (p: any): string[] => parseJsonArray(p.vape?.nicotine_options ?? "");

  const pickerProduct = picker ? rows.find((r) => r.id === picker.pid) : null;

  const searchRelated = async () => {
    if (!relQuery.trim()) return;
    setRelSearching(true);
    const r = await api({ action: "bulk.search", search: relQuery });
    setRelSearching(false);
    if (r.ok) {
      setRelResults(r.products || []);
      for (const p of r.products || []) relatedTitles.current[p.handle] = p.title;
    } else {
      notify(r.error || "Search failed");
    }
  };

  const save = async () => {
    const changes = Object.entries(edits)
      .filter(([, v]) => Object.keys(v).length > 0)
      .map(([id, values]) => ({ id, title: titles.current[id] || id, values }));
    if (!changes.length) return;
    setSaving(true);
    const r = await api({ action: "bulk.save", changes });
    setSaving(false);
    if (r.ok) {
      notify(`Saved — ${r.updated} products updated.`);
      setEdits({});
      setPicker(null);
      load(stack[stack.length - 1], search, status);
    } else {
      notify(r.error || "Save failed");
    }
  };

  const chipCls =
    "inline-flex items-center gap-1 rounded-full bg-neutral-100 border border-neutral-300 px-2.5 py-1 text-xs font-medium text-neutral-800";

  const renderCell = (p: any, f: Field) => {
    if (f.kind === "select") {
      const value = edits[p.id]?.[f.key] !== undefined ? edits[p.id][f.key] : displayValue(p, f.key);
      return (
        <select
          className="w-full rounded border border-neutral-300 bg-white px-2 py-1.5 text-sm text-neutral-900 outline-none focus:border-emerald-600"
          value={value}
          onChange={(e) => setCell(p, f.key, e.target.value)}
        >
          {(f.options || []).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    }
    if (f.kind === "flavors") {
      const ids = currentFlavorIds(p);
      return (
        <div className="flex flex-wrap items-center gap-1.5 min-w-[200px]">
          {ids.map((id) => (
            <span key={id} className={chipCls}>
              {flavorMap[id] || id}
              <button
                className="text-neutral-500 hover:text-red-600 font-bold"
                onClick={() => setListCell(p, "flavors", ids.filter((x) => x !== id), storedFlavorIds(p))}
              >
                ×
              </button>
            </span>
          ))}
          <button
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-neutral-400 px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
            onClick={() => setPicker({ pid: p.id, kind: "flavors" })}
          >
            <Plus size={13} /> Add
          </button>
        </div>
      );
    }
    if (f.kind === "related") {
      const items = currentRelated(p);
      return (
        <div className="flex flex-wrap items-center gap-1.5 min-w-[200px]">
          {items.map((it) => (
            <span key={it.handle} className={chipCls} title={it.handle}>
              {it.title}
              <button
                className="text-neutral-500 hover:text-red-600 font-bold"
                onClick={() =>
                  setListCell(
                    p,
                    "related",
                    items.filter((x) => x.handle !== it.handle).map((x) => x.handle),
                    storedRelated(p).map((x) => x.handle)
                  )
                }
              >
                ×
              </button>
            </span>
          ))}
          <button
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-neutral-400 px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
            onClick={() => {
              setRelQuery("");
              setRelResults([]);
              setPicker({ pid: p.id, kind: "related" });
            }}
          >
            <Plus size={13} /> Add
          </button>
        </div>
      );
    }
    if (f.kind === "options") {
      const vals = currentStrengths(p);
      return (
        <div className="flex flex-wrap items-center gap-1.5 min-w-[200px]">
          {vals.map((v) => (
            <span key={v} className={chipCls}>
              {v}
              <button
                className="text-neutral-500 hover:text-red-600 font-bold"
                onClick={() => setListCell(p, "nicotine_options", vals.filter((x) => x !== v), storedStrengths(p))}
              >
                ×
              </button>
            </span>
          ))}
          <button
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-neutral-400 px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
            onClick={() => {
              setCustomStrength("");
              setPicker({ pid: p.id, kind: "options" });
            }}
          >
            <Plus size={13} /> Add
          </button>
        </div>
      );
    }
    const value = edits[p.id]?.[f.key] !== undefined ? edits[p.id][f.key] : displayValue(p, f.key);
    return (
      <input
        className="w-full rounded border border-transparent bg-transparent px-2 py-1.5 text-sm text-neutral-900 outline-none focus:border-emerald-600 focus:bg-white"
        value={value}
        onChange={(e) => setCell(p, f.key, e.target.value)}
      />
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={back}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
          >
            <ArrowLeft size={15} /> Products
          </button>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Bulk Edit</h1>
            <p className="text-xs text-neutral-500">
              Edit many products at once. Tap + Add to pick flavours, strengths and related products. Saving an empty cell clears that field.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {dirtyCount > 0 && (
            <button
              onClick={() => setEdits({})}
              className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
            >
              <X size={15} /> Discard
            </button>
          )}
          <button
            onClick={save}
            disabled={dirtyCount === 0 || saving}
            className="inline-flex items-center gap-1.5 rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700 transition disabled:opacity-40"
          >
            <Save size={15} /> {saving ? "Saving…" : dirtyCount > 0 ? `Save changes (${dirtyCount})` : "Save changes"}
          </button>
        </div>
      </div>

      {/* Group switcher: related fields managed together */}
      <div className="flex flex-wrap gap-2 mb-3">
        {[...GROUPS.map((g) => ({ key: g.key, label: g.label })), { key: "all", label: "All columns" }].map((g) => (
          <button
            key={g.key}
            onClick={() => setGroup(g.key)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${
              group === g.key ? "bg-neutral-900 text-white" : "bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          className="flex-1 min-w-[220px] max-w-md rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-emerald-600"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyFilters()}
        />
        <select
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="ALL">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="DRAFT">Draft</option>
        </select>
        <button
          onClick={applyFilters}
          className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
        >
          Search
        </button>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-x-auto">
        <table className="text-sm border-collapse">
          <thead>
            {group === "all" && (
              <tr className="text-left text-xs font-semibold text-white">
                <th className="px-3 py-2 bg-neutral-800 sticky left-0 z-10">Product</th>
                {GROUPS.map((g) => (
                  <th key={g.key} colSpan={g.fields.length} className={`px-3 py-2 text-center ${g.color}`}>
                    {g.label}
                  </th>
                ))}
              </tr>
            )}
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
              <th className="px-3 py-2.5 font-semibold sticky left-0 z-10 bg-neutral-50 min-w-[240px]">Product</th>
              {shownGroups.map((g) =>
                g.fields.map((f) => (
                  <th key={f.key} className={`px-2 py-2.5 font-semibold whitespace-nowrap ${f.wide ? "min-w-[240px]" : "min-w-[130px]"}`}>
                    {f.label}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.map((p: any) => (
              <tr key={p.id} className="hover:bg-neutral-50">
                <td className="px-3 py-1.5 sticky left-0 z-10 bg-white">
                  <span className="font-medium text-neutral-900 block truncate max-w-[220px]" title={p.title}>
                    {p.title}
                  </span>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      p.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-neutral-200 text-neutral-700"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                {columns.map((f) => {
                  const edited = edits[p.id]?.[f.key] !== undefined;
                  return (
                    <td key={f.key} className={`px-1 py-1 align-top ${edited ? "bg-amber-100" : ""}`}>
                      {renderCell(p, f)}
                    </td>
                  );
                })}
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-3 py-6 text-center text-neutral-500">
                  No products found.
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={columns.length + 1} className="px-3 py-6 text-center text-neutral-500">
                  Loading…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
        <p className="text-xs text-neutral-500">
          Page {stack.length} · 25 products per page · edited cells turn yellow · photos, variants, custom spec rows and SEO stay in the product editor.
        </p>
        <div className="flex gap-2">
          <button
            onClick={prevPage}
            disabled={stack.length < 2 || loading}
            className="inline-flex items-center gap-1 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
          >
            <ChevronLeft size={15} /> Prev
          </button>
          <button
            onClick={nextPage}
            disabled={!pageInfo.hasNextPage || loading}
            className="inline-flex items-center gap-1 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
          >
            Next <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Picker popup: tap to pick, nothing to type in codes */}
      {picker && pickerProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setPicker(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-neutral-900">
                {picker.kind === "flavors"
                  ? "Pick flavours"
                  : picker.kind === "related"
                    ? "Pick related products"
                    : "Pick nicotine options"}
              </h2>
              <button onClick={() => setPicker(null)} className="text-neutral-500 hover:text-neutral-900">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-neutral-500 mb-3 truncate">{pickerProduct.title}</p>

            {picker.kind === "flavors" && (
              <div className="flex flex-col gap-1">
                {(flavors || []).map((fl: any) => {
                  const ids = currentFlavorIds(pickerProduct);
                  const on = ids.includes(fl.id);
                  return (
                    <button
                      key={fl.id}
                      onClick={() =>
                        setListCell(
                          pickerProduct,
                          "flavors",
                          on ? ids.filter((x) => x !== fl.id) : [...ids, fl.id],
                          storedFlavorIds(pickerProduct)
                        )
                      }
                      className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm text-left ${
                        on ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-800 border-neutral-300"
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 rounded border text-center leading-4 text-xs ${on ? "bg-white text-neutral-900" : ""}`}>
                        {on ? "✓" : ""}
                      </span>
                      {fl.name}
                    </button>
                  );
                })}
                {!(flavors || []).length && <p className="text-sm text-neutral-500">No flavours defined yet.</p>}
              </div>
            )}

            {picker.kind === "related" && (
              <div>
                <div className="flex gap-2 mb-3">
                  <input
                    className="flex-1 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
                    placeholder="Search product by name…"
                    value={relQuery}
                    onChange={(e) => setRelQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchRelated()}
                  />
                  <button
                    onClick={searchRelated}
                    className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Search
                  </button>
                </div>
                {relSearching && <p className="text-sm text-neutral-500">Searching…</p>}
                <div className="flex flex-col gap-1">
                  {relResults.map((r: any) => {
                    const items = currentRelated(pickerProduct);
                    const added = items.some((x) => x.handle === r.handle);
                    return (
                      <button
                        key={r.id}
                        disabled={added}
                        onClick={() => {
                          relatedTitles.current[r.handle] = r.title;
                          setListCell(
                            pickerProduct,
                            "related",
                            [...items.map((x) => x.handle), r.handle],
                            storedRelated(pickerProduct).map((x) => x.handle)
                          );
                        }}
                        className={`rounded-md border px-3 py-2 text-sm text-left disabled:opacity-50 ${
                          added ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-white text-neutral-800 border-neutral-300"
                        }`}
                      >
                        {r.title} {added ? "✓ Added" : ""}
                      </button>
                    );
                  })}
                  {!relSearching && relQuery && relResults.length === 0 && (
                    <p className="text-sm text-neutral-500">No products found for that name.</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {currentRelated(pickerProduct).map((it) => (
                    <span key={it.handle} className={chipCls}>
                      {it.title}
                      <button
                        className="text-neutral-500 hover:text-red-600 font-bold"
                        onClick={() =>
                          setListCell(
                            pickerProduct,
                            "related",
                            currentRelated(pickerProduct)
                              .filter((x) => x.handle !== it.handle)
                              .map((x) => x.handle),
                            storedRelated(pickerProduct).map((x) => x.handle)
                          )
                        }
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {picker.kind === "options" && (
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {STRENGTH_PRESETS.map((s) => {
                    const vals = currentStrengths(pickerProduct);
                    const on = vals.includes(s);
                    return (
                      <button
                        key={s}
                        onClick={() =>
                          setListCell(
                            pickerProduct,
                            "nicotine_options",
                            on ? vals.filter((x) => x !== s) : [...vals, s],
                            storedStrengths(pickerProduct)
                          )
                        }
                        className={`rounded-full px-3.5 py-1.5 text-sm font-medium border ${
                          on ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-700 border-neutral-300"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <input
                    className="flex-1 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
                    placeholder="Other strength, e.g. 50mg (5%)"
                    value={customStrength}
                    onChange={(e) => setCustomStrength(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && customStrength.trim()) {
                        const vals = currentStrengths(pickerProduct);
                        const v = customStrength.trim();
                        if (!vals.includes(v))
                          setListCell(pickerProduct, "nicotine_options", [...vals, v], storedStrengths(pickerProduct));
                        setCustomStrength("");
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const v = customStrength.trim();
                      if (!v) return;
                      const vals = currentStrengths(pickerProduct);
                      if (!vals.includes(v))
                        setListCell(pickerProduct, "nicotine_options", [...vals, v], storedStrengths(pickerProduct));
                      setCustomStrength("");
                    }}
                    className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {currentStrengths(pickerProduct).map((v) => (
                    <span key={v} className={chipCls}>
                      {v}
                      <button
                        className="text-neutral-500 hover:text-red-600 font-bold"
                        onClick={() =>
                          setListCell(
                            pickerProduct,
                            "nicotine_options",
                            currentStrengths(pickerProduct).filter((x) => x !== v),
                            storedStrengths(pickerProduct)
                          )
                        }
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setPicker(null)}
              className="mt-4 w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
