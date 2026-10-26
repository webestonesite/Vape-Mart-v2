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
    orders(first: 25, sortKey: CREATED_AT, reverse: true) {
      nodes { id name createdAt displayFulfillmentStatus totalPriceSet { shopMoney { amount currencyCode } } customer { displayName email } }
    }
    draftOrders(first: 25) {
      nodes { id name createdAt status totalPriceSet { shopMoney { amount currencyCode } } customer { displayName email } }
    }
    customers(first: 25, sortKey: CREATED_AT, reverse: true) {
      nodes { id displayName email phone numberOfOrders amountSpent { amount currencyCode } }
    }
    discountNodes(first: 25) {
      nodes { id discount {
        ... on DiscountCodeBasic { title codes(first: 1) { nodes { code } } }
        ... on DiscountCodeBxgy { title codes(first: 1) { nodes { code } } }
        ... on DiscountCodeFreeShipping { title codes(first: 1) { nodes { code } } }
        ... on DiscountAutomaticBasic { title }
        ... on DiscountAutomaticBxgy { title }
        ... on DiscountAutomaticFreeShipping { title }
      } }
    }
    redirects: urlRedirects(first: 100) {
      nodes { id path target }
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

  const orders = (d.orders?.nodes ?? []).map((o: any) => ({
    id: o.id as string, name: o.name as string, customer: o.customer?.displayName || o.customer?.email || "Guest",
    fulfillment: o.displayFulfillmentStatus || "", total: o.totalPriceSet?.shopMoney?.amount || "",
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
  }));
  const discounts = (d.discountNodes?.nodes ?? []).map((n: any) => ({
    id: n.id as string, title: n.discount?.title || "",
    code: n.discount?.codes?.nodes?.[0]?.code || (n.discount ? "Automatic" : ""),
  }));
  const redirects = (d.redirects?.nodes ?? []).map((r: any) => ({
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
      reviews: metaobjects(type: "vm_product_review", first: 100) {
        nodes { id fields { key value } }
      }
      collectionFaqs: metaobjects(type: "vm_collection_faq", first: 100) {
        nodes { id fields { key value } }
      }
    }
  `);
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
         id title handle descriptionHtml
         image { url altText }
         seo { title description }
         metafields(first: 20, namespace: "collection") { nodes { key value } }
         products(first: 100) { nodes { id } }
       }
     }`,
    { id }
  );
  const c = d.collection;
  if (!c) throw new Error("Collection not found.");
  const mf: Record<string, string> = {};
  for (const m of c.metafields?.nodes ?? []) mf[m.key] = m.value;
  return {
    id: c.id as string,
    title: c.title as string,
    handle: c.handle as string,
    descriptionHtml: c.descriptionHtml || "",
    imageUrl: c.image?.url || "",
    seoTitle: c.seo?.title || "",
    seoDescription: c.seo?.description || "",
    badge: mf.badge || "",
    heroSubtitle: mf.hero_subtitle || "",
    showAsCard: mf.show_as_card === "true",
    productIds: (c.products?.nodes ?? []).map((p: any) => p.id as string),
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
    seoTitle: p.seo?.title || "",
    seoDescription: p.seo?.description || "",
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

async function deleteProductMetafields(productId: string, keys: string[]): Promise<void> {
  if (!keys.length) return;
  const d = await gql<any>(
    `mutation MfDel($metafields: [MetafieldIdentifierInput!]!) {
       metafieldsDelete(metafields: $metafields) { deletedMetafields { key namespace } userErrors { message } }
     }`,
    { metafields: keys.map((key) => ({ ownerId: productId, namespace: "vape", key })) }
  );
  const errs = d.metafieldsDelete?.userErrors ?? [];
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
  if (v.compareAtPrice) out.compareAtPrice = String(v.compareAtPrice);
  if (v.sku) out.inventoryItem = { sku: String(v.sku) };
  if (v.barcode) out.barcodes = [{ value: String(v.barcode) }];
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

async function bulkCreateVariants(productId: string, variants: any[], locationId: string | undefined, removeStandalone: boolean): Promise<void> {
  if (!variants.length) return;
  const d = await gql<any>(
    `mutation VarCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!, $strategy: ProductVariantsBulkCreateStrategy) {
       productVariantsBulkCreate(productId: $productId, variants: $variants, strategy: $strategy) { productVariants { id } userErrors { message } }
     }`,
    { productId, variants: variants.map((v: any) => comboToBulkInput(v, locationId)), strategy: removeStandalone ? "REMOVE_STANDALONE_VARIANT" : "DEFAULT" }
  );
  const errs = d.productVariantsBulkCreate?.userErrors ?? [];
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
  if (p.seoTitle !== undefined || p.seoDescription !== undefined)
    baseInput.seo = { title: p.seoTitle || "", description: p.seoDescription || "" };
  const first: Record<string, unknown> = { price: String(p.price || "0") };
  if (p.compareAtPrice) first.compareAtPrice = String(p.compareAtPrice);
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
  if (Array.isArray(p.options) && p.options.length) await createProductOptions(id, p.options);
  if (Array.isArray(p.variants) && p.variants.length) {
    await bulkCreateVariants(id, p.variants, p.locationId, true);
  } else {
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
  if (p.seoTitle !== undefined || p.seoDescription !== undefined)
    input.seo = { title: p.seoTitle || "", description: p.seoDescription || "" };
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
    await bulkCreateVariants(p.id, p.newVariants, p.locationId, false);
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
  if (Array.isArray(p.vapeDeleteKeys) && p.vapeDeleteKeys.length)
    await deleteProductMetafields(p.id, p.vapeDeleteKeys);
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
