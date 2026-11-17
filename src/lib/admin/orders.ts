import "server-only";
import { shopifyAdminMutation as gql } from "@/lib/shopify";
import type { AdminDraftOrder, AdminOrder, AdminOrderDetail, PageInfo, SaveResult } from "./types";

interface MoneyBag {
  shopMoney?: {
    amount?: string;
    currencyCode?: string;
  } | null;
}

interface OrdersQueryResponse {
  orders?: {
    nodes?: {
      id?: string;
      name?: string;
      createdAt?: string;
      displayFinancialStatus?: string | null;
      displayFulfillmentStatus?: string | null;
      totalPriceSet?: MoneyBag | null;
      customer?: { displayName?: string | null; email?: string | null } | null;
    }[];
    pageInfo?: { hasNextPage?: boolean; endCursor?: string | null };
  };
}

interface DraftOrdersQueryResponse {
  draftOrders?: {
    nodes?: {
      id?: string;
      name?: string;
      status?: string | null;
      createdAt?: string;
      totalPriceSet?: MoneyBag | null;
      customer?: { displayName?: string | null; email?: string | null } | null;
    }[];
    pageInfo?: { hasNextPage?: boolean; endCursor?: string | null };
  };
}

interface OrderDetailQueryResponse {
  order?: {
    id?: string;
    name?: string;
    createdAt?: string;
    displayFinancialStatus?: string | null;
    displayFulfillmentStatus?: string | null;
    note?: string | null;
    tags?: string[];
    totalPriceSet?: MoneyBag | null;
    totalRefundedSet?: MoneyBag | null;
    subtotalPriceSet?: MoneyBag | null;
    totalShippingPriceSet?: MoneyBag | null;
    totalTaxSet?: MoneyBag | null;
    customer?: { displayName?: string | null; email?: string | null; phone?: string | null } | null;
    email?: string | null;
    phone?: string | null;
    shippingAddress?: {
      name?: string | null;
      address1?: string | null;
      address2?: string | null;
      city?: string | null;
      country?: string | null;
      phone?: string | null;
    } | null;
    lineItems?: {
      nodes?: {
        id?: string;
        title?: string;
        variantTitle?: string | null;
        quantity?: number;
        refundableQuantity?: number;
        unfulfilledQuantity?: number;
        sku?: string | null;
        vendor?: string | null;
        originalUnitPriceSet?: MoneyBag | null;
        discountedTotalSet?: MoneyBag | null;
      }[];
    };
    fulfillmentOrders?: {
      nodes?: {
        id?: string;
        status?: string;
        lineItems?: {
          nodes?: {
            id?: string;
            remainingQuantity?: number;
            lineItem?: { id?: string; title?: string | null } | null;
          }[];
        };
      }[];
    };
    fulfillments?: {
      nodes?: {
        id?: string;
        status?: string;
        createdAt?: string;
        trackingInfo?: { company?: string | null; number?: string | null; url?: string | null }[];
      }[];
    };
    transactions?: {
      nodes?: {
        id?: string;
        kind?: string;
        gateway?: string;
        status?: string;
        amountSet?: MoneyBag | null;
      }[];
    };
    refunds?: {
      nodes?: {
        id?: string;
        createdAt?: string;
        totalRefundedSet?: MoneyBag | null;
      }[];
    };
  };
}

interface FulfillmentCreateResponse {
  fulfillmentCreate?: {
    fulfillment?: { id?: string };
    userErrors?: { message: string }[];
  };
}

interface RefundCreateResponse {
  refundCreate?: {
    refund?: { id?: string };
    userErrors?: { message: string }[];
  };
}

export async function getAdminOrders(opts: {
  status?: string;
  limit?: number;
  after?: string | null;
  reverse?: boolean;
} = {}): Promise<{ orders: AdminOrder[]; pageInfo: PageInfo }> {
  const limit = Math.min(Math.max(opts.limit || 25, 1), 100);
  const reverse = opts.reverse !== false;
  const query = opts.status ? `status:${opts.status}` : undefined;

  const d = await gql<OrdersQueryResponse>(
    `query PanelOrders($first: Int!, $after: String, $reverse: Boolean, $query: String) {
       orders(first: $first, after: $after, reverse: $reverse, query: $query) {
         nodes {
           id name createdAt displayFinancialStatus displayFulfillmentStatus
           totalPriceSet { shopMoney { amount currencyCode } }
           customer { displayName email }
         }
         pageInfo { hasNextPage endCursor }
       }
     }`,
    { first: limit, after: opts.after || null, reverse, query }
  );

  const orders: AdminOrder[] = (d.orders?.nodes ?? []).map((o) => ({
    id: o.id || "",
    name: o.name || "",
    customer: o.customer?.displayName || o.customer?.email || "Guest",
    fulfillment: o.displayFulfillmentStatus || "",
    financial: o.displayFinancialStatus || "",
    total: o.totalPriceSet?.shopMoney?.amount || "",
    currency: o.totalPriceSet?.shopMoney?.currencyCode || "AED",
    createdAt: o.createdAt || "",
  }));

  const pageInfo: PageInfo = {
    hasNextPage: !!d.orders?.pageInfo?.hasNextPage,
    endCursor: d.orders?.pageInfo?.endCursor || null,
  };

  return { orders, pageInfo };
}

