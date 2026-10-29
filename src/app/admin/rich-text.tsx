"use client";

import { useEffect, useRef, useState } from "react";
import { Bold, Italic, Link2, List, Unlink } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  RichText — docs-style editor for owner-entered content.            */
/*  Value is HTML (same trust level as Shopify's own descriptionHtml:  */
/*  only the password-protected panel owner can write it). Bold,       */
/*  italic, bullet list and hyperlinks. Plain-text callers should use  */
/*  a normal input instead — titles, slugs, SEO and tags stay plain.   */
/* ------------------------------------------------------------------ */

export function RichText({
  value,
  onChange,
  placeholder,
  minHeight = 120,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  // Load external value (product load). Never clobber while typing.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.activeElement === el) return;
    if (el.innerHTML !== (value || "")) el.innerHTML = value || "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const exec = (cmd: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const applyLink = () => {
    const url = linkUrl.trim();
    if (!url) {
      setLinkOpen(false);
      return;
    }
    const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    exec("createLink", href);
    setLinkUrl("");
    setLinkOpen(false);
  };

  const btnCls =
    "rounded border border-neutral-300 bg-white p-1.5 text-neutral-700 hover:bg-neutral-100 disabled:opacity-40";

  return (
    <div className="rounded-md border border-neutral-300 bg-white overflow-hidden focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600">
      <div className="flex flex-wrap items-center gap-1 border-b border-neutral-200 bg-neutral-50 px-2 py-1.5">
        <button type="button" title="Bold" className={btnCls} onClick={() => exec("bold")}>
          <Bold size={14} />
        </button>
        <button type="button" title="Italic" className={btnCls} onClick={() => exec("italic")}>
          <Italic size={14} />
        </button>
        <button type="button" title="Bullet list" className={btnCls} onClick={() => exec("insertUnorderedList")}>
          <List size={14} />
        </button>
        <button
          type="button"
          title="Add link to selected text"
          className={btnCls}
          onClick={() => {
            setLinkOpen(!linkOpen);
            setLinkUrl("");
          }}
        >
          <Link2 size={14} />
        </button>
        <button type="button" title="Remove link" className={btnCls} onClick={() => exec("unlink")}>
          <Unlink size={14} />
        </button>
        {linkOpen && (
          <span className="flex items-center gap-1 ml-1">
            <input
              className="rounded border border-neutral-300 px-2 py-1 text-xs w-52 outline-none"
              placeholder="Link — https://…"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyLink();
                }
              }}
            />
            <button type="button" className="rounded bg-neutral-900 px-2 py-1 text-xs font-bold text-white" onClick={applyLink}>
              Bosao
            </button>
          </span>
        )}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder || ""}
        className="px-3 py-2 text-sm text-neutral-900 outline-none overflow-y-auto [&:empty:before]:content-[attr(data-placeholder)] [&:empty:before]:text-neutral-400"
        style={{ minHeight }}
        onInput={() => {
          if (ref.current) onChange(ref.current.innerHTML);
        }}
      />
    </div>
  );
}
