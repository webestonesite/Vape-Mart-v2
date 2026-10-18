"use client";

import { useState } from "react";
import { Link2, Check, MessageCircle, Send } from "lucide-react";

export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* user dismissed */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const url = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">Share:</span>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(title + " " + url)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        className="w-9 h-9 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 text-[#128C4B] flex items-center justify-center hover:bg-[#25D366] hover:text-white transition-colors"
      >
        <MessageCircle size={16} />
      </a>
      <a
        href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Telegram"
        className="w-9 h-9 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-600 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-colors"
      >
        <Send size={16} />
      </a>
      <button
        onClick={share}
        aria-label="Copy link"
        className="h-9 px-3 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-700 hover:text-white hover:border-emerald-700 transition-colors cursor-pointer"
      >
        {copied ? <Check size={14} /> : <Link2 size={14} />}
        {copied ? "Copied!" : "Copy Link"}
      </button>
    </div>
  );
}