export async function getAdminDraftOrders(opts: {
  limit?: number;
  after?: string | null;
} = {}): Promise<{ draftOrders: AdminDraftOrder[]; pageInfo: PageInfo }> {
  const limit = Math.min(Math.max(opts.limit || 25, 1), 100);
  const d = await gql<DraftOrdersQueryResponse>(
    `query PanelDraftOrders($first: Int!, $after: String) {
       draftOrders(first: $first, after: $after, reverse: true) {
         nodes {
           id name status createdAt
           totalPriceSet { shopMoney { amount currencyCode } }
           customer { displayName email }
         }
         pageInfo { hasNextPage endCursor }
       }
     }`,
    { first: limit, after: opts.after || null }
  );

  const draftOrders: AdminDraftOrder[] = (d.draftOrders?.nodes ?? []).map((o) => ({
    id: o.id || "",
    name: o.name || "",
    status: o.status || "",
    customer: o.customer?.displayName || o.customer?.email || "—",
    total: o.totalPriceSet?.shopMoney?.amount || "",
    currency: o.totalPriceSet?.shopMoney?.currencyCode || "AED",
    createdAt: o.createdAt || "",
  }));

  const pageInfo: PageInfo = {
    hasNextPage: !!d.draftOrders?.pageInfo?.hasNextPage,
    endCursor: d.draftOrders?.pageInfo?.endCursor || null,
  };

  return { draftOrders, pageInfo };
}

export async function getAdminOrderDetail(id: string): Promise<AdminOrderDetail> {
  const d = await gql<OrderDetailQueryResponse>(
    `query OrderDetail($id: ID!) {
       order(id: $id) {
         id name createdAt displayFinancialStatus displayFulfillmentStatus
         note tags
         totalPriceSet { shopMoney { amount currencyCode } }
         totalRefundedSet { shopMoney { amount currencyCode } }
         subtotalPriceSet { shopMoney { amount } }
         totalShippingPriceSet { shopMoney { amount } }
         totalTaxSet { shopMoney { amount } }
         customer { displayName email phone }
         email phone
         shippingAddress { name address1 address2 city country phone }
         lineItems(first: 50) {
           nodes {
             id title variantTitle quantity refundableQuantity unfulfilledQuantity sku vendor
             originalUnitPriceSet { shopMoney { amount } }
             discountedTotalSet { shopMoney { amount } }
           }
         }
         fulfillmentOrders(first: 10) {
           nodes {
             id status
             lineItems(first: 20) { nodes { id remainingQuantity lineItem { id title } } }
           }
         }
         fulfillments(first: 10) {
           nodes { id status createdAt trackingInfo { company number url } }
         }
         transactions(first: 10) {
           nodes { id kind gateway status amountSet { shopMoney { amount } } }
         }
         refunds(first: 10) {
           nodes { id createdAt totalRefundedSet { shopMoney { amount } } }
         }
       }
     }`,
    { id }
  );
  const o = d.order;
  if (!o) throw new Error("Order not found.");
  const money = (m: MoneyBag | null | undefined): string => m?.shopMoney?.amount || "0";

  return {
    id: o.id || "",
    name: o.name || "",
    createdAt: o.createdAt || "",
    financial: o.displayFinancialStatus || "",
    fulfillment: o.displayFulfillmentStatus || "",
    note: o.note || "",
    tags: (o.tags ?? []).join(", "),
    total: money(o.totalPriceSet),
    refunded: money(o.totalRefundedSet),
    subtotal: money(o.subtotalPriceSet),
    shipping: money(o.totalShippingPriceSet),
    tax: money(o.totalTaxSet),
    currency: o.totalPriceSet?.shopMoney?.currencyCode || "AED",
    customer: o.customer?.displayName || o.email || "Guest",
    email: o.customer?.email || o.email || "",
    phone: o.customer?.phone || o.phone || "",
    shippingAddress: o.shippingAddress
      ? [o.shippingAddress.name, o.shippingAddress.address1, o.shippingAddress.address2, o.shippingAddress.city, o.shippingAddress.country]
          .filter(Boolean)
          .join(", ")
      : "",
    lineItems: (o.lineItems?.nodes ?? []).map((li) => ({
      id: li.id || "",
      title: li.title || "",
      variantTitle: li.variantTitle || "",
      quantity: li.quantity ?? 0,
      refundableQuantity: li.refundableQuantity ?? 0,
      unfulfilledQuantity: li.unfulfilledQuantity ?? 0,
      sku: li.sku || "",
      vendor: li.vendor || "",
      unitPrice: money(li.originalUnitPriceSet),
      total: money(li.discountedTotalSet),
    })),
    fulfillmentOrders: (o.fulfillmentOrders?.nodes ?? []).map((fo) => ({
      id: fo.id || "",
      status: fo.status || "",
      lineItems: (fo.lineItems?.nodes ?? []).map((x) => ({
        id: x.id || "",
        remainingQuantity: x.remainingQuantity ?? 0,
        title: x.lineItem?.title || "",
      })),
    })),
    fulfillments: (o.fulfillments?.nodes ?? []).map((f) => ({
      id: f.id || "",
      status: f.status || "",
      createdAt: f.createdAt || "",
      tracking: (f.trackingInfo ?? []).map((t) => [t.company, t.number].filter(Boolean).join(" ")).filter(Boolean).join(", "),
      trackingUrl: f.trackingInfo?.[0]?.url || "",
    })),
    refunds: (o.refunds?.nodes ?? []).map((r) => ({
      id: r.id || "",
      createdAt: r.createdAt || "",
      amount: money(r.totalRefundedSet),
    })),
    saleGateway: (o.transactions?.nodes ?? []).find((t) => t.kind === "SALE" && t.status === "SUCCESS")?.gateway || "",
  };
}

