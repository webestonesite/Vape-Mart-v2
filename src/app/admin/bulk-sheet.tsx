"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Save,
  X,
  Plus,
  ExternalLink,
  Zap,
  Droplets,
  Tag,
  Check,
  Search,
  Table,
  Sliders,
  Layers,
} from "lucide-react";

async function api(body: any): Promise<any> {
  const res = await fetch("/api/admin-panel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

/* ------------------------------------------------------------------ */
/*  Bulk Edit: Grouped Metafields Table & Rapid Multi-Product Editor   */
/* ------------------------------------------------------------------ */

type Field = {
  key: string;
  label: string;
  placeholder?: string;
  wide?: boolean;
  kind?: "text" | "number" | "select" | "score" | "flavors" | "related" | "options" | "textarea";
  options?: { value: string; label: string }[];
  presets?: string[];
};

const FAMILY_OPTIONS = [
  { value: "", label: "Select family…" },
  { value: "fruit_ice", label: "Fruit Ice" },
  { value: "menthol", label: "Menthol" },
  { value: "tobacco", label: "Tobacco" },
  { value: "dessert", label: "Dessert" },
  { value: "beverage", label: "Beverage" },
];

const SCORE_OPTIONS = [
  { value: "", label: "None" },
  { value: "1", label: "1 (Very Mild)" },
  { value: "2", label: "2 (Mild)" },
  { value: "3", label: "3 (Medium)" },
  { value: "4", label: "4 (Strong)" },
  { value: "5", label: "5 (Max / Intense)" },
];

const STRENGTH_PRESETS = ["0mg", "20mg", "30mg", "50mg"];
const PUFF_PRESETS = ["5000", "8000", "10000", "15000", "20000", "50000"];
const BATTERY_PRESETS = ["500mAh", "650mAh", "850mAh", "1000mAh", "Rechargeable"];
const CHARGING_PRESETS = ["Type-C", "Micro-USB", "Wireless"];
const COIL_PRESETS = ["Mesh Coil", "Dual Mesh", "Ceramic"];
const CAPACITY_PRESETS = ["2ml", "10ml", "14ml", "16ml", "18ml", "20ml"];
const ACTIVATION_PRESETS = ["Draw-activated", "Button-activated"];
const VRPG_PRESETS = ["50/50", "70/30", "60/40"];
const BADGE_PRESETS = ["BEST SELLER", "NEW ARRIVAL", "TOP RATED", "HOT", "LIMITED EDITION", "CLEARANCE"];

export interface MetafieldGroup {
  key: "specs" | "taste" | "display";
  label: string;
  iconName: "specs" | "taste" | "display";
  badgeBg: string;
  badgeText: string;
  description: string;
  fields: Field[];
}

export const GROUPS: MetafieldGroup[] = [
  {
    key: "specs",
    label: "Specs & Hardware",
    iconName: "specs",
    badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
    badgeText: "Hardware specifications",
    description: "Puffs, nicotine, e-liquid, battery & charging info",
    fields: [
      { key: "puffs", label: "Puff count", kind: "number", placeholder: "e.g. 10000", presets: PUFF_PRESETS },
      { key: "puff_range", label: "Puff range", placeholder: "e.g. Up to 10,000 Puffs" },
      { key: "nicotine_strength", label: "Nicotine strength", placeholder: "e.g. 50mg (5%)", presets: STRENGTH_PRESETS },
      { key: "e_liquid_capacity", label: "E-liquid capacity", placeholder: "e.g. 16ml", presets: CAPACITY_PRESETS },
      { key: "battery_capacity", label: "Battery capacity", placeholder: "e.g. 650mAh", presets: BATTERY_PRESETS },
      { key: "charging_type", label: "Charging type", placeholder: "e.g. Type-C", presets: CHARGING_PRESETS },
      { key: "coil_type", label: "Coil type", placeholder: "e.g. Dual Mesh Coil", presets: COIL_PRESETS },
      { key: "activation", label: "Activation", placeholder: "e.g. Draw-activated", presets: ACTIVATION_PRESETS },
      { key: "vg_pg_ratio", label: "VG / PG ratio", placeholder: "e.g. 50/50", presets: VRPG_PRESETS },
    ],
  },
  {
    key: "taste",
    label: "Taste & Flavours",
    iconName: "taste",
    badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
    badgeText: "Flavor sensory profile",
    description: "Flavor family, sweetness, cooling, notes & flavor links",
    fields: [
      { key: "flavor_family", label: "Flavour family", kind: "select", options: FAMILY_OPTIONS },
      { key: "sweetness", label: "Sweetness (1-5)", kind: "score" },
      { key: "cooling", label: "Cooling (1-5)", kind: "score" },
      { key: "throat_hit", label: "Throat hit (1-5)", kind: "score" },
      { key: "top_note", label: "Top flavor note", placeholder: "e.g. Sweet Georgia Peach" },
      { key: "heart_note", label: "Heart flavor note", placeholder: "e.g. Candied Nectarine" },
      { key: "base_note", label: "Base flavor note", placeholder: "e.g. Refreshing Ice Frost" },
      { key: "nicotine_options", label: "Nicotine options", kind: "options", wide: true },
      { key: "flavors", label: "Flavours", kind: "flavors", wide: true },
    ],
  },
  {
    key: "display",
    label: "Display & Merchandising",
    iconName: "display",
    badgeBg: "bg-sky-50 text-sky-800 border-sky-200",
    badgeText: "Badges & store display",
    description: "Badges, subtitle, short description, rating & related items",
    fields: [
      { key: "badge", label: "Badge text", placeholder: "e.g. BEST SELLER", presets: BADGE_PRESETS },
      { key: "subtitle", label: "Subtitle", placeholder: "e.g. Dual mesh tech with smart LED screen" },
      { key: "short_description", label: "Short description", kind: "textarea", wide: true, placeholder: "Brief summary shown under title" },
      { key: "rating", label: "Rating (1-5)", kind: "number", placeholder: "e.g. 4.9" },
      { key: "review_count", label: "Review count", kind: "number", placeholder: "e.g. 128" },
      { key: "related", label: "Related products", kind: "related", wide: true },
    ],
  },
];

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
  const [viewMode, setViewMode] = useState<"grouped" | "spreadsheet">("grouped");
  const [activeGroupFilter, setActiveGroupFilter] = useState<"all" | "specs" | "taste" | "display">("all");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [rows, setRows] = useState<any[]>([]);
  const [pageInfo, setPageInfo] = useState<any>({ hasNextPage: false, endCursor: null });
  const [stack, setStack] = useState<(string | null)[]>([null]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [edits, setEdits] = useState<Record<string, Record<string, string>>>({});

  // Group modal state: editing one group or all groups for a specific product
  const [groupModal, setGroupModal] = useState<{
    productIndex: number;
    groupKey: "specs" | "taste" | "display" | "all";
  } | null>(null);

  // Sub-pickers
  const [picker, setPicker] = useState<{ pid: string; kind: "flavors" | "related" | "options" } | null>(null);
  const [relQuery, setRelQuery] = useState("");
  const [relResults, setRelResults] = useState<any[]>([]);
  const [relSearching, setRelSearching] = useState(false);
  const [customStrength, setCustomStrength] = useState("");
  const titles = useRef<Record<string, string>>({});
  const relatedTitles = useRef<Record<string, string>>({});

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

  const getProductValue = (product: any, key: string): string => {
    if (edits[product.id]?.[key] !== undefined) return edits[product.id][key];
    return displayValue(product, key);
  };

  const isFieldEdited = (product: any, key: string): boolean => {
    return edits[product.id]?.[key] !== undefined;
  };

  const isProductEdited = (product: any): boolean => {
    return !!edits[product.id] && Object.keys(edits[product.id]).length > 0;
  };

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
  const currentModalProduct = groupModal !== null && rows[groupModal.productIndex] ? rows[groupModal.productIndex] : null;

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
      notify(`Saved — ${r.updated} products updated in Shopify.`);
      setEdits({});
      setPicker(null);
      load(stack[stack.length - 1], search, status);
    } else {
      notify(r.error || "Save failed");
    }
  };

  const chipCls =
    "inline-flex items-center gap-1 rounded-md bg-neutral-100 border border-neutral-300 px-2 py-0.5 text-xs font-medium text-neutral-800";

  /* Group summary helpers for table cells */
  const renderSpecsSummary = (p: any) => {
    const puffs = getProductValue(p, "puffs");
    const nic = getProductValue(p, "nicotine_strength");
    const eliquid = getProductValue(p, "e_liquid_capacity");
    const battery = getProductValue(p, "battery_capacity");
    const charging = getProductValue(p, "charging_type");
    const coil = getProductValue(p, "coil_type");

    const badges: string[] = [];
    if (puffs) badges.push(`${puffs} Puffs`);
    if (nic) badges.push(nic);
    if (eliquid) badges.push(eliquid);
    if (battery) badges.push(battery);
    if (charging) badges.push(charging);
    if (coil) badges.push(coil);

    const edited = GROUPS[0].fields.some((f) => isFieldEdited(p, f.key));

    return (
      <div
        onClick={() => {
          const idx = rows.findIndex((r) => r.id === p.id);
          setGroupModal({ productIndex: idx, groupKey: "specs" });
        }}
        className={`group relative flex flex-col justify-between p-2 rounded-lg border cursor-pointer transition hover:shadow-sm ${
          edited ? "bg-amber-50/80 border-amber-300" : "bg-neutral-50/70 border-neutral-200 hover:border-emerald-500 hover:bg-emerald-50/30"
        }`}
      >
        <div className="flex items-center justify-between gap-1 mb-1.5">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
            <Zap size={12} className="text-emerald-600" /> Specs
          </span>
          <span className="text-[11px] font-semibold text-emerald-700 opacity-80 group-hover:opacity-100 group-hover:underline">
            {badges.length ? "Edit" : "+ Add"}
          </span>
        </div>
        {badges.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {badges.slice(0, 4).map((b, i) => (
              <span key={i} className="inline-block rounded bg-white px-1.5 py-0.5 text-[11px] font-medium text-neutral-800 border border-neutral-200 shadow-2xs">
                {b}
              </span>
            ))}
            {badges.length > 4 && (
              <span className="text-[11px] text-neutral-500 font-medium">+{badges.length - 4} more</span>
            )}
          </div>
        ) : (
          <span className="text-xs text-neutral-400 italic">No specs entered yet</span>
        )}
      </div>
    );
  };

  const renderTasteSummary = (p: any) => {
    const fam = getProductValue(p, "flavor_family");
    const sweet = getProductValue(p, "sweetness");
    const cool = getProductValue(p, "cooling");
    const hit = getProductValue(p, "throat_hit");
    const flavorIds = currentFlavorIds(p);

    const badges: string[] = [];
    if (fam) {
      const opt = FAMILY_OPTIONS.find((o) => o.value === fam);
      badges.push(opt?.label || fam);
    }
    if (sweet) badges.push(`Sweet: ${sweet}/5`);
    if (cool) badges.push(`Cool: ${cool}/5`);
    if (hit) badges.push(`Hit: ${hit}/5`);
    if (flavorIds.length) badges.push(`${flavorIds.length} Flavors`);

    const edited = GROUPS[1].fields.some((f) => isFieldEdited(p, f.key));

    return (
      <div
        onClick={() => {
          const idx = rows.findIndex((r) => r.id === p.id);
          setGroupModal({ productIndex: idx, groupKey: "taste" });
        }}
        className={`group relative flex flex-col justify-between p-2 rounded-lg border cursor-pointer transition hover:shadow-sm ${
          edited ? "bg-amber-50/80 border-amber-300" : "bg-neutral-50/70 border-neutral-200 hover:border-amber-500 hover:bg-amber-50/30"
        }`}
      >
        <div className="flex items-center justify-between gap-1 mb-1.5">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-800">
            <Droplets size={12} className="text-amber-600" /> Taste Profile
          </span>
          <span className="text-[11px] font-semibold text-amber-700 opacity-80 group-hover:opacity-100 group-hover:underline">
            {badges.length ? "Edit" : "+ Add"}
          </span>
        </div>
        {badges.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {badges.slice(0, 3).map((b, i) => (
              <span key={i} className="inline-block rounded bg-white px-1.5 py-0.5 text-[11px] font-medium text-neutral-800 border border-neutral-200 shadow-2xs">
                {b}
              </span>
            ))}
            {badges.length > 3 && (
              <span className="text-[11px] text-neutral-500 font-medium">+{badges.length - 3} more</span>
            )}
          </div>
        ) : (
          <span className="text-xs text-neutral-400 italic">No taste data set</span>
        )}
      </div>
    );
  };

  const renderDisplaySummary = (p: any) => {
    const badge = getProductValue(p, "badge");
    const sub = getProductValue(p, "subtitle");
    const rating = getProductValue(p, "rating");
    const count = getProductValue(p, "review_count");
    const rel = currentRelated(p);

    const badges: string[] = [];
    if (badge) badges.push(`🏷️ ${badge}`);
    if (rating) badges.push(`★ ${rating}${count ? ` (${count})` : ""}`);
    if (sub) badges.push(sub);
    if (rel.length) badges.push(`${rel.length} Related`);

    const edited = GROUPS[2].fields.some((f) => isFieldEdited(p, f.key));

    return (
      <div
        onClick={() => {
          const idx = rows.findIndex((r) => r.id === p.id);
          setGroupModal({ productIndex: idx, groupKey: "display" });
        }}
        className={`group relative flex flex-col justify-between p-2 rounded-lg border cursor-pointer transition hover:shadow-sm ${
          edited ? "bg-amber-50/80 border-amber-300" : "bg-neutral-50/70 border-neutral-200 hover:border-sky-500 hover:bg-sky-50/30"
        }`}
      >
        <div className="flex items-center justify-between gap-1 mb-1.5">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-sky-800">
            <Tag size={12} className="text-sky-600" /> Display & Badges
          </span>
          <span className="text-[11px] font-semibold text-sky-700 opacity-80 group-hover:opacity-100 group-hover:underline">
            {badges.length ? "Edit" : "+ Add"}
          </span>
        </div>
        {badges.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {badges.slice(0, 3).map((b, i) => (
              <span key={i} className="inline-block rounded bg-white px-1.5 py-0.5 text-[11px] font-medium text-neutral-800 border border-neutral-200 shadow-2xs truncate max-w-[140px]">
                {b}
              </span>
            ))}
            {badges.length > 3 && (
              <span className="text-[11px] text-neutral-500 font-medium">+{badges.length - 3} more</span>
            )}
          </div>
        ) : (
          <span className="text-xs text-neutral-400 italic">No badge / display set</span>
        )}
      </div>
    );
  };

  /* Modal Form Field Renderer */
  const renderModalField = (p: any, f: Field) => {
    const value = getProductValue(p, f.key);
    const edited = isFieldEdited(p, f.key);

    if (f.kind === "score") {
      return (
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((num) => {
            const isSelected = value === String(num);
            return (
              <button
                key={num}
                type="button"
                onClick={() => setCell(p, f.key, isSelected ? "" : String(num))}
                className={`h-9 w-9 rounded-lg font-bold text-sm transition flex items-center justify-center border ${
                  isSelected
                    ? "bg-amber-500 text-white border-amber-600 shadow-sm scale-105"
                    : "bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100"
                }`}
              >
                {num}
              </button>
            );
          })}
          {value && (
            <button
              type="button"
              onClick={() => setCell(p, f.key, "")}
              className="ml-2 text-xs text-neutral-400 hover:text-red-600"
            >
              Clear
            </button>
          )}
        </div>
      );
    }

    if (f.kind === "select") {
      return (
        <select
          className={`w-full rounded-md border px-3 py-2 text-sm text-neutral-900 outline-none focus:border-emerald-600 ${
            edited ? "border-amber-400 bg-amber-50/50" : "border-neutral-300 bg-white"
          }`}
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

    if (f.kind === "textarea") {
      return (
        <textarea
          rows={3}
          className={`w-full rounded-md border px-3 py-2 text-sm text-neutral-900 outline-none focus:border-emerald-600 ${
            edited ? "border-amber-400 bg-amber-50/50" : "border-neutral-300 bg-white"
          }`}
          placeholder={f.placeholder}
          value={value}
          onChange={(e) => setCell(p, f.key, e.target.value)}
        />
      );
    }

    if (f.kind === "flavors") {
      const ids = currentFlavorIds(p);
      return (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {ids.map((id) => (
              <span key={id} className={chipCls}>
                {flavorMap[id] || id}
                <button
                  type="button"
                  className="text-neutral-500 hover:text-red-600 font-bold ml-1"
                  onClick={() => setListCell(p, "flavors", ids.filter((x) => x !== id), storedFlavorIds(p))}
                >
                  ×
                </button>
              </span>
            ))}
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md border border-dashed border-neutral-400 px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
              onClick={() => setPicker({ pid: p.id, kind: "flavors" })}
            >
              <Plus size={13} /> Select flavours ({ids.length})
            </button>
          </div>
        </div>
      );
    }

    if (f.kind === "related") {
      const items = currentRelated(p);
      return (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {items.map((it) => (
              <span key={it.handle} className={chipCls} title={it.handle}>
                {it.title}
                <button
                  type="button"
                  className="text-neutral-500 hover:text-red-600 font-bold ml-1"
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
              type="button"
              className="inline-flex items-center gap-1 rounded-md border border-dashed border-neutral-400 px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
              onClick={() => {
                setRelQuery("");
                setRelResults([]);
                setPicker({ pid: p.id, kind: "related" });
              }}
            >
              <Plus size={13} /> Add related product
            </button>
          </div>
        </div>
      );
    }

    if (f.kind === "options") {
      const vals = currentStrengths(p);
      return (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {vals.map((v) => (
              <span key={v} className={chipCls}>
                {v}
                <button
                  type="button"
                  className="text-neutral-500 hover:text-red-600 font-bold ml-1"
                  onClick={() => setListCell(p, "nicotine_options", vals.filter((x) => x !== v), storedStrengths(p))}
                >
                  ×
                </button>
              </span>
            ))}
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md border border-dashed border-neutral-400 px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
              onClick={() => {
                setCustomStrength("");
                setPicker({ pid: p.id, kind: "options" });
              }}
            >
              <Plus size={13} /> Manage nicotine options
            </button>
          </div>
        </div>
      );
    }

    // Default text or number input with clickable presets
    return (
      <div className="space-y-1.5">
        <input
          type={f.kind === "number" ? "text" : "text"}
          className={`w-full rounded-md border px-3 py-2 text-sm text-neutral-900 outline-none focus:border-emerald-600 ${
            edited ? "border-amber-400 bg-amber-50/50" : "border-neutral-300 bg-white"
          }`}
          placeholder={f.placeholder}
          value={value}
          onChange={(e) => setCell(p, f.key, e.target.value)}
        />
        {f.presets && f.presets.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 pt-0.5">
            <span className="text-[11px] text-neutral-400 font-medium mr-1">Quick:</span>
            {f.presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setCell(p, f.key, preset)}
                className={`rounded px-1.5 py-0.5 text-[11px] font-medium transition border ${
                  value === preset
                    ? "bg-neutral-800 text-white border-neutral-800"
                    : "bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const getShopifyProductAdminUrl = (p: any) => {
    const rawId = String(p.id || "");
    const numericId = rawId.replace(/\D/g, "");
    return `https://admin.shopify.com/store/vf4iap-u5/products/${numericId}`;
  };

  const shopifyNativeBulkUrl =
    "https://admin.shopify.com/store/vf4iap-u5/bulk?resource_name=Product&edit=metafields.vape.puffs%2Cmetafields.vape.nicotine_strength%2Cmetafields.vape.e_liquid_capacity%2Cmetafields.vape.battery_capacity%2Cmetafields.vape.charging_type%2Cmetafields.vape.coil_type%2Cmetafields.vape.badge%2Cmetafields.vape.subtitle%2Cmetafields.vape.flavor_family%2Cmetafields.vape.sweetness%2Cmetafields.vape.cooling%2Cmetafields.vape.throat_hit";

  return (
    <div className="space-y-4">
      {/* Top action header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={back}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition"
          >
            <ArrowLeft size={16} /> Products
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-neutral-900">Metafield Bulk Table</h1>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                Shopify Synced
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Click any category group (Specs, Taste, Display) to open all related fields in one fast editor.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={shopifyNativeBulkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition"
            title="Open Shopify store's built-in bulk spreadsheet"
          >
            <ExternalLink size={13} /> Open Shopify Bulk Editor ↗
          </a>

          {dirtyCount > 0 && (
            <button
              onClick={() => setEdits({})}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              <X size={15} /> Discard ({dirtyCount})
            </button>
          )}

          <button
            onClick={save}
            disabled={dirtyCount === 0 || saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 transition disabled:opacity-40"
          >
            <Save size={15} />
            {saving ? "Saving to Shopify…" : dirtyCount > 0 ? `Save All (${dirtyCount} changes)` : "Save changes"}
          </button>
        </div>
      </div>

      {/* Control bar: View toggle, search, filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-neutral-200">
        <div className="flex flex-wrap items-center gap-2">
          {/* View mode toggle */}
          <div className="inline-flex rounded-lg border border-neutral-300 bg-neutral-100 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("grouped")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition ${
                viewMode === "grouped" ? "bg-white text-neutral-900 shadow-2xs" : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <Layers size={14} /> Grouped Table
            </button>
            <button
              type="button"
              onClick={() => setViewMode("spreadsheet")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition ${
                viewMode === "spreadsheet" ? "bg-white text-neutral-900 shadow-2xs" : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <Table size={14} /> Full Excel Grid
            </button>
          </div>

          {viewMode === "spreadsheet" && (
            <div className="flex items-center gap-1.5 ml-2 border-l pl-3 border-neutral-200">
              <span className="text-xs text-neutral-500 font-medium">Show:</span>
              {(["all", "specs", "taste", "display"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setActiveGroupFilter(g)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                    activeGroupFilter === g ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              className="w-full rounded-lg border border-neutral-300 bg-white pl-8 pr-3 py-1.5 text-sm outline-none focus:border-emerald-600"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            />
          </div>
          <select
            className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
          </select>
          <button
            onClick={applyFilters}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
          >
            Filter
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: GROUPED TABLE (User-friendly combined columns) */}
      {viewMode === "grouped" && (
        <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse text-left">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-xs font-bold uppercase tracking-wider text-neutral-500">
                  <th className="px-4 py-3 min-w-[220px]">Product</th>
                  <th className="px-3 py-3 min-w-[220px]">
                    <span className="inline-flex items-center gap-1.5 text-emerald-800">
                      <Zap size={14} /> Specs & Hardware
                    </span>
                  </th>
                  <th className="px-3 py-3 min-w-[220px]">
                    <span className="inline-flex items-center gap-1.5 text-amber-800">
                      <Droplets size={14} /> Taste & Flavours
                    </span>
                  </th>
                  <th className="px-3 py-3 min-w-[220px]">
                    <span className="inline-flex items-center gap-1.5 text-sky-800">
                      <Tag size={14} /> Display & Merchandising
                    </span>
                  </th>
                  <th className="px-3 py-3 text-right min-w-[130px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {rows.map((p: any, idx: number) => {
                  const edited = isProductEdited(p);
                  return (
                    <tr key={p.id} className={`transition hover:bg-neutral-50/70 ${edited ? "bg-amber-50/20" : ""}`}>
                      {/* Product cell */}
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-start gap-2.5">
                          {p.featuredImage ? (
                            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-white">
                              <Image
                                src={p.featuredImage}
                                alt={p.title}
                                fill
                                sizes="40px"
                                className="object-contain p-0.5"
                              />
                            </div>
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-neutral-100 text-xs font-bold text-neutral-500">
                              VP
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="block font-semibold text-neutral-900 truncate max-w-[200px]" title={p.title}>
                              {p.title}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className={`inline-block rounded px-1.5 py-0.2 text-[10px] font-bold ${
                                  p.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-neutral-200 text-neutral-700"
                                }`}
                              >
                                {p.status}
                              </span>
                              {p.handle && (
                                <a
                                  href={`/product/${p.handle}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-neutral-400 hover:text-emerald-700 hover:underline truncate max-w-[110px]"
                                >
                                  /{p.handle}
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Specs group */}
                      <td className="px-3 py-2.5 align-top">
                        {renderSpecsSummary(p)}
                      </td>

                      {/* Taste group */}
                      <td className="px-3 py-2.5 align-top">
                        {renderTasteSummary(p)}
                      </td>

                      {/* Display group */}
                      <td className="px-3 py-2.5 align-top">
                        {renderDisplaySummary(p)}
                      </td>

                      {/* Action buttons */}
                      <td className="px-3 py-3 align-middle text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setGroupModal({ productIndex: idx, groupKey: "all" })}
                            className="inline-flex items-center gap-1 rounded-md bg-neutral-900 px-2.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-neutral-800"
                          >
                            <Sliders size={12} /> Edit All
                          </button>
                          <a
                            href={getShopifyProductAdminUrl(p)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center h-7 w-7 rounded-md border border-neutral-300 bg-white text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                            title="Open in Shopify Admin"
                          >
                            <ExternalLink size={13} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {!loading && rows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                      No products found matching filters.
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                      Loading products from Shopify…
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: CLASSIC SPREADSHEET GRID */}
      {viewMode === "spreadsheet" && (
        <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs overflow-x-auto">
          <table className="text-sm border-collapse text-left">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                <th className="px-3 py-2.5 sticky left-0 z-10 bg-neutral-50 min-w-[220px]">Product</th>
                {GROUPS.filter((g) => activeGroupFilter === "all" || g.key === activeGroupFilter).flatMap((g) =>
                  g.fields.map((f) => (
                    <th key={f.key} className={`px-2 py-2.5 whitespace-nowrap ${f.wide ? "min-w-[220px]" : "min-w-[130px]"}`}>
                      {f.label}
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {rows.map((p: any) => {
                const cols = GROUPS.filter((g) => activeGroupFilter === "all" || g.key === activeGroupFilter).flatMap((g) => g.fields);
                return (
                  <tr key={p.id} className="hover:bg-neutral-50">
                    <td className="px-3 py-1.5 sticky left-0 z-10 bg-white border-r border-neutral-100">
                      <span className="font-semibold text-neutral-900 block truncate max-w-[200px]" title={p.title}>
                        {p.title}
                      </span>
                      <span className="text-[11px] text-neutral-500">{p.status}</span>
                    </td>
                    {cols.map((f) => {
                      const edited = isFieldEdited(p, f.key);
                      return (
                        <td key={f.key} className={`px-1 py-1 align-top ${edited ? "bg-amber-100/70" : ""}`}>
                          {renderModalField(p, f)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-neutral-200 text-xs text-neutral-500">
        <div>
          Page {stack.length} · 25 products per page · Edited fields highlight in yellow · Hit &quot;Save changes&quot; to push to Shopify.
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevPage}
            disabled={stack.length < 2 || loading}
            className="inline-flex items-center gap-1 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <button
            onClick={nextPage}
            disabled={!pageInfo.hasNextPage || loading}
            className="inline-flex items-center gap-1 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* ============================================================= */}
      {/* GROUPED MODAL / POPUP: Rapid Multi-Field Editor for a Product */}
      {/* ============================================================= */}
      {groupModal !== null && currentModalProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-2xs animate-in fade-in duration-150"
          onClick={() => setGroupModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-neutral-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/80">
              <div className="flex items-center gap-3 min-w-0">
                {currentModalProduct.featuredImage && (
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-white">
                    <Image
                      src={currentModalProduct.featuredImage}
                      alt={currentModalProduct.title}
                      fill
                      sizes="44px"
                      className="object-contain p-1"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-neutral-900 truncate" title={currentModalProduct.title}>
                    {currentModalProduct.title}
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Product #{groupModal.productIndex + 1} of {rows.length} on this page
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={getShopifyProductAdminUrl(currentModalProduct)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-neutral-600 hover:text-neutral-900 border border-neutral-300 bg-white rounded-md px-2.5 py-1.5"
                >
                  <ExternalLink size={12} /> Shopify Admin
                </a>
                <button
                  onClick={() => setGroupModal(null)}
                  className="rounded-lg p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200 transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Group Selector Tabs */}
            <div className="flex items-center gap-1 px-6 pt-3 border-b border-neutral-200 bg-white">
              <button
                type="button"
                onClick={() => setGroupModal({ ...groupModal, groupKey: "specs" })}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold border-b-2 transition ${
                  groupModal.groupKey === "specs"
                    ? "border-emerald-600 text-emerald-800"
                    : "border-transparent text-neutral-500 hover:text-neutral-800"
                }`}
              >
                <Zap size={14} className="text-emerald-600" /> ⚡ Specs & Hardware
              </button>
              <button
                type="button"
                onClick={() => setGroupModal({ ...groupModal, groupKey: "taste" })}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold border-b-2 transition ${
                  groupModal.groupKey === "taste"
                    ? "border-amber-600 text-amber-800"
                    : "border-transparent text-neutral-500 hover:text-neutral-800"
                }`}
              >
                <Droplets size={14} className="text-amber-600" /> 🍇 Taste & Flavours
              </button>
              <button
                type="button"
                onClick={() => setGroupModal({ ...groupModal, groupKey: "display" })}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold border-b-2 transition ${
                  groupModal.groupKey === "display"
                    ? "border-sky-600 text-sky-800"
                    : "border-transparent text-neutral-500 hover:text-neutral-800"
                }`}
              >
                <Tag size={14} className="text-sky-600" /> 🏷️ Display & Merchandising
              </button>
              <button
                type="button"
                onClick={() => setGroupModal({ ...groupModal, groupKey: "all" })}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold border-b-2 transition ${
                  groupModal.groupKey === "all"
                    ? "border-neutral-900 text-neutral-900"
                    : "border-transparent text-neutral-500 hover:text-neutral-800"
                }`}
              >
                <Layers size={14} /> All Fields
              </button>
            </div>

            {/* Modal Body: Active Group Fields */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {GROUPS.filter((g) => groupModal.groupKey === "all" || g.key === groupModal.groupKey).map((grp) => (
                <div key={grp.key} className="space-y-4">
                  {groupModal.groupKey === "all" && (
                    <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                        {grp.label}
                      </span>
                      <span className="text-xs text-neutral-400">({grp.description})</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {grp.fields.map((f) => (
                      <div key={f.key} className={f.wide ? "md:col-span-2" : ""}>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-neutral-700">{f.label}</label>
                          {isFieldEdited(currentModalProduct, f.key) && (
                            <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 rounded px-1.5 py-0.2">
                              Draft Edit
                            </span>
                          )}
                        </div>
                        {renderModalField(currentModalProduct, f)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer with Fast Next / Previous Product navigation */}
            <div className="flex items-center justify-between px-6 py-3.5 border-t border-neutral-200 bg-neutral-50">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={groupModal.productIndex <= 0}
                  onClick={() =>
                    setGroupModal({
                      ...groupModal,
                      productIndex: groupModal.productIndex - 1,
                    })
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 disabled:opacity-40"
                >
                  <ChevronLeft size={14} /> Previous Product
                </button>
                <button
                  type="button"
                  disabled={groupModal.productIndex >= rows.length - 1}
                  onClick={() =>
                    setGroupModal({
                      ...groupModal,
                      productIndex: groupModal.productIndex + 1,
                    })
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 disabled:opacity-40"
                >
                  Next Product <ChevronRight size={14} />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setGroupModal(null)}
                  className="rounded-lg bg-neutral-900 px-4 py-2 text-xs font-bold text-white hover:bg-neutral-800 transition"
                >
                  Done Editing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-picker dialog: flavors / related / nicotine options */}
      {picker && pickerProduct && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setPicker(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3 border-b pb-2">
              <h3 className="font-bold text-neutral-900">
                {picker.kind === "flavors"
                  ? "Select Flavours"
                  : picker.kind === "related"
                    ? "Select Related Products"
                    : "Configure Nicotine Options"}
              </h3>
              <button onClick={() => setPicker(null)} className="text-neutral-500 hover:text-neutral-900">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-neutral-500 mb-3 truncate font-medium">{pickerProduct.title}</p>

            {picker.kind === "flavors" && (
              <div className="flex flex-col gap-1.5 max-h-[50vh] overflow-y-auto pr-1">
                {(flavors || []).map((fl: any) => {
                  const ids = currentFlavorIds(pickerProduct);
                  const on = ids.includes(fl.id);
                  return (
                    <button
                      key={fl.id}
                      type="button"
                      onClick={() =>
                        setListCell(
                          pickerProduct,
                          "flavors",
                          on ? ids.filter((x) => x !== fl.id) : [...ids, fl.id],
                          storedFlavorIds(pickerProduct)
                        )
                      }
                      className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm text-left transition ${
                        on
                          ? "bg-neutral-900 text-white border-neutral-900 font-semibold"
                          : "bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-50"
                      }`}
                    >
                      <span>{fl.name}</span>
                      {on && <Check size={16} className="text-white" />}
                    </button>
                  );
                })}
                {!(flavors || []).length && (
                  <p className="text-sm text-neutral-500 py-4 text-center">No flavour items defined yet.</p>
                )}
              </div>
            )}

            {picker.kind === "related" && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    className="flex-1 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
                    placeholder="Search product by title…"
                    value={relQuery}
                    onChange={(e) => setRelQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchRelated()}
                  />
                  <button
                    type="button"
                    onClick={searchRelated}
                    className="rounded-md bg-neutral-900 px-3.5 py-2 text-sm font-semibold text-white"
                  >
                    Search
                  </button>
                </div>
                {relSearching && <p className="text-xs text-neutral-500">Searching store products…</p>}
                <div className="flex flex-col gap-1 max-h-[35vh] overflow-y-auto">
                  {relResults.map((r: any) => {
                    const items = currentRelated(pickerProduct);
                    const added = items.some((x) => x.handle === r.handle);
                    return (
                      <button
                        key={r.id}
                        type="button"
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
                        className={`rounded-md border px-3 py-2 text-sm text-left transition ${
                          added
                            ? "bg-emerald-50 border-emerald-300 text-emerald-800 opacity-60"
                            : "bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-50"
                        }`}
                      >
                        {r.title} {added ? "✓ Added" : ""}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {picker.kind === "options" && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-neutral-600">Quick preset strengths:</label>
                <div className="flex flex-wrap gap-2">
                  {STRENGTH_PRESETS.map((s) => {
                    const vals = currentStrengths(pickerProduct);
                    const on = vals.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() =>
                          setListCell(
                            pickerProduct,
                            "nicotine_options",
                            on ? vals.filter((x) => x !== s) : [...vals, s],
                            storedStrengths(pickerProduct)
                          )
                        }
                        className={`rounded-full px-3.5 py-1.5 text-xs font-bold border transition ${
                          on ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100"
                        }`}
                      >
                        {s} {on ? "✓" : "+"}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <input
                    className="flex-1 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-emerald-600"
                    placeholder="Custom, e.g. 50mg (5%)"
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
                    type="button"
                    onClick={() => {
                      const v = customStrength.trim();
                      if (!v) return;
                      const vals = currentStrengths(pickerProduct);
                      if (!vals.includes(v))
                        setListCell(pickerProduct, "nicotine_options", [...vals, v], storedStrengths(pickerProduct));
                      setCustomStrength("");
                    }}
                    className="rounded-md bg-neutral-900 px-3.5 py-1.5 text-xs font-bold text-white"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setPicker(null)}
              className="mt-4 w-full rounded-lg bg-neutral-900 py-2.5 text-sm font-bold text-white hover:bg-neutral-800"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
