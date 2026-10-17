import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Clock, ArrowRight, BookOpen } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { blogPosts } from "@/data/blog";

export const metadata: Metadata = {
  title: "Vape Blog & Guides | Vape Mart UAE",
  description:
    "Vaping guides, safety tips, flavour advice and UAE regulation updates from the Vape Mart experts.",
};

const categoryColors: Record<string, string> = {
  "Buying Guides": "bg-emerald-100 text-emerald-800 border-emerald-200",
  Safety: "bg-red-50 text-red-700 border-red-200",
  Education: "bg-blue-50 text-blue-700 border-blue-200",
  Regulations: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function BlogPage() {
  const [featured, ...rest] = blogPosts;

  return (
    <main className="min-h-screen bg-white pb-16 sm:pb-24">
      <PageHero
        badge="Vape Mart Journal"
        title="Blog & Vaping Guides"
        subtitle="Honest advice from people who vape: buying guides, safety tips, flavour picks and UAE regulation updates."
        crumbs={[{ label: "Home", href: "/" }, { label: "Blog" }]}
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mt-8 sm:mt-12">
        {/* Featured post */}
        <Link
          href={`/blog/${featured.slug}`}
          className="group grid md:grid-cols-2 gap-0 rounded-[24px] overflow-hidden border border-emerald-100 shadow-lg hover:shadow-2xl transition-shadow bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#022c22] relative"
        >
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-amber-400/10 rounded-full blur-[70px] pointer-events-none" />
          <div className="p-8 sm:p-12 flex flex-col justify-center relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
                Featured
              </span>
              <span
                className={`px-3 py-1 rounded-full border text-xs font-bold ${categoryColors[featured.category]}`}
              >
                {featured.category}
              </span>
            </div>
            <h2 className="font-luxury text-white text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-4 group-hover:text-amber-200 transition-colors">
              {featured.title}
            </h2>
            <p className="text-emerald-100/70 text-sm sm:text-base leading-relaxed mb-6">
              {featured.excerpt}
            </p>
            <div className="flex items-center gap-4 text-emerald-100/60 text-xs sm:text-sm mb-6">
              <span className="flex items-center gap-1.5">
                <CalendarDays size={14} /> {featured.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} /> {featured.readTime}
              </span>
            </div>
            <span className="inline-flex items-center gap-2 text-amber-300 font-bold text-sm">
              Read Article <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
          <div className="hidden md:flex items-center justify-center p-12 relative z-10">
            <div className="w-24 h-24 rounded-full bg-amber-400/15 border border-amber-400/30 flex items-center justify-center">
              <BookOpen size={40} className="text-amber-300" />
            </div>
          </div>
        </Link>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mt-8 sm:mt-10">
          {rest.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-[20px] border border-slate-200 bg-white p-6 sm:p-7 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all flex flex-col"
            >
              <span
                className={`self-start px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider mb-4 ${categoryColors[post.category]}`}
              >
                {post.category}
              </span>
              <h3 className="font-luxury text-slate-900 text-lg sm:text-xl font-bold leading-snug mb-3 group-hover:text-emerald-800 transition-colors">
                {post.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-5 flex-1">{post.excerpt}</p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3 text-slate-400 text-xs">
                  <span className="flex items-center gap-1">
                    <CalendarDays size={13} /> {post.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} /> {post.readTime}
                  </span>
                </div>
                <ArrowRight
                  size={16}
                  className="text-emerald-700 group-hover:translate-x-1 transition-transform"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
