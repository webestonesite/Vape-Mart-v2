import "server-only";
import { shopifyAdminMutation as gql } from "@/lib/shopify";
import { RELATED_KEY, RELATED_NAMESPACE, infoByIds } from "./common";
import {
  BULK_FIELD_TYPES,
  deleteProductMetafields,
  productIdByHandle,
  setProductMetafields,
} from "./products";
import type { PageInfo } from "./types";

interface BulkMetafieldNode {
  key: string;
  value: string | null;
}

interface BulkProductNode {
  id: string;
  title: string;
  handle?: string | null;
  status: string;
  featuredImage?: { url?: string | null } | null;
  vapeMf?: { nodes?: BulkMetafieldNode[] };
  relMf?: { nodes?: BulkMetafieldNode[] };
}

interface BulkListQueryResponse {
  products?: {
    pageInfo?: { hasNextPage?: boolean; endCursor?: string | null };
    nodes?: BulkProductNode[];
  };
}

interface BulkSearchQueryResponse {
  products?: {
    nodes?: { id: string; title: string; handle?: string | null }[];
  };
}

export interface BulkProductItem {
  id: string;
  title: string;
  handle: string;
  featuredImage?: string;
  status: string;
  vape: Record<string, string>;
  related: { handle: string; title: string }[];
}

export const BULK_PAGE_SIZE = 25;

