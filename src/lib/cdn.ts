/**
 * Append Shopify CDN width transformation query
 */
export function cdnWidth(url: string, w: number): string {
  if (!url || !url.includes("cdn.shopify.com")) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}width=${w}`;
}

