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
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 100;
  const filtered = (data.products || [])
    .filter((p: any) => (status === "ALL" || p.status === status) && (!q || p.title.toLowerCase().includes(q.toLowerCase())));
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const shown = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

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
          <option value="ARCHIVED">Archived</option>
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
      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-neutral-500">
          {filtered.length === 0 ? "No products found." : `Showing ${safePage * PAGE_SIZE + 1}–${Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} of ${filtered.length} products.`}
        </p>
        {pageCount > 1 && (
          <div className="flex gap-2">
            <button type="button" disabled={safePage === 0} onClick={() => setPage(safePage - 1)} className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 disabled:opacity-40 hover:bg-neutral-50">← Prev</button>
            <span className="text-xs text-neutral-500 self-center">Page {safePage + 1} of {pageCount}</span>
            <button type="button" disabled={safePage >= pageCount - 1} onClick={() => setPage(safePage + 1)} className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 disabled:opacity-40 hover:bg-neutral-50">Next →</button>
          </div>
        )}
      </div>
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

export function OrdersTab({ data, notify, reload }: any) {
  const [sel, setSel] = useState<any>(null);
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const fmtDate = (iso: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? iso.slice(0, 10) : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  const openOrder = async (o: any) => {
    setSel(o);
    setLoading(true);
    const r = await api({ action: "orderDetail", id: o.id });
    setLoading(false);
    if (!r.ok) { notify("Error: " + (r.error || "could not load order")); return; }
    setDetail(r.detail);
  };

  const doFulfill = async () => {
    if (!detail) return;
    if (!window.confirm(`${detail.name} order-ta fulfilled hishebe mark korbo? Customer-ke janano hobe.`)) return;
    setBusy(true);
    const r = await api({ action: "order.fulfill", id: detail.id });
    setBusy(false);
    if (r.ok) { notify(r.message || "Order fulfilled."); setSel(null); setDetail(null); if (reload) reload(); }
    else notify("Error: " + (r.error || "fulfil failed"));
  };

  const doRefund = async () => {
    if (!detail) return;
    const refundable = (parseFloat(detail.total || "0") || 0) - (parseFloat(detail.refunded || "0") || 0);
    if (!window.confirm(`${detail.name} order-er puro ${detail.currency} ${refundable.toFixed(2)} ferot dibo? Taka customer-er kache fire jabe ar item-gulo stock-e fire asbe.`)) return;
    setBusy(true);
    const r = await api({ action: "order.refund", id: detail.id });
    setBusy(false);
    if (r.ok) { notify(r.message || "Refund done."); setSel(null); setDetail(null); if (reload) reload(); }
    else notify("Error: " + (r.error || "refund failed"));
  };

  if (sel && detail) {
    const refundable = (parseFloat(detail.total || "0") || 0) - (parseFloat(detail.refunded || "0") || 0);
    const canFulfill = (detail.fulfillmentOrders || []).some((fo: any) => fo.status === "OPEN" && (fo.lineItems || []).some((li: any) => li.remainingQuantity > 0));
    return (
      <div>
        <button onClick={() => { setSel(null); setDetail(null); }} className="text-sm font-semibold text-neutral-600 mb-3">← Back to orders</button>
        <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-4 mb-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <h1 className="text-xl font-bold text-neutral-900">{detail.name}</h1>
            <span className="text-sm text-neutral-500">{fmtDate(detail.createdAt)}</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${detail.financial === "PAID" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>Payment: {detail.financial || "—"}</span>
            <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold bg-neutral-200 text-neutral-700">Fulfillment: {detail.fulfillment || "—"}</span>
            {parseFloat(detail.refunded || "0") > 0 && <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-800">Refunded: {detail.currency} {detail.refunded}</span>}
          </div>
          <p className="text-sm text-neutral-700"><b>Customer:</b> {detail.customer} {detail.email ? `· ${detail.email}` : ""} {detail.phone ? `· ${detail.phone}` : ""}</p>
          {detail.shippingAddress && <p className="text-sm text-neutral-700 mt-1"><b>Ship to:</b> {detail.shippingAddress}</p>}
          {detail.note && <p className="text-sm text-neutral-700 mt-1"><b>Note:</b> {detail.note}</p>}
          {detail.tags && <p className="text-sm text-neutral-500 mt-1"><b>Tags:</b> {detail.tags}</p>}
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-3 py-2.5 font-semibold">Item</th>
                <th className="px-3 py-2.5 font-semibold">Qty</th>
                <th className="px-3 py-2.5 font-semibold">Price</th>
                <th className="px-3 py-2.5 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {(detail.lineItems || []).map((li: any) => (
                <tr key={li.id}>
                  <td className="px-3 py-2.5"><span className="font-medium text-neutral-900">{li.title}</span>{li.variantTitle ? <span className="text-neutral-500"> — {li.variantTitle}</span> : null}{li.sku ? <span className="text-neutral-400 text-xs"> · {li.sku}</span> : null}</td>
                  <td className="px-3 py-2.5 text-neutral-700">{li.quantity}</td>
                  <td className="px-3 py-2.5 text-neutral-700">{detail.currency} {li.unitPrice}</td>
                  <td className="px-3 py-2.5 font-medium text-neutral-900">{detail.currency} {li.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-3 py-3 text-sm text-neutral-700 space-y-1 border-t border-neutral-100">
            <p className="flex justify-between"><span>Subtotal</span><span>{detail.currency} {detail.subtotal}</span></p>
            <p className="flex justify-between"><span>Shipping</span><span>{detail.currency} {detail.shipping}</span></p>
            <p className="flex justify-between"><span>Tax</span><span>{detail.currency} {detail.tax}</span></p>
            <p className="flex justify-between font-bold text-neutral-900"><span>Total</span><span>{detail.currency} {detail.total}</span></p>
            {parseFloat(detail.refunded || "0") > 0 && <p className="flex justify-between text-red-600"><span>Refunded</span><span>−{detail.currency} {detail.refunded}</span></p>}
          </div>
        </div>

        {(detail.fulfillments || []).length > 0 && (
          <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-4 mb-4">
            <h2 className="font-bold text-neutral-900 mb-2">Fulfillments</h2>
            {(detail.fulfillments || []).map((f: any) => (
              <p key={f.id} className="text-sm text-neutral-700">{f.status} · {fmtDate(f.createdAt)}{f.tracking ? ` · ${f.tracking}` : ""}</p>
            ))}
          </div>
        )}
        {(detail.refunds || []).length > 0 && (
          <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-4 mb-4">
            <h2 className="font-bold text-neutral-900 mb-2">Refunds</h2>
            {(detail.refunds || []).map((r: any) => (
              <p key={r.id} className="text-sm text-neutral-700">{detail.currency} {r.amount} · {fmtDate(r.createdAt)}</p>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {canFulfill && (
            <button type="button" disabled={busy} onClick={doFulfill} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-50">
              {busy ? "Kaj hocche…" : "Fulfil order"}
            </button>
          )}
          {refundable > 0 && (
            <button type="button" disabled={busy} onClick={doRefund} className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-100 disabled:opacity-50">
              {busy ? "Kaj hocche…" : `Refund full amount (${detail.currency} ${refundable.toFixed(2)})`}
            </button>
          )}
          {!canFulfill && refundable <= 0 && (
            <p className="text-sm text-neutral-500">Ei order-e ar fulfil ba refund korar kichu nai.</p>
          )}
        </div>
        <p className="text-xs text-neutral-500 mt-3">Partial refund (koyekta item ba kichu taka) korte Shopify admin use koro — panel-e shudhu puro refund hoy.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-900 mb-4">Orders</h1>
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
              <th className="px-3 py-2.5 font-semibold">Order</th>
              <th className="px-3 py-2.5 font-semibold">Customer</th>
              <th className="px-3 py-2.5 font-semibold hidden sm:table-cell">Date</th>
              <th className="px-3 py-2.5 font-semibold hidden sm:table-cell">Payment</th>
              <th className="px-3 py-2.5 font-semibold">Fulfillment</th>
              <th className="px-3 py-2.5 font-semibold">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {(data.orders || []).map((o: any) => (
              <tr key={o.id} className="hover:bg-neutral-50 cursor-pointer" onClick={() => openOrder(o)}>
                <td className="px-3 py-2.5 font-medium text-neutral-900">{o.name}</td>
                <td className="px-3 py-2.5 text-neutral-700">{o.customer}</td>
                <td className="px-3 py-2.5 text-neutral-700 hidden sm:table-cell">{fmtDate(o.createdAt)}</td>
                <td className="px-3 py-2.5 text-neutral-700 hidden sm:table-cell">{o.financial || "—"}</td>
                <td className="px-3 py-2.5 text-neutral-700">{o.fulfillment || "—"}</td>
                <td className="px-3 py-2.5 font-medium text-neutral-900">
                  {o.currency} {o.total}
                </td>
              </tr>
            ))}
            {!(data.orders || []).length && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-neutral-500">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {loading && <p className="text-sm text-neutral-500 mt-3">Order khulche…</p>}
      <p className="text-xs text-neutral-500 mt-3">Order-e click korle detail dekhabe — item, customer, fulfil ar full refund ekhan thekei kora jabe.</p>
    </div>
  );
}
