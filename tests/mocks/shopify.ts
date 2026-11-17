// Mock implementation of @/lib/shopify for offline test environment
import { DEFAULT_STORED_HASH } from "./next-headers";
import { MOCK_GRAPHQL_PRODUCTS, MOCK_PRODUCT_DETAIL_NODE } from "../helpers/fixtures/products.fixture";
import { MOCK_GRAPHQL_ORDERS, MOCK_ORDER_DETAIL_NODE, MOCK_DRAFT_ORDERS } from "../helpers/fixtures/orders.fixture";
import { MOCK_GRAPHQL_REDIRECTS } from "../helpers/fixtures/redirects.fixture";
import { MOCK_GRAPHQL_METAOBJECTS } from "../helpers/fixtures/metaobjects.fixture";
import { MOCK_SHOP_SETTINGS } from "../helpers/fixtures/settings.fixture";
import type { ShopSettings } from "../../src/lib/shopify";

export type {
  CheckoutSettings,
  ProductPageSettings,
  CollectionPageSettings,
  ThemeSettings,
  HomeSettings,
  BlogSettings,
  PagesSettings,
  ShopSettings,
} from "../../src/lib/shopify";

export interface RecordedCall {
  query: string;
  variables: Record<string, unknown>;
  timestamp: number;
}

type MatcherFn = (query: string, variables: Record<string, unknown>) => boolean;
type HandlerFn = (query: string, variables: Record<string, unknown>) => unknown;

interface MockRule {
  id: string;
  matcher: MatcherFn;
  handler: HandlerFn;
}

const recordedCalls: RecordedCall[] = [];
const mockRules: MockRule[] = [];
let defaultResponse: unknown = null;

export async function shopifyAdminMutation<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  recordedCalls.push({ query, variables, timestamp: Date.now() });

  // 1. Check custom registered mock rules (in reverse order: newest rule wins)
  for (let i = mockRules.length - 1; i >= 0; i--) {
    const rule = mockRules[i];
    if (rule.matcher(query, variables)) {
      const result = rule.handler(query, variables);
      return result as T;
    }
  }

  // 2. Default query/mutation handlers
  const q = query.toLowerCase();

  // Admin authentication query
  if (query.includes("panel_password")) {
    return { shop: { metafield: { value: DEFAULT_STORED_HASH } } } as T;
  }

  // Shop settings metafields
  if (q.includes("metafieldsset")) {
    return {
      metafieldsSet: {
        metafields: [{ id: "gid://shopify/Metafield/777", key: "mock_key" }],
        userErrors: [],
      },
    } as T;
  }

  // Products mutations
  if (q.includes("productcreate")) {
    const input = (variables.input || variables.product || {}) as Record<string, unknown>;
    return {
      productCreate: {
        product: {
          id: "gid://shopify/Product/103",
          handle: input.handle || "new-product",
          title: input.title || "New Product",
        },
        userErrors: [],
      },
    } as T;
  }

  if (q.includes("productupdate")) {
    const input = (variables.input || variables.product || {}) as Record<string, unknown>;
    return {
      productUpdate: {
        product: {
          id: input.id || "gid://shopify/Product/101",
          handle: input.handle || "updated-product",
        },
        userErrors: [],
      },
    } as T;
  }

  if (q.includes("productdelete")) {
    const input = (variables.input || {}) as Record<string, unknown>;
    return {
      productDelete: {
        deletedProductId: input.id || variables.id || "gid://shopify/Product/101",
        userErrors: [],
      },
    } as T;
  }

  // Orders mutations
  if (q.includes("fulfillmentcreate")) {
    return {
      fulfillmentCreate: {
        fulfillment: { id: "gid://shopify/Fulfillment/991" },
        userErrors: [],
      },
    } as T;
  }

  if (q.includes("refundcreate")) {
    return {
      refundCreate: {
        refund: { id: "gid://shopify/Refund/992" },
        userErrors: [],
      },
    } as T;
  }

  // Redirects mutations
  if (q.includes("urlredirectcreate")) {
    const redirectInput = (variables.urlRedirect || {}) as Record<string, unknown>;
    return {
      urlRedirectCreate: {
        urlRedirect: {
          id: "gid://shopify/UrlRedirect/504",
          path: redirectInput.path,
          target: redirectInput.target,
        },
        userErrors: [],
      },
    } as T;
  }

  if (q.includes("urlredirectdelete")) {
    return {
      urlRedirectDelete: {
        deletedUrlRedirectId: variables.id || "gid://shopify/UrlRedirect/501",
        userErrors: [],
      },
    } as T;
  }

  // Metaobjects mutations
  if (q.includes("metaobjectcreate")) {
    return {
      metaobjectCreate: {
        metaobject: { id: "gid://shopify/Metaobject/604", handle: "new-metaobject" },
        userErrors: [],
      },
    } as T;
  }

  if (q.includes("metaobjectupdate")) {
    return {
      metaobjectUpdate: {
        metaobject: { id: variables.id || "gid://shopify/Metaobject/601" },
        userErrors: [],
      },
    } as T;
  }

  if (q.includes("metaobjectdelete")) {
    return {
      metaobjectDelete: {
        deletedId: variables.id || "gid://shopify/Metaobject/601",
        userErrors: [],
      },
    } as T;
  }

  // Queries: Single Product Detail
  if (q.includes("product(id:") || q.includes("productdetail") || (q.includes("product") && q.includes("$id: id!"))) {
    return { product: MOCK_PRODUCT_DETAIL_NODE } as T;
  }

  // Queries: Products Listing
  if (q.includes("products(")) {
    return {
      products: {
        nodes: MOCK_GRAPHQL_PRODUCTS,
        pageInfo: { hasNextPage: false, endCursor: "cursor_prod_end" },
      },
    } as T;
  }

  // Queries: Draft Orders Listing (must check before orders/order)
  if (q.includes("draftorders(")) {
    return {
      draftOrders: {
        nodes: MOCK_DRAFT_ORDERS,
        pageInfo: { hasNextPage: false, endCursor: "cursor_draft_end" },
      },
    } as T;
  }

  // Queries: Single Order Detail
  if (q.includes("order(id:") || q.includes("orderdetail") || (q.includes("query orderdetail") || (q.includes("order(") && !q.includes("orders(")))) {
    return { order: MOCK_ORDER_DETAIL_NODE } as T;
  }

  // Queries: Orders Listing
  if (q.includes("orders(")) {
    return {
      orders: {
        nodes: MOCK_GRAPHQL_ORDERS,
        pageInfo: { hasNextPage: false, endCursor: "cursor_ord_end" },
      },
    } as T;
  }

  // Queries: URL Redirects Listing
  if (q.includes("urlredirects(")) {
    return {
      urlRedirects: {
        nodes: MOCK_GRAPHQL_REDIRECTS,
        pageInfo: { hasNextPage: false, endCursor: "cursor_red_end" },
      },
    } as T;
  }

  // Queries: Metaobjects Listing
  if (q.includes("metaobjects(")) {
    return {
      metaobjects: {
        nodes: MOCK_GRAPHQL_METAOBJECTS,
        pageInfo: { hasNextPage: false, endCursor: "cursor_mo_end" },
      },
    } as T;
  }

  if (defaultResponse !== null) {
    return defaultResponse as T;
  }

  return {} as T;
}

