import type { Metadata } from "next";
import { ShieldCheck, Truck, BadgeCheck } from "lucide-react";
import { getDisplayPosts } from "@/lib/blog-adapter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BlogExplorer } from "@/components/blog/BlogExplorer";

export const metadata: Metadata = {
  title: "Blog & Buying Guides | Vape Mart UAE",
  description:
    "Vaping guides, safety tips, flavour advice and UAE regulation updates from the Vape Mart experts.",
};

export default async function BlogPage() {
  const posts = await getDisplayPosts();
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f7f8f7]">
        {/* Page header — simple title + subtitle, no hero band */}
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-2">
          <h1 className="text-slate-900 text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Blog & Buying Guides
          </h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-2xl">
            Honest advice from people who vape: buying guides, safety tips, flavour picks and
            UAE regulation updates.
          </p>
        </div>

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <BlogExplorer posts={posts} />
        </div>

        {/* Trust strip */}
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-14">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: BadgeCheck, title: "100% Genuine Products", text: "Factory-sealed stock from authorised distributors only." },
              { icon: Truck, title: "Fast UAE Delivery", text: "Express courier across Dubai, Abu Dhabi, Sharjah & Ajman." },
              { icon: ShieldCheck, title: "ESMA Certified", text: "Every product tax-paid, certified and age-verified at delivery." },
            ].map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-700/10 border border-emerald-700/20 flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-emerald-700" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm mb-1">{title}</p>
                  <p className="text-slate-500 text-[13px] leading-relaxed">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
