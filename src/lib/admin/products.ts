import "server-only";
import { shopifyAdminMutation as gql } from "@/lib/shopify";
import {
  RELATED_KEY,
  RELATED_NAMESPACE,
  gqlTry,
  infoByIds,
  slugify,
  validCompareAt,
} from "./common";
import { moCreate, moDelete, moUpdate } from "./metaobjects";
import type {
  AdminProduct,
  AdminProductDetail,
  AdminProductVariant,
  CreateProductInput,
  FieldObj,
  PageInfo,
  SaveResult,
  UpdateProductInput,
} from "./types";

export const BULK_FIELD_TYPES: Record<string, string> = {
  puffs: "number_integer",
  puff_range: "single_line_text_field",
  nicotine_strength: "single_line_text_field",
  battery_capacity: "single_line_text_field",
  coil_type: "single_line_text_field",
  charging_type: "single_line_text_field",
  e_liquid_capacity: "single_line_text_field",
  activation: "single_line_text_field",
  vg_pg_ratio: "single_line_text_field",
  flavor_family: "single_line_text_field",
  sweetness: "number_integer",
  cooling: "number_integer",
  throat_hit: "number_integer",
  top_note: "single_line_text_field",
  heart_note: "single_line_text_field",
  base_note: "single_line_text_field",
  nicotine_options: "list.single_line_text_field",
  badge: "single_line_text_field",
  subtitle: "single_line_text_field",
  short_description: "multi_line_text_field",
  rating: "number_decimal",
  review_count: "number_integer",
  flavors: "list.metaobject_reference",
};

export interface ProductMetafieldEntry {
  ownerId: string;
  namespace: string;
  key: string;
  type: string;
  value: string;
}

interface ProductByIdentifierResponse {
  productByIdentifier?: { id?: string } | null;
}

interface MetafieldsSetResponse {
  metafieldsSet?: {
    metafields?: { id: string }[];
    userErrors?: { message: string }[];
  };
}

interface MetafieldsDeleteResponse {
  metafieldsDelete?: {
    deletedMetafields?: { key: string; namespace: string }[];
    userErrors?: { message: string }[];
  };
}

interface ProductVariantsBulkUpdateResponse {
  productVariantsBulkUpdate?: {
    productVariants?: { id: string }[];
    userErrors?: { message: string }[];
  };
}

interface ProductOptionsCreateResponse {
  productOptionsCreate?: {
    product?: { id: string };
    userErrors?: { message: string }[];
  };
}

interface InventoryItemUpdateResponse {
  inventoryItemUpdate?: {
    inventoryItem?: { id: string };
    userErrors?: { message: string }[];
  };
}

interface ProductVariantsBulkCreateResponse {
  productVariantsBulkCreate?: {
    productVariants?: {
      id: string;
      selectedOptions?: { name: string; value: string }[];
    }[];
    userErrors?: { message: string }[];
  };
}

interface ProductCreateMediaResponse {
  productCreateMedia?: {
    media?: { id?: string }[];
    mediaUserErrors?: { message: string }[];
  };
}

interface FileUpdateResponse {
  fileUpdate?: {
    files?: { id: string }[];
    userErrors?: { message: string }[];
  };
}

interface ProductVariantMediaResponse {
  productVariantDetachMedia?: { userErrors?: { message: string }[] };
  productVariantAppendMedia?: { userErrors?: { message: string }[] };
}

interface ProductsQueryResponse {
  products?: {
    nodes?: {
      id: string;
      title: string;
      handle: string;
      status: string;
      featuredImage?: { url: string } | null;
      collections?: { nodes?: { id: string; title: string; handle: string }[] };
      variants?: {
        nodes?: {
          id: string;
          price?: string;
          compareAtPrice?: string | null;
          inventoryQuantity?: number | null;
          inventoryItem?: { id: string } | null;
        }[];
      };
    }[];
    pageInfo?: { hasNextPage?: boolean; endCursor?: string | null };
  };
}

interface ProductDetailQueryResponse {
  product?: {
    id: string;
    title: string;
    handle: string;
    descriptionHtml?: string | null;
    vendor?: string | null;
    productType?: string | null;
    tags?: string[];
    status: string;
    seo?: { title?: string | null; description?: string | null } | null;
    options?: { id: string; name: string; position?: number; values: string[] }[];
    variants?: {
      nodes?: {
        id: string;
        title: string;
        price?: string;
        compareAtPrice?: string | null;
        sku?: string | null;
        barcode?: string | null;
        inventoryQuantity?: number | null;
        taxable?: boolean;
        inventoryItem?: {
          id: string;
          unitCost?: { amount: string } | null;
          measurement?: { weight?: { value: number; unit: string } | null } | null;
          requiresShipping?: boolean;
          tracked?: boolean;
        } | null;
        selectedOptions?: { name: string; value: string }[];
        image?: { id?: string; url: string; altText?: string | null } | null;
        media?: { nodes?: { id: string; url?: string; image?: { url: string } | null }[] };
      }[];
    };
    images?: {
      nodes?: { id: string; url: string; altText?: string | null }[];
    };
    media?: {
      nodes?: { id: string; url?: string; image?: { url: string; altText?: string | null } | null; altText?: string | null }[];
    };
    collections?: { nodes?: { id: string; title: string; handle: string }[] };
    metafields?: { nodes?: { key: string; type: string; value: string | null }[] };
    relMf?: { nodes?: { key: string; value: string | null }[] };
  } | null;
}

