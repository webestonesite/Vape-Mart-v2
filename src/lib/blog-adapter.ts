import {
  fetchBlogPosts,
  fetchBlogPost,
  type BlogPost as ShopifyBlogPost,
} from "@/lib/shopify";
import { blogPosts as localPosts, type BlogPost as LocalBlogPost } from "@/data/blog";

/**
 * Blog display adapter: the blog is edited in Shopify (Content → Blog posts).
 * Shopify articles are converted to the view shape the blog components use.
 * If Shopify is unreachable or empty, the local posts in src/data/blog.ts
 * are served instead, so the blog never breaks.
 */
export interface DisplayPost extends LocalBlogPost {
  bodyHtml?: string;
}

const KNOWN_CATEGORIES = ["Buying Guides", "Safety", "Education", "Regulations"];

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/** Pull the leading "Quick Answer:" paragraph out of a Shopify body. */
function extractQuickAnswer(bodyHtml: string): { quickAnswer: string; bodyHtml: string } {
  const m = bodyHtml.match(
    /^\s*<p[^>]*>\s*<strong[^>]*>\s*Quick Answer:?\s*<\/strong>\s*([\s\S]*?)<\/p>/i
  );
  if (!m) return { quickAnswer: "", bodyHtml };
  return {
    quickAnswer: stripTags(m[1]),
    bodyHtml: bodyHtml.slice(m[0].length).trim(),
  };
}

function toDisplayPost(sp: ShopifyBlogPost): DisplayPost {
  const local = localPosts.find((p) => p.slug === sp.handle);
  const fromBody = extractQuickAnswer(sp.bodyHtml || "");
  const quickAnswer = sp.quickAnswer || fromBody.quickAnswer || local?.quickAnswer || sp.excerpt;
  const bodyHtml = fromBody.bodyHtml || sp.bodyHtml || "";
  const category =
    sp.category ||
    sp.tags.find((t) => KNOWN_CATEGORIES.includes(t)) ||
    local?.category ||
    "Guides";
  const words = stripTags(bodyHtml).split(/\s+/).filter(Boolean).length;
  return {
    slug: sp.handle,
    title: sp.title,
    excerpt: sp.excerpt || local?.excerpt || "",
    category,
    date: formatDate(sp.publishedAt) || local?.date || "",
    readTime: `${Math.max(1, Math.round(words / 200))} min read`,
    cover: sp.imageUrl || local?.cover,
    quickAnswer,
    tags: sp.tags.filter((t) => t !== category),
    productSlugs: sp.productSlugs.length ? sp.productSlugs : local?.productSlugs ?? [],
    content: [],
    bodyHtml,
  };
}

export async function getDisplayPosts(): Promise<DisplayPost[]> {
  try {
    const posts = await fetchBlogPosts();
    if (posts.length) return posts.map(toDisplayPost);
  } catch {
    /* fall through to local posts */
  }
  return localPosts.map((p) => ({ ...p }));
}

export async function getDisplayPost(slug: string): Promise<DisplayPost | null> {
  try {
    const sp = await fetchBlogPost(slug);
    if (sp) return toDisplayPost(sp);
  } catch {
    /* fall through to local posts */
  }
  const local = localPosts.find((p) => p.slug === slug);
  return local ? { ...local } : null;
}
