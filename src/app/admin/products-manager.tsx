"use client";

import { useState } from "react";
import { Search, Plus, Table } from "lucide-react";
import { BulkSheet } from "./bulk-sheet";
import { ProductEditor } from "./product-editor";

async function api(body: any): Promise<any> {
  const res = await fetch("/api/admin-panel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
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

export function ProductsManager({ data, notify, reload, initialQuery }: any) {
  const [view, setView] = useState<any>({ name: "list" });
  const [q, setQ] = useState(initialQuery || "");
  const [status, setStatus] = useState("ALL");
  const shown = (data.products || [])
    .filter((p: any) => (status === "ALL" || p.status === status) && (!q || p.title.toLowerCase().includes(q.toLowerCase())))
    .slice(0, 100);

  if (view.name === "bulk") {
    return <BulkSheet notify={notify} back={() => setView({ name: "list" })} flavors={data.flavors} />;
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