interface PfFaqsResponse {
  faqs?: {
    nodes?: { id: string; fields?: { key: string; value: string | null }[] }[];
  };
}

interface PfReviewsResponse {
  reviews?: {
    nodes?: { id: string; fields?: { key: string; value: string | null }[] }[];
  };
}

interface ProductCreateResponse {
  productCreate?: {
    product?: { id: string; handle: string };
    userErrors?: { message: string }[];
  };
}

interface ProductUpdateResponse {
  productUpdate?: {
    product?: { id: string };
    userErrors?: { message: string }[];
  };
}

interface ProductDeleteResponse {
  productDelete?: {
    deletedProductId?: string;
    userErrors?: { message: string }[];
  };
}

export async function productIdByHandle(handle: string): Promise<string | null> {
  const d = await gql<ProductByIdentifierResponse>(
    `query ByHandle($identifier: ProductIdentifierInput!) {
       productByIdentifier(identifier: $identifier) { id }
     }`,
    { identifier: { handle } }
  );
  return d.productByIdentifier?.id || null;
}

export async function setProductMetafields(productId: string, entries: ProductMetafieldEntry[]): Promise<void> {
  if (!entries.length) return;
  const d = await gql<MetafieldsSetResponse>(
    `mutation MfSet($metafields: [MetafieldsSetInput!]!) {
       metafieldsSet(metafields: $metafields) { metafields { id } userErrors { message } }
     }`,
    { metafields: entries }
  );
  const errs = d.metafieldsSet?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
}

export async function deleteProductMetafields(
  productId: string,
  keys: string[],
  namespace = "vape"
): Promise<void> {
  if (!keys.length) return;
  const d = await gql<MetafieldsDeleteResponse>(
    `mutation MfDel($metafields: [MetafieldIdentifierInput!]!) {
       metafieldsDelete(metafields: $metafields) { deletedMetafields { key namespace } userErrors { message } }
     }`,
    { metafields: keys.map((key) => ({ ownerId: productId, namespace, key })) }
  );
  const errs = d.metafieldsDelete?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
}

export function vapeMetafieldEntries(productId: string, vape: Record<string, unknown>): ProductMetafieldEntry[] {
  const out: ProductMetafieldEntry[] = [];
  const put = (key: string, type: string, value: unknown) => {
    if (value === undefined || value === null || value === "") return;
    out.push({ ownerId: productId, namespace: "vape", key, type, value: String(value) });
  };
  put("badge", "single_line_text_field", vape.badge);
  put("subtitle", "single_line_text_field", vape.subtitle);
  put("short_description", "multi_line_text_field", vape.short_description);
  put("puffs", "number_integer", vape.puffs);
  put("puff_range", "single_line_text_field", vape.puff_range);
  put("nicotine_strength", "single_line_text_field", vape.nicotine_strength);
  put("battery_capacity", "single_line_text_field", vape.battery_capacity);
  put("coil_type", "single_line_text_field", vape.coil_type);
  put("charging_type", "single_line_text_field", vape.charging_type);
  put("e_liquid_capacity", "single_line_text_field", vape.e_liquid_capacity);
  put("activation", "single_line_text_field", vape.activation);
  put("vg_pg_ratio", "single_line_text_field", vape.vg_pg_ratio);
  put("flavor_family", "single_line_text_field", vape.flavor_family);
  put("sweetness", "number_integer", vape.sweetness);
  put("cooling", "number_integer", vape.cooling);
  put("throat_hit", "number_integer", vape.throat_hit);
  put("top_note", "single_line_text_field", vape.top_note);
  put("heart_note", "single_line_text_field", vape.heart_note);
  put("base_note", "single_line_text_field", vape.base_note);
  if (Array.isArray(vape.nicotine_options) && vape.nicotine_options.length)
    put("nicotine_options", "list.single_line_text_field", JSON.stringify(vape.nicotine_options));
  if (Array.isArray(vape.custom_specs))
    out.push({ ownerId: productId, namespace: "vape", key: "custom_specs", type: "json", value: JSON.stringify(vape.custom_specs) });
  if (Array.isArray(vape.flavors))
    out.push({ ownerId: productId, namespace: "vape", key: "flavors", type: "list.metaobject_reference", value: JSON.stringify(vape.flavors) });
  return out;
}

export async function setInventory(itemId: string, locationId: string, quantity: number): Promise<void> {
  const base = {
    name: "available",
    reason: "correction",
    quantities: [{ inventoryItemId: itemId, locationId, quantity }],
  };
  await gqlTry([
    {
      query: `mutation InvSet($input: InventorySetQuantitiesInput!) {
         inventorySetQuantities(input: $input) { inventoryAdjustmentGroup { id } userErrors { message } }
       }`,
      variables: { input: { ...base, ignoreCompareQuantity: true } },
    },
    {
      query: `mutation InvSet($input: InventorySetQuantitiesInput!) {
         inventorySetQuantities(input: $input) { inventoryAdjustmentGroup { id } userErrors { message } }
       }`,
      variables: { input: base },
    },
  ]);
}

