import "server-only";
import { shopifyAdminMutation as gql } from "@/lib/shopify";
import { BLOG_ID, fileFromUrl, parseList, slugify } from "./common";
import type {
  AdminBlogPost,
  AdminDiscount,
  AdminFile,
  AdminMenu,
  AdminMenuItem,
  AdminPage,
  PageInfo,
  SaveResult,
} from "./types";

/* ------------------------------------------------------------------ */
/*  GraphQL Response Types                                            */
/* ------------------------------------------------------------------ */

interface BlogArticlesQueryResponse {
  blog?: {
    articles?: {
      nodes?: {
        id: string;
        handle: string;
        title: string;
        bodyHtml?: string | null;
        summary?: string | null;
        tags?: string[];
        publishedAt?: string | null;
        isPublished?: boolean;
        author?: { name?: string | null } | null;
        metafields?: { nodes?: { key: string; value: string | null }[] };
      }[];
      pageInfo?: { hasNextPage?: boolean; endCursor?: string | null };
    };
  };
}

interface ArticleMutationResponse {
  articleCreate?: { article?: { id: string }; userErrors?: { message: string }[] };
  articleUpdate?: { article?: { id: string }; userErrors?: { message: string }[] };
  articleDelete?: { deletedArticleId?: string; userErrors?: { message: string }[] };
}

interface MetafieldsSetResponse {
  metafieldsSet?: { userErrors?: { message: string }[] };
}

interface PagesQueryResponse {
  pages?: {
    nodes?: { id: string; handle: string; title: string; body?: string | null }[];
  };
}

interface PageUpdateResponse {
  pageUpdate?: { page?: { id: string }; userErrors?: { message: string }[] };
}

interface MenusQueryResponse {
  menus?: {
    nodes?: { id: string; handle: string; title: string }[];
  };
}

interface RawMenuItem {
  id?: string;
  title?: string | null;
  url?: string | null;
  type?: string | null;
  resourceId?: string | null;
  items?: RawMenuItem[];
}

interface MenuDetailQueryResponse {
  menu?: {
    id: string;
    title: string;
    handle: string;
    items?: RawMenuItem[];
  } | null;
}

interface MenuUpdateResponse {
  menuUpdate?: { menu?: { id: string }; userErrors?: { message: string }[] };
}

interface DiscountsQueryResponse {
  discountNodes?: {
    nodes?: {
      id: string;
      discount?: {
        title?: string;
        status?: string;
        codes?: { nodes?: { code?: string }[] };
      } | null;
    }[];
  };
}

interface DiscountCreateResponse {
  discountCodeBasicCreate?: {
    codeDiscountNode?: { id: string };
    userErrors?: { message: string }[];
  };
}

interface DiscountDeleteResponse {
  discountCodeDelete?: {
    deletedCodeDiscountId?: string;
    userErrors?: { message: string }[];
  };
}

interface FilesQueryResponse {
  files?: {
    nodes?: { id: string; image?: { url?: string | null } | null }[];
  };
}

interface FileDeleteResponse {
  fileDelete?: {
    deletedFileIds?: string[];
    userErrors?: { message: string }[];
  };
}

interface FileUrlQueryResponse {
  node?: {
    fileStatus?: string;
    image?: { url?: string | null } | null;
  } | null;
}

/* ------------------------------------------------------------------ */
/*  Blog Articles                                                      */
/* ------------------------------------------------------------------ */

export async function getAdminBlogArticles(opts: {
  limit?: number;
  after?: string | null;
} = {}): Promise<{ articles: AdminBlogPost[]; pageInfo: PageInfo }> {
  const limit = Math.min(Math.max(opts.limit || 50, 1), 250);
  const d = await gql<BlogArticlesQueryResponse>(
    `query PanelBlog($id: ID!, $first: Int!, $after: String) {
       blog(id: $id) {
         articles(first: $first, after: $after) {
           nodes {
             id handle title bodyHtml summary tags publishedAt isPublished
             author { name }
             metafields(first: 20) { nodes { key value } }
           }
           pageInfo { hasNextPage endCursor }
         }
       }
     }`,
    { id: BLOG_ID, first: limit, after: opts.after || null }
  );

  const articles: AdminBlogPost[] = (d.blog?.articles?.nodes ?? []).map((a) => {
    const mf: Record<string, string> = {};
    for (const m of a.metafields?.nodes ?? []) if (m.value != null) mf[m.key] = m.value;
    return {
      id: a.id,
      handle: a.handle,
      title: a.title,
      body: a.bodyHtml || "",
      summary: a.summary || "",
      tags: (a.tags ?? []).join(", "),
      category: mf.category || "",
      quickAnswer: mf.quick_answer || "",
      productSlugs: parseList(mf.product_slugs).join(", "),
      publishedAt: a.publishedAt || "",
      isPublished: a.isPublished !== false,
      author: a.author?.name || "",
    };
  });

  const pageInfo: PageInfo = {
    hasNextPage: !!d.blog?.articles?.pageInfo?.hasNextPage,
    endCursor: d.blog?.articles?.pageInfo?.endCursor || null,
  };

  return { articles, pageInfo };
}

