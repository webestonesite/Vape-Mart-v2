"use client";

import Link from "next/link";
import { Home as HomeIcon, Layers, Search, Droplets, ShoppingBag } from "lucide-react";

export function MobileBottomNav() {
  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#064e3b] border-t border-emerald-600/40 shadow-[0_-8px_25px_rgba(0,0,0,0.35)] px-2 py-2 flex items-center justify-between safe-bottom"
    >
      <Link
        href="/"
        className="flex-1 flex flex-col items-center justify-center gap-1 text-emerald-100/75 hover:text-amber-400 py-1.5 px-1 rounded-xl active:scale-95 transition-all text-center no-underline"
      >
        <HomeIcon size={20} className="stroke-[2.2]" />
        <span className="text-[11px] font-bold tracking-tight">Home</span>
      </Link>

      <Link
        href="/collections"
        className="flex-1 flex flex-col items-center justify-center gap-1 text-amber-400 py-1.5 px-1 rounded-xl active:scale-95 transition-all text-center no-underline"
      >
        <Layers size={20} className="stroke-[2.2]" />
        <span className="text-[11px] font-semibold tracking-tight">Shop</span>
      </Link>

      <Link
        href="/collections"
        className="flex-1 flex flex-col items-center justify-center gap-1 text-emerald-100/75 hover:text-white py-1.5 px-1 rounded-xl active:scale-95 transition-all text-center no-underline"
      >
        <Search size={20} className="stroke-[2.2]" />
        <span className="text-[11px] font-semibold tracking-tight">Search</span>
      </Link>

      <Link
        href="/collections/disposable-vape"
        className="flex-1 flex flex-col items-center justify-center gap-1 text-emerald-100/75 hover:text-white py-1.5 px-1 rounded-xl active:scale-95 transition-all text-center no-underline"
      >
        <Droplets size={20} className="stroke-[2.2]" />
        <span className="text-[11px] font-semibold tracking-tight">Disposables</span>
      </Link>

      <Link
        href="/collections"
        className="flex-1 flex flex-col items-center justify-center gap-1 text-emerald-100/75 hover:text-white py-1.5 px-1 rounded-xl active:scale-95 transition-all relative text-center no-underline"
      >
        <div className="relative">
          <ShoppingBag size={20} className="stroke-[2.2]" />
          <span className="absolute -top-1 -right-2 w-4 h-4 bg-amber-400 text-neutral-900 text-[10px] font-black flex items-center justify-center rounded-full shadow-sm">
            0
          </span>
        </div>
        <span className="text-[11px] font-semibold tracking-tight">Cart</span>
      </Link>
    </nav>
  );
}
