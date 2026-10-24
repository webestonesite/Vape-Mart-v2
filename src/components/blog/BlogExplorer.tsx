"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, Clock, ArrowRight, Sparkles } from "lucide-react";
import type { BlogPost } from "@/data/blog";
import { BlogCard, CoverImage, resolveBadgeClass } from "./BlogCard";

const DEFAULT_CATEGORIES = ["Buying Guides", "Safety", "Education", "Regulations"];

export function BlogExplorer({ posts, categories, categoryColors }: { posts: BlogPost[]; categories?: string[]; categoryColors?: Record<string, string> }) {
  const [active, setActive] = useState("All");
  const [featured, ...rest] = posts;
  const cats = ["All", ...(categories?.length ? categories : DEFAULT_CATEGORIES)];
  const filtered = active === "All" ? rest : rest.filter((p) => p.category === active);

  return (
    <>
      {/* Featured article */}
      {active === "All" && (
        <Link
          href={`/blog/${featured.slug}`}
          className="group grid md:grid-cols-2 rounded-[24px] overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-2xl transition-shadow mb-10"
        >
          <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[320px] overflow-hidden bg-slate-100">
            <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-500">
              <CoverImage post={featured} />
            </div>
            <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400 text-emerald-950 text-xs font-black uppercase tracking-wide shadow">
              <Sparkles size={13} /> Featured
            </span>
          </div>
          <div className="p-7 sm:p-10 flex flex-col justify-center">
            <span
              className={`self-start px-3 py-1 rounded-full text-white text-[11px] font-bold uppercase tracking-wide mb-4 ${resolveBadgeClass(featured.category, categoryColors)}`}
            >
              {featured.category}
            </span>
            <h2 className="text-slate-900 text-2xl sm:text-[28px] font-extrabold leading-tight mb-3 group-hover:text-emerald-800 transition-colors">
              {featured.title}
            </h2>
            <p className="text-slate-500 text-[15px] leading-relaxed mb-5">{featured.excerpt}</p>
            <div className="flex items-center gap-4 text-slate-400 text-sm mb-6">
              <span className="flex items-center gap-1.5">
                <CalendarDays size={14} /> {featured.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} /> {featured.readTime}
              </span>
            </div>
            <span className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors self-start">
              Read Article <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </Link>
      )}

      {/* Category filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-bold border transition-all cursor-pointer ${
              active === c
                ? "bg-emerald-700 border-emerald-700 text-white shadow-md"
                : "bg-white border-slate-200 text-slate-600 hover:border-emerald-400 hover:text-emerald-800"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filtered.map((post) => (
            <BlogCard key={post.slug} post={post} badgeClass={resolveBadgeClass(post.category, categoryColors)} />
          ))}
        </div>
      ) : (
        <p className="text-center text-slate-400 py-16">No articles in this category yet.</p>
      )}
    </>
  );
}
