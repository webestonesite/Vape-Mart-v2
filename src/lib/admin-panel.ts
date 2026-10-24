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
        const variant: Record<string, unknown> = { id: p.variantId };
        if (p.price !== undefined && p.price !== "") variant.price = String(p.price);
        if (p.compareAtPrice !== undefined) variant.compareAtPrice = p.compareAtPrice === "" ? null : String(p.compareAtPrice);
        const d = await gql<any>(
          `mutation VarUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
             productVariantsBulkUpdate(productId: $productId, variants: $variants) { productVariants { id } userErrors { message } }
           }`,
          { productId: p.id, variants: [variant] }
        );
        const errs = d.productVariantsBulkUpdate?.userErrors ?? [];
        if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
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
        const d = await gql<any>(
          `mutation InvSet($input: InventorySetQuantitiesInput!) {
             inventorySetQuantities(input: $input) { inventoryAdjustmentGroup { id } userErrors { message } }
           }`,
          {
            input: {
              name: "available",
              reason: "correction",
              ignoreCompareQuantity: true,
              quantities: [{ inventoryItemId: p.inventoryItemId, locationId: p.locationId, quantity: parseInt(String(p.inventoryQuantity), 10) || 0 }],
            },
          }
        );
        const errs = d.inventorySetQuantities?.userErrors ?? [];
        if (errs.length) throw new Error(errs.map((e: any) => e.message).join("; "));
      }
      return { message: "Product updated." };
    }

    default:
      throw new Error(`Unknown action: ${action}`);
  }
}