function sanitizeBulkSearch(raw: string): string | null {
  const s = (raw || "").replace(/["\\]/g, "").trim().slice(0, 100);
  return s ? s : null;
}

export async function listBulkProducts(opts: {
  cursor?: string | null;
  search?: string;
  status?: string;
}): Promise<{ products: BulkProductItem[]; pageInfo: PageInfo }> {
  const args: string[] = [`first: ${BULK_PAGE_SIZE}`];
  const varDefs: string[] = [];
  const vars: Record<string, string> = {};
  if (opts.cursor) {
    args.push("after: $after");
    varDefs.push("$after: String");
    vars.after = opts.cursor;
  }
  const parts: string[] = [];
  if (opts.status === "ACTIVE" || opts.status === "DRAFT") parts.push(`status:${opts.status}`);
  const term = sanitizeBulkSearch(opts.search || "");
  if (term) parts.push(term);
  if (parts.length) {
    args.push("query: $query");
    varDefs.push("$query: String");
    vars.query = parts.join(" ");
  }

  const d = await gql<BulkListQueryResponse>(
    `query BulkList${varDefs.length ? `(${varDefs.join(", ")})` : ""} {
       products(${args.join(", ")}) {
         pageInfo { hasNextPage endCursor }
         nodes {
           id title handle status
           featuredImage { url }
           vapeMf: metafields(first: 30, namespace: "vape") { nodes { key value } }
           relMf: metafields(first: 10, namespace: "${RELATED_NAMESPACE}") { nodes { key value } }
         }
       }
     }`,
    vars
  );

  const nodes = d.products?.nodes ?? [];
  const relatedIds = new Set<string>();
  const relatedByProduct: Record<string, string[]> = {};
  for (const p of nodes) {
    const rel = (p.relMf?.nodes ?? []).find((m) => m.key === RELATED_KEY);
    let ids: string[] = [];
    try {
      const v = JSON.parse(rel?.value || "[]");
      if (Array.isArray(v)) ids = v.map(String);
    } catch {
      ids = [];
    }
    relatedByProduct[p.id] = ids;
    for (const id of ids) relatedIds.add(id);
  }
  const infoById = await infoByIds([...relatedIds]);

  return {
    products: nodes.map((p) => {
      const vape: Record<string, string> = {};
      for (const m of p.vapeMf?.nodes ?? []) {
        if (m.key in BULK_FIELD_TYPES) vape[m.key] = m.value ?? "";
      }
      return {
        id: p.id,
        title: p.title,
        handle: p.handle || "",
        featuredImage: p.featuredImage?.url || undefined,
        status: p.status,
        vape,
        related: (relatedByProduct[p.id] || []).map((id) => ({
          handle: infoById[id]?.handle || id,
          title: infoById[id]?.title || id,
        })),
      };
    }),
    pageInfo: {
      hasNextPage: !!d.products?.pageInfo?.hasNextPage,
      endCursor: d.products?.pageInfo?.endCursor || null,
    },
  };
}

export async function searchBulkProducts(term: string): Promise<{ products: { id: string; title: string; handle: string }[] }> {
  const q = sanitizeBulkSearch(term);
  if (!q) return { products: [] };
  const d = await gql<BulkSearchQueryResponse>(
    `query BulkSearch($query: String) {
       products(first: 10, query: $query) { nodes { id title handle } }
     }`,
    { query: q }
  );
  return {
    products: (d.products?.nodes ?? []).map((p) => ({
      id: p.id,
      title: p.title,
      handle: p.handle || "",
    })),
  };
}

export async function saveBulkMetafields(
  changes: { id: string; title?: string; values: Record<string, string> }[]
): Promise<{ updated: number }> {
  let updated = 0;
  for (let i = 0; i < changes.length; i += 5) {
    const batch = changes.slice(i, i + 5);
    await Promise.all(
      batch.map(async (c) => {
        const sets: { ownerId: string; namespace: string; key: string; type: string; value: string }[] = [];
        const dels: string[] = [];
        let relatedSet: string[] | null = null;
        let relatedDel = false;

        for (const [key, raw] of Object.entries(c.values || {})) {
          if (key === "related") {
            const rawVal = (raw ?? "").trim();
            let handles: string[] = [];
            if (rawVal.startsWith("[")) {
              try {
                const arr = JSON.parse(rawVal);
                if (Array.isArray(arr)) handles = arr.map(String);
              } catch {
                handles = [];
              }
            } else {
              handles = rawVal
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
            }
            if (!handles.length) {
              relatedDel = true;
              continue;
            }
            const ids: string[] = [];
            for (const h of handles) {
              const id = await productIdByHandle(h);
              if (!id) throw new Error(`Unknown product link name "${h}" (product: ${c.title || c.id}).`);
              ids.push(id);
            }
            relatedSet = ids;
            continue;
          }
          const type = BULK_FIELD_TYPES[key];
          if (!type) continue;
          const value = (raw ?? "").trim();
          if (value === "") {
            dels.push(key);
            continue;
          }
          if (type === "number_integer" || type === "number_decimal") {
            if (!/^-?\d+(\.\d+)?$/.test(value))
              throw new Error(`"${key}" must be a number (product: ${c.title || c.id}).`);
          }
          if (key === "nicotine_options") {
            let list: string[];
            if (value.startsWith("[")) {
              try {
                const arr = JSON.parse(value);
                list = Array.isArray(arr) ? arr.map(String) : [];
              } catch {
                list = [];
              }
            } else {
              list = value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
            }
            if (!list.length) {
              dels.push(key);
              continue;
            }
            sets.push({ ownerId: c.id, namespace: "vape", key, type, value: JSON.stringify(list) });
          } else if (key === "flavors") {
            let list: unknown;
            try {
              list = JSON.parse(value);
            } catch {
              throw new Error(`Bad flavour data (product: ${c.title || c.id}).`);
            }
            if (!Array.isArray(list) || !list.length) {
              dels.push(key);
              continue;
            }
            sets.push({ ownerId: c.id, namespace: "vape", key, type, value: JSON.stringify(list) });
          } else {
            sets.push({ ownerId: c.id, namespace: "vape", key, type, value });
          }
        }
        if (sets.length) await setProductMetafields(c.id, sets);
        if (dels.length) await deleteProductMetafields(c.id, dels);
        if (relatedSet) {
          await setProductMetafields(c.id, [
            { ownerId: c.id, namespace: RELATED_NAMESPACE, key: RELATED_KEY, type: "list.product_reference", value: JSON.stringify(relatedSet) },
          ]);
        }
        if (relatedDel) await deleteProductMetafields(c.id, [RELATED_KEY], RELATED_NAMESPACE);
      })
    );
    updated += batch.length;
  }
  return { updated };
}