export async function bulkUpdateVariants(productId: string, variants: Record<string, unknown>[]): Promise<void> {
  const clean = variants.map((v) => {
    const out: Record<string, unknown> = { id: String(v.id || "") };
    if (v.price !== undefined && v.price !== "") out.price = String(v.price);
    if (v.compareAtPrice !== undefined) out.compareAtPrice = validCompareAt(v.compareAtPrice);
    if (typeof v.sku === "string" && v.sku.trim()) out.inventoryItem = { sku: v.sku.trim() };
    if (typeof v.barcode === "string" && v.barcode.trim()) out.barcodes = [{ value: v.barcode.trim() }];
    if (typeof v.taxable === "boolean") out.taxable = v.taxable;
    return out;
  });
  const d = await gql<ProductVariantsBulkUpdateResponse>(
    `mutation VarBulk($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
       productVariantsBulkUpdate(productId: $productId, variants: $variants) { productVariants { id } userErrors { message } }
     }`,
    { productId, variants: clean }
  );
  const errs = d.productVariantsBulkUpdate?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
}

function comboToBulkInput(v: Record<string, unknown>, locationId: string | undefined): Record<string, unknown> {
  const out: Record<string, unknown> = { price: String(v.price || "0") };
  if (Array.isArray(v.optionValues) && v.optionValues.length) out.optionValues = v.optionValues;
  const cat = validCompareAt(v.compareAtPrice);
  if (cat) out.compareAtPrice = cat;
  const inv: Record<string, unknown> = {};
  if (v.sku) inv.sku = String(v.sku);
  const cost = parseFloat(String(v.cost ?? ""));
  if (Number.isFinite(cost) && cost >= 0) inv.cost = cost.toFixed(2);
  const w = parseFloat(String(v.weightKg ?? ""));
  if (Number.isFinite(w) && w > 0) inv.measurement = { weight: { unit: "KILOGRAMS", value: w } };
  if (typeof v.requiresShipping === "boolean") inv.requiresShipping = v.requiresShipping;
  if (typeof v.tracked === "boolean") inv.tracked = v.tracked;
  if (Object.keys(inv).length) out.inventoryItem = inv;
  if (v.barcode) out.barcodes = [{ value: String(v.barcode) }];
  if (typeof v.taxable === "boolean") out.taxable = v.taxable;
  if (locationId && v.inventoryQuantity !== undefined && v.inventoryQuantity !== "")
    out.inventoryQuantities = [{ availableQuantity: parseInt(String(v.inventoryQuantity), 10) || 0, locationId }];
  return out;
}

export async function createProductOptions(
  productId: string,
  options: { name: string; values: string[] }[]
): Promise<void> {
  const clean = (options || [])
    .filter((o) => o.name && Array.isArray(o.values) && o.values.length)
    .map((o) => ({ name: o.name, values: o.values.map((v: string) => ({ name: v })) }));
  if (!clean.length) return;
  const d = await gql<ProductOptionsCreateResponse>(
    `mutation OptCreate($productId: ID!, $options: [ProductOptionInput!]!) {
       productOptionsCreate(productId: $productId, options: $options) { product { id } userErrors { message } }
     }`,
    { productId, options: clean }
  );
  const errs = d.productOptionsCreate?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
}

export async function updateVariantInventory(
  items: {
    inventoryItemId: string;
    cost?: string | number;
    weightKg?: string | number;
    requiresShipping?: boolean;
    tracked?: boolean;
  }[]
): Promise<void> {
  for (const it of items || []) {
    if (!it.inventoryItemId) continue;
    const input: Record<string, unknown> = {};
    const cost = parseFloat(String(it.cost ?? ""));
    if (Number.isFinite(cost) && cost >= 0) input.cost = cost.toFixed(2);
    const w = parseFloat(String(it.weightKg ?? ""));
    if (Number.isFinite(w) && w > 0) input.measurement = { weight: { unit: "KILOGRAMS", value: w } };
    if (typeof it.requiresShipping === "boolean") input.requiresShipping = it.requiresShipping;
    if (typeof it.tracked === "boolean") input.tracked = it.tracked;
    if (!Object.keys(input).length) continue;
    const d = await gql<InventoryItemUpdateResponse>(
      `mutation InvItemUpdate($id: ID!, $input: InventoryItemInput!) {
         inventoryItemUpdate(id: $id, input: $input) { inventoryItem { id } userErrors { message } }
       }`,
      { id: it.inventoryItemId, input }
    );
    const errs = d.inventoryItemUpdate?.userErrors ?? [];
    if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
  }
}

export async function bulkCreateVariants(
  productId: string,
  variants: Record<string, unknown>[],
  locationId: string | undefined,
  removeStandalone: boolean
): Promise<{ id: string; selectedOptions: { name: string; value: string }[] }[]> {
  if (!variants.length) return [];
  const d = await gql<ProductVariantsBulkCreateResponse>(
    `mutation VarCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!, $strategy: ProductVariantsBulkCreateStrategy) {
       productVariantsBulkCreate(productId: $productId, variants: $variants, strategy: $strategy) {
         productVariants { id selectedOptions { name value } }
         userErrors { message }
       }
     }`,
    {
      productId,
      variants: variants.map((v) => comboToBulkInput(v, locationId)),
      strategy: removeStandalone ? "REMOVE_STANDALONE_VARIANT" : "DEFAULT",
    }
  );
  const errs = d.productVariantsBulkCreate?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
  return (d.productVariantsBulkCreate?.productVariants ?? []).map((v) => ({
    id: v.id,
    selectedOptions: (v.selectedOptions ?? []).map((s) => ({ name: s.name, value: s.value })),
  }));
}

