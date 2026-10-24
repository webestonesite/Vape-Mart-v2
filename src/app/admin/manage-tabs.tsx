"use client";

import { useState } from "react";import { Search, Plus, Trash2, Save, X, Star } from "lucide-react";
import { api, Lbl, Inp, TA, PrimaryBtn } from "./panel-ui";

/* ------------------------------------------------------------------ */
/*  Phase 2 managers: per-product reviews, collections v2, flavors,    */
/*  media library. All saves go through the panel API into Shopify.    */
/* ------------------------------------------------------------------ */

function Card({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-neutral-900">{title}</h2>
        {right}
      </div>
      {children}
    </div>
  );
}

function DelBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
    >
      <Trash2 size={13} /> Delete
    </button>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <span className="text-amber-500 text-sm tracking-wide">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={13} className="inline" fill={i <= n ? "currentColor" : "none"} />
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Product Reviews (vm_product_review metaobjects)                    */
/* ------------------------------------------------------------------ */

export function ProductReviewsTab({ data, save }: any) {
  const [filterProduct, setFilterProduct] = useState("");
  const [form, setForm] = useState<any>({ product: "", author: "", rating: 5, title: "", body: "", verified: true, position: 0 });
  const [editing, setEditing] = useState<any>(null);

  const reviews = (data.reviews || [])
    .filter((r: any) => !filterProduct || r.product === filterProduct)
    .sort((a: any, b: any) => (a.product === b.product ? (a.position || 0) - (b.position || 0) : String(a.product).localeCompare(String(b.product))));
  const productName = (id: string) => (data.products || []).find((p: any) => p.id === id)?.title || id;

  const startEdit = (r: any) => {
    setEditing(r);
    setForm({ product: r.product, author: r.author, rating: r.rating, title: r.title, body: r.body, verified: r.verified, position: r.position });
  };
  const resetForm = () => {
    setEditing(null);
    setForm({ product: "", author: "", rating: 5, title: "", body: "", verified: true, position: 0 });
  };
  const doSave = async () => {
    if (!form.product || !form.author.trim() || !form.body.trim()) return;
    await save("review.save", { ...(editing ? { id: editing.id } : {}), ...form });
    resetForm();
  };

  return (
    <div>
      <p className="text-sm text-neutral-500 mb-4">
        Prottek product-er jonno alada review likhun — egulo product page-er Customer Reviews carousel-e dekhabe.
        Age ei section-ta konodin dekha jeto na, karon review-er kono data model chilo na.
      </p>
      <Card title="Add / edit review" right={editing && <button onClick={resetForm} className="text-xs font-semibold text-neutral-500 inline-flex items-center gap-1"><X size={13} /> Cancel edit</button>}>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Lbl>Product</Lbl>
            <select value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm">
              <option value="">Select product…</option>
              {(data.products || []).map((p: any) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          <div>
            <Lbl>Author name</Lbl>
            <Inp value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="e.g. Ahmed R." />
          </div>
          <div>
            <Lbl>Rating</Lbl>
            <select value={form.rating} onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value, 10) })} className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm">
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>{n} star{n > 1 ? "s" : ""}</option>
              ))}
            </select>
          </div>
          <div>
            <Lbl>Position (order)</Lbl>
            <Inp type="number" value={form.position} onChange={(e) => setForm({ ...form, position: parseInt(e.target.value, 10) || 0 })} />
          </div>
          <div className="sm:col-span-2">
            <Lbl>Review title</Lbl>
            <Inp value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Best disposable I have tried" />
          </div>
          <div className="sm:col-span-2">
            <Lbl>Review text</Lbl>
            <TA rows={3} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="What did the customer say?" />
          </div>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" checked={form.verified} onChange={(e) => setForm({ ...form, verified: e.target.checked })} />
            Verified purchase
          </label>
        </div>
        <div className="mt-3">
          <PrimaryBtn onClick={doSave}><Save size={15} /> {editing ? "Update review" : "Add review"}</PrimaryBtn>
        </div>
      </Card>

      <div className="mb-3">
        <Lbl>Filter by product</Lbl>
        <select value={filterProduct} onChange={(e) => setFilterProduct(e.target.value)} className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm">
          <option value="">All products</option>
          {(data.products || []).map((p: any) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-neutral-500">No product reviews yet.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r: any) => (
            <div key={r.id} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-neutral-500">{productName(r.product)}</p>
                  <p className="font-bold text-neutral-900">{r.title || "(no title)"} <Stars n={r.rating} /></p>
                  <p className="text-sm text-neutral-600 mt-1">{r.body}</p>
                  <p className="text-xs text-neutral-500 mt-2">{r.author}{r.verified ? " · Verified" : ""}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => startEdit(r)} className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50">Edit</button>
                  <DelBtn onClick={async () => { if (confirm("Delete this review?")) await save("review.delete", { id: r.id }); }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Collections v2 (edit native fields + metafields + FAQs)            */
/* ------------------------------------------------------------------ */

export function CollectionsManager({ data, notify, reload }: any) {
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [faqForm, setFaqForm] = useState<any>({ question: "", answer: "", position: 0 });

  const shown = (data.collections || []).filter((c: any) => !q || c.title.toLowerCase().includes(q.toLowerCase()));

  const openEdit = async (c: any) => {
    setLoading(true);
    const r = await api({ action: "collectionDetail", id: c.id });
    setLoading(false);
    if (!r.ok) { notify("Error: " + (r.error || "could not load collection")); return; }
    setEditing(c);
    setForm(r.detail);
  };

  const doSave = async () => {
    if (!form.title.trim()) return;
    const r = await api({ action: "save", saveAction: "collection.save", payload: form });
    if (r.ok) { notify(r.message || "Saved"); setEditing(null); setForm(null); reload(); }
    else notify("Error: " + (r.error || "save failed"));
  };

  const doCreate = async () => {
    if (!newTitle.trim()) return;
    const r = await api({ action: "collection.create", title: newTitle.trim() });
    if (r.ok) { notify("Collection created."); setNewTitle(""); reload(); }
    else notify("Error: " + (r.error || "create failed"));
  };

  const faqs = (data.collectionFaqs || []).filter((f: any) => editing && f.collection === editing.id);

  if (editing && form) {
    return (
      <div>
        <button onClick={() => { setEditing(null); setForm(null); }} className="text-sm font-semibold text-neutral-600 mb-3">← Back to collections</button>
        <Card title={`Edit: ${form.handle}`}>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Lbl>Title</Lbl>
              <Inp value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Lbl>Handle (URL slug, read-only here)</Lbl>
              <Inp value={form.handle} disabled />
            </div>
            <div className="sm:col-span-2">
              <Lbl>Description</Lbl>
              <TA rows={4} value={form.descriptionHtml} onChange={(e) => setForm({ ...form, descriptionHtml: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Lbl>Image URL</Lbl>
              <Inp value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://…" />
            </div>
            <div>
              <Lbl>SEO title</Lbl>
              <Inp value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
            </div>
            <div>
              <Lbl>SEO description</Lbl>
              <Inp value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} />
            </div>
            <div>
              <Lbl>Badge (collection page hero)</Lbl>
              <Inp value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="e.g. BEST SELLER" />
            </div>
            <div>
              <Lbl>Hero subtitle</Lbl>
              <Inp value={form.heroSubtitle} onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-sm text-neutral-700 sm:col-span-2">
              <input type="checkbox" checked={form.showAsCard} onChange={(e) => setForm({ ...form, showAsCard: e.target.checked })} />
              Show as a category card on the Shop page (even if it is not in the built-in list)
            </label>
          </div>
          <div className="mt-3 flex gap-2">
            <PrimaryBtn onClick={doSave}><Save size={15} /> Save collection</PrimaryBtn>
            <button
              onClick={async () => { if (confirm("Delete this collection? Products stay, only the collection is removed.")) { const r = await api({ action: "collection.delete", id: form.id }); if (r.ok) { notify("Collection deleted."); setEditing(null); setForm(null); reload(); } else notify("Error: " + (r.error || "delete failed")); } }}
              className="inline-flex items-center gap-1 rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </Card>

        <Card title="Collection FAQs (shown on this collection page)">
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <div className="sm:col-span-2">
              <Lbl>Question</Lbl>
              <Inp value={faqForm.question} onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Lbl>Answer</Lbl>
              <TA rows={2} value={faqForm.answer} onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })} />
            </div>
            <div>
              <Lbl>Position</Lbl>
              <Inp type="number" value={faqForm.position} onChange={(e) => setFaqForm({ ...faqForm, position: parseInt(e.target.value, 10) || 0 })} />
            </div>
          </div>
          <PrimaryBtn onClick={async () => {
            if (!faqForm.question.trim()) return;
            const r = await api({ action: "save", saveAction: "collectionFaq.save", payload: { collection: editing.id, ...faqForm } });
            if (r.ok) { notify(r.message || "Saved"); setFaqForm({ question: "", answer: "", position: 0 }); reload(); }
            else notify("Error: " + (r.error || "save failed"));
          }}><Plus size={15} /> Add FAQ</PrimaryBtn>
          <div className="mt-4 space-y-2">
            {faqs.map((f: any) => (
              <div key={f.id} className="flex items-start justify-between gap-3 rounded-lg border border-neutral-100 p-3">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{f.question}</p>
                  <p className="text-sm text-neutral-600">{f.answer}</p>
                </div>
                <DelBtn onClick={async () => { if (confirm("Delete this FAQ?")) { const r = await api({ action: "save", saveAction: "collectionFaq.delete", payload: { id: f.id } }); if (r.ok) { notify("Deleted."); reload(); } else notify("Error: " + (r.error || "delete failed")); } }} />
              </div>
            ))}
            {faqs.length === 0 && <p className="text-sm text-neutral-500">No FAQs for this collection yet.</p>}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search collections…" className="w-full rounded-md border border-neutral-300 bg-white pl-9 pr-3 py-2 text-sm" />
        </div>
        <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="New collection title…" className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm" />
        <PrimaryBtn onClick={doCreate}><Plus size={15} /> Create</PrimaryBtn>
      </div>
      {loading && <p className="text-neutral-500">Loading collection…</p>}
      <div className="space-y-2">
        {shown.map((c: any) => (
          <div key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
            <div>
              <p className="font-semibold text-neutral-900">{c.title}</p>
              <p className="text-xs text-neutral-500">/{c.handle} · {c.productCount} products</p>
            </div>
            <button onClick={() => openEdit(c)} className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50">Edit</button>
          </div>
        ))}
        {shown.length === 0 && <p className="text-sm text-neutral-500">No collections found.</p>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Flavors (flavor metaobjects)                                       */
/* ------------------------------------------------------------------ */

export function FlavorsTab({ data, save }: any) {
  const [form, setForm] = useState<any>({ name: "", color: "", inStock: true, imageUrl: "" });
  const [editing, setEditing] = useState<any>(null);

  const imgFor = (fl: any) => {
    if (!fl.image) return "";
    const hit = (data.files || []).find((f: any) => f.id === fl.image);
    return hit ? hit.url : "";
  };

  const reset = () => { setEditing(null); setForm({ name: "", color: "", inStock: true, imageUrl: "" }); };
  const doSave = async () => {
    if (!form.name.trim()) return;
    await save("flavor.save", { ...(editing ? { id: editing.id } : {}), ...form });
    reset();
  };

  return (
    <div>
      <p className="text-sm text-neutral-500 mb-4">
        Flavour toiri/edit/delete korun — eguloi product page-er flavour dropdown-e dekhabe.
      </p>
      <Card title={editing ? "Edit flavor" : "Add flavor"} right={editing && <button onClick={reset} className="text-xs font-semibold text-neutral-500 inline-flex items-center gap-1"><X size={13} /> Cancel</button>}>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <Lbl>Name</Lbl>
            <Inp value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Blue Razz Ice" />
          </div>
          <div>
            <Lbl>Color (hex)</Lbl>
            <Inp value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="#3b82f6" />
          </div>
          <div>
            <Lbl>Image URL</Lbl>
            <Inp value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://…" />
          </div>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" checked={form.inStock} onChange={(e) => setForm({ ...form, inStock: e.target.checked })} />
            In stock
          </label>
        </div>
        <div className="mt-3">
          <PrimaryBtn onClick={doSave}><Save size={15} /> {editing ? "Update flavor" : "Add flavor"}</PrimaryBtn>
        </div>
      </Card>
      <div className="flex flex-wrap gap-2">
        {(data.flavors || []).map((fl: any) => {
          const url = imgFor(fl);
          return (
            <div key={fl.id} className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white pl-1.5 pr-2 py-1.5 shadow-sm">
              {url ? <img src={url} alt="" className="w-6 h-6 rounded-full object-cover" /> : <span className="w-6 h-6 rounded-full border" style={{ background: fl.color || "#eee" }} />}
              <span className="text-sm font-medium text-neutral-800">{fl.name}</span>
              <span className="text-xs text-neutral-400">{fl.inStock ? "in stock" : "out of stock"}</span>
              <button onClick={() => { setEditing(fl); setForm({ name: fl.name, color: fl.color, inStock: fl.inStock, imageUrl: url }); }} className="text-xs font-semibold text-neutral-600 hover:text-neutral-900">Edit</button>
              <button onClick={async () => { if (confirm(`Delete flavor "${fl.name}"? Products using it will lose that flavour.`)) await save("flavor.delete", { id: fl.id }); }} className="text-red-500 hover:text-red-700"><Trash2 size={13} /></button>
            </div>
          );
        })}
        {!(data.flavors || []).length && <p className="text-sm text-neutral-500">No flavors defined yet.</p>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Media library (Shopify Files)                                      */
/* ------------------------------------------------------------------ */

export function MediaTab({ data, notify, reload }: any) {
  const [q, setQ] = useState("");
  const files = (data.files || []).filter((f: any) => !q || f.url.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <p className="text-sm text-neutral-500 mb-4">
        Store-er file library (panel theke upload kora chobi + Shopify Files). Chobi delete korle jekhane bebohar hoyeche sekhane vangte pare — sabdhane delete korun.
      </p>
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by URL…" className="w-full rounded-md border border-neutral-300 bg-white pl-9 pr-3 py-2 text-sm" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {files.map((f: any) => (
          <div key={f.id} className="rounded-xl border border-neutral-200 bg-white p-2 shadow-sm">
            <img src={f.url} alt="" className="w-full h-28 object-cover rounded-lg bg-neutral-100" />
            <p className="text-[11px] text-neutral-500 truncate mt-2" title={f.url}>{f.url.split("/").pop()}</p>
            <div className="flex gap-2 mt-2">
              <button onClick={() => { navigator.clipboard?.writeText(f.url); notify("URL copied."); }} className="flex-1 rounded-md border border-neutral-300 px-2 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-50">Copy URL</button>
              <button onClick={async () => { if (confirm("Delete this file permanently?")) { const r = await api({ action: "save", saveAction: "media.delete", payload: { id: f.id } }); if (r.ok) { notify("Deleted."); reload(); } else notify("Error: " + (r.error || "delete failed")); } }} className="rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>
      {files.length === 0 && <p className="text-sm text-neutral-500">No files found.</p>}
    </div>
  );
}
