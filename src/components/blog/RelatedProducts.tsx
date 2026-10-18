import Image from "next/image";
import Link from "next/link";
import { Star, ArrowRight, ShoppingBag } from "lucide-react";
import { fetchProductBySlug } from "@/data/products-shopify";

export async function RelatedProducts({ slugs, title }: { slugs: string[]; title?: string }) {
  const found = await Promise.all(slugs.map((s) => fetchProductBySlug(s)));
  const products = found.filter((p): p is NonNullable<typeof p> => Boolean(p)).slice(0, 4);
  if (products.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="flex items-center gap-2 text-slate-900 text-xl sm:text-2xl font-extrabold">
          <ShoppingBag size={22} className="text-emerald-700" />
          {title ?? "Shop Related Products"}
        </h2>
        <Link
          href="/collections"
          className="inline-flex items-center gap-1 text-emerald-700 font-bold text-sm hover:text-emerald-900 transition-colors"
        >
          View All <ArrowRight size={15} />
        </Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {products.map((p) => (
          <Link
            key={p.slug}
            href={`/product/${p.slug}`}
            className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-emerald-200 hover:-translate-y-1 transition-all duration-300 flex flex-col"
          >
            <div className="relative aspect-square overflow-hidden bg-slate-50">
              <Image
                src={p.primaryImage}
                alt={p.title}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {p.badge && (
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-400 text-emerald-950 text-[10px] font-black uppercase tracking-wide">
                  {p.badge}
                </span>
              )}
            </div>
            <div className="p-3 sm:p-4 flex flex-col flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                {p.brand}
              </p>
              <h3 className="text-slate-900 font-bold text-[13px] sm:text-sm leading-snug mb-2 line-clamp-2 flex-1 group-hover:text-emerald-800 transition-colors">
                {p.title}
              </h3>
              <div className="flex items-center gap-1 mb-2">
                <Star size={12} className="text-amber-400 fill-amber-400" />
                <span className="text-xs font-bold text-slate-700">{p.rating}</span>
                <span className="text-[11px] text-slate-400">({p.revs})</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-emerald-800 font-extrabold text-base sm:text-lg">
                  AED {p.price.toFixed(2)}
                </span>
                {p.originalPrice && p.originalPrice > p.price && (
                  <span className="text-slate-400 text-xs line-through">
                    AED {p.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
