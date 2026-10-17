import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface PageHeroProps {
  badge: string;
  title: string;
  subtitle: string;
  crumbs: { label: string; href?: string }[];
}

export function PageHero({ badge, title, subtitle, crumbs }: PageHeroProps) {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 mb-4 sm:mb-6 flex-wrap">
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={13} className="text-slate-300" />}
            {c.href ? (
              <Link href={c.href} className="hover:text-emerald-700 transition-colors font-medium">
                {c.label}
              </Link>
            ) : (
              <span className="text-emerald-800 font-semibold">{c.label}</span>
            )}
          </span>
        ))}
      </nav>

      {/* Luxury panel */}
      <div className="relative overflow-hidden rounded-[24px] sm:rounded-[32px] bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#022c22] px-6 py-10 sm:px-12 sm:py-14 text-center shadow-2xl">
        <div className="absolute -top-24 -right-24 w-[420px] h-[420px] bg-emerald-400/15 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-[380px] h-[380px] bg-amber-400/15 rounded-full blur-[90px] pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-4 sm:mb-5">
            {badge}
          </span>
          <h1 className="font-luxury text-white text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-3 sm:mb-4">
            {title}
          </h1>
          <div className="flex items-center justify-center gap-2 mb-4 sm:mb-5">
            <span className="h-px w-12 sm:w-16 bg-gradient-to-r from-transparent to-amber-400/70" />
            <span className="w-1.5 h-1.5 rotate-45 bg-amber-400" />
            <span className="h-px w-12 sm:w-16 bg-gradient-to-l from-transparent to-amber-400/70" />
          </div>
          <p className="text-emerald-100/70 text-sm sm:text-base leading-relaxed">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