async function blogMetafields(
  articleId: string,
  p: { category?: string; quickAnswer?: string; productSlugs?: string | string[] }
): Promise<void> {
  const entries: { ownerId: string; namespace: string; key: string; type: string; value: string }[] = [];
  const put = (key: string, type: string, value: unknown) => {
    if (value === undefined || value === null) return;
    entries.push({ ownerId: articleId, namespace: "blog", key, type, value: String(value) });
  };
  if (p.category !== undefined) put("category", "single_line_text_field", p.category);
  if (p.quickAnswer !== undefined) put("quick_answer", "multi_line_text_field", p.quickAnswer);
  if (p.productSlugs !== undefined) {
    const list = Array.isArray(p.productSlugs)
      ? p.productSlugs
      : String(p.productSlugs || "").split(",").map((x: string) => x.trim()).filter(Boolean);
    put("product_slugs", "list.single_line_text_field", JSON.stringify(list));
  }
  if (!entries.length) return;
  const d = await gql<MetafieldsSetResponse>(
    `mutation BlogMf($metafields: [MetafieldsSetInput!]!) {
       metafieldsSet(metafields: $metafields) { userErrors { message } }
     }`,
    { metafields: entries }
  );
  const errs = d.metafieldsSet?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
}

export async function saveAdminBlogArticle(p: {
  id?: string;
  title: string;
  handle?: string;
  body?: string;
  summary?: string;
  tags?: string | string[];
  author?: string;
  isPublished?: boolean;
  publishDate?: string;
  imageUrl?: string;
  category?: string;
  quickAnswer?: string;
  productSlugs?: string | string[];
}): Promise<SaveResult> {
  const article: Record<string, unknown> = {
    title: p.title,
    body: p.body || "",
    summary: p.summary || "",
    tags: Array.isArray(p.tags) ? p.tags : String(p.tags || "").split(",").map((x) => x.trim()).filter(Boolean),
    author: { name: String(p.author || "Vape Mart Team").trim() || "Vape Mart Team" },
    isPublished: p.isPublished !== false,
  };
  if (p.handle && slugify(p.handle)) article.handle = slugify(p.handle);
  if (p.publishDate) article.publishDate = p.publishDate;
  let id: string | undefined = p.id;

  const trySave = async (withImage: boolean) => {
    const input: Record<string, unknown> = { ...article };
    if (withImage && p.imageUrl) input.image = { url: p.imageUrl, altText: p.title };
    if (id) {
      const d = await gql<ArticleMutationResponse>(
        `mutation ArticleUpdate($id: ID!, $article: ArticleUpdateInput!) {
           articleUpdate(id: $id, article: $article) { article { id } userErrors { message } }
         }`,
        { id, article: input }
      );
      const errs = d.articleUpdate?.userErrors ?? [];
      if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
    } else {
      const d = await gql<ArticleMutationResponse>(
        `mutation ArticleCreate($article: ArticleCreateInput!) {
           articleCreate(article: $article) { article { id } userErrors { message } }
         }`,
        { article: { ...input, blogId: BLOG_ID } }
      );
      const errs = d.articleCreate?.userErrors ?? [];
      if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
      id = d.articleCreate?.article?.id;
    }
  };

  let warning = "";
  try {
    await trySave(true);
  } catch (e) {
    if (p.imageUrl) {
      await trySave(false);
      warning = " Post saved, but the image URL was rejected — check the image link.";
    } else throw e;
  }
  if (id) await blogMetafields(id, p);
  const published = article.isPublished !== false;
  return {
    message: (id && p.id ? "Blog post updated." : published ? "Blog post published." : "Blog post saved as draft.") + warning,
    id,
  };
}

export async function deleteAdminBlogArticle(id: string): Promise<SaveResult> {
  const d = await gql<ArticleMutationResponse>(
    `mutation ArticleDelete($id: ID!) { articleDelete(id: $id) { deletedArticleId userErrors { message } } }`,
    { id }
  );
  const errs = d.articleDelete?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
  return { message: "Blog post deleted.", id };
}

/* ------------------------------------------------------------------ */
/*  Pages                                                             */
/* ------------------------------------------------------------------ */

export async function getAdminPages(): Promise<AdminPage[]> {
  const d = await gql<PagesQueryResponse>(
    `query PanelPages {
       pages(first: 50) {
         nodes { id handle title body }
       }
     }`
  );
  return (d.pages?.nodes ?? [])
    .filter((p) => ["about", "contact", "privacy-policy", "terms-conditions"].includes(p.handle))
    .map((p) => ({
      id: p.id,
      handle: p.handle,
      title: p.title,
      body: p.body || "",
    }));
}

