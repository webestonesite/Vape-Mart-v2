/**
 * Global Utility Formatters
 * Consistent formatting for AED currency, dates, percentages, and strings.
 */

/**
 * Format price in UAE Dirhams (AED)
 */
export function formatPrice(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null) return "AED 0.00";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "AED 0.00";
  return `AED ${num.toFixed(2)}`;
}

/**
 * Format discount percentage string
 */
export function formatDiscount(originalPrice: number, currentPrice: number): string | null {
  if (!originalPrice || originalPrice <= currentPrice) return null;
  const pct = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  return pct > 0 ? `-${pct}%` : null;
}

/**
 * Truncate long strings cleanly without cutting off words
 */
export function truncate(text: string, maxLength = 80): string {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}