export function resolveVariantMedia(
  entries: { variantId?: string; options?: string[]; mediaId?: string | null; mediaSource?: string }[],
  variants: { id: string; selectedOptions: { name: string; value: string }[] }[]
): { variantId: string; mediaId: string | null }[] {
  const out: { variantId: string; mediaId: string | null }[] = [];
  for (const e of entries || []) {
    if (e.variantId) {
      out.push({ variantId: e.variantId, mediaId: e.mediaId ?? null });
      continue;
    }
    const tuple = e.options || [];
    const match = variants.find((v) => {
      const sel = v.selectedOptions.map((s) => s.value);
      return sel.length === tuple.length && sel.every((val, i) => val === tuple[i]);
    });
    if (match) out.push({ variantId: match.id, mediaId: e.mediaId ?? null });
  }
  return out;
}

export async function addMedia(productId: string, sources: string[]): Promise<string[]> {
  const media = sources.filter(Boolean).map((originalSource) => ({ originalSource, mediaContentType: "IMAGE" }));
  if (!media.length) return [];
  const d = await gql<ProductCreateMediaResponse>(
    `mutation MediaAdd($productId: ID!, $media: [CreateMediaInput!]!) {
       productCreateMedia(productId: $productId, media: $media) { media { id } mediaUserErrors { message } }
     }`,
    { productId, media }
  );
  const errs = d.productCreateMedia?.mediaUserErrors ?? [];
  if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
  return (d.productCreateMedia?.media ?? []).map((m) => m.id || "").filter(Boolean);
}

export async function setMediaAlts(alts: { id: string; alt: string }[]): Promise<void> {
  const files = (alts || []).filter((a) => a.id && a.alt !== undefined && a.alt !== null);
  if (!files.length) return;
  const d = await gql<FileUpdateResponse>(
    `mutation AltSet($files: [FileUpdateInput!]!) {
       fileUpdate(files: $files) { files { id } userErrors { message } }
     }`,
    { files: files.map((f) => ({ id: f.id, alt: f.alt })) }
  );
  const errs = d.fileUpdate?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
}

export async function applyVariantMedia(
  productId: string,
  wanted: { variantId: string; mediaId: string | null }[],
  current: Record<string, string[]>
): Promise<void> {
  for (const w of wanted || []) {
    if (!w.variantId) continue;
    const cur = current[w.variantId] || [];
    const want = w.mediaId ? [w.mediaId] : [];
    if (cur.length === want.length && cur.every((m, i) => m === want[i])) continue;
    if (cur.length) {
      const d = await gql<ProductVariantMediaResponse>(
        `mutation VarMediaDetach($productId: ID!, $variantMedia: [ProductVariantDetachMediaInput!]!) {
           productVariantDetachMedia(productId: $productId, variantMedia: $variantMedia) { userErrors { message } }
         }`,
        { productId, variantMedia: [{ variantId: w.variantId, mediaIds: cur }] }
      );
      const errs = d.productVariantDetachMedia?.userErrors ?? [];
      if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
    }
    if (want.length) {
      const d = await gql<ProductVariantMediaResponse>(
        `mutation VarMediaAppend($productId: ID!, $variantMedia: [ProductVariantAppendMediaInput!]!) {
           productVariantAppendMedia(productId: $productId, variantMedia: $variantMedia) { userErrors { message } }
         }`,
        { productId, variantMedia: [{ variantId: w.variantId, mediaIds: want }] }
      );
      const errs = d.productVariantAppendMedia?.userErrors ?? [];
      if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
    }
  }
}

export async function saveProductFaqs(
  productId: string,
  wanted: { id?: string; question: string; answer: string; position: number }[],
  existing: { id: string }[]
): Promise<void> {
  const list = (wanted || []).filter((f) => (f.question || "").trim() !== "");
  const wantedIds = new Set(list.map((f) => f.id).filter(Boolean) as string[]);
  for (const ex of existing || []) {
    if (!wantedIds.has(ex.id)) await moDelete(ex.id);
  }
  const ids: string[] = [];
  for (let i = 0; i < list.length; i++) {
    const f = list[i];
    const fields: FieldObj = { product: productId, question: f.question.trim(), answer: f.answer || "", position: String(f.position ?? i) };
    if (f.id) {
      await moUpdate(f.id, fields);
      ids.push(f.id);
    } else {
      ids.push(await moCreate("vm_product_faq", fields));
    }
  }
  if (ids.length) {
    await setProductMetafields(productId, [
      { ownerId: productId, namespace: "vape", key: "product_faqs", type: "list.metaobject_reference", value: JSON.stringify(ids) },
    ]);
  } else {
    await deleteProductMetafields(productId, ["product_faqs"]);
  }
}

export async function saveProductReviews(
  productId: string,
  wanted: { id?: string; author: string; rating: number; title: string; body: string; verified: boolean; position: number }[],
  existing: { id: string }[]
): Promise<void> {
  const list = (wanted || []).filter((r) => (r.body || "").trim() !== "" || (r.title || "").trim() !== "");
  const wantedIds = new Set(list.map((r) => r.id).filter(Boolean) as string[]);
  for (const ex of existing || []) {
    if (!wantedIds.has(ex.id)) await moDelete(ex.id);
  }
  for (let i = 0; i < list.length; i++) {
    const r = list[i];
    const fields: FieldObj = {
      product: productId,
      author: r.author || "Customer",
      rating: String(r.rating || 5),
      title: r.title || "",
      body: r.body || "",
      verified: r.verified === false ? "false" : "true",
      position: String(r.position ?? i),
    };
    if (r.id) await moUpdate(r.id, fields);
    else await moCreate("vm_product_review", fields);
  }
}

