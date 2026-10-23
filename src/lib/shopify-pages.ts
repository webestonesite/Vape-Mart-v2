import { fetchShopifyPage } from "@/lib/shopify";

/**
 * Info-page helpers: About / Contact / Privacy / Terms copy lives in
 * Shopify admin (Content → Pages). These helpers read a page and, for the
 * sectioned legal pages, split its HTML body into { title, body[] }
 * sections so the existing designed layouts render unchanged.
 */

export interface PageSection {
  title: string;
  body: string[];
}

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&rdquo;/g, "”")
    .replace(/&ldquo;/g, "“")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–");
}

function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

/** Split a Shopify page body (<h2>Section</h2><p>…</p>…) into sections. */
export function parseSectionsFromHtml(html: string): PageSection[] {
  if (!html) return [];
  const parts = html.split(/<h2[^>]*>/i);
  const sections: PageSection[] = [];
  for (const part of parts.slice(1)) {
    const closeIdx = part.toLowerCase().indexOf("</h2>");
    if (closeIdx === -1) continue;
    const title = stripTags(part.slice(0, closeIdx));
    const rest = part.slice(closeIdx + 5);
    const paras = [...rest.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
      .map((m) => stripTags(m[1]))
      .filter(Boolean);
    // Text outside <p> tags (plain line breaks) still counts as a paragraph.
    if (!paras.length) {
      const text = stripTags(rest);
      if (text) paras.push(text);
    }
    if (title && paras.length) sections.push({ title, body: paras });
  }
  return sections;
}

/** Sections for a legal page; empty array means "use the local fallback". */
export async function getShopifyPageSections(handle: string): Promise<PageSection[]> {
  const page = await fetchShopifyPage(handle);
  if (!page || !page.bodyHtml) return [];
  const sections = parseSectionsFromHtml(page.bodyHtml);
  return sections.length >= 2 ? sections : [];
}

/** Raw body HTML for a page; empty string means "use the local fallback". */
export async function getShopifyPageBody(handle: string): Promise<string> {
  const page = await fetchShopifyPage(handle);
  return page?.bodyHtml ?? "";
}
