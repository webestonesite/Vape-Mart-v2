import "server-only";
import { shopifyAdminMutation as gql } from "@/lib/shopify";

export const SHOP_ID = "gid://shopify/Shop/63186075696";
export const BLOG_ID = "gid://shopify/Blog/85628715056";
export const RELATED_NAMESPACE = "shopify--discovery--product_recommendation";
export const RELATED_KEY = "related_products";

export function fieldsMap(fields: { key: string; value: string | null }[] | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of fields ?? []) if (f.value != null) out[f.key] = f.value;
  return out;
}

export function parseList(value: string | undefined): string[] {
  if (!value) return [];
  try {
    const v = JSON.parse(value);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

export function slugify(s: string): string {
  return (s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function validSortOrder(v: unknown): string | undefined {
  const s = String(v || "").toUpperCase();
  const ALLOWED = new Set([
    "ALPHA_ASC", "ALPHA_DESC", "BEST_SELLING", "CREATED", "CREATED_DESC",
    "MANUAL", "PRICE_ASC", "PRICE_DESC",
  ]);
  return ALLOWED.has(s) ? s : undefined;
}

export function validCompareAt(v: unknown): string | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  const n = parseFloat(String(v));
  return Number.isFinite(n) && n > 0 ? n.toFixed(2) : undefined;
}

interface ShopifyUserError {
  message: string;
  field?: string[];
}

interface FileCreateResponse {
  fileCreate?: {
    files?: { id: string }[];
    userErrors?: ShopifyUserError[];
  };
}

interface NodesByIdsResponse {
  nodes?: ({ id?: string; handle?: string; title?: string } | null)[];
}

export async function gqlTry<T = Record<string, unknown>>(
  docs: { query: string; variables: Record<string, unknown> }[]
): Promise<T> {
  let last: unknown = null;
  for (const d of docs) {
    try {
      return await gql<T>(d.query, d.variables);
    } catch (e: unknown) {
      last = e;
    }
  }
  throw last;
}

export async function fileFromUrl(url: string, alt: string): Promise<string> {
  const d = await gql<FileCreateResponse>(
    `mutation FileCreate($files: [FileCreateInput!]!) {
       fileCreate(files: $files) { files { id } userErrors { message } }
     }`,
    { files: [{ originalSource: url, alt, contentType: "IMAGE" }] }
  );
  const errs = d.fileCreate?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
  const id = d.fileCreate?.files?.[0]?.id;
  if (!id) throw new Error("Shopify did not return a file ID.");
  return id;
}

export async function infoByIds(ids: string[]): Promise<Record<string, { handle: string; title: string }>> {
  if (!ids.length) return {};
  const d = await gql<NodesByIdsResponse>(
    `query NodesByIds($ids: [ID!]!) {
       nodes(ids: $ids) {
         ... on Product { id handle title }
       }
     }`,
    { ids }
  );
  const out: Record<string, { handle: string; title: string }> = {};
  for (const n of d.nodes ?? []) {
    if (n && n.id) out[n.id] = { handle: n.handle || "", title: n.title || "" };
  }
  return out;
}
