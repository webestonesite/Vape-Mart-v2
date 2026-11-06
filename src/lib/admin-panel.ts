import "server-only";
import crypto from "node:crypto";
import { shopifyAdminMutation as gql, fetchShopSettings } from "@/lib/shopify";

/**
 * Server-side engine for the /admin panel.
 *
 * Everything the panel manages lives in Shopify (shop metafields,
 * metaobjects, blog articles, pages, menu, products) — the panel is
 * just a simpler front door, so the storefront keeps reading the same
 * data it already reads. The panel password is stored in Shopify as a
 * salted scrypt hash (shop metafield, namespace "admin"); the browser
 * only ever holds an HMAC session cookie derived from that hash.
 */

export const SHOP_ID = "gid://shopify/Shop/63186075696";
export const BLOG_ID = "gid://shopify/Blog/85628715056";
export const SESSION_COOKIE = "vm_admin_session";

/* ------------------------------------------------------------------ */
/*  Password auth                                                      */
/* ------------------------------------------------------------------ */

async function getStoredHash(): Promise<string | null> {
  const d = await gql<any>(
    `{ shop { metafield(namespace: "admin", key: "panel_password") { value } } }`
  );
  return d.shop?.metafield?.value || null;
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = (stored || "").split(":");
  if (!salt || !hash) return false;
  const calc = crypto.scryptSync(password, salt, 64);
  const orig = Buffer.from(hash, "hex");
  return calc.length === orig.length && crypto.timingSafeEqual(calc, orig);
}

export function sessionTokenFor(stored: string): string {
  return crypto
    .createHmac("sha256", stored)
    .update("vape-mart-admin-session-v1")
    .digest("hex");
}

export interface AuthState {
  setupNeeded: boolean;
  authed: boolean;
}

export async function getAuthState(cookieToken: string | undefined): Promise<AuthState> {
  const stored = await getStoredHash();
  if (!stored) return { setupNeeded: true, authed: false };
  return {
    setupNeeded: false,
    authed: !!cookieToken && cookieToken === sessionTokenFor(stored),
  };
}

export async function setupPassword(code: string, password: string): Promise<string> {
  const expected = process.env.ADMIN_SETUP_CODE || "";
  if (!expected) throw new Error("Setup is not configured on the server (ADMIN_SETUP_CODE missing).");
  if (!code || code !== expected) throw new Error("Wrong setup code.");
  if (!password || password.length < 8) throw new Error("Password must be at least 8 characters.");
  const existing = await getStoredHash();
  if (existing) throw new Error("Password is already set. Use the login form.");
  const stored = hashPassword(password);
  await setShopMetafields([
    { key: "panel_password", type: "single_line_text_field", value: stored, namespace: "admin" },
  ]);
  return sessionTokenFor(stored);
}

export async function login(password: string): Promise<string> {
  const stored = await getStoredHash();
  if (!stored) throw new Error("Panel is not set up yet.");
  if (!verifyPassword(password || "", stored)) throw new Error("Wrong password.");
  return sessionTokenFor(stored);
}

/* ------------------------------------------------------------------ */
/*  Small helpers                                                      */
/* ------------------------------------------------------------------ */

function fieldsMap(fields: { key: string; value: string | null }[] | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of fields ?? []) if (f.value != null) out[f.key] = f.value;
  return out;
}

