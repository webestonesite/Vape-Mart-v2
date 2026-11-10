"use client";

import React from "react";

/* Shared API + UI primitives for the admin panel shell and its
   lazily-loaded managers (kept tiny so the login shell stays light). */

export async function api(body: any): Promise<any> {
  const res = await fetch("/api/admin-panel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  // Never let a non-JSON error page (e.g. a gateway 413/502) turn into a
  // cryptic "Unexpected token" SyntaxError: callers check r.ok / r.error.
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { ok: false, error: text || `Request failed (HTTP ${res.status}).` };
  }
}

/* Vercel rejects request bodies over ~4.5 MB before our code runs, so a
   large phone photo can never upload through the route. Shrink images in
   the browser first: downscale to at most 1600px on the long edge and
   re-encode. Files already under the threshold are sent untouched. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // route limit; keep well under Vercel's ~4.5 MB cap
const COMPRESS_FROM_BYTES = 3.5 * 1024 * 1024;
const MAX_IMAGE_EDGE = 1600;

export async function prepareImageFile(file: File): Promise<File> {
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
    // Undecodable in the browser (e.g. HEIC) — send as-is and let the
    // size check below reject it with a plain message.
    return file;
  }
}

export async function uploadFile(file: File): Promise<string> {
  const ready = await prepareImageFile(file);
  if (ready.size > MAX_UPLOAD_BYTES)
    throw new Error("This image is too large — please use an image under 4 MB.");
  const form = new FormData();
  form.append("file", ready);
  const res = await fetch("/api/admin-panel/upload", { method: "POST", body: form });
  if (!res.ok) {
    // The route returns JSON errors, but Vercel's 413 is plain text —
    // read it as text first so the user sees the real message.
    const text = await res.text();
    let msg = text;
    try {
      const j = JSON.parse(text);
      if (j && j.error) msg = j.error;
    } catch {
      /* keep the plain-text message */
    }
    throw new Error(msg || `Upload failed (HTTP ${res.status}).`);
  }
  const j = await res.json();
  if (!j.ok) throw new Error(j.error || "Upload failed");
  return j.resourceUrl as string;
}

/* Upload a file and return a permanent Shopify Files URL for it, so the
   URL can be saved as a banner/hero image without expiring. */
export async function uploadImageFile(file: File): Promise<string> {
  const staged = await uploadFile(file);
  const r = await api({ action: "save", saveAction: "file.permanentUrl", payload: { url: staged } });
  if (!r.ok || !r.url) throw new Error(r.error || "Could not save the uploaded image");
  return r.url as string;
}

export const inputCls =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600";
export const labelCls = "block text-xs font-semibold text-neutral-600 mb-1";

export function Lbl({ children }: { children: React.ReactNode }) {
  return <label className={labelCls}>{children}</label>;
}
export function Inp(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputCls} />;
}
export function TA(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={inputCls} />;
}
export function PrimaryBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700 transition"
    >
      {children}
    </button>
  );
}
export function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-neutral-900">{value}</p>
      {sub && <p className="text-xs text-neutral-500 mt-0.5">{sub}</p>}
    </div>
  );
}
