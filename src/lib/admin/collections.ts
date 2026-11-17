import "server-only";
import { shopifyAdminMutation as gql } from "@/lib/shopify";
import { gqlTry, validSortOrder } from "./common";
import type {
  AdminCollection,
  AdminCollectionDetail,
  PageInfo,
  SaveResult,
  UpdateCollectionInput,
} from "./types";

interface CollectionsQueryResponse {
  collections?: {
    nodes?: {
      id?: string;
      title?: string;
      handle?: string;
      productsCount?: { count?: number };
    }[];
    pageInfo?: { hasNextPage?: boolean; endCursor?: string | null };
  };
}

interface CollectionDetailQueryResponse {
  collection?: {
    id?: string;
    title?: string;
    handle?: string;
    descriptionHtml?: string;
    sortOrder?: string;
    image?: { url?: string; altText?: string | null };
    seo?: { title?: string | null; description?: string | null };
    metafields?: { nodes?: { key: string; value: string | null }[] };
  };
}

interface CollectionProductsQueryResponse {
  collection?: {
    products?: {
      nodes?: { id?: string }[];
      pageInfo?: { hasNextPage?: boolean; endCursor?: string | null };
    };
  };
}

interface CollectionCreateResponse {
  collectionCreate?: {
    collection?: { id?: string };
    userErrors?: { message: string }[];
  };
}

interface CollectionUpdateResponse {
  collectionUpdate?: {
    collection?: { id?: string };
    userErrors?: { message: string }[];
  };
}

interface CollectionDeleteResponse {
  collectionDelete?: {
    deletedCollectionId?: string;
    userErrors?: { message: string }[];
  };
}

export async function getAdminCollections(opts: { limit?: number; after?: string | null } = {}): Promise<{
  collections: AdminCollection[];
  pageInfo: PageInfo;
}> {
  const limit = Math.min(Math.max(opts.limit || 50, 1), 250);
  const d = await gql<CollectionsQueryResponse>(
    `query PanelCollections($first: Int!, $after: String) {
       collections(first: $first, after: $after) {
         nodes {
           id title handle
           productsCount { count }
         }
         pageInfo { hasNextPage endCursor }
       }
     }`,
    { first: limit, after: opts.after || null }
  );

  const collections: AdminCollection[] = (d.collections?.nodes ?? []).map((c) => ({
    id: c.id || "",
    title: c.title || "",
    handle: c.handle || "",
    productCount: c.productsCount?.count ?? 0,
  }));

  const pageInfo: PageInfo = {
    hasNextPage: !!d.collections?.pageInfo?.hasNextPage,
    endCursor: d.collections?.pageInfo?.endCursor || null,
  };

  return { collections, pageInfo };
}

export async function listAllCollections(): Promise<AdminCollection[]> {
  const out: AdminCollection[] = [];
  let after: string | null = null;
  for (let page = 0; page < 20; page++) {
    const res = await getAdminCollections({ limit: 50, after });
    out.push(...res.collections);
    if (!res.pageInfo.hasNextPage) break;
    after = res.pageInfo.endCursor;
  }
  return out;
}

