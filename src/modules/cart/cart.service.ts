import { env } from "@/core/config/env";

export interface ShopifyCartLineInput {
  merchandiseId: string;
  quantity: number;
}

export interface ShopifyCartResponse {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
  };
  lines: {
    nodes: Array<{
      id: string;
      quantity: number;
      merchandise: {
        id: string;
        title: string;
        product: {
          title: string;
          handle: string;
        };
        price: {
          amount: string;
          currencyCode: string;
        };
      };
    }>;
  };
}

async function storefrontFetch<T>(query: string, variables: Record<string, unknown> = {}): Promise<T | null> {
  if (!env.SHOPIFY_STOREFRONT_TOKEN) {
    // If storefront token not provided yet, fallback gracefully
    return null;
  }

  try {
    const res = await fetch(
      `https://${env.SHOPIFY_STORE_DOMAIN}/api/${env.SHOPIFY_API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": env.SHOPIFY_STOREFRONT_TOKEN,
        },
        body: JSON.stringify({ query, variables }),
      }
    );

    if (!res.ok) return null;
    const json = await res.json();
    return json.data as T;
  } catch {
    return null;
  }
}

/**
 * Direct Client-Side Shopify Storefront Cart Operations
 * Zero server load, zero Vercel compute credits.
 */
export async function createShopifyCart(lines: ShopifyCartLineInput[] = []): Promise<ShopifyCartResponse | null> {
  const query = /* GraphQL */ `
    mutation CartCreate($lines: [CartLineInput!]) {
      cartCreate(input: { lines: $lines }) {
        cart {
          id
          checkoutUrl
          totalQuantity
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
          lines(first: 50) {
            nodes {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  product {
                    title
                    handle
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await storefrontFetch<{ cartCreate: { cart: ShopifyCartResponse } }>(query, { lines });
  return data?.cartCreate?.cart ?? null;
}

export async function addLinesToCart(cartId: string, lines: ShopifyCartLineInput[]): Promise<ShopifyCartResponse | null> {
  const query = /* GraphQL */ `
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id
          checkoutUrl
          totalQuantity
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
        }
      }
    }
  `;

  const data = await storefrontFetch<{ cartLinesAdd: { cart: ShopifyCartResponse } }>(query, { cartId, lines });
  return data?.cartLinesAdd?.cart ?? null;
}

export async function fetchLiveCart(cartId: string): Promise<ShopifyCartResponse | null> {
  const query = /* GraphQL */ `
    query GetCart($cartId: ID!) {
      cart(id: $cartId) {
        id
        checkoutUrl
        totalQuantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
      }
    }
  `;

  const data = await storefrontFetch<{ cart: ShopifyCartResponse | null }>(query, { cartId });
  return data?.cart ?? null;
}

