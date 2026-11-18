"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Home as HomeIcon, Layers, Search, Droplets, ShoppingBag } from "lucide-react";

import { useCart } from "@/modules/cart/CartProvider";

interface HomeFloatingControlsProps {
  phone?: string;
}

export function HomeFloatingControls({ phone = "+971 55 110 3401" }: HomeFloatingControlsProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  /* While the cart drawer is open the drawer is the top layer: its own
     z-50 sits BELOW this file's FAB (z-60) and bottom nav (z-70), so
     they would paint over the drawer's totals and footer buttons. Hide
     them while the drawer is open — the drawer has its own WhatsApp
     order button, so nothing is lost. */
  const { isOpen: isCartOpen, totalCount, openCart } = useCart();
  if (isCartOpen) return null;

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setShowScrollTop(scrollY > 450);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : "https://wa.me/971551103401";

  return (
    <>
      {/* Premium WhatsApp FAB */}
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5, ease: "easeOut" }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-[84px] right-4 sm:bottom-8 sm:right-8 z-[60] w-13 h-13 sm:w-16 sm:h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(37,211,102,0.4)] hover:shadow-[0_12px_40px_rgba(37,211,102,0.6)] transition-all duration-300 group cursor-pointer"
        aria-label="Chat on WhatsApp"
      >
        <div className="absolute inset-0 rounded-full border border-white/40 group-hover:animate-ping opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        </svg>
      </motion.a>

      {/* Smooth Back to Top Floating Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            onClick={scrollToTop}
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            whileHover={{ scale: 1.12, y: -3 }}
            whileTap={{ scale: 0.92 }}
            className="fixed bottom-[148px] right-5 sm:bottom-28 sm:right-9 z-[60] w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-[#064e3b] shadow-[0_10px_30px_rgba(6,78,59,0.25)] border border-emerald-100 flex items-center justify-center cursor-pointer group hover:bg-[#064e3b] hover:text-white transition-colors"
            aria-label="Scroll to top"
          >
            <ArrowUp size={18} className="group-hover:-translate-y-0.5 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile Sticky Bottom Navigation */}
      <nav aria-label="Mobile Bottom Navigation" className="lg:hidden fixed bottom-0 left-0 right-0 z-[70] bg-[#064e3b] border-t border-emerald-600/40 shadow-[0_-8px_25px_rgba(0,0,0,0.35)] px-2 py-2 flex items-center justify-between safe-bottom">
        <Link href="/" className="flex-1 flex flex-col items-center justify-center gap-1 text-amber-400 py-1.5 px-1 rounded-xl active:scale-95 transition-all text-center no-underline">
          <HomeIcon size={20} className="stroke-[2.2]" />
          <span className="text-[11px] font-bold tracking-tight">Home</span>
        </Link>
        <Link 
          href="/collections" 
          className="flex-1 flex flex-col items-center justify-center gap-1 text-emerald-100/75 hover:text-white py-1.5 px-1 rounded-xl active:scale-95 transition-all text-center no-underline"
        >
          <Layers size={20} className="stroke-[2.2]" />
          <span className="text-[11px] font-semibold tracking-tight">Shop</span>
        </Link>
        <Link 
          href="/collections" 
          className="flex-1 flex flex-col items-center justify-center gap-1 text-emerald-100/75 hover:text-white py-1.5 px-1 rounded-xl active:scale-95 transition-all !bg-transparent !border-0 outline-none cursor-pointer text-center no-underline"
        >
          <Search size={20} className="stroke-[2.2]" />
          <span className="text-[11px] font-semibold tracking-tight">Search</span>
        </Link>
        <Link href="/collections/disposable-vape" className="flex-1 flex flex-col items-center justify-center gap-1 text-emerald-100/75 hover:text-white py-1.5 px-1 rounded-xl active:scale-95 transition-all text-center no-underline">
          <Droplets size={20} className="stroke-[2.2]" />
          <span className="text-[11px] font-semibold tracking-tight">Disposables</span>
        </Link>
        <button
          type="button"
          onClick={openCart}
          aria-label="Cart"
          className="flex-1 flex flex-col items-center justify-center gap-1 text-emerald-100/75 hover:text-white py-1.5 px-1 rounded-xl active:scale-95 transition-all relative text-center cursor-pointer"
        >
          <div className="relative">
            <ShoppingBag size={20} className="stroke-[2.2]" />
            <span className="absolute -top-1 -right-2 w-4 h-4 bg-amber-400 text-neutral-900 text-[10px] font-black flex items-center justify-center rounded-full shadow-sm">{totalCount}</span>
          </div>
          <span className="text-[11px] font-semibold tracking-tight">Cart</span>
        </button>
      </nav>
    </>
  );
}

export default HomeFloatingControls;

