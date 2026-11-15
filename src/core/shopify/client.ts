import { env } from "@/core/config/env";

export type SafeResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

interface SafeFetchOptions {
  query: string;
  variables?: Record<string, unknown>;
  tags?: string[];
  timeoutMs?: number;
  apiType?: "storefront" | "admin";
}

/**
 * Non-throwing safe GraphQL client.
 * Strictly wraps requests in an AbortController timeout (default 5000ms)
 * and returns a typed SafeResult discriminated union.
 * Ensures temporary API drops or corrupt payloads never crash Server Components.
 */
export async function safeShopifyFetch<T>({
  query,
  variables = {},
  tags = [],
  timeoutMs = 5000,
  apiType = "storefront",
}: SafeFetchOptions): Promise<SafeResult<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const endpoint =
    apiType === "storefront"
      ? `https://${env.SHOPIFY_STORE_DOMAIN}/api/${env.SHOPIFY_API_VERSION}/graphql.json`
      : `https://${env.SHOPIFY_STORE_DOMAIN}/admin/api/${env.SHOPIFY_API_VERSION}/graphql.json`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (apiType === "storefront") {
    if (env.SHOPIFY_STOREFRONT_TOKEN) {
      headers["X-Shopify-Storefront-Access-Token"] = env.SHOPIFY_STOREFRONT_TOKEN;
    }
  } else if (env.SHOPIFY_ADMIN_TOKEN) {
    headers["X-Shopify-Access-Token"] = env.SHOPIFY_ADMIN_TOKEN;
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
      cache: "force-cache",
      next: tags.length > 0 ? { tags } : undefined,
      signal: controller.signal,
    });

    if (!res.ok) {
      return { ok: false, error: `Shopify HTTP ${res.status}: ${res.statusText}` };
    }

    const json = await res.json();
    if (json.errors && json.errors.length > 0) {
      return { ok: false, error: json.errors[0]?.message || "Shopify GraphQL error" };
    }

    return { ok: true, data: json.data as T };
  } catch (err: unknown) {
    const msg =
      err instanceof Error
        ? err.name === "AbortError"
          ? `Shopify fetch timed out after ${timeoutMs}ms`
          : err.message
        : "Unknown Shopify network error";

    return { ok: false, error: msg };
  } finally {
    clearTimeout(timer);
  }
}

