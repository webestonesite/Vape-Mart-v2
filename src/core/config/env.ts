/**
 * Runtime Environment Configuration & Validator
 * Centralizes store credentials with fail-safe defaults for development & edge runtime.
 */

export const env = {
  // Public Storefront Configuration
  SHOPIFY_STORE_DOMAIN:
    process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ||
    process.env.SHOPIFY_STORE_DOMAIN ||
    "vf4iap-u5.myshopify.com",
  SHOPIFY_STOREFRONT_TOKEN:
    process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN ||
    process.env.SHOPIFY_STOREFRONT_TOKEN ||
    "",
  SHOPIFY_API_VERSION:
    process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION ||
    process.env.SHOPIFY_API_VERSION ||
    "2025-07",
  SITE_URL:
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://vapemart.ae",

  // Server-Only Secrets
  SHOPIFY_CLIENT_ID: process.env.SHOPIFY_CLIENT_ID || "",
  SHOPIFY_CLIENT_SECRET: process.env.SHOPIFY_CLIENT_SECRET || "",
  SHOPIFY_ADMIN_TOKEN: process.env.SHOPIFY_ADMIN_TOKEN || "",
  SHOPIFY_WEBHOOK_SECRET: process.env.SHOPIFY_WEBHOOK_SECRET || "",
  REVALIDATE_SECRET: process.env.REVALIDATE_SECRET || "vapemart-sync-2026",
  ADMIN_SETUP_CODE: process.env.ADMIN_SETUP_CODE || "vapemart-admin-setup-2026",

  // Helpers
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
} as const;

export function validateCoreEnv() {
  const missing: string[] = [];
  if (!env.SHOPIFY_STORE_DOMAIN) missing.push("SHOPIFY_STORE_DOMAIN");
  if (!env.SHOPIFY_CLIENT_ID && !env.SHOPIFY_ADMIN_TOKEN) {
    missing.push("SHOPIFY_CLIENT_ID or SHOPIFY_ADMIN_TOKEN");
  }
  if (missing.length > 0) {
    console.warn(`[Config] Missing environment variables: ${missing.join(", ")}`);
  }
}