export async function fulfillAdminOrder(id: string): Promise<SaveResult> {
  const detail = await getAdminOrderDetail(id);
  const open = detail.fulfillmentOrders.filter(
    (fo) => fo.status === "OPEN" && fo.lineItems.some((li) => li.remainingQuantity > 0)
  );
  if (!open.length) throw new Error("Order already fulfilled — no open fulfillment orders found.");

  for (const fo of open) {
    const d = await gql<FulfillmentCreateResponse>(
      `mutation FulfillCreate($fulfillment: FulfillmentInput!) {
         fulfillmentCreate(fulfillment: $fulfillment) {
           fulfillment { id }
           userErrors { message }
         }
       }`,
      {
        fulfillment: {
          notifyCustomer: true,
          lineItemsByFulfillmentOrder: [
            {
              fulfillmentOrderId: fo.id,
              fulfillmentOrderLineItems: fo.lineItems
                .filter((li) => li.remainingQuantity > 0)
                .map((li) => ({ id: li.id, quantity: li.remainingQuantity })),
            },
          ],
        },
      }
    );
    const errs = d.fulfillmentCreate?.userErrors ?? [];
    if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
  }
  return { message: "Order fulfilled — customer notified.", id };
}

export async function refundAdminOrder(id: string): Promise<SaveResult> {
  const detail = await getAdminOrderDetail(id);
  const total = parseFloat(detail.total || "0") || 0;
  const refunded = parseFloat(detail.refunded || "0") || 0;
  const refundable = total - refunded;
  if (refundable <= 0) throw new Error("No refundable amount remaining on this order.");

  const refundLineItems = detail.lineItems
    .filter((li) => li.refundableQuantity > 0)
    .map((li) => ({ lineItemId: li.id, quantity: li.refundableQuantity, restockType: "RETURN" }));
  if (!refundLineItems.length) throw new Error("No items available to refund.");

  const input: Record<string, unknown> = {
    orderId: id,
    refundLineItems,
    notify: true,
    note: "Full refund from Vape Mart admin panel.",
  };
  if (detail.saleGateway) {
    input.transactions = [{ kind: "REFUND", gateway: detail.saleGateway, amount: refundable.toFixed(2) }];
  }
  const d = await gql<RefundCreateResponse>(
    `mutation RefundCreate($input: RefundInput!) {
       refundCreate(input: $input) {
         refund { id }
         userErrors { message }
       }
     }`,
    { input }
  );
  const errs = d.refundCreate?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
  return {
    message: `Full refund completed — ${detail.currency} ${refundable.toFixed(2)} refunded, items restocked.`,
    id,
  };
}