export async function getAdminCollectionDetail(id: string): Promise<AdminCollectionDetail> {
  const d = await gql<CollectionDetailQueryResponse>(
    `query CollectionDetail($id: ID!) {
       collection(id: $id) {
         id title handle descriptionHtml sortOrder
         image { url altText }
         seo { title description }
         metafields(first: 20, namespace: "collection") { nodes { key value } }
       }
     }`,
    { id }
  );
  const c = d.collection;
  if (!c) throw new Error("Collection not found.");

  const productIds: string[] = [];
  let after: string | null = null;
  for (let page = 0; page < 20; page++) {
    const colResp: CollectionProductsQueryResponse = await gql<CollectionProductsQueryResponse>(
      `query CollectionProducts($id: ID!, $after: String) {
         collection(id: $id) {
           products(first: 100, after: $after) {
             nodes { id }
             pageInfo { hasNextPage endCursor }
           }
         }
       }`,
      { id, after }
    );
    const nodes = colResp.collection?.products?.nodes ?? [];
    productIds.push(...nodes.map((p: { id?: string }) => p.id || "").filter(Boolean));
    if (!colResp.collection?.products?.pageInfo?.hasNextPage) break;
    after = colResp.collection?.products?.pageInfo?.endCursor || null;
  }
  const mf: Record<string, string> = {};
  for (const m of c.metafields?.nodes ?? []) if (m.value != null) mf[m.key] = m.value;

  return {
    id: c.id || "",
    title: c.title || "",
    handle: c.handle || "",
    descriptionHtml: c.descriptionHtml || "",
    sortOrder: c.sortOrder || "MANUAL",
    imageUrl: c.image?.url || "",
    seoTitle: c.seo?.title || "",
    seoDescription: c.seo?.description || "",
    badge: mf.badge || "",
    heroSubtitle: mf.hero_subtitle || "",
    showAsCard: mf.show_as_card === "true",
    productIds,
  };
}

export async function createAdminCollection(
  title: string,
  opts?: { descriptionHtml?: string; sortOrder?: string }
): Promise<SaveResult> {
  const input: Record<string, unknown> = { title };
  if (opts?.descriptionHtml) input.descriptionHtml = opts.descriptionHtml;
  const so = validSortOrder(opts?.sortOrder);
  if (so) input.sortOrder = so;
  const d = await gql<CollectionCreateResponse>(
    `mutation CollCreate($collection: CollectionInput!) {
       collectionCreate(input: $collection) { collection { id } userErrors { message } }
     }`,
    { collection: input }
  );
  const errs = d.collectionCreate?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
  return { message: "Collection created.", id: d.collectionCreate?.collection?.id };
}

export async function updateAdminCollection(p: UpdateCollectionInput): Promise<SaveResult> {
  const collection: Record<string, unknown> = { id: p.id };
  if (p.title !== undefined) collection.title = p.title;
  if (p.descriptionHtml !== undefined) collection.descriptionHtml = p.descriptionHtml;
  const so = validSortOrder(p.sortOrder);
  if (so) collection.sortOrder = so;
  if (p.imageUrl) collection.image = { src: p.imageUrl, altText: p.title || "" };
  if (p.seoTitle !== undefined || p.seoDescription !== undefined)
    collection.seo = { title: p.seoTitle || "", description: p.seoDescription || "" };
  collection.metafields = [
    { namespace: "collection", key: "badge", type: "single_line_text_field", value: String(p.badge || "") },
    { namespace: "collection", key: "hero_subtitle", type: "single_line_text_field", value: String(p.heroSubtitle || "") },
    { namespace: "collection", key: "show_as_card", type: "boolean", value: p.showAsCard ? "true" : "false" },
  ];
  const d = await gql<CollectionUpdateResponse>(
    `mutation CollectionSave($collection: CollectionInput!) {
       collectionUpdate(collection: $collection) { collection { id } userErrors { message } }
     }`,
    { collection }
  );
  const errs = d.collectionUpdate?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
  return { message: "Collection saved.", id: p.id };
}

export async function deleteAdminCollection(id: string): Promise<SaveResult> {
  const d = await gqlTry<CollectionDeleteResponse>([
    {
      query: `mutation CollDelete($id: ID!) { collectionDelete(id: $id) { deletedCollectionId userErrors { message } } }`,
      variables: { id },
    },
    {
      query: `mutation CollDelete($input: CollectionDeleteInput!) { collectionDelete(input: $input) { deletedCollectionId userErrors { message } } }`,
      variables: { input: { id } },
    },
  ]);
  const errs = d.collectionDelete?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
  return { message: "Collection deleted.", id };
}

export const getCollectionDetail = getAdminCollectionDetail;
export const createCollection = createAdminCollection;
export const updateCollection = updateAdminCollection;
export const deleteCollection = deleteAdminCollection;

