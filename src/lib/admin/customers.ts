import "server-only";
import { shopifyAdminMutation as gql } from "@/lib/shopify";
import type { AdminCustomer, AdminCustomerDetail, PageInfo, SaveResult } from "./types";

interface CustomersQueryResponse {
  customers?: {
    nodes?: {
      id: string;
      displayName?: string | null;
      email?: string | null;
      phone?: string | null;
      note?: string | null;
      tags?: string[];
      numberOfOrders?: number;
      amountSpent?: { amount?: string; currencyCode?: string } | null;
    }[];
    pageInfo?: { hasNextPage?: boolean; endCursor?: string | null };
  };
}

interface CustomerDetailQueryResponse {
  customer?: {
    id: string;
    displayName?: string | null;
    email?: string | null;
    phone?: string | null;
    note?: string | null;
    tags?: string[];
    numberOfOrders?: number;
    amountSpent?: { amount?: string; currencyCode?: string } | null;
    addressesV2?: {
      edges?: {
        node?: {
          id: string;
          name?: string | null;
          address1?: string | null;
          address2?: string | null;
          city?: string | null;
          country?: string | null;
          phone?: string | null;
          default?: boolean;
        };
      }[];
    };
    orders?: {
      nodes?: {
        id: string;
        name: string;
        createdAt?: string;
        displayFinancialStatus?: string | null;
        displayFulfillmentStatus?: string | null;
        totalPriceSet?: { shopMoney?: { amount?: string; currencyCode?: string } } | null;
      }[];
    };
  } | null;
}

interface CustomerUpdateResponse {
  customerUpdate?: {
    customer?: { id: string };
    userErrors?: { message: string }[];
  };
}

export async function getAdminCustomers(opts: {
  limit?: number;
  after?: string | null;
} = {}): Promise<{ customers: AdminCustomer[]; pageInfo: PageInfo }> {
  const limit = Math.min(Math.max(opts.limit || 50, 1), 250);
  const d = await gql<CustomersQueryResponse>(
    `query PanelCustomers($first: Int!, $after: String) {
       customers(first: $first, after: $after) {
         nodes {
           id displayName email phone note tags
           numberOfOrders
           amountSpent { amount currencyCode }
         }
         pageInfo { hasNextPage endCursor }
       }
     }`,
    { first: limit, after: opts.after || null }
  );

  const customers: AdminCustomer[] = (d.customers?.nodes ?? []).map((c) => ({
    id: c.id,
    name: c.displayName || "",
    email: c.email || "",
    phone: c.phone || "",
    orders: c.numberOfOrders ?? 0,
    spent: c.amountSpent?.amount || "",
    currency: c.amountSpent?.currencyCode || "AED",
    note: c.note || "",
    tags: (c.tags ?? []).join(", "),
  }));

  const pageInfo: PageInfo = {
    hasNextPage: !!d.customers?.pageInfo?.hasNextPage,
    endCursor: d.customers?.pageInfo?.endCursor || null,
  };

  return { customers, pageInfo };
}

export async function getAdminCustomerDetail(id: string): Promise<AdminCustomerDetail> {
  const d = await gql<CustomerDetailQueryResponse>(
    `query CustomerDetail($id: ID!) {
       customer(id: $id) {
         id displayName email phone note tags
         numberOfOrders amountSpent { amount currencyCode }
         addressesV2(first: 10) {
           edges { node { id name address1 address2 city country phone default } }
         }
         orders(first: 20, reverse: true) {
           nodes {
             id name createdAt displayFinancialStatus displayFulfillmentStatus
             totalPriceSet { shopMoney { amount currencyCode } }
           }
         }
       }
     }`,
    { id }
  );
  const c = d.customer;
  if (!c) throw new Error("Customer not found.");

  return {
    id: c.id,
    name: c.displayName || "",
    email: c.email || "",
    phone: c.phone || "",
    note: c.note || "",
    tags: (c.tags ?? []).join(", "),
    orders: c.numberOfOrders ?? 0,
    spent: c.amountSpent?.amount || "",
    currency: c.amountSpent?.currencyCode || "AED",
    addresses: (c.addressesV2?.edges ?? []).map((e) => {
      const a = e.node;
      return {
        id: a?.id || "",
        label: [a?.name, a?.address1, a?.address2, a?.city, a?.country, a?.phone].filter(Boolean).join(", "),
        isDefault: !!a?.default,
      };
    }),
    orderHistory: (c.orders?.nodes ?? []).map((o) => ({
      id: o.id,
      name: o.name,
      createdAt: o.createdAt || "",
      financial: o.displayFinancialStatus || "",
      fulfillment: o.displayFulfillmentStatus || "",
      total: o.totalPriceSet?.shopMoney?.amount || "",
      currency: o.totalPriceSet?.shopMoney?.currencyCode || "AED",
    })),
  };
}

export async function updateAdminCustomer(p: { id: string; note?: string; tags?: string | string[] }): Promise<SaveResult> {
  const input: Record<string, unknown> = { id: p.id };
  if (p.note !== undefined) input.note = String(p.note || "");
  if (p.tags !== undefined) {
    input.tags = Array.isArray(p.tags)
      ? p.tags
      : String(p.tags || "").split(",").map((x: string) => x.trim()).filter(Boolean);
  }
  const d = await gql<CustomerUpdateResponse>(
    `mutation CustomerSave($input: CustomerInput!) {
       customerUpdate(input: $input) {
         customer { id }
         userErrors { message }
       }
     }`,
    { input }
  );
  const errs = d.customerUpdate?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
  return { message: "Customer saved.", id: p.id };
}

export const getCustomerDetail = getAdminCustomerDetail;
export const updateCustomer = updateAdminCustomer;
