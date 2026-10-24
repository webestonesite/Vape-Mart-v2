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
    products(first: 250) {
      nodes {
        id title handle status featuredImage { url }
        variants(first: 1) { nodes { id price compareAtPrice inventoryQuantity inventoryItem { id } } }
      }
    }
    locations(first: 5) { nodes { id name } }
    files(first: 40, sortKey: CREATED_AT, reverse: true) {
      nodes { id ... on MediaImage { image { url } } }
    }
    blog(id: "${BLOG_ID}") {
      articles(first: 50) {
        nodes {
          id handle title bodyHtml: body summary tags publishedAt
          metafields(first: 10, namespace: "vapemart") { nodes { key type value } }
        }
      }
    }
    pages(first: 30) { nodes { id handle title body } }
    menus(first: 10) { nodes { id title handle } }
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

export async function getPanelData() {
  const settings = await fetchShopSettings();
  const d = await gql<any>(PANEL_QUERY);

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

  const products = (d.products?.nodes ?? []).map((p: any) => {
    const v = p.variants?.nodes?.[0] ?? {};
    return {
      id: p.id as string,
      title: p.title as string,
      handle: p.handle as string,
      status: p.status as string,
      image: p.featuredImage?.url || "",
      variantId: v.id || "",
      price: v.price || "",
      compareAtPrice: v.compareAtPrice || "",
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

  return {
    settings: {
      announcements: settings.announcements,
      phone: settings.phone,
      footerText: settings.footerText,
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
    locationId: d.locations?.nodes?.[0]?.id || "",
  };
}

/* ------------------------------------------------------------------ */
/*  Save actions                                                       */
/* ------------------------------------------------------------------ */

export interface SaveResult {
  message: string;
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
      const article: Record<string, unknown> = {
        title: p.title,
        body: p.body || "",
        summary: p.summary || "",
        tags: String(p.tags || "").split(",").map((x: string) => x.trim()).filter(Boolean),
        isPublished: true,
      };
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
      return { message: (id && p.id ? "Blog post updated." : "Blog post published.") + warning };
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
  const d = await gql<any>(`
    query PanelExtras {
      collections(first: 60) {
        nodes { id title handle productsCount { count } }
      }
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
    }
  `);
  const flavors = (d.flavors?.nodes ?? []).map((n: any) => {
    const f: Record<string, string> = {};
    for (const fld of n.fields ?? []) if (fld.value != null) f[fld.key] = fld.value;
    return { id: n.id as string, name: f.name || "", color: f.color || "" };
  });
  return {
    collections: (d.collections?.nodes ?? []).map((c: any) => ({
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
  };
}

export async function getProductDetail(id: string) {
  const d = await gql<any>(
    `query ProductDetail($id: ID!) {
       product(id: $id) {
         id title handle descriptionHtml vendor productType tags status
         options { id name position values }
         variants(first: 50) {
           nodes {
             id title price compareAtPrice sku barcode inventoryQuantity
             inventoryItem { id }
             selectedOptions { name value }
           }
         }
         media(first: 30) {
           nodes { ... on MediaImage { id image { url altText } } }
         }
         collections(first: 30) { nodes { id title handle } }
         metafields(first: 50, namespace: "vape") { nodes { key type value } }
       }
     }`,
    { id }
  );
  const p = d.product;
  if (!p) throw new Error("Product not found.");
  const mf: Record<string, string> = {};
  for (const m of p.metafields?.nodes ?? []) mf[m.key] = m.value;
  return {
    id: p.id as string,
    title: p.title as string,
    handle: p.handle as string,
    descriptionHtml: p.descriptionHtml || "",
    vendor: p.vendor || "",
    productType: p.productType || "",
    tags: (p.tags ?? []).join(", "),
    status: p.status as string,
    options: (p.options ?? []).map((o: any) => ({ id: o.id, name: o.name, values: o.values ?? [] })),
    variants: (p.variants?.nodes ?? []).map((v: any) => ({
      id: v.id as string,
      title: v.title as string,
      price: v.price || "",
      compareAtPrice: v.compareAtPrice || "",
      sku: v.sku || "",
      barcode: v.barcode || "",
      inventoryQuantity: typeof v.inventoryQuantity === "number" ? v.inventoryQuantity : 0,
      inventoryItemId: v.inventoryItem?.id || "",
      selectedOptions: (v.selectedOptions ?? []).map((s: any) => ({ name: s.name, value: s.value })),
    })),
    media: (p.media?.nodes ?? [])
      .filter((m: any) => m.image?.url)
      .map((m: any) => ({ id: m.id as string, url: m.image.url as string, altText: m.image.altText || "" })),
    collections: (p.collections?.nodes ?? []).map((c: any) => c.id as string),
    vape: mf,
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
  put("puff_count", "number_integer", vape.puff_count);
  put("nicotine_strength", "single_line_text_field", vape.nicotine_strength);
  put("battery", "single_line_text_field", vape.battery);
  put("coil", "single_line_text_field", vape.coil);
  put("charging", "single_line_text_field", vape.charging);
  put("e_liquid", "single_line_text_field", vape.e_liquid);
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
  if (Array.isArray(vape.flavours))
    out.push({ ownerId: productId, namespace: "vape", key: "flavours", type: "list.metaobject_reference", value: JSON.stringify(vape.flavours) });
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

async function addMedia(productId: string, sources: string[]): Promise<void> {
  const media = sources.filter(Boolean).map((originalSource) => ({ originalSource, mediaContentType: "IMAGE" }));
  if (!media.length) return;
  const d = await gql<any>(
    `mutation MediaAdd($productId: ID!, $media: [CreateMediaInput!]!) {
       productCreateMedia(productId: $productId, media: $media) { media { id } mediaUserErrors { message } }
     }`,
    { productId, media }
  );
  const errs = d.productCreateMedia?.mediaUserErrors ?? [];
  if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
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

async function bulkUpdateVariants(productId: string, variants: any[]): Promise<void> {
  const clean = variants.map((v: any) => {
    const out: Record<string, unknown> = { id: v.id };
    if (v.price !== undefined && v.price !== "") out.price = String(v.price);
    if (v.compareAtPrice !== undefined) out.compareAtPrice = v.compareAtPrice === "" ? null : String(v.compareAtPrice);
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

export async function createProduct(p: any): Promise<SaveResult> {
  const baseInput: Record<string, unknown> = {
    title: p.title,
    descriptionHtml: p.descriptionHtml || "",
    vendor: p.vendor || "",
    productType: p.productType || "",
    tags: String(p.tags || "").split(",").map((x: string) => x.trim()).filter(Boolean),
    status: p.status || "DRAFT",
  };
  const first: Record<string, unknown> = { price: String(p.price || "0") };
  if (p.compareAtPrice) first.compareAtPrice = String(p.compareAtPrice);
  if (p.sku) first.sku = String(p.sku);
  if (p.barcode) first.barcode = String(p.barcode);
  if (p.locationId && p.inventoryQuantity !== undefined && p.inventoryQuantity !== "")
    first.inventoryQuantities = [{ availableQuantity: parseInt(String(p.inventoryQuantity), 10) || 0, locationId: p.locationId }];
  if (Array.isArray(p.optionValues) && p.optionValues.length) first.options = p.optionValues;
  let id: string;
  try {
    const input = { ...baseInput, variants: [first] };
    if (Array.isArray(p.options) && p.options.length)
      (input as any).options = p.options.map((o: any) => ({ name: o.name, values: (o.values || []).map((v: string) => ({ name: v })) }));
    const d = await gql<any>(
      `mutation ProductCreate($input: ProductInput!) {
         productCreate(input: $input) { product { id handle } userErrors { message } }
       }`,
      { input }
    );
    const errs = d.productCreate?.userErrors ?? [];
    if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
    id = d.productCreate.product.id as string;
  } catch {
    // Newer API versions dropped ProductInput.variants: create bare, then
    // price/stock the auto-created default variant.
    const d = await gql<any>(
      `mutation ProductCreate($input: ProductInput!) {
         productCreate(input: $input) { product { id handle } userErrors { message } }
       }`,
      { input: baseInput }
    );
    const errs = d.productCreate?.userErrors ?? [];
    if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
    id = d.productCreate.product.id as string;
    const detail = await getProductDetail(id);
    const dv = detail.variants[0];
    if (dv) {
      await bulkUpdateVariants(id, [{ id: dv.id, price: first.price, compareAtPrice: first.compareAtPrice }]);
      if (p.locationId && p.inventoryQuantity !== undefined && p.inventoryQuantity !== "" && dv.inventoryItemId)
        await setInventory(dv.inventoryItemId, p.locationId, parseInt(String(p.inventoryQuantity), 10) || 0);
    }
  }
  if (Array.isArray(p.mediaSources) && p.mediaSources.length) await addMedia(id, p.mediaSources);
  if (Array.isArray(p.collectionIds) && p.collectionIds.length) {
    await gql<any>(
      `mutation ProdColl($id: ID!, $product: ProductUpdateInput!) {
         productUpdate(id: $id, product: $product) { product { id } userErrors { message } }
       }`,
      { id, product: { collectionsToJoin: p.collectionIds } }
    );
  }
  if (p.vape) await setProductMetafields(id, vapeMetafieldEntries(id, p.vape));
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
  const coll = await getProductDetail(p.id);
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
    await bulkUpdateVariants(p.id, p.variantUpdates);
    // SKU/barcode live on the variant in older API versions only; try the
    // classic single-variant update, and ignore a schema rejection.
    for (const v of p.variantUpdates) {
      if (v.sku === undefined && v.barcode === undefined) continue;
      try {
        await gql<any>(
          `mutation VarSingle($input: ProductVariantUpdateInput!) {
             productVariantUpdate(input: $input) { productVariant { id } userErrors { message } }
           }`,
          { input: { id: v.id, sku: v.sku || null, barcode: v.barcode || null } }
        );
      } catch {
        /* newer API: SKU/barcode moved off the variant input — skip */
      }
    }
  }
  if (Array.isArray(p.newVariants) && p.newVariants.length) {
    const variants = p.newVariants.map((v: any) => {
      const out: Record<string, unknown> = { price: String(v.price || "0") };
      if (v.compareAtPrice) out.compareAtPrice = String(v.compareAtPrice);
      if (v.sku) out.sku = String(v.sku);
      if (v.barcode) out.barcode = String(v.barcode);
      if (v.options) out.options = v.options;
      if (p.locationId && v.inventoryQuantity !== undefined && v.inventoryQuantity !== "")
        out.inventoryQuantities = [{ availableQuantity: parseInt(String(v.inventoryQuantity), 10) || 0, locationId: p.locationId }];
      return out;
    });
    const d3 = await gql<any>(
      `mutation VarCreate($productId: ID!, $variants: [ProductVariantCreateInput!]!) {
         productVariantsBulkCreate(productId: $productId, variants: $variants) { productVariants { id } userErrors { message } }
       }`,
      { productId: p.id, variants }
    );
    const errs3 = d3.productVariantsBulkCreate?.userErrors ?? [];
    if (errs3.length) throw new Error(errs3.map((e: any) => e.message).join("; "));
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
  if (Array.isArray(p.mediaSources) && p.mediaSources.length) await addMedia(p.id, p.mediaSources);
  if (Array.isArray(p.inventoryUpdates) && p.inventoryUpdates.length && p.locationId) {
    for (const u of p.inventoryUpdates) {
      if (!u.inventoryItemId) continue;
      await setInventory(u.inventoryItemId, p.locationId, parseInt(String(u.quantity), 10) || 0);
    }
  }
  if (p.vape) await setProductMetafields(p.id, vapeMetafieldEntries(p.id, p.vape));
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

export async function createCollection(title: string): Promise<SaveResult> {
  const d = await gql<any>(
    `mutation CollCreate($collection: CollectionInput!) {
       collectionCreate(input: $collection) { collection { id } userErrors { message } }
     }`,
    { collection: { title } }
  );
  const errs = d.collectionCreate?.userErrors ?? [];
  if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
  return { message: "Collection created." };
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
