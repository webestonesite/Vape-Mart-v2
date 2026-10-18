import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock, ArrowRight, ShieldCheck, ShoppingBag, GraduationCap, Scale, Newspaper } from "lucide-react";
import type { BlogPost } from "@/data/blog";

export const categoryBadge: Record<string, string> = {
  "Buying Guides": "bg-emerald-600",
  Safety: "bg-red-600",
  Education: "bg-blue-600",
  Regulations: "bg-amber-500",
};

const categoryIcon: Record<string, typeof ShieldCheck> = {
  "Buying Guides": ShoppingBag,
  Safety: ShieldCheck,
  Education: GraduationCap,
  Regulations: Scale,
};

export function CoverImage({ post, className }: { post: BlogPost; className?: string }) {
  if (post.cover) {
    return (
      <Image
        src={post.cover}
        alt={post.title}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={`object-cover ${className ?? ""}`}
      />
    );
  }
  const Icon = categoryIcon[post.category] ?? Newspaper;
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#022c22] via-[#065f46] to-[#022c22] ${className ?? ""}`}
    >
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-400/10 rounded-full blur-[50px] pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-400/10 rounded-full blur-[60px] pointer-events-none" />
      <div className="relative flex flex-col items-center gap-3 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center shadow-lg">
          <Icon size={30} className="text-amber-300" />
        </div>
        <span className="text-emerald-100/50 text-[11px] font-bold uppercase tracking-[0.2em]">
          Vape Mart Journal
        </span>
      </div>
    </div>
  );
}

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-emerald-200 hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-500">
          <CoverImage post={post} />
        </div>
        <span
          className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-white text-[11px] font-bold uppercase tracking-wide shadow ${categoryBadge[post.category] ?? "bg-slate-600"}`}
        >
          {post.category}
        </span>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-slate-900 font-bold text-[17px] leading-snug mb-2 group-hover:text-emerald-800 transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-4 flex-1 line-clamp-2">{post.excerpt}</p>
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-3 text-slate-400 text-xs">
            <span className="flex items-center gap-1">
              <CalendarDays size={13} /> {post.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={13} /> {post.readTime}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-sm">
            Read More
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}
