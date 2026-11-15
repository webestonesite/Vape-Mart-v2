/**
 * Append Shopify CDN width transformation query with WebP format and safe quality limit.
 */
export function cdnWidth(url: string, w: number, q: number = 75): string {
  if (!url || !url.includes("cdn.shopify.com")) return url;
  const safeWidth = Math.min(w || 800, 1200);
  const safeQuality = Math.min(q || 75, 80);
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}width=${safeWidth}&format=webp&quality=${safeQuality}`;
}

