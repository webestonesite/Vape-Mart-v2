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

  // Cap max resolution to prevent unnecessary bandwidth consumption
  const safeWidth = Math.min(width || 800, 1200);
  // Default quality to 75 (optimal sweet spot for crisp HD with minimal KB)
  const safeQuality = quality && quality > 0 ? Math.min(quality, 80) : 75;

  // Only rewrite Shopify CDN URLs
  if (src.includes('cdn.shopify.com')) {
    try {
      const url = new URL(src);
      url.searchParams.set('width', safeWidth.toString());
      url.searchParams.set('format', 'webp');
      url.searchParams.set('quality', safeQuality.toString());
      return url.toString();
    } catch {
      // If URL parsing fails, append query params cleanly
      const separator = src.includes('?') ? '&' : '?';
      return `${src}${separator}width=${safeWidth}&format=webp&quality=${safeQuality}`;
    }
  }

  // Non-Shopify images served directly
  return src;
}