function parseList(value: string | undefined): string[] {
  if (!value) return [];
  try {
    const v = JSON.parse(value);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

export async function setShopMetafields(
  entries: { key: string; type: string; value: string; namespace?: string }[]
): Promise<void> {
  const metafields = entries.map((e) => ({
    ownerId: SHOP_ID,
    namespace: e.namespace || "store",
    key: e.key,
    type: e.type,
    value: e.value,
  }));
  const d = await gql<any>(
    `mutation MfSet($metafields: [MetafieldsSetInput!]!) {
       metafieldsSet(metafields: $metafields) { metafields { id } userErrors { message } }
     }`,
    { metafields }
  );
  const errs = d.metafieldsSet?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
}

type FieldObj = Record<string, string | number | undefined>;

function moFieldsArray(fields: FieldObj): { key: string; value: string }[] {
  return Object.entries(fields)
    .filter(([, v]) => v !== undefined)
    .map(([key, value]) => ({ key, value: String(value) }));
}

async function moCreate(type: string, fields: FieldObj): Promise<string> {
  const d = await gql<any>(
    `mutation MoCreate($metaobject: MetaobjectCreateInput!) {
       metaobjectCreate(metaobject: $metaobject) { metaobject { id } userErrors { message } }
     }`,
    { metaobject: { type, fields: moFieldsArray(fields) } }
  );
  const errs = d.metaobjectCreate?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
  return d.metaobjectCreate.metaobject.id as string;
}

async function moUpdate(id: string, fields: FieldObj): Promise<void> {
  const d = await gql<any>(
    `mutation MoUpdate($id: ID!, $metaobject: MetaobjectUpdateInput!) {
       metaobjectUpdate(id: $id, metaobject: $metaobject) { metaobject { id } userErrors { message } }
     }`,
    { id, metaobject: { fields: moFieldsArray(fields) } }
  );
  const errs = d.metaobjectUpdate?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
}

async function moDelete(id: string): Promise<void> {
  const d = await gql<any>(
    `mutation MoDelete($id: ID!) {
       metaobjectDelete(id: $id) { deletedId userErrors { message } }
     }`,
    { id }
  );
  const errs = d.metaobjectDelete?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
}

async function fileFromUrl(url: string, alt: string): Promise<string> {
  const d = await gql<any>(
    `mutation FileFromUrl($files: [FileCreateInput!]!) {
       fileCreate(files: $files) { files { id } userErrors { message } }
     }`,
    { files: [{ originalSource: url, contentType: "IMAGE", alt }] }
  );
  const errs = d.fileCreate?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
  const id = d.fileCreate?.files?.[0]?.id;
  if (!id) throw new Error("Image upload did not return a file.");
  return id as string;
}

/* ------------------------------------------------------------------ */
/*  Panel data (everything the UI needs in one read)                   */
/* ------------------------------------------------------------------ */

const PANEL_QUERY = `
  query PanelData {
    hero: metaobjects(type: "hero_slide", first: 20) {
      nodes { id fields { key value } imageRef: field(key: "image") { reference { ... on MediaImage { id image { url } } } } }
    }
    sections: metaobjects(type: "home_section", first: 20) { nodes { id fields { key value } } }
    testimonials: metaobjects(type: "testimonial", first: 30) { nodes { id fields { key value } } }
    faqs: metaobjects(type: "faq_item", first: 30) { nodes { id fields { key value } } }
    showcase: metaobjects(type: "showcase_card", first: 60) { nodes { id fields { key value } } }
    locations(first: 5) { nodes { id name } }
    files(first: 40, sortKey: CREATED_AT, reverse: true) {
      nodes { id ... on MediaImage { image { url } } }
    }
    blog(id: "${BLOG_ID}") {
      articles(first: 50) {
        nodes {
          id handle title bodyHtml: body summary tags publishedAt isPublished
          author { name }
          metafields(first: 10, namespace: "vapemart") { nodes { key type value } }
        }
      }
    }
    pages(first: 30) { nodes { id handle title body } }
    menus(first: 10) { nodes { id title handle } }
    orders(first: 25, sortKey: CREATED_AT, reverse: true) {
      nodes { id name createdAt displayFulfillmentStatus displayFinancialStatus totalPriceSet { shopMoney { amount currencyCode } } customer { displayName email } }
    }
    draftOrders(first: 25) {
      nodes { id name createdAt status totalPriceSet { shopMoney { amount currencyCode } } customer { displayName email } }
    }
    customers(first: 25, sortKey: CREATED_AT, reverse: true) {
      nodes { id displayName email phone numberOfOrders amountSpent { amount currencyCode } note tags }
    }
    discountNodes(first: 25) {
      nodes { id discount {
        ... on DiscountCodeBasic { title status codes(first: 1) { nodes { code } } }
        ... on DiscountCodeBxgy { title status codes(first: 1) { nodes { code } } }
        ... on DiscountCodeFreeShipping { title status codes(first: 1) { nodes { code } } }
        ... on DiscountAutomaticBasic { title status }
        ... on DiscountAutomaticBxgy { title status }
        ... on DiscountAutomaticFreeShipping { title status }
      } }
    }
  }
`;

const MENU_QUERY = `
  query MenuItems($id: ID!) {
    menu(id: $id) {
      id title handle
      items {
        id title url type
        items { id title url type items { id title url type } }
      }
    }
  }
`;

/* ------------------------------------------------------------------ */
/*  Full-list pagination (2026-11-07 audit)                            */
/*                                                                     */
/*  The panel used to read products(first: 250), collections(first:   */
/*  60) and redirects(first: 100) in one shot, so 27 products and 9   */
/*  collections never reached the panel at all — the dashboard total  */
/*  was wrong and the newest zero-price products were uneditable.     */
/*  These helpers loop with cursors until everything is read. Pages   */
/*  stay small so each query stays under Shopify's 1000-point limit.  */
/* ------------------------------------------------------------------ */

async function listAllPanelProducts(): Promise<any[]> {
  const out: any[] = [];
  let after: string | null = null;
  for (let page = 0; page < 20; page++) {
    const d: any = await gql<any>(
      `query PanelProducts($after: String) {
         products(first: 100, after: $after) {
           nodes {
             id title handle status featuredImage { url }
             variants(first: 1) { nodes { id price compareAtPrice inventoryQuantity inventoryItem { id } } }
           }
           pageInfo { hasNextPage endCursor }
         }
       }`,
      { after }
    );
    out.push(...(d.products?.nodes ?? []));
    if (!d.products?.pageInfo?.hasNextPage) break;
    after = d.products.pageInfo.endCursor;
  }
  return out;
}

async function listAllRedirects(): Promise<any[]> {
  const out: any[] = [];
  let after: string | null = null;
  for (let page = 0; page < 20; page++) {
    const d: any = await gql<any>(
      `query PanelRedirects($after: String) {
         urlRedirects(first: 100, after: $after) {
           nodes { id path target }
           pageInfo { hasNextPage endCursor }
         }
       }`,
      { after }
    );
    out.push(...(d.urlRedirects?.nodes ?? []));
    if (!d.urlRedirects?.pageInfo?.hasNextPage) break;
    after = d.urlRedirects.pageInfo.endCursor;
  }
  return out;
}

async function listAllCollections(): Promise<any[]> {
  const out: any[] = [];
  let after: string | null = null;
  for (let page = 0; page < 20; page++) {
    const d: any = await gql<any>(
      `query PanelCollections($after: String) {
         collections(first: 50, after: $after) {
           nodes { id title handle productsCount { count } }
           pageInfo { hasNextPage endCursor }
         }
       }`,
      { after }
    );
    out.push(...(d.collections?.nodes ?? []));
    if (!d.collections?.pageInfo?.hasNextPage) break;
    after = d.collections.pageInfo.endCursor;
  }
  return out;
}

export async function getPanelData() {
  const settings = await fetchShopSettings();
  const [d, allProducts, allRedirects] = await Promise.all([
    gql<any>(PANEL_QUERY),
    listAllPanelProducts(),
    listAllRedirects(),
  ]);

  const mo = (nodes: any[] | undefined) =>
    (nodes ?? []).map((n) => ({ id: n.id as string, f: fieldsMap(n.fields), raw: n }));

  const heroSlides = mo(d.hero?.nodes).map(({ id, f, raw }) => ({
    id,
    title: f.title || "",
    description: f.description || "",
    badge: f.badge || "",
    buttonText: f.button_text || "",
    buttonLink: f.button_link || "",
    position: parseInt(f.position || "0", 10) || 0,
    imageUrl: raw.imageRef?.reference?.image?.url || "",
    imageFileId: raw.imageRef?.reference?.id || "",
  })).sort((a, b) => a.position - b.position);

  const sections = mo(d.sections?.nodes).map(({ id, f }) => ({
    id,
    key: f.section_key || "",
    title: f.title || "",
    subtitle: f.subtitle || "",
    badgeText: f.badge_text || "",
    productIds: parseList(f.products),
  })).filter((s) => s.key);

  const testimonials = mo(d.testimonials?.nodes).map(({ id, f }) => ({
    id,
    name: f.name || "",
    role: f.role || "",
    title: f.title || "",
    review: f.review || "",
    position: parseInt(f.position || "0", 10) || 0,
  })).sort((a, b) => a.position - b.position);

  const faqs = mo(d.faqs?.nodes).map(({ id, f }) => ({
    id,
    question: f.question || "",
    answer: f.answer || "",
    position: parseInt(f.position || "0", 10) || 0,
  })).sort((a, b) => a.position - b.position);

  const showcase = mo(d.showcase?.nodes).map(({ id, f }) => ({
    id,
    sectionKey: f.section_key || "",
    title: f.title || "",
    price: f.price || "",
    revs: parseInt(f.revs || "0", 10) || 0,
    badge: f.badge || "",
    brand: f.brand || "",
    imageUrl: f.image_url || "",
    position: parseInt(f.position || "0", 10) || 0,
  })).sort((a, b) => a.sectionKey.localeCompare(b.sectionKey) || a.position - b.position);

  const products = (allProducts ?? []).map((p: any) => {
    const v = p.variants?.nodes?.[0] ?? {};
    return {
      id: p.id as string,
      title: p.title as string,
      handle: p.handle as string,
      status: p.status as string,
      image: p.featuredImage?.url || "",
      variantId: v.id || "",
      price: v.price || "",
      compareAtPrice: parseFloat(String(v.compareAtPrice || "0")) > 0 ? v.compareAtPrice : "",
      inventoryQuantity: typeof v.inventoryQuantity === "number" ? v.inventoryQuantity : 0,
      inventoryItemId: v.inventoryItem?.id || "",
    };
  });

  const files = (d.files?.nodes ?? [])
    .filter((n: any) => n.image?.url)
    .map((n: any) => ({ id: n.id as string, url: n.image.url as string }));

  const blogPosts = (d.blog?.articles?.nodes ?? []).map((a: any) => {
    const mf: Record<string, string> = {};
    for (const m of a.metafields?.nodes ?? []) mf[m.key] = m.value;
    return {
      id: a.id as string,
      handle: a.handle as string,
      title: a.title as string,
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

  const pages = (d.pages?.nodes ?? [])
    .filter((p: any) => ["about", "contact", "privacy-policy", "terms-conditions"].includes(p.handle))
    .map((p: any) => ({ id: p.id as string, handle: p.handle as string, title: p.title as string, body: p.body || "" }));

  const menuNode = (d.menus?.nodes ?? []).find((m: any) => m.handle === "vape-mart-main-menu");
  let menu: any = null;
  if (menuNode) {
    const md = await gql<any>(MENU_QUERY, { id: menuNode.id });
    if (md.menu) {
      const mapItem = (it: any): any => ({
        id: it.id,
        title: it.title || "",
        url: it.url || "",
        children: (it.items ?? []).map(mapItem),
      });
      menu = {
        id: md.menu.id,
        title: md.menu.title,
        handle: md.menu.handle,
        items: (md.menu.items ?? []).map(mapItem),
      };
    }
  }

  const orders = (d.orders?.nodes ?? []).map((o: any) => ({
    id: o.id as string, name: o.name as string, customer: o.customer?.displayName || o.customer?.email || "Guest",
    fulfillment: o.displayFulfillmentStatus || "", financial: o.displayFinancialStatus || "", total: o.totalPriceSet?.shopMoney?.amount || "",
    currency: o.totalPriceSet?.shopMoney?.currencyCode || "AED", createdAt: o.createdAt || "",
  }));
  const draftOrders = (d.draftOrders?.nodes ?? []).map((o: any) => ({
    id: o.id as string, name: o.name as string, status: o.status || "",
    customer: o.customer?.displayName || o.customer?.email || "—",
    total: o.totalPriceSet?.shopMoney?.amount || "", currency: o.totalPriceSet?.shopMoney?.currencyCode || "AED", createdAt: o.createdAt || "",
  }));
  const customers = (d.customers?.nodes ?? []).map((c: any) => ({
    id: c.id as string, name: c.displayName || "", email: c.email || "", phone: c.phone || "",
    orders: c.numberOfOrders ?? 0, spent: c.amountSpent?.amount || "", currency: c.amountSpent?.currencyCode || "AED",
    note: c.note || "", tags: (c.tags ?? []).join(", "),
  }));
  const discounts = (d.discountNodes?.nodes ?? []).map((n: any) => ({
    id: n.id as string, title: n.discount?.title || "",
    code: n.discount?.codes?.nodes?.[0]?.code || (n.discount ? "Automatic" : ""),
    status: n.discount?.status || "",
  }));
  const redirects = (allRedirects ?? []).map((r: any) => ({
    id: r.id as string, path: r.path as string, target: r.target as string,
  }));

  return {
    settings: {
      announcements: settings.announcements,
      phone: settings.phone,
      footerText: settings.footerText,
      logoUrl: settings.logoUrl,
      checkout: settings.checkout,
      productPage: settings.productPage,
      collectionPage: settings.collectionPage,
      theme: settings.theme,
      home: settings.home,
      blog: settings.blog,
      pages: settings.pages,
    },
    heroSlides,
    sections,
    testimonials,
    faqs,
    showcase,
    products,
    files,
    blogPosts,
    pages,
    menu,
    orders,
    draftOrders,
    customers,
    discounts,
    redirects,
    locationId: d.locations?.nodes?.[0]?.id || "",
  };
}

/* ------------------------------------------------------------------ */
/*  Save actions                                                       */
/* ------------------------------------------------------------------ */

export interface SaveResult {
  message: string;
  id?: string;
}

/* Collection sort orders (Shopify CollectionSortOrder enum, verified live:
   the "Home page" collection reports BEST_SELLING). */
const COLLECTION_SORT_ORDERS = ["MANUAL", "BEST_SELLING", "ALPHA_ASC", "ALPHA_DESC", "PRICE", "PRICE_DESC", "CREATED", "CREATED_DESC"] as const;
function validSortOrder(v: unknown): string | undefined {
  const s = String(v || "");
  return (COLLECTION_SORT_ORDERS as readonly string[]).includes(s) ? s : undefined;
}

async function blogMetafields(articleId: string, p: any): Promise<void> {
  const entries: { ownerId: string; namespace: string; key: string; type: string; value: string }[] = [];
  if (typeof p.category === "string" && p.category.trim())
    entries.push({ ownerId: articleId, namespace: "vapemart", key: "category", type: "single_line_text_field", value: p.category.trim() });
  if (typeof p.quickAnswer === "string" && p.quickAnswer.trim())
    entries.push({ ownerId: articleId, namespace: "vapemart", key: "quick_answer", type: "multi_line_text_field", value: p.quickAnswer.trim() });
  if (typeof p.productSlugs === "string") {
    const slugs = p.productSlugs.split(/[,\n]/).map((x: string) => x.trim()).filter(Boolean);
    entries.push({ ownerId: articleId, namespace: "vapemart", key: "product_slugs", type: "list.single_line_text_field", value: JSON.stringify(slugs) });
  }
  if (!entries.length) return;
  const d = await gql<any>(
    `mutation MfSet($metafields: [MetafieldsSetInput!]!) {
       metafieldsSet(metafields: $metafields) { metafields { id } userErrors { message } }
     }`,
    { metafields: entries }
  );
  const errs = d.metafieldsSet?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
}

export async function saveAction(action: string, p: any): Promise<SaveResult> {
  switch (action) {
    case "settings": {
      await setShopMetafields([
        { key: "announcements", type: "list.single_line_text_field", value: JSON.stringify((p.announcements ?? []).map(String).filter((x: string) => x.trim())) },
        { key: "phone", type: "single_line_text_field", value: String(p.phone ?? "") },
        { key: "footer_text", type: "single_line_text_field", value: String(p.footerText ?? "") },
      ]);
      return { message: "Top bar, phone and footer text saved." };
    }

    case "hero.save": {
      const fields: FieldObj = {
        title: p.title, description: p.description, badge: p.badge,
        button_text: p.buttonText, button_link: p.buttonLink, position: p.position,
      };
      if (p.imageFileId) fields.image = p.imageFileId;
      else if (p.imageUrl) fields.image = await fileFromUrl(String(p.imageUrl), String(p.title || "Hero slide"));
      if (p.id) { await moUpdate(p.id, fields); return { message: "Hero slide updated." }; }
      await moCreate("hero_slide", fields);
      return { message: "Hero slide added." };
    }
    case "hero.delete": await moDelete(p.id); return { message: "Hero slide deleted." };

    case "section.save": {
      await moUpdate(p.id, {
        title: p.title, subtitle: p.subtitle, badge_text: p.badgeText,
        products: JSON.stringify((p.productIds ?? []).map(String)),
      });
      return { message: "Section saved." };
    }

    case "testimonial.save": {
      const fields: FieldObj = { name: p.name, role: p.role, title: p.title, review: p.review, position: p.position };
      if (p.id) { await moUpdate(p.id, fields); return { message: "Review updated." }; }
      await moCreate("testimonial", fields);
      return { message: "Review added." };
    }
    case "testimonial.delete": await moDelete(p.id); return { message: "Review deleted." };

    case "faq.save": {
      const fields: FieldObj = { question: p.question, answer: p.answer, position: p.position };
      if (p.id) { await moUpdate(p.id, fields); return { message: "FAQ updated." }; }
      await moCreate("faq_item", fields);
      return { message: "FAQ added." };
    }
    case "faq.delete": await moDelete(p.id); return { message: "FAQ deleted." };

    case "showcase.save": {
      const fields: FieldObj = {
        section_key: p.sectionKey, title: p.title, price: p.price, revs: p.revs,
        badge: p.badge, brand: p.brand, image_url: p.imageUrl, position: p.position,
      };
      if (p.id) { await moUpdate(p.id, fields); return { message: "Card updated." }; }
      await moCreate("showcase_card", fields);
      return { message: "Card added." };
    }
    case "showcase.delete": await moDelete(p.id); return { message: "Card deleted." };

    case "blog.save": {
      // Author is REQUIRED by articleCreate (2026-11-07 audit: the panel
      // omitted it, so creates could fail). Drafts are supported now —
      // isPublished false saves a draft instead of publishing live.
      const article: Record<string, unknown> = {
        title: p.title,
        body: p.body || "",
        summary: p.summary || "",
        tags: String(p.tags || "").split(",").map((x: string) => x.trim()).filter(Boolean),
        author: { name: String(p.author || "Vape Mart Team").trim() || "Vape Mart Team" },
        isPublished: p.isPublished !== false,
      };
      if (p.handle && slugify(p.handle)) article.handle = slugify(p.handle);
      if (p.publishDate) article.publishDate = p.publishDate;
      let id: string | undefined = p.id;
      const trySave = async (withImage: boolean) => {
        const input = { ...article };
        if (withImage && p.imageUrl) input.image = { url: p.imageUrl, altText: p.title };
        if (id) {
          const d = await gql<any>(
            `mutation ArticleUpdate($id: ID!, $article: ArticleUpdateInput!) {
               articleUpdate(id: $id, article: $article) { article { id } userErrors { message } }
             }`,
            { id, article: input }
          );
          const errs = d.articleUpdate?.userErrors ?? [];
          if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
        } else {
          const d = await gql<any>(
            `mutation ArticleCreate($article: ArticleCreateInput!) {
               articleCreate(article: $article) { article { id } userErrors { message } }
             }`,
            { article: { ...input, blogId: BLOG_ID } }
          );
          const errs = d.articleCreate?.userErrors ?? [];
          if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
          id = d.articleCreate.article.id;
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
      return { message: (id && p.id ? "Blog post updated." : published ? "Blog post published." : "Blog post saved as draft.") + warning };
    }
    case "blog.delete": {
      const d = await gql<any>(
        `mutation ArticleDelete($id: ID!) { articleDelete(id: $id) { deletedArticleId userErrors { message } } }`,
        { id: p.id }
      );
      const errs = d.articleDelete?.userErrors ?? [];
      if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
      return { message: "Blog post deleted." };
    }

    case "page.save": {
      const d = await gql<any>(
        `mutation PageSave($id: ID!, $page: PageUpdateInput!) {
           pageUpdate(id: $id, page: $page) { page { id } userErrors { message } }
         }`,
        { id: p.id, page: { body: p.body || "", title: p.title || undefined } }
      );
      const errs = d.pageUpdate?.userErrors ?? [];
      if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
      return { message: "Page saved." };
    }

    case "menu.save": {
      const mapItems = (items: any[]): any[] =>
        (items ?? []).map((it) => ({
          ...(it.id ? { id: it.id } : {}),
          title: String(it.title || ""),
          type: "LINK",
          url: String(it.url || "/"),
          items: mapItems(it.children ?? []),
        }));
      const d = await gql<any>(
        `mutation MenuSave($id: ID!, $title: String!, $handle: String!, $items: [MenuItemUpdateInput!]!) {
           menuUpdate(id: $id, title: $title, handle: $handle, items: $items) { menu { id } userErrors { message } }
         }`,
        { id: p.id, title: p.title, handle: p.handle, items: mapItems(p.items) }
      );
      const errs = d.menuUpdate?.userErrors ?? [];
      if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
      return { message: "Menu saved." };
    }

    case "product.save": {
      if (p.variantId && (p.price !== undefined || p.compareAtPrice !== undefined)) {
        await bulkUpdateVariants(p.id, [{ id: p.variantId, price: p.price, compareAtPrice: p.compareAtPrice }]);
      }
      if (p.status) {
        const d = await gql<any>(
          `mutation ProductStatus($product: ProductUpdateInput!) {
             productUpdate(product: $product) { product { id } userErrors { message } }
           }`,
          { product: { id: p.id, status: p.status } }
        );
        const errs = d.productUpdate?.userErrors ?? [];
        if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
      }
      if (p.inventoryItemId && p.locationId && p.inventoryQuantity !== undefined && p.inventoryQuantity !== "") {
        await setInventory(p.inventoryItemId, p.locationId, parseInt(String(p.inventoryQuantity), 10) || 0);
      }
      return { message: "Product updated." };
    }

    case "review.save": {
      const fields: FieldObj = {
        product: p.product, author: p.author, rating: p.rating, title: p.title,
        body: p.body, verified: p.verified ? "true" : "false", position: p.position,
      };
      if (p.id) { await moUpdate(p.id, fields); return { message: "Review updated." }; }
      await moCreate("vm_product_review", fields);
      return { message: "Review added." };
    }
    case "review.delete": await moDelete(p.id); return { message: "Review deleted." };

    case "collectionFaq.save": {
      const fields: FieldObj = { collection: p.collection, question: p.question, answer: p.answer, position: p.position };
      if (p.id) { await moUpdate(p.id, fields); return { message: "Collection FAQ updated." }; }
      await moCreate("vm_collection_faq", fields);
      return { message: "Collection FAQ added." };
    }
    case "collectionFaq.delete": await moDelete(p.id); return { message: "Collection FAQ deleted." };

    case "flavor.save": {
      const fields: FieldObj = { name: p.name, color: p.color, in_stock: p.inStock ? "true" : "false" };
      if (p.imageFileId) fields.image = p.imageFileId;
      else if (p.imageUrl) fields.image = await fileFromUrl(String(p.imageUrl), String(p.name || "Flavor"));
      if (p.id) { await moUpdate(p.id, fields); return { message: "Flavor updated." }; }
      await moCreate("flavor", fields);
      return { message: "Flavor added." };
    }
    case "flavor.delete": await moDelete(p.id); return { message: "Flavor deleted." };

    case "media.delete": {
      const d = await gql<any>(
        `mutation FileDelete($fileIds: [ID!]!) {
           fileDelete(fileIds: $fileIds) { deletedFileIds userErrors { message } }
         }`,
        { fileIds: [p.id] }
      );
      const errs = d.fileDelete?.userErrors ?? [];
      if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
      return { message: "File deleted." };
    }

    case "collection.save": {
      const collection: Record<string, any> = { id: p.id, title: p.title, descriptionHtml: p.descriptionHtml || "" };
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
      const d = await gql<any>(
        `mutation CollectionSave($collection: CollectionInput!) {
           collectionUpdate(collection: $collection) { collection { id } userErrors { message } }
         }`,
        { collection }
      );
      const errs = d.collectionUpdate?.userErrors ?? [];
      if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
      return { message: "Collection saved." };
    }

    case "checkout.save": {
      await setShopMetafields([
        { namespace: "checkout", key: "free_shipping_threshold", type: "number_integer", value: String(parseInt(String(p.freeShippingThreshold ?? 0), 10) || 0) },
        { namespace: "checkout", key: "delivery_fee", type: "number_decimal", value: String(parseFloat(String(p.deliveryFee ?? 0)) || 0) },
        { namespace: "checkout", key: "vat_note", type: "single_line_text_field", value: String(p.vatNote || "") },
        { namespace: "checkout", key: "city_promises", type: "json", value: JSON.stringify(p.cityPromises ?? []) },
        { namespace: "checkout", key: "payment_labels", type: "json", value: JSON.stringify(p.paymentLabels ?? []) },
      ]);
      return { message: "Cart & checkout settings saved." };
    }

    case "productPage.save": {
      await setShopMetafields([
        { namespace: "product_page", key: "trust_badges", type: "json", value: JSON.stringify(p.trustBadges ?? []) },
        { namespace: "product_page", key: "shipping_text", type: "multi_line_text_field", value: String(p.shippingText || "") },
        { namespace: "product_page", key: "return_text", type: "multi_line_text_field", value: String(p.returnText || "") },
        { namespace: "product_page", key: "spec_order", type: "list.single_line_text_field", value: JSON.stringify((p.specOrder ?? []).map(String)) },
      ]);
      return { message: "Product page settings saved." };
    }

    case "collectionPage.save": {
      await setShopMetafields([
        { namespace: "collection_page", key: "items_per_page", type: "number_integer", value: String(parseInt(String(p.itemsPerPage ?? 0), 10) || 0) },
        { namespace: "collection_page", key: "compare_limit", type: "number_integer", value: String(parseInt(String(p.compareLimit ?? 0), 10) || 0) },
        { namespace: "collection_page", key: "sort_options", type: "json", value: JSON.stringify(p.sortOptions ?? []) },
        { namespace: "collection_page", key: "puff_buckets", type: "json", value: JSON.stringify(p.puffBuckets ?? []) },
        { namespace: "collection_page", key: "flavor_families", type: "json", value: JSON.stringify(p.flavorFamilies ?? []) },
        { namespace: "collection_page", key: "quiz_steps", type: "json", value: JSON.stringify(p.quizSteps ?? []) },
        { namespace: "collection_page", key: "shop_all_hero", type: "json", value: JSON.stringify(p.shopAllHero ?? {}) },
      ]);
      return { message: "Collection page settings saved." };
    }

    case "theme.save": {
      const entries: { namespace?: string; key: string; type: string; value: string }[] = [
        { namespace: "theme", key: "search_placeholder", type: "single_line_text_field", value: String(p.searchPlaceholder || "") },
        { namespace: "theme", key: "topbar_links", type: "json", value: JSON.stringify(p.topbarLinks ?? []) },
        { namespace: "theme", key: "footer_links", type: "json", value: JSON.stringify(p.footerLinks ?? []) },
        { namespace: "theme", key: "newsletter_text", type: "single_line_text_field", value: String(p.newsletterText || "") },
        { namespace: "theme", key: "mega_banner", type: "json", value: JSON.stringify(p.megaBanner ?? {}) },
        { namespace: "theme", key: "colors", type: "json", value: JSON.stringify(p.colors ?? { preset: "emerald" }) },
        { namespace: "theme", key: "fonts", type: "json", value: JSON.stringify(p.fonts ?? { heading: "playfair", body: "system" }) },
      ];
      if (p.logoUrl) {
        const fileId = await fileFromUrl(String(p.logoUrl), "Store logo");
        entries.push({ namespace: "store", key: "logo", type: "file_reference", value: fileId });
      }
      await setShopMetafields(entries);
      return { message: "Theme settings saved." };
    }

    case "home.save": {
      await setShopMetafields([
        { namespace: "home", key: "promo_banners", type: "json", value: JSON.stringify(p.promoBanners ?? []) },
        { namespace: "home", key: "category_tiles", type: "json", value: JSON.stringify(p.categoryTiles ?? []) },
        { namespace: "home", key: "features", type: "json", value: JSON.stringify(p.features ?? []) },
        { namespace: "home", key: "trust_stats", type: "json", value: JSON.stringify(p.trustStats ?? {}) },
        { namespace: "home", key: "section_visibility", type: "json", value: JSON.stringify(p.sectionVisibility ?? {}) },
        { namespace: "home", key: "section_order", type: "list.single_line_text_field", value: JSON.stringify(p.sectionOrder ?? []) },
      ]);
      return { message: "Home page settings saved." };
    }

    case "blogSettings.save": {
      await setShopMetafields([
        { namespace: "blog", key: "categories", type: "list.single_line_text_field", value: JSON.stringify(p.categories ?? []) },
        { namespace: "blog", key: "category_colors", type: "json", value: JSON.stringify(p.categoryColors ?? {}) },
      ]);
      return { message: "Blog settings saved." };
    }

    case "pages.save": {
      await setShopMetafields([
        { namespace: "pages", key: "about_values", type: "json", value: JSON.stringify(p.aboutValues ?? []) },
        { namespace: "pages", key: "about_stats", type: "json", value: JSON.stringify(p.aboutStats ?? []) },
        { namespace: "pages", key: "contact_cards", type: "json", value: JSON.stringify(p.contactCards ?? []) },
        { namespace: "pages", key: "page_hero_subtitles", type: "json", value: JSON.stringify(p.pageHeroSubtitles ?? {}) },
      ]);
      return { message: "Info page settings saved." };
    }

    case "discount.save": {
      // Code discount (percentage or fixed AED off the whole order).
      // BXGY / free-shipping / automatic discounts stay in Shopify admin.
      const title = String(p.title || "").trim();
      const code = String(p.code || "").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
      const value = parseFloat(String(p.value || "0"));
      if (!title) throw new Error("Discount-er nam dao.");
      if (!code) throw new Error("Code dao (jemon: EID10).");
      if (!(value > 0)) throw new Error("Chhar-er poriman dao (0-r beshi hote hobe).");
      if (p.type === "percentage" && value > 100) throw new Error("Percentage 100-er beshi hote parbe na.");
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
      const d = await gql<any>(
        `mutation DiscountCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
           discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
             codeDiscountNode { id }
             userErrors { message }
           }
         }`,
        { basicCodeDiscount: input }
      );
      const errs = d.discountCodeBasicCreate?.userErrors ?? [];
      if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
      return { message: `Discount "${code}" toiri hoise.` };
    }

    case "discount.delete": {
      const d = await gql<any>(
        `mutation DiscountDelete($id: ID!) {
           discountCodeDelete(id: $id) { deletedCodeDiscountId userErrors { message } }
         }`,
        { id: p.id }
      );
      const errs = d.discountCodeDelete?.userErrors ?? [];
      if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
      return { message: "Discount deleted." };
    }

    case "customer.save": {
      const input: Record<string, unknown> = { id: p.id };
      if (p.note !== undefined) input.note = String(p.note || "");
      if (p.tags !== undefined)
        input.tags = String(p.tags || "").split(",").map((x: string) => x.trim()).filter(Boolean);
      const d = await gql<any>(
        `mutation CustomerSave($input: CustomerInput!) {
           customerUpdate(input: $input) { customer { id } userErrors { message } }
         }`,
        { input }
      );
      const errs = d.customerUpdate?.userErrors ?? [];
      if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
      return { message: "Customer saved." };
    }

    case "redirect.save": {
      const path = String(p.path || "").trim();
      const target = String(p.target || "").trim();
      if (!path.startsWith("/")) throw new Error("Redirect path must start with / (e.g. /old-page).");
      if (!target) throw new Error("Redirect target is required.");
      const d = await gql<any>(
        `mutation RedirectCreate($path: String!, $target: String!) {
           urlRedirectCreate(urlRedirect: { path: $path, target: $target }) { urlRedirect { id } userErrors { message } }
         }`,
        { path, target }
      );
      const errs = d.urlRedirectCreate?.userErrors ?? [];
      if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
      return { message: "Redirect added." };
    }

    case "redirect.delete": {
      const d = await gql<any>(
        `mutation RedirectDelete($id: ID!) {
           urlRedirectDelete(id: $id) { deletedUrlRedirectId userErrors { message } }
         }`,
        { id: p.id }
      );
      const errs = d.urlRedirectDelete?.userErrors ?? [];
      if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
      return { message: "Redirect deleted." };
    }

    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

/* Try GraphQL docs in order (first success wins). Used where the Admin
   API changed shapes between versions (e.g. 2025-07 vs 2026-10): a
   schema-validation error throws before anything executes, so falling
   back to the other shape is safe. */
async function gqlTry(docs: { query: string; variables: any }[]): Promise<any> {
  let last: any = null;
  for (const d of docs) {
    try {
      return await gql<any>(d.query, d.variables);
    } catch (e) {
      last = e;
    }
  }
  throw last;
}

/* ------------------------------------------------------------------ */
/*  v2: dashboard extras, full product & collection management         */
/* ------------------------------------------------------------------ */

export async function getPanelExtras() {
  const [d, allCollections] = await Promise.all([
    gql<any>(`
    query PanelExtras {
      orders(first: 20, reverse: true) {
        nodes {
          id name createdAt displayFulfillmentStatus
          totalPriceSet { shopMoney { amount currencyCode } }
          customer { displayName }
        }
      }
      flavors: metaobjects(type: "flavor", first: 100) {
        nodes { id fields { key value } }
      }
      reviews: metaobjects(type: "vm_product_review", first: 100) {
        nodes { id fields { key value } }
      }
      collectionFaqs: metaobjects(type: "vm_collection_faq", first: 100) {
        nodes { id fields { key value } }
      }
    }
  `),
    listAllCollections(),
  ]);
  const flavors = (d.flavors?.nodes ?? []).map((n: any) => {
    const f: Record<string, string> = {};
    for (const fld of n.fields ?? []) if (fld.value != null) f[fld.key] = fld.value;
    return { id: n.id as string, name: f.name || "", color: f.color || "", inStock: f.in_stock !== "false", image: f.image || "" };
  });
  const moList = (nodes: any[]) =>
    (nodes ?? []).map((n: any) => {
      const f: Record<string, string> = {};
      for (const fld of n.fields ?? []) if (fld.value != null) f[fld.key] = fld.value;
      return { id: n.id as string, ...f };
    });
  return {
    collections: (allCollections ?? []).map((c: any) => ({
      id: c.id as string,
      title: c.title as string,
      handle: c.handle as string,
      productCount: c.productsCount?.count ?? 0,
    })),
    orders: (d.orders?.nodes ?? []).map((o: any) => ({
      id: o.id as string,
      name: o.name as string,
      createdAt: o.createdAt as string,
      fulfillment: o.displayFulfillmentStatus || "",
      total: o.totalPriceSet?.shopMoney?.amount || "",
      currency: o.totalPriceSet?.shopMoney?.currencyCode || "AED",
      customer: o.customer?.displayName || "—",
    })),
    flavors,
    reviews: moList(d.reviews?.nodes).map((r: any) => ({
      id: r.id,
      product: r.product || "",
      author: r.author || "",
      rating: parseInt(r.rating || "5", 10) || 5,
      title: r.title || "",
      body: r.body || "",
      verified: r.verified !== "false",
      position: parseInt(r.position || "0", 10) || 0,
    })),
    collectionFaqs: moList(d.collectionFaqs?.nodes).map((f: any) => ({
      id: f.id,
      collection: f.collection || "",
      question: f.question || "",
      answer: f.answer || "",
      position: parseInt(f.position || "0", 10) || 0,
    })),
  };
}

export async function getCollectionDetail(id: string) {
  const d = await gql<any>(
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
  // Product membership can exceed 100 (disposable-vape has 88+); page it.
  const productIds: string[] = [];
  let after: string | null = null;
  for (let page = 0; page < 20; page++) {
    const pd: any = await gql<any>(
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
    productIds.push(...((pd.collection?.products?.nodes ?? []) as any[]).map((p: any) => p.id as string));
    if (!pd.collection?.products?.pageInfo?.hasNextPage) break;
    after = pd.collection.products.pageInfo.endCursor;
  }
  const mf: Record<string, string> = {};
  for (const m of c.metafields?.nodes ?? []) mf[m.key] = m.value;
  return {
    id: c.id as string,
    title: c.title as string,
    handle: c.handle as string,
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

/* ------------------------------------------------------------------ */
/*  Orders (batch 2, 2026-11-07): detail + fulfil + full refund        */
/*  The panel used to list orders only — fulfil/refund needed Shopify. */
/*  Fulfil = fulfillmentCreate on every OPEN fulfillment order, all    */
/*  remaining items, customer notified. Refund = FULL refund only      */
/*  (all refundable line items, restocked, original gateway, customer  */
/*  notified). Partial refunds stay in Shopify admin.                 */
/* ------------------------------------------------------------------ */

export async function getOrderDetail(id: string) {
  const d: any = await gql<any>(
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
  const money = (m: any) => m?.shopMoney?.amount || "0";
  return {
    id: o.id as string,
    name: o.name as string,
    createdAt: o.createdAt as string,
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
      ? [o.shippingAddress.name, o.shippingAddress.address1, o.shippingAddress.address2, o.shippingAddress.city, o.shippingAddress.country].filter(Boolean).join(", ")
      : "",
    lineItems: (o.lineItems?.nodes ?? []).map((li: any) => ({
      id: li.id as string,
      title: li.title as string,
      variantTitle: li.variantTitle || "",
      quantity: li.quantity ?? 0,
      refundableQuantity: li.refundableQuantity ?? 0,
      unfulfilledQuantity: li.unfulfilledQuantity ?? 0,
      sku: li.sku || "",
      vendor: li.vendor || "",
      unitPrice: money(li.originalUnitPriceSet),
      total: money(li.discountedTotalSet),
    })),
    fulfillmentOrders: (o.fulfillmentOrders?.nodes ?? []).map((fo: any) => ({
      id: fo.id as string,
      status: fo.status || "",
      lineItems: (fo.lineItems?.nodes ?? []).map((x: any) => ({
        id: x.id as string,
        remainingQuantity: x.remainingQuantity ?? 0,
        title: x.lineItem?.title || "",
      })),
    })),
    fulfillments: (o.fulfillments?.nodes ?? []).map((f: any) => ({
      id: f.id as string,
      status: f.status || "",
      createdAt: f.createdAt || "",
      tracking: [f.trackingInfo?.company, f.trackingInfo?.number].filter(Boolean).join(" "),
      trackingUrl: f.trackingInfo?.url || "",
    })),
    refunds: (o.refunds?.nodes ?? []).map((r: any) => ({
      id: r.id as string,
      createdAt: r.createdAt || "",
      amount: money(r.totalRefundedSet),
    })),
    saleGateway: (o.transactions?.nodes ?? []).find((t: any) => t.kind === "SALE" && t.status === "SUCCESS")?.gateway || "",
  };
}

export async function fulfillOrder(id: string): Promise<SaveResult> {
  const detail = await getOrderDetail(id);
  const open = detail.fulfillmentOrders.filter(
    (fo: any) => fo.status === "OPEN" && fo.lineItems.some((li: any) => li.remainingQuantity > 0)
  );
  if (!open.length) throw new Error("Order already fulfilled — kono khula fulfillment order nai.");
  for (const fo of open) {
    const d: any = await gql<any>(
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
                .filter((li: any) => li.remainingQuantity > 0)
                .map((li: any) => ({ id: li.id, quantity: li.remainingQuantity })),
            },
          ],
        },
      }
    );
    const errs = d.fulfillmentCreate?.userErrors ?? [];
    if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
  }
  return { message: "Order fulfilled — customer-ke janano hoise." };
}

export async function refundOrder(id: string): Promise<SaveResult> {
  const detail = await getOrderDetail(id);
  const total = parseFloat(detail.total || "0") || 0;
  const refunded = parseFloat(detail.refunded || "0") || 0;
  const refundable = total - refunded;
  if (refundable <= 0) throw new Error("Refund korar moto taka nai — order-ta agei puro refund hoye gese.");
  const refundLineItems = detail.lineItems
    .filter((li: any) => li.refundableQuantity > 0)
    .map((li: any) => ({ lineItemId: li.id, quantity: li.refundableQuantity, restockType: "RETURN" }));
  if (!refundLineItems.length) throw new Error("Refund korar moto item nai.");
  const input: Record<string, unknown> = {
    orderId: id,
    refundLineItems,
    notify: true,
    note: "Full refund from Vape Mart panel.",
  };
  if (detail.saleGateway) {
    input.transactions = [{ kind: "REFUND", gateway: detail.saleGateway, amount: refundable.toFixed(2) }];
  }
  const d: any = await gql<any>(
    `mutation RefundCreate($input: RefundInput!) {
       refundCreate(input: $input) {
         refund { id }
         userErrors { message }
       }
     }`,
    { input }
  );
  const errs = d.refundCreate?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
  return { message: `Full refund done — ${detail.currency} ${refundable.toFixed(2)} ferot deoa hoise, item-gulo stock-e fire gese.` };
}

/* ------------------------------------------------------------------ */
/*  Customers (batch 2, 2026-11-07): detail + note/tags edit           */
/* ------------------------------------------------------------------ */

export async function getCustomerDetail(id: string) {
  const d: any = await gql<any>(
    `query CustomerDetail($id: ID!) {
       customer(id: $id) {
         id displayName email phone note tags
         numberOfOrders amountSpent { amount currencyCode }
         addressesV2(first: 10) {
           edges { node { id name address1 address2 city country phone default } }
         }
         orders(first: 20, reverse: true) {
           nodes { id name createdAt displayFinancialStatus displayFulfillmentStatus totalPriceSet { shopMoney { amount currencyCode } } }
         }
       }
     }`,
    { id }
  );
  const c = d.customer;
  if (!c) throw new Error("Customer not found.");
  return {
    id: c.id as string,
    name: c.displayName || "",
    email: c.email || "",
    phone: c.phone || "",
    note: c.note || "",
    tags: (c.tags ?? []).join(", "),
    orders: c.numberOfOrders ?? 0,
    spent: c.amountSpent?.amount || "",
    currency: c.amountSpent?.currencyCode || "AED",
    addresses: (c.addressesV2?.edges ?? []).map((e: any) => {
      const a = e.node;
      return {
        id: a.id as string,
        label: [a.name, a.address1, a.address2, a.city, a.country, a.phone].filter(Boolean).join(", "),
        isDefault: !!a.default,
      };
    }),
    orderHistory: (c.orders?.nodes ?? []).map((o: any) => ({
      id: o.id as string,
      name: o.name as string,
      createdAt: o.createdAt || "",
      financial: o.displayFinancialStatus || "",
      fulfillment: o.displayFulfillmentStatus || "",
      total: o.totalPriceSet?.shopMoney?.amount || "",
      currency: o.totalPriceSet?.shopMoney?.currencyCode || "AED",
    })),
  };
}

export async function getProductDetail(id: string) {
  const d = await gql<any>(
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
  const mf: Record<string, string> = {};
  for (const m of p.metafields?.nodes ?? []) mf[m.key] = m.value;
  // Product FAQs + reviews live in metaobjects linked by product GID;
  // related products live in Shopify's discovery metafield (product GIDs).
  const faqIds: string[] = (() => {
    try {
      const v = JSON.parse(mf["product_faqs"] || "[]");
      return Array.isArray(v) ? v.map(String) : [];
    } catch {
      return [];
    }
  })();
  const relIds: string[] = (() => {
    const rel = (p.relMf?.nodes ?? []).find((m: any) => m.key === RELATED_KEY);
    try {
      const v = JSON.parse(rel?.value || "[]");
      return Array.isArray(v) ? v.map(String) : [];
    } catch {
      return [];
    }
  })();
  const [faqNodes, reviewNodes, relInfo] = await Promise.all([
    gql<any>(`query PfFaqs { faqs: metaobjects(type: "vm_product_faq", first: 100) { nodes { id fields { key value } } } }`, {}),
    gql<any>(`query PfReviews { reviews: metaobjects(type: "vm_product_review", first: 100) { nodes { id fields { key value } } } }`, {}),
    infoByIds(relIds),
  ]);
  const fieldsOf = (n: any) => {
    const f: Record<string, string> = {};
    for (const fld of n.fields ?? []) if (fld.value != null) f[fld.key] = fld.value;
    return f;
  };
  const faqs = (faqNodes.faqs?.nodes ?? [])
    .filter((n: any) => faqIds.includes(n.id))
    .map((n: any) => {
      const f = fieldsOf(n);
      return { id: n.id, question: f.question || "", answer: f.answer || "", position: parseInt(f.position || "0", 10) || 0 };
    })
    .sort((a: any, b: any) => a.position - b.position);
  const reviews = (reviewNodes.reviews?.nodes ?? [])
    .map((n: any) => ({ id: n.id, f: fieldsOf(n) }))
    .filter((x: any) => x.f.product === id)
    .map((x: any) => ({
      id: x.id,
      author: x.f.author || "",
      rating: parseInt(x.f.rating || "5", 10) || 5,
      title: x.f.title || "",
      body: x.f.body || "",
      verified: x.f.verified !== "false",
      position: parseInt(x.f.position || "0", 10) || 0,
    }))
    .sort((a: any, b: any) => a.position - b.position);
  const related = relIds
    .map((rid: string) => relInfo[rid])
    .filter(Boolean)
    .map((r: any) => ({ handle: r.handle, title: r.title }));
  return {
    id: p.id as string,
    title: p.title as string,
    handle: p.handle as string,
    descriptionHtml: p.descriptionHtml || "",
    seoTitle: p.seo?.title || "",
    seoDescription: p.seo?.description || "",
    vendor: p.vendor || "",
    productType: p.productType || "",
    tags: (p.tags ?? []).join(", "),
    status: p.status as string,
    options: (p.options ?? []).map((o: any) => ({ id: o.id, name: o.name, values: o.values ?? [] })),
    variants: (p.variants?.nodes ?? []).map((v: any) => {
      // Weight comes back in the unit it was stored in — normalise to kg.
      const w = v.inventoryItem?.measurement?.weight;
      let weightKg = "";
      if (w && typeof w.value === "number") {
        const unit = String(w.unit || "KILOGRAMS").toUpperCase();
        const kg = unit === "GRAMS" ? w.value / 1000 : unit === "OUNCES" ? w.value * 0.0283495 : unit === "POUNDS" ? w.value * 0.453592 : w.value;
        weightKg = String(Math.round(kg * 1000) / 1000);
      }
      return {
        id: v.id as string,
        title: v.title as string,
        price: v.price || "",
        compareAtPrice: parseFloat(String(v.compareAtPrice || "0")) > 0 ? v.compareAtPrice : "",
        sku: v.sku || "",
        barcode: v.barcode || "",
        inventoryQuantity: typeof v.inventoryQuantity === "number" ? v.inventoryQuantity : 0,
        inventoryItemId: v.inventoryItem?.id || "",
        cost: v.inventoryItem?.unitCost?.amount || "",
        weightKg,
        requiresShipping: v.inventoryItem?.requiresShipping !== false,
        tracked: v.inventoryItem?.tracked !== false,
        taxable: v.taxable !== false,
        selectedOptions: (v.selectedOptions ?? []).map((s: any) => ({ name: s.name, value: s.value })),
        media: (v.media?.nodes ?? [])
          .filter((m: any) => m.image?.url)
          .map((m: any) => ({ id: m.id as string, url: m.image.url as string })),
      };
    }),
    media: (p.media?.nodes ?? [])
      .filter((m: any) => m.image?.url)
      .map((m: any) => ({ id: m.id as string, url: m.image.url as string, altText: m.image.altText || "" })),
    collections: (p.collections?.nodes ?? []).map((c: any) => c.id as string),
    vape: mf,
    faqs,
    reviews,
    related,
  };
}

function vapeMetafieldEntries(productId: string, vape: Record<string, any>): any[] {
  const out: any[] = [];
  const put = (key: string, type: string, value: any) => {
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
  put("rating", "number_decimal", vape.rating);
  put("review_count", "number_integer", vape.review_count);
  if (Array.isArray(vape.nicotine_options))
    out.push({ ownerId: productId, namespace: "vape", key: "nicotine_options", type: "list.single_line_text_field", value: JSON.stringify(vape.nicotine_options) });
  if (Array.isArray(vape.custom_specs))
    out.push({ ownerId: productId, namespace: "vape", key: "custom_specs", type: "json", value: JSON.stringify(vape.custom_specs) });
  if (Array.isArray(vape.flavors))
    out.push({ ownerId: productId, namespace: "vape", key: "flavors", type: "list.metaobject_reference", value: JSON.stringify(vape.flavors) });
  return out;
}

async function setProductMetafields(productId: string, entries: any[]): Promise<void> {
  if (!entries.length) return;
  const d = await gql<any>(
    `mutation MfSet($metafields: [MetafieldsSetInput!]!) {
       metafieldsSet(metafields: $metafields) { metafields { id } userErrors { message } }
     }`,
    { metafields: entries }
  );
  const errs = d.metafieldsSet?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
}

async function deleteProductMetafields(productId: string, keys: string[], namespace = "vape"): Promise<void> {
  if (!keys.length) return;
  const d = await gql<any>(
    `mutation MfDel($metafields: [MetafieldIdentifierInput!]!) {
       metafieldsDelete(metafields: $metafields) { deletedMetafields { key namespace } userErrors { message } }
     }`,
    { metafields: keys.map((key) => ({ ownerId: productId, namespace, key })) }
  );
  const errs = d.metafieldsDelete?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
}

/* ------------------------------------------------------------------ */
/*  Bulk metafield sheet (Excel-style editing)                         */
/* ------------------------------------------------------------------ */

// The vape.* keys the bulk sheet edits, with their Shopify types.
// Deliberately the same editable set as the product editor: rating /
// review_count are NOT here (reviews now live in vm_product_review
// metaobjects, PR #47), and flavours stay in the flavour picker.
const BULK_FIELD_TYPES: Record<string, string> = {
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

// Related products lives outside the vape namespace (Shopify's own
// product-recommendation namespace), so the sheet reads/writes it
// separately from the vape.* keys above.
const RELATED_NAMESPACE = "shopify--discovery--product_recommendation";
const RELATED_KEY = "related_products";

export const BULK_PAGE_SIZE = 25;

function sanitizeBulkSearch(raw: string): string | null {
  const s = (raw || "").replace(/["\\]/g, "").trim().slice(0, 100);
  return s ? s : null;
}

export async function listBulkProducts(opts: { cursor?: string | null; search?: string; status?: string }) {
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
  const d = await gql<any>(
    `query BulkList${varDefs.length ? `(${varDefs.join(", ")})` : ""} {
       products(${args.join(", ")}) {
         pageInfo { hasNextPage endCursor }
         nodes {
           id title status
           vapeMf: metafields(first: 30, namespace: "vape") { nodes { key value } }
           relMf: metafields(first: 10, namespace: "${RELATED_NAMESPACE}") { nodes { key value } }
         }
       }
     }`,
    vars
  );
  const nodes = d.products?.nodes ?? [];
  // Resolve related-product IDs to handles in one nodes query, so the
  // sheet shows (and accepts) plain link names, not GIDs.
  const relatedIds = new Set<string>();
  const relatedByProduct: Record<string, string[]> = {};
  for (const p of nodes) {
    const rel = (p.relMf?.nodes ?? []).find((m: any) => m.key === RELATED_KEY);
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
    products: nodes.map((p: any) => {
      const vape: Record<string, string> = {};
      for (const m of p.vapeMf?.nodes ?? []) {
        if (m.key in BULK_FIELD_TYPES) vape[m.key] = m.value ?? "";
      }
      return {
        id: p.id as string,
        title: p.title as string,
        status: p.status as string,
        vape,
        related: (relatedByProduct[p.id] || []).map((id) => ({
          handle: infoById[id]?.handle || id,
          title: infoById[id]?.title || id,
        })),
      };
    }),
    pageInfo: {
      hasNextPage: !!d.products?.pageInfo?.hasNextPage,
      endCursor: (d.products?.pageInfo?.endCursor as string) || null,
    },
  };
}

export async function searchBulkProducts(term: string) {
  const q = sanitizeBulkSearch(term);
  if (!q) return { products: [] };
  const d = await gql<any>(
    `query BulkSearch($query: String) {
       products(first: 10, query: $query) { nodes { id title handle } }
     }`,
    { query: q }
  );
  return {
    products: (d.products?.nodes ?? []).map((p: any) => ({
      id: p.id as string,
      title: p.title as string,
      handle: p.handle as string,
    })),
  };
}

async function infoByIds(ids: string[]): Promise<Record<string, { handle: string; title: string }>> {
  if (!ids.length) return {};
  const d = await gql<any>(
    `query NodesById($ids: [ID!]!) { nodes(ids: $ids) { ... on Product { id handle title } } }`,
    { ids }
  );
  const out: Record<string, { handle: string; title: string }> = {};
  for (const n of d.nodes ?? []) if (n?.id && n?.handle) out[n.id] = { handle: n.handle, title: n.title || n.handle };
  return out;
}

async function productIdByHandle(handle: string): Promise<string | null> {
  const d = await gql<any>(
    `query ByHandle($identifier: ProductIdentifierInput!) {
       productByIdentifier(identifier: $identifier) { id }
     }`,
    { identifier: { handle } }
  );
  return d.productByIdentifier?.id || null;
}

export async function saveBulkMetafields(
  changes: { id: string; title?: string; values: Record<string, string> }[]
): Promise<{ updated: number }> {
  let updated = 0;
  // Small batches: fast enough, gentle on the Admin API.
  for (let i = 0; i < changes.length; i += 5) {
    const batch = changes.slice(i, i + 5);
    await Promise.all(
      batch.map(async (c) => {
        const sets: any[] = [];
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
          if (!type) continue; // never write an unknown key
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
            // Client sends the flavour metaobject IDs as a JSON list.
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

async function addMedia(productId: string, sources: string[]): Promise<string[]> {
  const media = sources.filter(Boolean).map((originalSource) => ({ originalSource, mediaContentType: "IMAGE" }));
  if (!media.length) return [];
  const d = await gql<any>(
    `mutation MediaAdd($productId: ID!, $media: [CreateMediaInput!]!) {
       productCreateMedia(productId: $productId, media: $media) { media { id } mediaUserErrors { message } }
     }`,
    { productId, media }
  );
  const errs = d.productCreateMedia?.mediaUserErrors ?? [];
  if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
  // Media come back in request order, so the caller can match alts by index.
  return (d.productCreateMedia?.media ?? []).map((m: any) => m.id as string).filter(Boolean);
}

/* Alt text for product images. fileUpdate is the current (non-deprecated)
   path on both the site's 2025-07 API and the 2026-10 schema, unlike
   productCreateMedia which the connector refuses as deprecated. */
async function setMediaAlts(alts: { id: string; alt: string }[]): Promise<void> {
  const files = (alts || []).filter((a) => a.id && a.alt !== undefined && a.alt !== null);
  if (!files.length) return;
  const d = await gql<any>(
    `mutation AltSet($files: [FileUpdateInput!]!) {
       fileUpdate(files: $files) { files { id } userErrors { message } }
     }`,
    { files: files.map((f) => ({ id: f.id, alt: f.alt })) }
  );
  const errs = d.fileUpdate?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
}

/* Variant images: wanted entries carry a variantId (existing variant) or an
   options tuple (newly created variant, resolved by the caller into IDs).
   current maps variantId -> attached media IDs. Detach-then-append keeps
   exactly one image per variant. */
async function applyVariantMedia(
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
      const d = await gql<any>(
        `mutation VarMediaDetach($productId: ID!, $variantMedia: [ProductVariantDetachMediaInput!]!) {
           productVariantDetachMedia(productId: $productId, variantMedia: $variantMedia) { userErrors { message } }
         }`,
        { productId, variantMedia: [{ variantId: w.variantId, mediaIds: cur }] }
      );
      const errs = d.productVariantDetachMedia?.userErrors ?? [];
      if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
    }
    if (want.length) {
      const d = await gql<any>(
        `mutation VarMediaAppend($productId: ID!, $variantMedia: [ProductVariantAppendMediaInput!]!) {
           productVariantAppendMedia(productId: $productId, variantMedia: $variantMedia) { userErrors { message } }
         }`,
        { productId, variantMedia: [{ variantId: w.variantId, mediaIds: want }] }
      );
      const errs = d.productVariantAppendMedia?.userErrors ?? [];
      if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
    }
  }
}

/* Product FAQs (vm_product_faq entries linked from vape.product_faqs).
   The panel sends the desired end-state list; this diffs against existing
   entries, creates/updates/deletes, then rewrites the link metafield. */
async function saveProductFaqs(
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

/* Product reviews on the entry page use the same vm_product_review entries
   as the Reviews tab; the panel sends the desired end-state list. */
async function saveProductReviews(
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

/* Related products (Shopify's discovery namespace). Handles resolve to
   product GIDs; unknown handles fail loudly, never silently skipped. */
async function saveRelatedHandles(productId: string, handles: string[]): Promise<void> {
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

async function setInventory(itemId: string, locationId: string, quantity: number): Promise<void> {
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

/* Compare-at must be a real "was" price: 0 / "0" / "" means "no compare-at",
   never write 0.00 to Shopify (2026-11-07 audit: 1,559 variants carry a
   0.00 compare-at, and the panel used to write "0" from its own form). */
function validCompareAt(v: unknown): string | null {
  const n = parseFloat(String(v ?? ""));
  return Number.isFinite(n) && n > 0 ? String(n) : null;
}

/* URL slug from a typed handle (create used to drop it silently — the
   product then got an auto handle the client never asked for). */
function slugify(s: string): string {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function bulkUpdateVariants(productId: string, variants: any[]): Promise<void> {
  const clean = variants.map((v: any) => {
    const out: Record<string, unknown> = { id: v.id };
    if (v.price !== undefined && v.price !== "") out.price = String(v.price);
    if (v.compareAtPrice !== undefined) out.compareAtPrice = validCompareAt(v.compareAtPrice);
    // SKU / barcode ride the bulk input (inventoryItem.sku + barcodes) —
    // the old classic productVariantUpdate call silently swallowed schema
    // rejections, so typed SKUs vanished. Only send non-empty values.
    if (typeof v.sku === "string" && v.sku.trim()) out.inventoryItem = { sku: v.sku.trim() };
    if (typeof v.barcode === "string" && v.barcode.trim()) out.barcodes = [{ value: v.barcode.trim() }];
    if (typeof v.taxable === "boolean") out.taxable = v.taxable;
    return out;
  });
  const d = await gql<any>(
    `mutation VarBulk($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
       productVariantsBulkUpdate(productId: $productId, variants: $variants) { productVariants { id } userErrors { message } }
     }`,
    { productId, variants: clean }
  );
  const errs = d.productVariantsBulkUpdate?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
}

// Bulk variant input shape, verified live against Shopify (2026-10 schema;
// the same ProductVariantsBulkInput type exists since 2024-07):
// optionValues [{optionName, name}], price, compareAtPrice,
// inventoryItem {sku}, barcodes [{value}], inventoryQuantities.
// NOTE: bulkCreate does NOT create missing option NAMES ("Option does not
// exist") — create them first via productOptionsCreate. New option VALUES
// are added automatically by bulkCreate.
function comboToBulkInput(v: any, locationId: string | undefined): Record<string, unknown> {
  const out: Record<string, unknown> = { price: String(v.price || "0") };
  if (Array.isArray(v.optionValues) && v.optionValues.length) out.optionValues = v.optionValues;
  const cat = validCompareAt(v.compareAtPrice);
  if (cat) out.compareAtPrice = cat;
  // Cost / weight / shipping / tracking live on the inventory item.
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

async function createProductOptions(productId: string, options: any[]): Promise<void> {
  const clean = (options || [])
    .filter((o: any) => o.name && Array.isArray(o.values) && o.values.length)
    .map((o: any) => ({ name: o.name, values: o.values.map((v: string) => ({ name: v })) }));
  if (!clean.length) return;
  const d = await gql<any>(
    `mutation OptCreate($productId: ID!, $options: [ProductOptionInput!]!) {
       productOptionsCreate(productId: $productId, options: $options) { product { id } userErrors { message } }
     }`,
    { productId, options: clean }
  );
  const errs = d.productOptionsCreate?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
}

/* Cost / weight / shipping / tracking live on the variant's inventory
   item (inventoryItemUpdate). Only fields the client actually set are
   sent; the rest stay untouched. */
async function updateVariantInventory(items: any[]): Promise<void> {
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
    const d = await gql<any>(
      `mutation InvItemUpdate($id: ID!, $input: InventoryItemInput!) {
         inventoryItemUpdate(id: $id, input: $input) { inventoryItem { id } userErrors { message } }
       }`,
      { id: it.inventoryItemId, input }
    );
    const errs = d.inventoryItemUpdate?.userErrors ?? [];
    if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
  }
}

async function bulkCreateVariants(productId: string, variants: any[], locationId: string | undefined, removeStandalone: boolean): Promise<{ id: string; selectedOptions: { name: string; value: string }[] }[]> {
  if (!variants.length) return [];
  const d = await gql<any>(
    `mutation VarCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!, $strategy: ProductVariantsBulkCreateStrategy) {
       productVariantsBulkCreate(productId: $productId, variants: $variants, strategy: $strategy) { productVariants { id selectedOptions { name value } } userErrors { message } }
     }`,
    { productId, variants: variants.map((v: any) => comboToBulkInput(v, locationId)), strategy: removeStandalone ? "REMOVE_STANDALONE_VARIANT" : "DEFAULT" }
  );
  const errs = d.productVariantsBulkCreate?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
  return (d.productVariantsBulkCreate?.productVariants ?? []).map((v: any) => ({
    id: v.id as string,
    selectedOptions: (v.selectedOptions ?? []).map((s: any) => ({ name: s.name, value: s.value })),
  }));
}

/* Resolve entry-page variant-media entries to variant IDs. Entries carry a
   variantId (existing variant) or an options tuple (new variant, matched
   against created/existing variants by selected options). */
function resolveVariantMedia(
  entries: { variantId?: string; options?: string[]; mediaId: string | null }[],
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

export async function createProduct(p: any): Promise<SaveResult> {
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
  // Custom slug (was silently dropped on create — the product got an
  // auto handle instead). A taken handle fails loudly, which is correct.
  if (p.handle && slugify(p.handle)) baseInput.handle = slugify(p.handle);
  const first: Record<string, unknown> = { price: String(p.price || "0") };
  const cat = validCompareAt(p.compareAtPrice);
  if (cat) first.compareAtPrice = cat;
  if (p.sku) first.sku = String(p.sku);
  if (p.barcode) first.barcode = String(p.barcode);
  if (p.locationId && p.inventoryQuantity !== undefined && p.inventoryQuantity !== "")
    first.inventoryQuantities = [{ availableQuantity: parseInt(String(p.inventoryQuantity), 10) || 0, locationId: p.locationId }];
  // Proven create flow (verified live): bare create -> productOptionsCreate
  // -> bulkCreate combos with REMOVE_STANDALONE_VARIANT. ProductInput.variants
  // is version-fragile, so it is deliberately not used.
  const d = await gql<any>(
    `mutation ProductCreate($input: ProductInput!) {
       productCreate(input: $input) { product { id handle } userErrors { message } }
     }`,
    { input: baseInput }
  );
  const errs = d.productCreate?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
  const id = d.productCreate.product.id as string;
  let createdVariants: { id: string; selectedOptions: { name: string; value: string }[] }[] = [];
  if (Array.isArray(p.options) && p.options.length) await createProductOptions(id, p.options);
  if (Array.isArray(p.variants) && p.variants.length) {
    createdVariants = await bulkCreateVariants(id, p.variants, p.locationId, true);
  } else {
    const detail = await getProductDetail(id);
    const dv = detail.variants[0];
    if (dv) {
      createdVariants = [{ id: dv.id, selectedOptions: (dv.selectedOptions || []).map((s: any) => ({ name: s.name, value: s.value })) }];
      // No-option create: SKU/barcode were built into `first` but never
      // applied (bulkUpdateVariants used to drop them). Pass them through.
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
    await gql<any>(
      `mutation ProdColl($id: ID!, $product: ProductUpdateInput!) {
         productUpdate(id: $id, product: $product) { product { id } userErrors { message } }
       }`,
      { id, product: { collectionsToJoin: p.collectionIds } }
    );
  }
  if (p.vape) await setProductMetafields(id, vapeMetafieldEntries(id, p.vape));
  // Unified entry page extras (all optional; absent keys mean "not edited").
  const newAlts = newMediaIds.map((mid, i) => ({ id: mid, alt: (p.mediaAlts || [])[i] || "" })).filter((a) => a.alt !== "");
  if (newAlts.length || (p.mediaAltUpdates || []).length)
    await setMediaAlts([...newAlts, ...(p.mediaAltUpdates || [])]);
  if (Array.isArray(p.variantMedia) && p.variantMedia.length) {
    // New-upload images have no ID yet on the panel; map source -> created ID.
    const translated = p.variantMedia.map((e: any) => {
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
  return { message: "Product created." };
}

export async function updateProduct(p: any): Promise<SaveResult> {
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
  const coll = await getProductDetail(p.id);
  let createdVariants: { id: string; selectedOptions: { name: string; value: string }[] }[] = [];
  const join = (p.collectionIds || []).filter((x: string) => !coll.collections.includes(x));
  const leave = coll.collections.filter((x: string) => !(p.collectionIds || []).includes(x));
  if (join.length) input.collectionsToJoin = join;
  if (leave.length) input.collectionsToLeave = leave;
  const d = await gql<any>(
    `mutation ProdUpdate($id: ID!, $product: ProductUpdateInput!) {
       productUpdate(id: $id, product: $product) { product { id } userErrors { message } }
     }`,
    { id: p.id, product: input }
  );
  const errs = d.productUpdate?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));

  if (Array.isArray(p.variantUpdates) && p.variantUpdates.length) {
    // SKU/barcode now ride bulkUpdateVariants (inventoryItem.sku +
    // barcodes); the old classic productVariantUpdate fallback silently
    // swallowed rejections, so typed SKUs vanished.
    await bulkUpdateVariants(p.id, p.variantUpdates);
  }
  if (Array.isArray(p.newVariants) && p.newVariants.length) {
    // bulkCreate needs the option NAMES to exist first; new values are added
    // automatically. coll (fetched above) carries the current options.
    const existingNames = new Set((coll.options || []).map((o: any) => o.name));
    const wanted = new Map<string, string[]>();
    for (const v of p.newVariants)
      for (const ov of v.optionValues || []) {
        if (!wanted.has(ov.optionName)) wanted.set(ov.optionName, []);
        if (!wanted.get(ov.optionName)!.includes(ov.name)) wanted.get(ov.optionName)!.push(ov.name);
      }
    const missing = [...wanted.entries()]
      .filter(([name]) => !existingNames.has(name))
      .map(([name, values]) => ({ name, values }));
    if (missing.length) await createProductOptions(p.id, missing);
    createdVariants = await bulkCreateVariants(p.id, p.newVariants, p.locationId, false);
  }
  if (Array.isArray(p.deleteVariantIds) && p.deleteVariantIds.length) {
    for (const vid of p.deleteVariantIds) {
      await gql<any>(
        `mutation VarDelete($id: ID!) { productVariantDelete(id: $id) { deletedProductVariantId userErrors { message } } }`,
        { id: vid }
      );
    }
  }
  if (Array.isArray(p.deleteMediaIds) && p.deleteMediaIds.length) {
    const d4 = await gql<any>(
      `mutation MediaDel($productId: ID!, $mediaIds: [ID!]!) {
         productDeleteMedia(productId: $productId, mediaIds: $mediaIds) { deletedMediaIds mediaUserErrors { message } }
       }`,
      { productId: p.id, mediaIds: p.deleteMediaIds }
    );
    const errs4 = d4.productDeleteMedia?.mediaUserErrors ?? [];
    if (errs4.length) throw new Error(errs4.map((e: any) => e.message).join("; "));
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
    // Cost / weight / shipping / tracking ride the same payload.
    await updateVariantInventory(p.inventoryUpdates);
  }
  if (Array.isArray(p.vapeDeleteKeys) && p.vapeDeleteKeys.length)
    await deleteProductMetafields(p.id, p.vapeDeleteKeys);
  if (p.vape) await setProductMetafields(p.id, vapeMetafieldEntries(p.id, p.vape));
  // Unified entry page extras (absent keys mean "not edited").
  const newAlts = newMediaIds.map((mid, i) => ({ id: mid, alt: (p.mediaAlts || [])[i] || "" })).filter((a) => a.alt !== "");
  if (newAlts.length || (p.mediaAltUpdates || []).length)
    await setMediaAlts([...newAlts, ...(p.mediaAltUpdates || [])]);
  if (Array.isArray(p.variantMedia) && p.variantMedia.length) {
    const allVariants = [
      ...(coll.variants || []).map((v: any) => ({ id: v.id, selectedOptions: v.selectedOptions || [] })),
      ...createdVariants,
    ];
    const current: Record<string, string[]> = {};
    for (const v of coll.variants || []) current[v.id] = (v.media || []).map((m: any) => m.id);
    // New-upload images have no ID yet on the panel; map source -> created ID.
    const translated = p.variantMedia.map((e: any) => {
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
  return { message: "Product updated." };
}

export async function deleteProduct(id: string): Promise<SaveResult> {
  const d = await gqlTry([
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
  if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
  return { message: "Product deleted." };
}

export async function createCollection(title: string, opts?: { descriptionHtml?: string; sortOrder?: string }): Promise<SaveResult> {
  const input: Record<string, unknown> = { title };
  if (opts?.descriptionHtml) input.descriptionHtml = opts.descriptionHtml;
  const so = validSortOrder(opts?.sortOrder);
  if (so) input.sortOrder = so;
  const d = await gql<any>(
    `mutation CollCreate($collection: CollectionInput!) {
       collectionCreate(input: $collection) { collection { id } userErrors { message } }
     }`,
    { collection: input }
  );
  const errs = d.collectionCreate?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
  return { message: "Collection created.", id: d.collectionCreate?.collection?.id };
}

export async function deleteCollection(id: string): Promise<SaveResult> {
  const d = await gqlTry([
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
  if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
  return { message: "Collection deleted." };
}
