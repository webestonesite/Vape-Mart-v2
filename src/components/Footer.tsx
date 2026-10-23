"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Mail, Send, ChevronRight, CreditCard, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#022c22] text-white pt-12 sm:pt-16 md:pt-20 pb-28 lg:pb-12 mt-12 sm:mt-16 rounded-t-[28px] sm:rounded-t-[40px] shadow-2xl relative overflow-hidden border-t border-emerald-900/60">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      {/* UAE 21+ Age Verification & Health Warning Banner */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mb-10">
        <div className="bg-emerald-950/80 border border-emerald-700/50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-black text-sm flex items-center justify-center shrink-0">
              21+
            </div>
            <div>
              <p className="text-white text-xs sm:text-sm font-bold">AGE VERIFICATION MANDATORY IN UNITED ARAB EMIRATES</p>
              <p className="text-emerald-200/70 text-[11px] sm:text-xs">
                Sale of vaping and nicotine inhalation devices to persons under 21 years of age is strictly prohibited by UAE Federal Law. Valid Emirates ID or Passport required upon delivery.
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 text-emerald-100 text-xs font-semibold shrink-0">
            <ShieldCheck size={16} className="text-amber-400" />
            <span>100% Tax-Paid & ESMA Certified</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-8 mb-12 sm:mb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 flex flex-col items-start">
            <div className="mb-4 sm:mb-6">
              <Link href="/">
                <Image
                  src="/vape-mart-text-logo-white.png"
                  alt="Vape Mart"
                  width={180}
                  height={62}
                  className="h-8 sm:h-10 w-auto object-contain"
                  unoptimized
                />
              </Link>
            </div>
            <p className="text-emerald-100/60 leading-relaxed text-xs sm:text-sm mb-6 sm:mb-8 pr-4">
              The UAE&apos;s premier destination for luxury vaping products. We guarantee 100% original imported devices, exquisite gourmet e-liquids, and authentic IQOS Terea with rapid 2-hour courier delivery across Dubai.
            </p>
            <div className="flex items-center gap-3">
              <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">Fast Courier Service:</span>
              <span className="text-xs text-emerald-200">Dubai • Abu Dhabi • Sharjah • Ajman</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 text-white tracking-wide">Explore</h4>
            <ul className="flex flex-col gap-2.5 sm:gap-3 text-xs sm:text-sm">
              <li>
                <Link href="/" className="text-emerald-100/60 hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={13} className="text-amber-400" />
                  Home Page
                </Link>
              </li>
              <li>
                <Link href="/collections" className="text-emerald-100/60 hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={13} className="text-amber-400" />
                  Shop All Collections
                </Link>
              </li>
              <li>
                <Link href="/collections/disposable-vape" className="text-emerald-100/60 hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={13} className="text-amber-400" />
                  Best Seller Disposables
                </Link>
              </li>
              <li>
                <Link href="/collections/heated-tobacco" className="text-emerald-100/60 hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={13} className="text-amber-400" />
                  IQOS Terea Cartons
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-emerald-100/60 hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={13} className="text-amber-400" />
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-emerald-100/60 hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={13} className="text-amber-400" />
                  Blog & Guides
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-emerald-100/60 hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={13} className="text-amber-400" />
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-emerald-100/60 hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={13} className="text-amber-400" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-conditions" className="text-emerald-100/60 hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={13} className="text-amber-400" />
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="lg:col-span-2">
            <h4 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 text-white tracking-wide">Categories</h4>
            <ul className="flex flex-col gap-2.5 sm:gap-3 text-xs sm:text-sm">
              <li>
                <Link href="/collections/disposable-vape" className="text-emerald-100/60 hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={13} className="text-amber-400" />
                  Disposable Vapes
                </Link>
              </li>
              <li>
                <Link href="/collections/pods-system" className="text-emerald-100/60 hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={13} className="text-amber-400" />
                  JUUL & Pod Systems
                </Link>
              </li>
              <li>
                <Link href="/collections/e-liquid" className="text-emerald-100/60 hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={13} className="text-amber-400" />
                  Nicotine Salts & E-Juice
                </Link>
              </li>
              <li>
                <Link href="/collections/heated-tobacco" className="text-emerald-100/60 hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={13} className="text-amber-400" />
                  TEREA Indonesian
                </Link>
              </li>
              <li>
                <Link href="/collections/shisha-hookah" className="text-emerald-100/60 hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight size={13} className="text-amber-400" />
                  E-Shisha & Hookah
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Express Assistance */}
          <div className="lg:col-span-4">
            <h4 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 text-white tracking-wide">UAE Support Hub</h4>
            <ul className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8 text-xs sm:text-sm">
              <li className="flex items-start gap-3 text-emerald-100/60">
                <MapPin size={18} className="text-amber-400 shrink-0 mt-0.5" />
                <span>Downtown & Dubai Marina Hub, United Arab Emirates</span>
              </li>
              <li className="flex items-center gap-3 text-emerald-100/60">
                <Phone size={18} className="text-amber-400 shrink-0" />
                <a href="tel:+971551688299" className="hover:text-amber-300 transition-colors">
                  +971 55 168 8299 (WhatsApp Available)
                </a>
              </li>
              <li className="flex items-center gap-3 text-emerald-100/60">
                <Mail size={18} className="text-amber-400 shrink-0" />
                <span>support@vapemart.ae</span>
              </li>
            </ul>

            <h4 className="text-xs sm:text-sm font-bold mb-3 sm:mb-4 text-white uppercase tracking-wider">VIP Newsletter</h4>
            <form className="relative flex items-center" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter email for private drops..."
                className="w-full h-11 sm:h-12 bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 sm:pr-14 text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 transition-colors"
              />
              <button
                type="submit"
                className="absolute right-1.5 w-8 h-8 sm:w-9 sm:h-9 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg flex items-center justify-center transition-colors shadow-md cursor-pointer"
                aria-label="Subscribe"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-emerald-100/40 text-[11px] sm:text-xs font-medium text-center md:text-left">
            &copy; {new Date().getFullYear()} Vape Mart UAE. All Rights Reserved. Designed for adult consumers (21+) only.
          </p>
          <div className="flex items-center gap-2 sm:gap-3 text-emerald-100/50 text-xs font-medium">
            <span className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
              <CreditCard size={14} className="text-amber-400" />
              <span>Cash on Delivery (COD)</span>
            </span>
            <span className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
              <CreditCard size={14} className="text-emerald-400" />
              <span>Cards & Apple Pay</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
