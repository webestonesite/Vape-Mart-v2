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

export function CustomersTab({ data }: any) {
  const list = data.customers || [];
  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-900 mb-4">Customers (view only)</h1>
      <Table
        head={["Customer", "Email", "Phone", "Orders", "Spent"]}
        empty={list.length ? "" : "No customers yet."}
        rows={list.map((c: any) => (
          <tr key={c.id} className="hover:bg-neutral-50">
            <td className="px-3 py-2.5 font-medium text-neutral-900">{c.name}</td>
            <td className="px-3 py-2.5 text-neutral-700">{c.email}</td>
            <td className="px-3 py-2.5 text-neutral-700">{c.phone || "—"}</td>
            <td className="px-3 py-2.5 text-neutral-700">{c.orders}</td>
            <td className="px-3 py-2.5 font-medium text-neutral-900">{c.currency} {c.spent}</td>
          </tr>
        ))}
      />
    </div>
  );
}

export function DiscountsTab({ data }: any) {
  const list = data.discounts || [];
  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-900 mb-4">Discounts (view only)</h1>
      <Table
        head={["Title", "Code"]}
        empty={list.length ? "" : "No discounts yet."}
        rows={list.map((d: any) => (
          <tr key={d.id} className="hover:bg-neutral-50">
            <td className="px-3 py-2.5 font-medium text-neutral-900">{d.title}</td>
            <td className="px-3 py-2.5 text-neutral-700">{d.code}</td>
          </tr>
        ))}
      />
      <p className="text-xs text-neutral-500 mt-3">Discount toiri/bodol korte Shopify app use koro — panel-e shudhu dekha jay.</p>
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
