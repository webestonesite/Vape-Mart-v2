import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, ArrowLeft, ArrowRight } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { blogPosts, getPost } from "@/data/blog";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Article Not Found | Vape Mart UAE" };
  return {
    title: `${post.title} | Vape Mart UAE Blog`,
    description: post.excerpt,
  };
}

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const idx = blogPosts.findIndex((p) => p.slug === slug);
  const next = blogPosts[(idx + 1) % blogPosts.length];

  return (
    <main className="min-h-screen bg-white pb-16 sm:pb-24">
      <PageHero
        badge={post.category}
        title={post.title}
        subtitle={post.excerpt}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: post.category },
        ]}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12">
        <div className="flex items-center gap-4 text-slate-400 text-xs sm:text-sm mb-8 pb-6 border-b border-slate-100">
          <span className="flex items-center gap-1.5">
            <CalendarDays size={14} /> {post.date}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} /> {post.readTime}
          </span>
          <span className="ml-auto text-emerald-700 font-semibold">Vape Mart Experts</span>
        </div>

        <article className="flex flex-col gap-5 sm:gap-6">
          {post.content.map((para, i) => (
            <p
              key={i}
              className={
                i === 0
                  ? "font-luxury text-slate-800 text-lg sm:text-xl leading-relaxed"
                  : "text-slate-600 text-[15px] sm:text-base leading-relaxed"
              }
            >
              {para}
            </p>
          ))}
        </article>

        {/* CTA */}
        <div className="mt-10 sm:mt-12 rounded-[20px] bg-gradient-to-br from-[#022c22] to-[#064e3b] p-8 text-center relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-400/15 rounded-full blur-[60px] pointer-events-none" />
          <h3 className="font-luxury text-white text-xl sm:text-2xl font-bold mb-2 relative z-10">
            Ready to Shop Original?
          </h3>
          <p className="text-emerald-100/70 text-sm mb-5 relative z-10">
            100% authentic, ESMA certified, delivered across the UAE.
          </p>
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-sm px-6 py-3 rounded-xl transition-colors relative z-10"
          >
            Shop All Collections <ArrowRight size={16} />
          </Link>
        </div>

        {/* Next article */}
        <Link
          href={`/blog/${next.slug}`}
          className="group mt-8 flex items-center justify-between gap-4 rounded-[20px] border border-slate-200 p-5 sm:p-6 hover:border-emerald-200 hover:shadow-lg transition-all"
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Next Article
            </p>
            <p className="font-luxury text-slate-900 font-bold text-base sm:text-lg group-hover:text-emerald-800 transition-colors">
              {next.title}
            </p>
          </div>
          <ArrowRight size={20} className="text-emerald-700 shrink-0 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/blog"
          className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-emerald-700 hover:text-emerald-900 transition-colors"
        >
          <ArrowLeft size={16} /> Back to all articles
        </Link>
      </div>
    </main>
  );
}