export async function saveRelatedHandles(productId: string, handles: string[]): Promise<void> {
  const list = (handles || []).map((h) => String(h).trim()).filter(Boolean);
  if (!list.length) {
    await deleteProductMetafields(productId, [RELATED_KEY], RELATED_NAMESPACE);
    return;
  }
  const ids: string[] = [];
  for (const h of list) {
    const id = await productIdByHandle(h);
    if (!id) throw new Error(`Unknown related product "${h}".`);
    ids.push(id);
  }
  await setProductMetafields(productId, [
    { ownerId: productId, namespace: RELATED_NAMESPACE, key: RELATED_KEY, type: "list.product_reference", value: JSON.stringify(ids) },
  ]);
}

export async function getAdminProducts(opts: {
  query?: string;
  status?: string;
  limit?: number;
  cursor?: string | null;
} = {}): Promise<{ products: AdminProduct[]; pageInfo: PageInfo }> {
  const limit = Math.min(Math.max(opts.limit || 50, 1), 250);
  const parts: string[] = [];
  if (opts.status === "ACTIVE" || opts.status === "DRAFT" || opts.status === "ARCHIVED") {
    parts.push(`status:${opts.status}`);
  }
  if (opts.query && opts.query.trim()) {
    parts.push(opts.query.trim().replace(/["\\]/g, ""));
  }
  const queryStr = parts.length ? parts.join(" ") : undefined;

  const d = await gql<ProductsQueryResponse>(
    `query AdminProducts($first: Int!, $after: String, $query: String) {
       products(first: $first, after: $after, query: $query) {
         nodes {
           id title handle status
           featuredImage { url }
           collections(first: 20) { nodes { id title handle } }
           variants(first: 1) { nodes { id price compareAtPrice inventoryQuantity inventoryItem { id } } }
         }
         pageInfo { hasNextPage endCursor }
       }
     }`,
    { first: limit, after: opts.cursor || null, query: queryStr }
  );

  const products: AdminProduct[] = (d.products?.nodes ?? []).map((p) => {
    const v = p.variants?.nodes?.[0];
    return {
      id: p.id,
      title: p.title,
      handle: p.handle,
      status: p.status,
      image: p.featuredImage?.url || "",
      collections: (p.collections?.nodes ?? []).map((c) => ({
        id: c.id,
        title: c.title,
        handle: c.handle,
      })),
      variantId: v?.id || "",
      price: v?.price || "",
      compareAtPrice: parseFloat(String(v?.compareAtPrice || "0")) > 0 ? (v?.compareAtPrice || "") : "",
      inventoryQuantity: typeof v?.inventoryQuantity === "number" ? v.inventoryQuantity : 0,
      inventoryItemId: v?.inventoryItem?.id || "",
    };
  });

  const pageInfo: PageInfo = {
    hasNextPage: !!d.products?.pageInfo?.hasNextPage,
    endCursor: d.products?.pageInfo?.endCursor || null,
  };

  return { products, pageInfo };
}

export async function listAllPanelProducts(): Promise<AdminProduct[]> {
  const out: AdminProduct[] = [];
  let after: string | null = null;
  for (let page = 0; page < 20; page++) {
    const res = await getAdminProducts({ limit: 100, cursor: after });
    out.push(...res.products);
    if (!res.pageInfo.hasNextPage) break;
    after = res.pageInfo.endCursor;
  }
  return out;
}

export async function getAdminProductDetail(id: string): Promise<AdminProductDetail> {
  const d = await gql<ProductDetailQueryResponse>(
    `query ProductDetail($id: ID!) {
       product(id: $id) {
         id title handle descriptionHtml vendor productType tags status
         seo { title description }
         options { id name position values }
         variants(first: 50) {
           nodes {
             id title price compareAtPrice sku barcode inventoryQuantity taxable
             inventoryItem { id unitCost { amount } measurement { weight { value unit } } requiresShipping tracked }
             selectedOptions { name value }
             media(first: 5) { nodes { ... on MediaImage { id image { url } } } }
           }
         }
         media(first: 30) {
           nodes { ... on MediaImage { id image { url altText } } }
         }
         collections(first: 30) { nodes { id title handle } }
         metafields(first: 50, namespace: "vape") { nodes { key type value } }
         relMf: metafields(first: 10, namespace: "${RELATED_NAMESPACE}") { nodes { key value } }
       }
     }`,
    { id }
  );
  const p = d.product;
  if (!p) throw new Error("Product not found.");
  const mf: Record<string, string> = {
    badge: "",
    subtitle: "",
    short_description: "",
    puffs: "",
    puff_range: "",
    nicotine_strength: "",
    battery_capacity: "",
    coil_type: "",
    charging_type: "",
    e_liquid_capacity: "",
    activation: "",
    vg_pg_ratio: "",
    flavor_family: "",
    sweetness: "",
    cooling: "",
    throat_hit: "",
    top_note: "",
    heart_note: "",
    base_note: "",
  };
  for (const m of p.metafields?.nodes ?? []) if (m.value != null) mf[m.key] = m.value;

  const faqIds: string[] = (() => {
    try {
      const v = JSON.parse(mf["product_faqs"] || "[]");
      return Array.isArray(v) ? v.map(String) : [];
    } catch {
      return [];
    }
  })();
  const relIds: string[] = (() => {
    const rel = (p.relMf?.nodes ?? []).find((m) => m.key === RELATED_KEY);
    try {
      const v = JSON.parse(rel?.value || "[]");
      return Array.isArray(v) ? v.map(String) : [];
    } catch {
      return [];
    }
  })();
  const [faqNodes, reviewNodes, relInfo] = await Promise.all([
    gql<PfFaqsResponse>(`query PfFaqs { faqs: metaobjects(type: "vm_product_faq", first: 100) { nodes { id fields { key value } } } }`, {}),
    gql<PfReviewsResponse>(`query PfReviews { reviews: metaobjects(type: "vm_product_review", first: 100) { nodes { id fields { key value } } } }`, {}),
    infoByIds(relIds),
  ]);
  const fieldsOf = (n: { fields?: { key: string; value: string | null }[] }) => {
    const f: Record<string, string> = {};
    for (const fld of n.fields ?? []) if (fld.value != null) f[fld.key] = fld.value;
    return f;
  };
  const faqs = (faqNodes.faqs?.nodes ?? [])
    .filter((n) => faqIds.includes(n.id))
    .map((n) => {
      const f = fieldsOf(n);
      return { id: n.id, question: f.question || "", answer: f.answer || "", position: parseInt(f.position || "0", 10) || 0 };
    })
    .sort((a, b) => a.position - b.position);
  const reviews = (reviewNodes.reviews?.nodes ?? [])
    .map((n) => ({ id: n.id, f: fieldsOf(n) }))
    .filter((x) => x.f.product === id)
    .map((x) => ({
      id: x.id,
      author: x.f.author || "",
      rating: parseInt(x.f.rating || "5", 10) || 5,
      title: x.f.title || "",
      body: x.f.body || "",
      verified: x.f.verified !== "false",
      position: parseInt(x.f.position || "0", 10) || 0,
    }))
    .sort((a, b) => a.position - b.position);
  const related = relIds
    .map((rid: string) => relInfo[rid])
    .filter(Boolean)
    .map((r) => ({ handle: r.handle, title: r.title }));

  return {
    id: p.id,
    title: p.title,
    handle: p.handle,
    descriptionHtml: p.descriptionHtml || "",
    seoTitle: p.seo?.title || "",
    seoDescription: p.seo?.description || "",
    vendor: p.vendor || "",
    productType: p.productType || "",
    tags: (p.tags ?? []).join(", "),
    status: p.status,
    options: (p.options ?? []).map((o) => ({ id: o.id, name: o.name, values: o.values ?? [] })),
    variants: (p.variants?.nodes ?? []).map((v): AdminProductVariant => {
      const w = v.inventoryItem?.measurement?.weight;
      let weightKg = "";
      if (w && typeof w.value === "number") {
        const unit = String(w.unit || "KILOGRAMS").toUpperCase();
        const kg = unit === "GRAMS" ? w.value / 1000 : unit === "OUNCES" ? w.value * 0.0283495 : unit === "POUNDS" ? w.value * 0.453592 : w.value;
        weightKg = String(Math.round(kg * 1000) / 1000);
      }
      return {
        id: v.id,
        title: v.title,
        price: v.price || "",
        compareAtPrice: parseFloat(String(v.compareAtPrice || "0")) > 0 ? (v.compareAtPrice || "") : "",
        sku: v.sku || "",
        barcode: v.barcode || "",
        inventoryQuantity: typeof v.inventoryQuantity === "number" ? v.inventoryQuantity : 0,
        inventoryItemId: v.inventoryItem?.id || "",
        cost: v.inventoryItem?.unitCost?.amount || "",
        weightKg,
        requiresShipping: v.inventoryItem?.requiresShipping !== false,
        tracked: v.inventoryItem?.tracked !== false,
        taxable: v.taxable !== false,
        selectedOptions: (v.selectedOptions ?? []).map((s) => ({ name: s.name, value: s.value })),
        media: [
          ...(v.media?.nodes ?? [])
            .filter((m) => m.image?.url || m.url)
            .map((m) => ({ id: m.id, url: m.image?.url || m.url || "" })),
          ...(v.image?.url ? [{ id: v.image.id || "", url: v.image.url }] : []),
        ],
      };
    }),
    media: [
      ...(p.media?.nodes ?? [])
        .filter((m) => m.image?.url || m.url)
        .map((m) => ({ id: m.id, url: m.image?.url || m.url || "", altText: m.image?.altText || m.altText || "" })),
      ...(p.images?.nodes ?? [])
        .filter((im) => im.url)
        .map((im) => ({ id: im.id, url: im.url, altText: im.altText || "" })),
    ],
    collections: (p.collections?.nodes ?? []).map((c) => c.id),
    vape: mf,
    faqs,
    reviews,
    related,
  };
}

export async function createAdminProduct(p: CreateProductInput): Promise<SaveResult> {
  const baseInput: Record<string, unknown> = {
    title: p.title,
    descriptionHtml: p.descriptionHtml || "",
    vendor: p.vendor || "",
    productType: p.productType || "",
    tags: String(p.tags || "").split(",").map((x: string) => x.trim()).filter(Boolean),
    status: p.status || "DRAFT",
  };
  if (p.seoTitle !== undefined || p.seoDescription !== undefined)
    baseInput.seo = { title: p.seoTitle || "", description: p.seoDescription || "" };
  if (p.handle && slugify(p.handle)) baseInput.handle = slugify(p.handle);
  const first: Record<string, unknown> = { price: String(p.price || "0") };
  const cat = validCompareAt(p.compareAtPrice);
  if (cat) first.compareAtPrice = cat;
  if (p.sku) first.sku = String(p.sku);
  if (p.barcode) first.barcode = String(p.barcode);
  if (p.locationId && p.inventoryQuantity !== undefined && p.inventoryQuantity !== "")
    first.inventoryQuantities = [{ availableQuantity: parseInt(String(p.inventoryQuantity), 10) || 0, locationId: p.locationId }];

  const d = await gql<ProductCreateResponse>(
    `mutation ProductCreate($input: ProductInput!) {
       productCreate(input: $input) { product { id handle } userErrors { message } }
     }`,
    { input: baseInput }
  );
  const errs = d.productCreate?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
  const id = d.productCreate?.product?.id || "";
  if (!id) throw new Error("Shopify did not return a product ID.");

  let createdVariants: { id: string; selectedOptions: { name: string; value: string }[] }[] = [];
  if (Array.isArray(p.options) && p.options.length) await createProductOptions(id, p.options);
  if (Array.isArray(p.variants) && p.variants.length) {
    createdVariants = await bulkCreateVariants(id, p.variants, p.locationId, true);
  } else {
    const detail = await getAdminProductDetail(id);
    const dv = detail.variants[0];
    if (dv) {
      createdVariants = [{ id: dv.id, selectedOptions: (dv.selectedOptions || []).map((s) => ({ name: s.name, value: s.value })) }];
      await bulkUpdateVariants(id, [{ id: dv.id, price: first.price, compareAtPrice: first.compareAtPrice, sku: p.sku, barcode: p.barcode, taxable: p.taxable }]);
      if (p.locationId && p.inventoryQuantity !== undefined && p.inventoryQuantity !== "" && dv.inventoryItemId)
        await setInventory(dv.inventoryItemId, p.locationId, parseInt(String(p.inventoryQuantity), 10) || 0);
      if (dv.inventoryItemId)
        await updateVariantInventory([{ inventoryItemId: dv.inventoryItemId, cost: p.cost, weightKg: p.weightKg, requiresShipping: p.requiresShipping, tracked: p.tracked }]);
    }
  }
  let newMediaIds: string[] = [];
  if (Array.isArray(p.mediaSources) && p.mediaSources.length) newMediaIds = await addMedia(id, p.mediaSources);
  if (Array.isArray(p.collectionIds) && p.collectionIds.length) {
    await gql<ProductUpdateResponse>(
      `mutation ProdColl($product: ProductUpdateInput!) {
         productUpdate(product: $product) { product { id } userErrors { message } }
       }`,
      { product: { id, collectionsToJoin: p.collectionIds } }
    );
  }
  if (p.vape) await setProductMetafields(id, vapeMetafieldEntries(id, p.vape));
  const newAlts = newMediaIds.map((mid, i) => ({ id: mid, alt: (p.mediaAlts || [])[i] || "" })).filter((a) => a.alt !== "");
  if (newAlts.length || (p.mediaAltUpdates || []).length)
    await setMediaAlts([...newAlts, ...(p.mediaAltUpdates || [])]);
  if (Array.isArray(p.variantMedia) && p.variantMedia.length) {
    const translated = p.variantMedia.map((e) => {
      if (e.mediaSource) {
        const idx = (p.mediaSources || []).indexOf(e.mediaSource);
        if (idx >= 0 && newMediaIds[idx]) return { ...e, mediaId: newMediaIds[idx] };
      }
      return e;
    });
    await applyVariantMedia(id, resolveVariantMedia(translated, createdVariants), {});
  }
  if (Array.isArray(p.faqs)) await saveProductFaqs(id, p.faqs, []);
  if (Array.isArray(p.reviews)) await saveProductReviews(id, p.reviews, []);
  if (Array.isArray(p.relatedHandles)) await saveRelatedHandles(id, p.relatedHandles);
  return { message: "Product created.", id };
}

export async function updateAdminProduct(p: UpdateProductInput): Promise<SaveResult> {
  const input: Record<string, unknown> = {
    title: p.title,
    descriptionHtml: p.descriptionHtml || "",
    vendor: p.vendor || "",
    productType: p.productType || "",
    tags: String(p.tags || "").split(",").map((x: string) => x.trim()).filter(Boolean),
    status: p.status || "DRAFT",
  };
  if (p.handle) input.handle = p.handle;
  if (p.seoTitle !== undefined || p.seoDescription !== undefined)
    input.seo = { title: p.seoTitle || "", description: p.seoDescription || "" };
  const coll = await getAdminProductDetail(p.id);
  let createdVariants: { id: string; selectedOptions: { name: string; value: string }[] }[] = [];
  const join = (p.collectionIds || []).filter((x: string) => !coll.collections.includes(x));
  const leave = coll.collections.filter((x: string) => !(p.collectionIds || []).includes(x));
  if (join.length) input.collectionsToJoin = join;
  if (leave.length) input.collectionsToLeave = leave;
  const d = await gql<ProductUpdateResponse>(
    `mutation ProdUpdate($product: ProductUpdateInput!) {
       productUpdate(product: $product) { product { id } userErrors { message } }
     }`,
    { product: { ...input, id: p.id } }
  );
  const errs = d.productUpdate?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));

  if (Array.isArray(p.variantUpdates) && p.variantUpdates.length) {
    await bulkUpdateVariants(p.id, p.variantUpdates);
  }
  if (Array.isArray(p.newVariants) && p.newVariants.length) {
    const existingNames = new Set((coll.options || []).map((o) => o.name));
    const wanted = new Map<string, string[]>();
    for (const v of p.newVariants) {
      const optionValues = Array.isArray(v.optionValues) ? (v.optionValues as { optionName: string; name: string }[]) : [];
      for (const ov of optionValues) {
        if (!wanted.has(ov.optionName)) wanted.set(ov.optionName, []);
        if (!wanted.get(ov.optionName)!.includes(ov.name)) wanted.get(ov.optionName)!.push(ov.name);
      }
    }
    const missing = [...wanted.entries()]
      .filter(([name]) => !existingNames.has(name))
      .map(([name, values]) => ({ name, values }));
    if (missing.length) await createProductOptions(p.id, missing);
    createdVariants = await bulkCreateVariants(p.id, p.newVariants, p.locationId, false);
  }
  if (Array.isArray(p.deleteVariantIds) && p.deleteVariantIds.length) {
    for (const vid of p.deleteVariantIds) {
      await gql<Record<string, unknown>>(
        `mutation VarDelete($id: ID!) { productVariantDelete(id: $id) { deletedProductVariantId userErrors { message } } }`,
        { id: vid }
      );
    }
  }
  if (Array.isArray(p.deleteMediaIds) && p.deleteMediaIds.length) {
    const d4 = await gql<{ productDeleteMedia?: { userErrors?: { message: string }[] } }>(
      `mutation MediaDel($productId: ID!, $mediaIds: [ID!]!) {
         productDeleteMedia(productId: $productId, mediaIds: $mediaIds) { deletedMediaIds mediaUserErrors { message } }
       }`,
      { productId: p.id, mediaIds: p.deleteMediaIds }
    );
    const errs4 = d4.productDeleteMedia?.userErrors ?? [];
    if (errs4.length) throw new Error(errs4.map((e) => e.message).join("; "));
  }
  let newMediaIds: string[] = [];
  if (Array.isArray(p.mediaSources) && p.mediaSources.length) newMediaIds = await addMedia(p.id, p.mediaSources);
  if (Array.isArray(p.inventoryUpdates) && p.inventoryUpdates.length) {
    if (p.locationId) {
      for (const u of p.inventoryUpdates) {
        if (!u.inventoryItemId) continue;
        await setInventory(u.inventoryItemId, p.locationId, parseInt(String(u.quantity), 10) || 0);
      }
    }
    await updateVariantInventory(p.inventoryUpdates);
  }
  if (Array.isArray(p.vapeDeleteKeys) && p.vapeDeleteKeys.length)
    await deleteProductMetafields(p.id, p.vapeDeleteKeys);
  if (p.vape) await setProductMetafields(p.id, vapeMetafieldEntries(p.id, p.vape));
  const newAlts = newMediaIds.map((mid, i) => ({ id: mid, alt: (p.mediaAlts || [])[i] || "" })).filter((a) => a.alt !== "");
  if (newAlts.length || (p.mediaAltUpdates || []).length)
    await setMediaAlts([...newAlts, ...(p.mediaAltUpdates || [])]);
  if (Array.isArray(p.variantMedia) && p.variantMedia.length) {
    const allVariants = [
      ...(coll.variants || []).map((v) => ({ id: v.id, selectedOptions: v.selectedOptions || [] })),
      ...createdVariants,
    ];
    const current: Record<string, string[]> = {};
    for (const v of coll.variants || []) current[v.id] = (v.media || []).map((m) => m.id);
    const translated = p.variantMedia.map((e) => {
      if (e.mediaSource) {
        const idx = (p.mediaSources || []).indexOf(e.mediaSource);
        if (idx >= 0 && newMediaIds[idx]) return { ...e, mediaId: newMediaIds[idx] };
      }
      return e;
    });
    await applyVariantMedia(p.id, resolveVariantMedia(translated, allVariants), current);
  }
  if (Array.isArray(p.faqs)) await saveProductFaqs(p.id, p.faqs, coll.faqs || []);
  if (Array.isArray(p.reviews)) await saveProductReviews(p.id, p.reviews, coll.reviews || []);
  if (Array.isArray(p.relatedHandles)) await saveRelatedHandles(p.id, p.relatedHandles);
  return { message: "Product updated.", id: p.id };
}

export async function deleteAdminProduct(id: string): Promise<SaveResult> {
  const d = await gqlTry<ProductDeleteResponse>([
    {
      query: `mutation ProdDelete($id: ID!) { productDelete(id: $id) { deletedProductId userErrors { message } } }`,
      variables: { id },
    },
    {
      query: `mutation ProdDelete($input: ProductDeleteInput!) { productDelete(input: $input) { deletedProductId userErrors { message } } }`,
      variables: { input: { id } },
    },
  ]);
  const errs = d.productDelete?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
  return { message: "Product deleted.", id };
}

// Aliases matching legacy names for seamless backward-compatibility
export const getProductDetail = getAdminProductDetail;
export const createProduct = createAdminProduct;
export const updateProduct = updateAdminProduct;
export const deleteProduct = deleteAdminProduct;