export async function fetchShopSettings(_revalidateSecs = 0): Promise<ShopSettings> {
  recordedCalls.push({
    query: "FETCH_SHOP_SETTINGS",
    variables: { _revalidateSecs },
    timestamp: Date.now(),
  });
  return JSON.parse(JSON.stringify(MOCK_SHOP_SETTINGS));
}

export async function fetchAllShopifyProducts(): Promise<typeof MOCK_GRAPHQL_PRODUCTS> {
  return [...MOCK_GRAPHQL_PRODUCTS];
}

// ---------------------------------------------------------------------------
// Mock inspection and control helpers
// ---------------------------------------------------------------------------

export function setMockResponse(
  pattern: string | RegExp | MatcherFn,
  dataOrHandler: unknown | HandlerFn
): void {
  const matcher: MatcherFn =
    typeof pattern === "string"
      ? (query) => query.includes(pattern)
      : pattern instanceof RegExp
      ? (query) => pattern.test(query)
      : pattern;

  const handler: HandlerFn =
    typeof dataOrHandler === "function" ? (dataOrHandler as HandlerFn) : () => dataOrHandler;

  mockRules.push({ id: Math.random().toString(36), matcher, handler });
}

export function setMockUserErrors(mutationName: string, messages: string[]): void {
  const errs = messages.map((message) => ({ message }));
  setMockResponse(mutationName, {
    [mutationName]: {
      userErrors: errs,
    },
  });
}

export function setDefaultMockResponse(data: unknown): void {
  defaultResponse = data;
}

export function getRecordedCalls(): RecordedCall[] {
  return [...recordedCalls];
}

export function getLastRecordedCall(): RecordedCall | undefined {
  return recordedCalls[recordedCalls.length - 1];
}

export function clearRecordedCalls(): void {
  recordedCalls.length = 0;
}

export function resetShopifyMocks(): void {
  recordedCalls.length = 0;
  mockRules.length = 0;
  defaultResponse = null;
}
