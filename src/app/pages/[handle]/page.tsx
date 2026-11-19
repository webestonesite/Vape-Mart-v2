import { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchShopifyPage } from "@/lib/shopify";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";

export const dynamicParams = true;
export const revalidate = 86400;

type PageProps = {
  params: Promise<{ handle: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const page = await fetchShopifyPage(handle).catch(() => null);

  if (!page) {
    return {
      title: "Page Not Found | Vape Mart UAE",
    };
  }

  return {
    title: `${page.title} | Vape Mart UAE`,
    description: `Read ${page.title} at Vape Mart UAE. Authentic vapes with express delivery across Dubai.`,
  };
}

export default async function ShopifyCmsPage({ params }: PageProps) {
  const { handle } = await params;
  const page = await fetchShopifyPage(handle).catch(() => null);

  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          {page.title}
        </h1>
        <div
          className="prose prose-invert max-w-none mt-8 text-zinc-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
        />
      </main>
      <Footer />
    </div>
  );
}
