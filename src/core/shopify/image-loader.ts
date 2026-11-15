/**
 * Custom Shopify CDN Image Loader
 * Bypasses Vercel Image Optimization quota (1,000 transforms/mo) by routing
 * transformations directly to Shopify's high-speed global Edge CDN.
 */
export default function shopifyImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (!src) return '';

  // Only rewrite Shopify CDN URLs
  if (src.includes('cdn.shopify.com')) {
    try {
      const url = new URL(src);
      url.searchParams.set('width', width.toString());
      url.searchParams.set('format', 'webp');
      if (quality) {
        url.searchParams.set('quality', quality.toString());
      }
      return url.toString();
    } catch {
      // If URL parsing fails, append query params cleanly
      const separator = src.includes('?') ? '&' : '?';
      return `${src}${separator}width=${width}&format=webp${quality ? `&quality=${quality}` : ''}`;
    }
  }

  // Non-Shopify images served directly
  return src;
}

