"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Save, X } from "lucide-react";

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
/*  Columns are grouped so related fields are managed together;       */
/*  one Save writes every changed cell across all pages.              */
/* ------------------------------------------------------------------ */

type Field = { key: string; label: string; wide?: boolean };

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
      { key: "flavor_family", label: "Flavour family" },
      { key: "sweetness", label: "Sweetness (1-5)" },
      { key: "cooling", label: "Cooling (1-5)" },
      { key: "throat_hit", label: "Throat hit (1-5)" },
      { key: "top_note", label: "Top note" },
      { key: "heart_note", label: "Heart note" },
      { key: "base_note", label: "Base note" },
      { key: "nicotine_options", label: "Nicotine options (comma separated)", wide: true },
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
    ],
  },
];

// Stored nicotine_options is a JSON list; the sheet shows it as comma text.
function displayValue(product: any, key: string): string {
  const raw = product.vape?.[key] ?? "";
  if (key === "nicotine_options") {
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr.join(", ");
    } catch {
      return raw;
    }
  }
  return raw;
}

export function BulkSheet({ notify, back }: any) {
  const [group, setGroup] = useState("specs");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [rows, setRows] = useState<any[]>([]);
  const [pageInfo, setPageInfo] = useState<any>({ hasNextPage: false, endCursor: null });
  const [stack, setStack] = useState<(string | null)[]>([null]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [edits, setEdits] = useState<Record<string, Record<string, string>>>({});
  const titles = useRef<Record<string, string>>({});

  const shownGroups = group === "all" ? GROUPS : GROUPS.filter((g) => g.key === group);
  const columns: Field[] = shownGroups.flatMap((g) => g.fields);

  const load = useCallback(async (cursor: string | null, q: string, st: string) => {
    setLoading(true);
    const r = await api({ action: "bulk.list", cursor, search: q, status: st });
    if (r.ok) {
      setRows(r.products || []);
      setPageInfo(r.pageInfo || { hasNextPage: false, endCursor: null });
      for (const p of r.products || []) titles.current[p.id] = p.title;
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
      load(stack[stack.length - 1], search, status);
    } else {
      notify(r.error || "Save failed");
    }
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
            <p className="text-xs text-neutral-500">Edit many products at once, like a spreadsheet. Saving an empty cell clears that field.</p>
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
                  const value = edited ? edits[p.id][f.key] : displayValue(p, f.key);
                  return (
                    <td key={f.key} className={`px-1 py-1 ${edited ? "bg-amber-100" : ""}`}>
                      <input
                        className="w-full rounded border border-transparent bg-transparent px-2 py-1.5 text-sm text-neutral-900 outline-none focus:border-emerald-600 focus:bg-white"
                        value={value}
                        onChange={(e) => setCell(p, f.key, e.target.value)}
                      />
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
          Page {stack.length} · 25 products per page · edited cells turn yellow · flavours, photos, variants, custom spec rows and SEO stay in the product editor.
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
    </div>
  );
}
