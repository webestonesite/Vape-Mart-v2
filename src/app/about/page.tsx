import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Truck, BadgeCheck, Headset, ArrowRight, Award, PackageCheck, Timer } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "About Us | Vape Mart UAE",
  description:
    "Vape Mart is the UAE's premier destination for 100% original vaping products — ESMA certified, tax-paid, with rapid delivery across Dubai and the Emirates.",
};

const values = [
  {
    icon: BadgeCheck,
    title: "100% Original, Always",
    text: "Every product is factory-sealed and sourced from authorised distributors. No grey stock, no counterfeits — verified before it ships.",
  },
  {
    icon: ShieldCheck,
    title: "ESMA Certified & Tax-Paid",
    text: "Full UAE compliance on every item we sell. Tax stamps and certifications are your proof of safety-tested products.",
  },
  {
    icon: Truck,
    title: "Rapid UAE Delivery",
    text: "Express courier across Dubai, Abu Dhabi, Sharjah and Ajman — with Cash on Delivery available on every order.",
  },
  {
    icon: Headset,
    title: "Real Human Support",
    text: "Our team vapes what we sell. Get honest advice on devices, flavours and nicotine strengths from people who know.",
  },
];

const stats = [
  { icon: PackageCheck, value: "50,000+", label: "Orders Delivered" },
  { icon: Award, value: "100%", label: "Authentic Products" },
  { icon: Timer, value: "2-Hour", label: "Dubai Express Delivery" },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <PageHero
          badge="Our Story"
          title="About Vape Mart"
          subtitle="The UAE's premier destination for luxury vaping — built on authenticity, compliance, and service adult vapers can trust."
          crumbs={[{ label: "Home", href: "/" }, { label: "About Us" }]}
        />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mt-8 sm:mt-12 pb-16 sm:pb-24">
          {/* Story */}
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center mb-12 sm:mb-20">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold uppercase tracking-wider mb-4">
                Who We Are
              </span>
              <h2 className="font-luxury text-slate-900 text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-4 sm:mb-5">
                A Premium Vape House, Built for the Emirates
              </h2>
              <div className="flex flex-col gap-4 text-slate-600 text-[15px] sm:text-base leading-relaxed">
                <p>
                  Vape Mart began with a simple frustration: too many vapers in the UAE were paying
                  premium prices for questionable products. Counterfeits, grey imports, and sellers
                  who disappeared after the sale were the norm — not the exception.
                </p>
                <p>
                  We built the shop we wished existed. Every device and e-liquid on our shelves is
                  100% original, ESMA certified, and tax-paid. Every order is age-verified at
                  delivery. And every customer gets the kind of service we would demand ourselves:
                  fast courier, honest advice, and Cash on Delivery across the Emirates.
                </p>
                <p>
                  Today, Vape Mart serves thousands of adult vapers across Dubai, Abu Dhabi,
                  Sharjah, Ajman and beyond — from first-time switchers leaving cigarettes behind
                  to connoisseurs chasing the perfect flavour.
                </p>
              </div>
            </div>
            <div className="relative rounded-[24px] overflow-hidden bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#022c22] p-8 sm:p-12 shadow-2xl">
              <div className="absolute -top-20 -right-20 w-72 h-72 bg-amber-400/15 rounded-full blur-[70px] pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-emerald-400/15 rounded-full blur-[70px] pointer-events-none" />
              <div className="relative z-10 grid grid-cols-1 gap-6">
                {stats.map((s) => (
                  <div key={s.label} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center shrink-0">
                      <s.icon size={22} className="text-amber-300" />
                    </div>
                    <div>
                      <p className="font-luxury text-white text-2xl sm:text-3xl font-bold">{s.value}</p>
                      <p className="text-emerald-100/60 text-xs sm:text-sm">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Values */}
          <div className="text-center mb-8 sm:mb-10">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold uppercase tracking-wider mb-4">
              What We Stand For
            </span>
            <h2 className="font-luxury text-slate-900 text-2xl sm:text-3xl lg:text-4xl font-bold">
              The Vape Mart Promise
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mb-12 sm:mb-16">
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-[20px] border border-slate-200 bg-white p-6 sm:p-7 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
                  <v.icon size={22} className="text-emerald-700" />
                </div>
                <h3 className="font-luxury text-slate-900 text-lg font-bold mb-2">{v.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{v.text}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="rounded-[24px] bg-gradient-to-br from-[#022c22] to-[#064e3b] p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-400/15 rounded-full blur-[70px] pointer-events-none" />
            <h2 className="font-luxury text-white text-2xl sm:text-3xl font-bold mb-3 relative z-10">
              Experience the Difference
            </h2>
            <p className="text-emerald-100/70 text-sm sm:text-base mb-6 relative z-10">
              Browse 100% original devices, pods and e-liquids — delivered fast, anywhere in the UAE.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
              <Link
                href="/collections"
                className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-sm px-6 py-3 rounded-xl transition-colors"
              >
                Shop Collections <ArrowRight size={16} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 border border-white/25 hover:border-amber-400/60 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
