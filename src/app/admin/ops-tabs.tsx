"use client";

import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { Lbl, Inp, PrimaryBtn } from "./panel-ui";

/* ------------------------------------------------------------------ */
/*  Store ops (read-only) + URL redirects                              */
/*  Orders tab already exists in products-manager; it reads           */
/*  data.orders, which getPanelData now returns. Fulfill/refund stay   */
/*  in Shopify — the panel only lists, it never fulfills.              */
/* ------------------------------------------------------------------ */

function Table({ head, rows, empty }: { head: string[]; rows: React.ReactNode; empty: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
            {head.map((h) => (
              <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">{rows}</tbody>
      </table>
      {empty && (
        <p className="px-3 py-6 text-center text-neutral-500">{empty}</p>
      )}
    </div>
  );
}

export function DraftsTab({ data }: any) {
  const list = data.draftOrders || [];
  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-900 mb-4">Draft Orders (view only)</h1>
      <Table
        head={["Draft", "Customer", "Status", "Total"]}
        empty={list.length ? "" : "No draft orders."}
        rows={list.map((o: any) => (
          <tr key={o.id} className="hover:bg-neutral-50">
            <td className="px-3 py-2.5 font-medium text-neutral-900">{o.name}</td>
            <td className="px-3 py-2.5 text-neutral-700">{o.customer}</td>
            <td className="px-3 py-2.5 text-neutral-700">{o.status}</td>
            <td className="px-3 py-2.5 font-medium text-neutral-900">{o.currency} {o.total}</td>
          </tr>
        ))}
      />
      <p className="text-xs text-neutral-500 mt-3">Draft order complete/convert korte Shopify app use koro — panel-e shudhu dekha jay.</p>
    </div>
  );
}

export function CustomersTab({ data, save }: any) {
  const list = data.customers || [];
  const [sel, setSel] = useState<any>(null);
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [tags, setTags] = useState("");

  const openCustomer = async (c: any) => {
    setSel(c);
    setLoading(true);
    const res = await fetch("/api/admin-panel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "customerDetail", id: c.id }),
    });
    const r = await res.json();
    setLoading(false);
    if (!r.ok) return;
    setDetail(r.detail);
    setNote(r.detail.note || "");
    setTags(r.detail.tags || "");
  };

  const doSave = async () => {
    if (!detail) return;
    await save("customer.save", { id: detail.id, note, tags });
    setDetail({ ...detail, note, tags });
  };

  if (sel && detail) {
    return (
      <div>
        <button onClick={() => { setSel(null); setDetail(null); }} className="text-sm font-semibold text-neutral-600 mb-3">← Back to customers</button>
        <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-4 mb-4">
          <h1 className="text-xl font-bold text-neutral-900">{detail.name}</h1>
          <p className="text-sm text-neutral-700 mt-1">{detail.email || "—"} {detail.phone ? `· ${detail.phone}` : ""}</p>
          <p className="text-sm text-neutral-700 mt-1"><b>Orders:</b> {detail.orders} · <b>Total spent:</b> {detail.currency} {detail.spent}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-4 mb-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <Lbl>Note (customer somporke kichu likhe rakho)</Lbl>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600" />
            </div>
            <div className="sm:col-span-2">
              <Lbl>Tags (comma diye — jemon: vip, wholesale)</Lbl>
              <Inp value={tags} onChange={(e) => setTags(e.target.value)} placeholder="vip, wholesale" />
            </div>
          </div>
          <div className="mt-3">
            <PrimaryBtn onClick={doSave}>Save customer</PrimaryBtn>
          </div>
        </div>
        {(detail.addresses || []).length > 0 && (
          <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-4 mb-4">
            <h2 className="font-bold text-neutral-900 mb-2">Addresses</h2>
            {(detail.addresses || []).map((a: any) => (
              <p key={a.id} className="text-sm text-neutral-700">{a.label}{a.isDefault ? " (default)" : ""}</p>
            ))}
          </div>
        )}
        <Table
          head={["Order", "Date", "Payment", "Fulfillment", "Total"]}
          empty={(detail.orderHistory || []).length ? "" : "No orders yet."}
          rows={(detail.orderHistory || []).map((o: any) => (
            <tr key={o.id} className="hover:bg-neutral-50">
              <td className="px-3 py-2.5 font-medium text-neutral-900">{o.name}</td>
              <td className="px-3 py-2.5 text-neutral-700">{o.createdAt ? o.createdAt.slice(0, 10) : "—"}</td>
              <td className="px-3 py-2.5 text-neutral-700">{o.financial || "—"}</td>
              <td className="px-3 py-2.5 text-neutral-700">{o.fulfillment || "—"}</td>
              <td className="px-3 py-2.5 font-medium text-neutral-900">{o.currency} {o.total}</td>
            </tr>
          ))}
        />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-900 mb-4">Customers</h1>
      <Table
        head={["Customer", "Email", "Phone", "Orders", "Spent"]}
        empty={list.length ? "" : "No customers yet."}
        rows={list.map((c: any) => (
          <tr key={c.id} className="hover:bg-neutral-50 cursor-pointer" onClick={() => openCustomer(c)}>
            <td className="px-3 py-2.5 font-medium text-neutral-900">{c.name}</td>
            <td className="px-3 py-2.5 text-neutral-700">{c.email}</td>
            <td className="px-3 py-2.5 text-neutral-700">{c.phone || "—"}</td>
            <td className="px-3 py-2.5 text-neutral-700">{c.orders}</td>
            <td className="px-3 py-2.5 font-medium text-neutral-900">{c.currency} {c.spent}</td>
          </tr>
        ))}
      />
      {loading && <p className="text-sm text-neutral-500 mt-3">Customer khulche…</p>}
      <p className="text-xs text-neutral-500 mt-3">Customer-e click korle detail dekhabe — note, tag, address ar order history.</p>
    </div>
  );
}

export function DiscountsTab({ data, save }: any) {
  const list = data.discounts || [];
  const [form, setForm] = useState<any>({ title: "", code: "", type: "percentage", value: "", startsAt: "", endsAt: "", usageLimit: "", minSubtotal: "", oncePerCustomer: false });
  const set = (k: string, v: any) => setForm({ ...form, [k]: v });
  const [busy, setBusy] = useState(false);

  const create = async () => {
    if (busy) return;
    setBusy(true);
    await save("discount.save", form);
    setBusy(false);
    setForm({ title: "", code: "", type: "percentage", value: "", startsAt: "", endsAt: "", usageLimit: "", minSubtotal: "", oncePerCustomer: false });
  };
  const del = async (id: string, title: string) => {
    if (!window.confirm(`"${title}" discount-ta delete korbo? Code-ta ar kaj korbe na.`)) return;
    await save("discount.delete", { id });
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-900 mb-4">Discounts</h1>
      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm mb-4">
        <h2 className="font-bold text-neutral-900 mb-3">Notun discount code</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Lbl>Discount-er nam</Lbl>
            <Inp value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="jemon: Eid Sale 10%" />
          </div>
          <div>
            <Lbl>Code (customer checkout-e likhbe)</Lbl>
            <Inp value={form.code} onChange={(e) => set("code", e.target.value.toUpperCase())} placeholder="EID10" />
          </div>
          <div>
            <Lbl>Chhar-er dhoron</Lbl>
            <select value={form.type} onChange={(e) => set("type", e.target.value)} className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm">
              <option value="percentage">Percentage (%) off</option>
              <option value="fixed">Fixed AED off</option>
            </select>
          </div>
          <div>
            <Lbl>{form.type === "fixed" ? "Koto AED off" : "Koto % off"}</Lbl>
            <Inp type="number" value={form.value} onChange={(e) => set("value", e.target.value)} placeholder={form.type === "fixed" ? "50" : "10"} />
          </div>
          <div>
            <Lbl>Shuru (khali rakhle ekhoni)</Lbl>
            <Inp type="datetime-local" value={form.startsAt} onChange={(e) => set("startsAt", e.target.value)} />
          </div>
          <div>
            <Lbl>Shesh (khali rakhle shesh nai)</Lbl>
            <Inp type="datetime-local" value={form.endsAt} onChange={(e) => set("endsAt", e.target.value)} />
          </div>
          <div>
            <Lbl>Usage limit (koybar use kora jabe — khali rakhle limit nai)</Lbl>
            <Inp type="number" value={form.usageLimit} onChange={(e) => set("usageLimit", e.target.value)} placeholder="100" />
          </div>
          <div>
            <Lbl>Minimum order (AED — khali rakhle minimum nai)</Lbl>
            <Inp type="number" value={form.minSubtotal} onChange={(e) => set("minSubtotal", e.target.value)} placeholder="200" />
          </div>
          <label className="flex items-center gap-2 text-sm text-neutral-700 sm:col-span-2">
            <input type="checkbox" checked={form.oncePerCustomer} onChange={(e) => set("oncePerCustomer", e.target.checked)} />
            Ekjon customer ekbar-i use korte parbe
          </label>
        </div>
        <div className="mt-3">
          <PrimaryBtn onClick={create}><Plus size={15} /> {busy ? "Toiri hocche…" : "Discount toiri koro"}</PrimaryBtn>
        </div>
      </div>
      <Table
        head={["Title", "Code", "Status", ""]}
        empty={list.length ? "" : "No discounts yet."}
        rows={list.map((d: any) => (
          <tr key={d.id} className="hover:bg-neutral-50">
            <td className="px-3 py-2.5 font-medium text-neutral-900">{d.title}</td>
            <td className="px-3 py-2.5 text-neutral-700">{d.code}</td>
            <td className="px-3 py-2.5 text-neutral-700">{d.status || "—"}</td>
            <td className="px-3 py-2.5 text-right">
              {d.code !== "Automatic" && (
                <button onClick={() => del(d.id, d.title)} className="text-red-500 hover:text-red-700 p-1" aria-label="Delete discount">
                  <Trash2 size={14} />
                </button>
              )}
            </td>
          </tr>
        ))}
      />
      <p className="text-xs text-neutral-500 mt-3">Buy X Get Y ba free-shipping discount korte Shopify admin use koro — panel-e shudhu percentage / fixed-amount code discount toiri hoy.</p>
    </div>
  );
}

export function RedirectsTab({ data, save, reload }: any) {
  const list = data.redirects || [];
  const [path, setPath] = useState("");
  const [target, setTarget] = useState("");
  const [busy, setBusy] = useState(false);

  const add = async () => {
    if (busy || !path.trim() || !target.trim()) return;
    setBusy(true);
    await save("redirect.save", { path: path.trim(), target: target.trim() });
    setBusy(false);
    setPath("");
    setTarget("");
    if (reload) reload();
  };
  const del = async (id: string) => {
    if (!window.confirm("Delete this redirect? Old links will 404 again.")) return;
    await save("redirect.delete", { id });
    if (reload) reload();
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-900 mb-4">URL Redirects</h1>
      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm mb-4">
        <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
          <div>
            <Lbl>Old path (must start with /)</Lbl>
            <Inp value={path} onChange={(e) => setPath(e.target.value)} placeholder="/old-page" />
          </div>
          <div>
            <Lbl>Redirects to</Lbl>
            <Inp value={target} onChange={(e) => setTarget(e.target.value)} placeholder="/collections/juul" />
          </div>
          <PrimaryBtn onClick={add}><Plus size={15} /> Add redirect</PrimaryBtn>
        </div>
      </div>
      <Table
        head={["From", "To", ""]}
        empty={list.length ? "" : "No redirects yet."}
        rows={list.map((r: any) => (
          <tr key={r.id} className="hover:bg-neutral-50">
            <td className="px-3 py-2.5 font-medium text-neutral-900">{r.path}</td>
            <td className="px-3 py-2.5 text-neutral-700">{r.target}</td>
            <td className="px-3 py-2.5 text-right">
              <button onClick={() => del(r.id)} className="text-red-500 hover:text-red-700 p-1" aria-label="Delete redirect">
                <Trash2 size={14} />
              </button>
            </td>
          </tr>
        ))}
      />
    </div>
  );
}