export async function saveAdminPage(id: string, p: { title?: string; body?: string }): Promise<SaveResult> {
  const d = await gql<PageUpdateResponse>(
    `mutation PageSave($id: ID!, $page: PageUpdateInput!) {
       pageUpdate(id: $id, page: $page) { page { id } userErrors { message } }
     }`,
    { id, page: { body: p.body || "", title: p.title || undefined } }
  );
  const errs = d.pageUpdate?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
  return { message: "Page saved.", id };
}

/* ------------------------------------------------------------------ */
/*  Navigation Menus                                                   */
/* ------------------------------------------------------------------ */

export async function getAdminMenu(handle = "vape-mart-main-menu"): Promise<AdminMenu | null> {
  const d = await gql<MenusQueryResponse>(
    `query PanelMenu {
       menus(first: 10) {
         nodes { id handle title }
       }
     }`
  );
  const node = (d.menus?.nodes ?? []).find((m) => m.handle === handle);
  if (!node) return null;

  const md = await gql<MenuDetailQueryResponse>(
    `query MenuItems($id: ID!) {
       menu(id: $id) {
         id title handle
         items {
           id title url type resourceId
           items { id title url type resourceId items { id title url type resourceId } }
         }
       }
     }`,
    { id: node.id }
  );

  if (!md.menu) return null;
  const mapItem = (it: RawMenuItem): AdminMenuItem => ({
    id: it.id,
    title: it.title || "",
    url: it.url || "",
    type: it.type || "HTTP",
    resourceId: it.resourceId || "",
    children: (it.items ?? []).map(mapItem),
  });

  return {
    id: md.menu.id,
    title: md.menu.title,
    handle: md.menu.handle,
    items: (md.menu.items ?? []).map(mapItem),
  };
}

export async function saveAdminMenu(p: { id: string; title: string; handle: string; items: AdminMenuItem[] }): Promise<SaveResult> {
  const MENU_ITEM_TYPES = new Set([
    "ARTICLE", "BLOG", "CATALOG", "COLLECTION", "COLLECTIONS",
    "CUSTOMER_ACCOUNT_PAGE", "FRONTPAGE", "HTTP", "METAOBJECT",
    "PAGE", "PRODUCT", "SEARCH", "SHOP_POLICY",
  ]);
  const RESOURCE_TYPES = new Set(["ARTICLE", "BLOG", "COLLECTION", "METAOBJECT", "PAGE", "PRODUCT"]);

  const mapItems = (items: AdminMenuItem[]): Record<string, unknown>[] =>
    (items ?? []).map((it) => {
      const rawType = String(it.type || "").toUpperCase();
      const isResource = RESOURCE_TYPES.has(rawType) && !!it.resourceId;
      const type = isResource
        ? rawType
        : MENU_ITEM_TYPES.has(rawType) && !RESOURCE_TYPES.has(rawType)
          ? rawType
          : "HTTP";
      return {
        ...(it.id ? { id: it.id } : {}),
        title: String(it.title || ""),
        type,
        url: String(it.url || "/"),
        ...(isResource ? { resourceId: it.resourceId } : {}),
        items: mapItems(it.children ?? []),
      };
    });

  const d = await gql<MenuUpdateResponse>(
    `mutation MenuSave($id: ID!, $title: String!, $handle: String!, $items: [MenuItemUpdateInput!]!) {
       menuUpdate(id: $id, title: $title, handle: $handle, items: $items) {
         menu { id }
         userErrors { message }
       }
     }`,
    { id: p.id, title: p.title, handle: p.handle, items: mapItems(p.items) }
  );
  const errs = d.menuUpdate?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
  return { message: "Menu saved.", id: p.id };
}

/* ------------------------------------------------------------------ */
/*  Discounts                                                          */
/* ------------------------------------------------------------------ */

export async function getAdminDiscounts(): Promise<AdminDiscount[]> {
  const d = await gql<DiscountsQueryResponse>(
    `query PanelDiscounts {
       discountNodes(first: 50) {
         nodes {
           id
           discount {
             ... on DiscountCodeBasic { title status codes(first: 1) { nodes { code } } }
             ... on DiscountCodeBxgy { title status codes(first: 1) { nodes { code } } }
             ... on DiscountCodeFreeShipping { title status codes(first: 1) { nodes { code } } }
             ... on DiscountAutomaticBasic { title status }
             ... on DiscountAutomaticBxgy { title status }
             ... on DiscountAutomaticFreeShipping { title status }
           }
         }
       }
     }`
  );

  return (d.discountNodes?.nodes ?? []).map((n) => ({
    id: n.id,
    title: n.discount?.title || "",
    code: n.discount?.codes?.nodes?.[0]?.code || (n.discount ? "Automatic" : ""),
    status: n.discount?.status || "",
  }));
}

