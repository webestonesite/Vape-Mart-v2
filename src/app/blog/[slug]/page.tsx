import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, ChevronRight, ArrowRight, Zap } from "lucide-react";
import { blogPosts } from "@/data/blog";
import { getDisplayPost, getDisplayPosts } from "@/lib/blog-adapter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BlogCard, CoverImage, categoryBadge } from "@/components/blog/BlogCard";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { RelatedProducts } from "@/components/blog/RelatedProducts";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getDisplayPost(slug);
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
  const post = await getDisplayPost(slug);
  if (!post) notFound();

  const allPosts = await getDisplayPosts();
  const related = [
    ...allPosts.filter((p) => p.slug !== slug && p.category === post.category),
    ...allPosts.filter((p) => p.slug !== slug && p.category !== post.category),
  ].slice(0, 3);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f7f8f7]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
          {/* Article card — white, bordered, separated from the page background */}
          <article className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 sm:p-10">
            <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-400 mb-5 flex-wrap">
              <Link href="/" className="hover:text-emerald-700 transition-colors">
                Home
              </Link>
              <ChevronRight size={13} />
              <Link href="/blog" className="hover:text-emerald-700 transition-colors">
                Blog
              </Link>
              <ChevronRight size={13} />
              <span className="text-slate-700 font-semibold">{post.category}</span>
            </nav>
            <span
              className={`inline-block px-3 py-1 rounded-full text-white text-[11px] font-bold uppercase tracking-wide mb-4 ${categoryBadge[post.category] ?? "bg-slate-600"}`}
            >
              {post.category}
            </span>
            <h1 className="text-slate-900 text-2xl sm:text-4xl font-extrabold leading-tight tracking-tight mb-4">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-slate-400 text-xs sm:text-sm flex-wrap mb-8">
              <span className="flex items-center gap-1.5">
                <CalendarDays size={14} /> {post.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} /> {post.readTime}
              </span>
              <span className="text-emerald-700 font-semibold">By Vape Mart Experts</span>
            </div>

            {/* Featured image */}
            <div className="relative aspect-[16/9] rounded-[20px] overflow-hidden bg-slate-100 border border-slate-200 mb-8">
              <CoverImage post={post} />
            </div>

            {/* Quick Answer — signature summary box */}
            <div className="rounded-2xl border-l-4 border-amber-400 bg-amber-50 p-5 sm:p-6 mb-8">
              <p className="flex items-center gap-2 text-amber-800 font-extrabold text-sm uppercase tracking-wide mb-2">
                <Zap size={15} /> Quick Answer
              </p>
              <p className="text-slate-700 text-[15px] sm:text-base leading-relaxed">{post.quickAnswer}</p>
            </div>

            {/* Body — HTML from Shopify when available, local paragraphs otherwise */}
            {post.bodyHtml ? (
              <div
                className="flex flex-col gap-5 mb-10 [&>p]:text-slate-600 [&>p]:text-[15px] sm:[&>p]:text-base [&>p]:leading-[1.8] [&>p:first-of-type]:text-slate-800 [&>p:first-of-type]:text-lg sm:[&>p:first-of-type]:text-xl [&>p:first-of-type]:leading-relaxed [&>p:first-of-type]:font-medium [&>h2]:text-slate-900 [&>h2]:text-xl sm:[&>h2]:text-2xl [&>h2]:font-extrabold [&>h2]:mt-4 [&>h3]:text-slate-900 [&>h3]:font-bold [&>h3]:text-lg [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:text-slate-600 [&>ul]:leading-[1.8] [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:text-slate-600 [&>ol]:leading-[1.8] [&_a]:text-emerald-700 [&_a]:font-semibold"
                dangerouslySetInnerHTML={{ __html: post.bodyHtml }}
              />
            ) : (
              <div className="flex flex-col gap-5 mb-10">
                {post.content.map((para, i) => (
                  <p
                    key={i}
                    className={
                      i === 0
                        ? "text-slate-800 text-lg sm:text-xl leading-relaxed font-medium"
                        : "text-slate-600 text-[15px] sm:text-base leading-[1.8]"
                    }
                  >
                    {para}
                  </p>
                ))}
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-500 text-xs font-semibold"
                >
                  #{t}
                </span>
              ))}
            </div>

            {/* Share */}
            <div className="flex items-center justify-between bg-slate-50 rounded-2xl border border-slate-200 px-5 py-4 mb-10">
              <ShareButtons title={post.title} />
              <Link
                href="/blog"
                className="text-sm font-bold text-emerald-700 hover:text-emerald-900 transition-colors hidden sm:inline"
              >
                ← All Articles
              </Link>
            </div>

            {/* Related products */}
            <RelatedProducts slugs={post.productSlugs} />

            {/* CTA */}
            <div className="rounded-[20px] bg-gradient-to-br from-[#022c22] to-[#065f46] p-8 text-center relative overflow-hidden mt-10">
              <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-400/15 rounded-full blur-[60px] pointer-events-none" />
              <h3 className="text-white text-xl sm:text-2xl font-extrabold mb-2 relative z-10">
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
          </article>
        </div>

        {/* Related articles */}
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-slate-900 text-xl sm:text-2xl font-extrabold">Related Articles</h2>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1 text-emerald-700 font-bold text-sm hover:text-emerald-900 transition-colors"
            >
              View All <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {related.map((p) => (
              <BlogCard key={p.slug} post={p} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