export async function saveAdminDiscount(p: {
  title: string;
  code: string;
  value: number | string;
  type?: string;
  startsAt?: string;
  endsAt?: string;
  usageLimit?: number | string;
  minSubtotal?: number | string;
  oncePerCustomer?: boolean;
}): Promise<SaveResult> {
  const title = String(p.title || "").trim();
  const code = String(p.code || "").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
  const value = parseFloat(String(p.value || "0"));
  if (!title) throw new Error("Discount title is required.");
  if (!code) throw new Error("Discount code is required (e.g. EID10).");
  if (!(value > 0)) throw new Error("Discount value must be greater than 0.");
  if (p.type === "percentage" && value > 100) throw new Error("Percentage cannot exceed 100.");

  const customerGets: Record<string, unknown> = {
    items: { all: true },
    appliesOnOneTimePurchase: true,
  };
  if (p.type === "fixed") {
    customerGets.value = { discountAmount: { amount: value.toFixed(2), appliesOnEachItem: false } };
  } else {
    customerGets.value = { percentage: value / 100 };
  }
  const input: Record<string, unknown> = { title, code, customerGets };
  if (p.startsAt) input.startsAt = p.startsAt;
  if (p.endsAt) input.endsAt = p.endsAt;
  const limit = parseInt(String(p.usageLimit || ""), 10);
  if (Number.isFinite(limit) && limit > 0) input.usageLimit = limit;
  const minSub = parseFloat(String(p.minSubtotal || "0"));
  if (minSub > 0) input.minimumRequirement = { subtotal: { greaterThanOrEqualToSubtotal: minSub.toFixed(2) } };
  if (p.oncePerCustomer) input.appliesOncePerCustomer = true;

  const d = await gql<DiscountCreateResponse>(
    `mutation DiscountCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
       discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
         codeDiscountNode { id }
         userErrors { message }
       }
     }`,
    { basicCodeDiscount: input }
  );
  const errs = d.discountCodeBasicCreate?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
  return { message: `Discount "${code}" created.`, id: d.discountCodeBasicCreate?.codeDiscountNode?.id };
}

export async function deleteAdminDiscount(id: string): Promise<SaveResult> {
  const d = await gql<DiscountDeleteResponse>(
    `mutation DiscountDelete($id: ID!) {
       discountCodeDelete(id: $id) { deletedCodeDiscountId userErrors { message } }
     }`,
    { id }
  );
  const errs = d.discountCodeDelete?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
  return { message: "Discount deleted.", id };
}

/* ------------------------------------------------------------------ */
/*  Media / Files                                                      */
/* ------------------------------------------------------------------ */

export async function getAdminFiles(limit = 40): Promise<AdminFile[]> {
  const d = await gql<FilesQueryResponse>(
    `query PanelFiles($first: Int!) {
       files(first: $first) {
         nodes {
           id
           ... on MediaImage { image { url } }
         }
       }
     }`,
    { first: limit }
  );

  return (d.files?.nodes ?? [])
    .filter((n) => n.image?.url)
    .map((n) => ({ id: n.id, url: n.image?.url || "" }));
}

export async function deleteAdminFile(id: string): Promise<SaveResult> {
  const d = await gql<FileDeleteResponse>(
    `mutation FileDelete($fileIds: [ID!]!) {
       fileDelete(fileIds: $fileIds) { deletedFileIds userErrors { message } }
     }`,
    { fileIds: [id] }
  );
  const errs = d.fileDelete?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
  return { message: "File deleted.", id };
}

export async function getPermanentFileUrl(rawUrl: string): Promise<{ message: string; url: string }> {
  const url = String(rawUrl || "");
  if (!url) throw new Error("No image URL.");
  if (url.startsWith("/") || (url.includes("cdn.shopify.com") && !url.includes("/tmp/"))) {
    return { message: "Image ready.", url };
  }
  const fileId = await fileFromUrl(url, "Uploaded image");
  let finalUrl = "";
  for (let i = 0; i < 8; i++) {
    const d = await gql<FileUrlQueryResponse>(
      `query FileUrl($id: ID!) { node(id: $id) { ... on MediaImage { fileStatus image { url } } } }`,
      { id: fileId }
    );
    finalUrl = d?.node?.image?.url || "";
    if (finalUrl && d?.node?.fileStatus === "READY") break;
    if (d?.node?.fileStatus === "FAILED") throw new Error("Shopify could not process the uploaded image.");
    if (i < 7) await new Promise((r) => setTimeout(r, 1000));
  }
  if (!finalUrl) throw new Error("Could not read the uploaded image URL.");
  return { message: "Image ready.", url: finalUrl };
}
