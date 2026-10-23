import "server-only";
import type { ProductItem, ProductFlavor } from "@/types/product";

/* ------------------------------------------------------------------ */
/*  Shopify Admin API client (server-only — token never hits browser)  */
/* ------------------------------------------------------------------ */

const SHOP_DOMAIN = "vf4iap-u5.myshopify.com";
const API_VERSION = "2025-07";
const REVALIDATE_SECS = 300; // 5 min cache on product/catalog reads

/* ------------------------------------------------------------------ */
/*  Access-token provider                                              */
/*                                                                     */
/*  Preferred mode: if SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET are   */
/*  set, the site mints its own Admin API token via the OAuth          */
/*  client_credentials grant and refreshes it before it expires        */
/*  (those tokens live ~24h, so a static token silently dies).        */
/*  Fallback: the static SHOPIFY_ADMIN_TOKEN env var, as before.       */
/* ------------------------------------------------------------------ */

const TOKEN_REFRESH_MARGIN_MS = 5 * 60 * 1000; // refresh when <5 min of validity remain

let tokenCache: { value: string; expiresAt: number } | null = null;
let tokenInFlight: Promise<string> | null = null;

async function requestNewToken(clientId: string, clientSecret: string): Promise<string> {
  const res = await fetch(`https://${SHOP_DOMAIN}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Shopify OAuth token request failed: HTTP ${res.status}`);
  const json = await res.json();
  const accessToken = json.access_token as string | undefined;
  if (!accessToken) throw new Error("Shopify OAuth token response missing access_token");
  const expiresInSecs =
    typeof json.expires_in === "number" && json.expires_in > 0 ? json.expires_in : 3600;
  tokenCache = { value: accessToken, expiresAt: Date.now() + expiresInSecs * 1000 };
  return accessToken;
}

async function getShopifyAccessToken(forceRefresh = false): Promise<string> {
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    const token = process.env.SHOPIFY_ADMIN_TOKEN;
    if (!token) throw new Error("SHOPIFY_ADMIN_TOKEN is not configured");
    return token;
  }
  if (
    !forceRefresh &&
    tokenCache &&
    tokenCache.expiresAt - Date.now() > TOKEN_REFRESH_MARGIN_MS
  ) {
    return tokenCache.value;
  }
  if (!tokenInFlight) {
    tokenInFlight = requestNewToken(clientId, clientSecret).finally(() => {
      tokenInFlight = null;
    });
  }
  return tokenInFlight;
}

function invalidateShopifyTokenCache(): void {
  tokenCache = null;
}

async function shopifyAdmin<T>(query: string, variables: Record<string, unknown> = {}, revalidate = REVALIDATE_SECS): Promise<T> {
  const doRequest = (token: string) =>
    fetch(`https://${SHOP_DOMAIN}/admin/api/${API_VERSION}/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate },
    });

  let res = await doRequest(await getShopifyAccessToken());
  if (res.status === 401) {
    // Token rejected (expired/revoked): drop the cache, mint a fresh one, retry once.
    invalidateShopifyTokenCache();
    res = await doRequest(await getShopifyAccessToken(true));
  }
  if (!res.ok) throw new Error(`Shopify Admin API HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(`Shopify GraphQL errors: ${JSON.stringify(json.errors).slice(0, 500)}`);
  return json.data as T;
}

/* ------------------------------------------------------------------ */
/*  Metafield helpers                                                  */
/* ------------------------------------------------------------------ */

interface MetafieldNode {
  namespace: string;
  key: string;
  type: string;
  value: string | null;
}

function mfMap(metafields: MetafieldNode[] | null | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of metafields ?? []) {
    if (m && m.value != null) out[`${m.namespace}.${m.key}`] = m.value;
  }
  return out;
}

function parseList(raw: string | undefined): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

const VAPE_KEYS = [
  "subtitle", "badge", "short_description", "puffs", "puff_range",
  "nicotine_strength", "nicotine_options", "e_liquid_capacity",
  "battery_capacity", "charging_type", "coil_type", "activation",
  "sweetness", "cooling", "throat_hit", "top_note", "heart_note",
  "base_note", "vg_pg_ratio", "rating", "review_count",
];


/* ------------------------------------------------------------------ */
/*  Shopify -> ProductItem adapter                                     */
/* ------------------------------------------------------------------ */

interface ShopifyImage { url: string; altText: string | null }
interface ShopifyVariant {
  id: string; sku: string | null; price: string;
  compareAtPrice: string | null; inventoryQuantity: number | null;
}
interface ShopifyCollectionRef { id: string; title: string; handle: string }
interface ShopifyProductNode {
  id: string; title: string; handle: string; status: string;
  vendor: string; productType: string; tags: string[];
  descriptionHtml: string;
  priceRangeV2: { minVariantPrice: { amount: string } };
  images: { nodes: ShopifyImage[] };
  variants: { nodes: ShopifyVariant[] };
  collections: { nodes: ShopifyCollectionRef[] };
  metafields: { nodes: MetafieldNode[] } | null;
}

interface FlavorMetaobject {
  id: string;
  fields: { key: string; value: string | null }[];
}

const PRODUCT_FRAGMENT = `
  id title handle status vendor productType tags descriptionHtml
  priceRangeV2 { minVariantPrice { amount } }
  images(first: 8) { nodes { url altText } }
  variants(first: 3) { nodes { id sku price compareAtPrice inventoryQuantity } }
  collections(first: 6) { nodes { id title handle } }
  metafields(first: 40, namespace: "vape") {
    nodes { namespace key type value }
  }
`;

function primaryCollection(collections: ShopifyCollectionRef[]): ShopifyCollectionRef | null {
  const real = collections.filter((c) => c.handle !== "frontpage");
  return real[0] ?? null;
}

/** Placeholder for products that have no photo yet, chosen by category:
    e-liquids get the bottle image, JUUL the JUUL photo, Terea/IQOS the
    sticks photo, everything else the disposable image. Brand collections
    (e.g. "sam-vape-e-liquid") resolve by suffix/prefix, not just exact
    handle, so an e-liquid never shows a disposable device. */
function fallbackImageFor(handle: string): string {
  const h = (handle || "").toLowerCase();
  if (h === "e-liquid" || h === "e-liquids" || h.endsWith("-e-liquid")) return "/images/prod_eliquid.png";
  if (h.startsWith("juul")) return "/images/juul_product.jpg";
  if (h.startsWith("terea") || h.startsWith("iqos")) return "/images/terea_heets.jpg";
  return "/images/prod_disposable.png";
}

function toProductItem(node: ShopifyProductNode, flavorObjects: FlavorMetaobject[] = []): ProductItem {
  const mf = mfMap(node.metafields?.nodes);
  const images = node.images.nodes.map((i) => i.url);
  const firstVariant = node.variants.nodes[0];
  const price = parseFloat(node.priceRangeV2.minVariantPrice.amount || "0") || 0;
  const compareAt = firstVariant?.compareAtPrice ? parseFloat(firstVariant.compareAtPrice) : 0;
  const stockQty = node.variants.nodes.reduce((s, v) => s + (v.inventoryQuantity ?? 0), 0);
  const col = primaryCollection(node.collections.nodes);
  const fallbackImage = fallbackImageFor(col?.handle || "");

  const flavors: ProductFlavor[] = flavorObjects.map((f) => {
    const fm: Record<string, string> = {};
    for (const field of f.fields) if (field.value != null) fm[field.key] = field.value;
    return {
      id: f.id,
      name: fm.name || "Unknown",
      color: fm.color || "#10b981",
      inStock: fm.in_stock === "true",
      img: fm.image || undefined,
    };
  });

  const puffsNum = parseInt(mf["vape.puffs"] || "0", 10) || undefined;
  const specs: { label: string; value: string }[] = [];
  if (puffsNum) specs.push({ label: "Puff Count", value: `${puffsNum.toLocaleString()} Puffs` });
  if (mf["vape.nicotine_strength"]) specs.push({ label: "Nicotine", value: mf["vape.nicotine_strength"] });
  if (mf["vape.e_liquid_capacity"]) specs.push({ label: "E-Liquid", value: mf["vape.e_liquid_capacity"] });
  if (mf["vape.battery_capacity"]) specs.push({ label: "Battery", value: mf["vape.battery_capacity"] });
  if (mf["vape.charging_type"]) specs.push({ label: "Charging", value: mf["vape.charging_type"] });
  if (mf["vape.coil_type"]) specs.push({ label: "Coil", value: mf["vape.coil_type"] });
  if (mf["vape.activation"]) specs.push({ label: "Activation", value: mf["vape.activation"] });
  if (mf["vape.vg_pg_ratio"]) specs.push({ label: "VG/PG", value: mf["vape.vg_pg_ratio"] });

  const num = (v: string | undefined, dflt: number) => {
    const n = parseInt(v || "", 10);
    return Number.isFinite(n) && n >= 1 && n <= 5 ? n : dflt;
  };

  const desc = stripHtml(node.descriptionHtml || "");

  return {
    id: node.id.split("/").pop() || node.handle,
    slug: node.handle,
    title: node.title,
    subtitle: mf["vape.subtitle"] || undefined,
    brand: (node.vendor || "VAPE MART").toUpperCase(),
    category: col?.title || node.productType || "Vapes",
    categorySlug: col?.handle || "all",
    shopifyCollections: node.collections.nodes
      .filter((c) => c.handle !== "frontpage")
      .map((c) => ({ slug: c.handle, title: c.title })),
    price,
    originalPrice: compareAt > price ? compareAt : price,
    revs: parseInt(mf["vape.review_count"] || "0", 10) || 0,
    rating: parseFloat(mf["vape.rating"] || "0") || 0,
    badge: mf["vape.badge"] || undefined,
    inStock: stockQty > 0,
    stockQuantity: stockQty,
    sku: firstVariant?.sku || node.handle,
    images: images.length ? images : [fallbackImage],
    primaryImage: images[0] || fallbackImage,
    shortDescription: mf["vape.short_description"] || desc.slice(0, 180),
    fullDescription: node.descriptionHtml || "",
    puffs: puffsNum,
    puffRange: mf["vape.puff_range"] || undefined,
    nicotineStrength: mf["vape.nicotine_strength"] || "",
    nicotineOptions: parseList(mf["vape.nicotine_options"]),
    eLiquidCapacity: mf["vape.e_liquid_capacity"] || undefined,
    batteryCapacity: mf["vape.battery_capacity"] || undefined,
    chargingType: mf["vape.charging_type"] || undefined,
    coilType: mf["vape.coil_type"] || undefined,
    activation: mf["vape.activation"] || undefined,
    flavors,
    flavorFamily: "fruit_ice",
    sensoryProfile: {
      sweetness: num(mf["vape.sweetness"], 3),
      cooling: num(mf["vape.cooling"], 3),
      throatHit: num(mf["vape.throat_hit"], 3),
      topNote: mf["vape.top_note"] || "",
      heartNote: mf["vape.heart_note"] || "",
      baseNote: mf["vape.base_note"] || "",
      ratio: mf["vape.vg_pg_ratio"] || undefined,
    },
    highlights: specs.slice(0, 4).map((s) => ({ title: s.label, desc: s.value, iconName: "Check" })),
    specifications: specs,
    reviews: [],
    faqs: [],
    relatedSlugs: [],
  };
}

/* ------------------------------------------------------------------ */
/*  Product reads                                                      */
/* ------------------------------------------------------------------ */

const LIST_QUERY = `
  query ProductsList($first: Int!, $after: String) {
    products(first: $first, after: $after, sortKey: TITLE) {
      pageInfo { hasNextPage endCursor }
      nodes { ${PRODUCT_FRAGMENT} }
    }
  }
`;

export async function fetchAllShopifyProducts(): Promise<ProductItem[]> {
  const out: ProductItem[] = [];
  let after: string | null = null;
  for (let page = 0; page < 6; page++) {
    const data: { products: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: ShopifyProductNode[] } } =
      await shopifyAdmin<{ products: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: ShopifyProductNode[] } }>(
        LIST_QUERY, { first: 100, after }
      );
    // Only ACTIVE products are live on the site; drafts stay hidden
    // (the Admin API returns drafts too, unlike the storefront).
    out.push(
      ...data.products.nodes
        .filter((n: ShopifyProductNode) => n.status === "ACTIVE")
        .map((n: ShopifyProductNode) => toProductItem(n))
    );
    if (!data.products.pageInfo.hasNextPage) break;
    after = data.products.pageInfo.endCursor;
  }
  return out;
}

const DETAIL_QUERY = `
  query ProductDetail($handle: String!) {
    productByHandle(handle: $handle) {
      ${PRODUCT_FRAGMENT}
      flavorRefs: metafield(namespace: "vape", key: "flavors") {
        references(first: 60) {
          nodes {
            ... on Metaobject {
              id
              fields { key value }
            }
          }
        }
      }
    }
  }
`;

export async function fetchShopifyProductByHandle(handle: string): Promise<ProductItem | null> {
  const data = await shopifyAdmin<{
    productByHandle: (ShopifyProductNode & { flavorRefs: { references: { nodes: FlavorMetaobject[] } } | null }) | null;
  }>(DETAIL_QUERY, { handle }, 120);
  const node = data.productByHandle;
  if (!node || node.status !== "ACTIVE") return null;
  const flavors = node.flavorRefs?.references?.nodes ?? [];
  return toProductItem(node, flavors);
}

/* ------------------------------------------------------------------ */
/*  Menu (vape-mart-main-menu)                                         */
/* ------------------------------------------------------------------ */

export interface MenuLink { title: string; url: string; children?: MenuLink[] }

const MENU_ID = "gid://shopify/Menu/274787336240";

const MENU_QUERY = `
  query GetMenu($id: ID!) {
    menu(id: $id) {
      items {
        title url
        items {
          title url
          items { title url }
        }
      }
    }
  }
`;

function cleanUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname + u.search;
  } catch {
    return url;
  }
}

function mapMenuItems(items: any[]): MenuLink[] {
  return (items ?? []).map((i) => ({
    title: i.title,
    url: cleanUrl(i.url || "#"),
    children: i.items?.length ? mapMenuItems(i.items) : undefined,
  }));
}

export async function fetchShopifyMenu(): Promise<MenuLink[]> {
  try {
    const data = await shopifyAdmin<{ menu: { items: any[] } | null }>(MENU_QUERY, { id: MENU_ID }, 600);
    if (!data.menu) return [];
    return mapMenuItems(data.menu.items);
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/*  Shop settings (announcements, phone, footer text, logo)            */
/* ------------------------------------------------------------------ */

export interface ShopSettings {
  announcements: string[];
  phone: string;
  footerText: string;
  logoUrl: string;
}

const SHOP_META_QUERY = `
  query ShopMeta {
    shop {
      metafields(first: 20, namespace: "store") { nodes { namespace key type value } }
    }
  }
`;

export async function fetchShopSettings(): Promise<ShopSettings> {
  const fallback: ShopSettings = { announcements: [], phone: "", footerText: "", logoUrl: "" };
  try {
    const data = await shopifyAdmin<{ shop: { metafields: { nodes: MetafieldNode[] } } }>(SHOP_META_QUERY, {}, 600);
    const mf = mfMap(data.shop.metafields.nodes);
    let logoUrl = "";
    try {
      const logoRef = JSON.parse(mf["store.logo"] || "null");
      logoUrl = logoRef?.image?.url || logoRef?.url || "";
    } catch { /* ignore */ }
    return {
      announcements: parseList(mf["store.announcements"]),
      phone: mf["store.phone"] || "",
      footerText: mf["store.footer_text"] || "",
      logoUrl,
    };
  } catch {
    return fallback;
  }
}

/* ------------------------------------------------------------------ */
/*  Blog (Shopify Articles)                                            */
/* ------------------------------------------------------------------ */

export interface BlogPost {
  handle: string;
  title: string;
  excerpt: string;
  bodyHtml: string;
  imageUrl: string;
  publishedAt: string;
  tags: string[];
  category: string;
  quickAnswer: string;
  productSlugs: string[];
}

const BLOG_ID = "gid://shopify/Blog/85628715056";

const BLOG_QUERY = `
  query BlogPosts($id: ID!, $first: Int!, $after: String) {
    blog(id: $id) {
      articles(first: $first, after: $after, sortKey: PUBLISHED_AT, reverse: true) {
        pageInfo { hasNextPage endCursor }
        nodes {
          handle title bodyHtml excerpt
          publishedAt tags
          image { url }
          metafields(first: 10, namespace: "vapemart") { nodes { namespace key type value } }
        }
      }
    }
  }
`;

function toBlogPost(n: any): BlogPost {
  const text = stripHtml(n.bodyHtml || "");
  const mf = mfMap(n.metafields?.nodes);
  return {
    handle: n.handle,
    title: n.title,
    excerpt: n.excerpt || text.slice(0, 180),
    bodyHtml: n.bodyHtml || "",
    imageUrl: n.image?.url || "",
    publishedAt: n.publishedAt,
    tags: n.tags ?? [],
    category: mf["vapemart.category"] || "",
    quickAnswer: mf["vapemart.quick_answer"] || "",
    productSlugs: parseList(mf["vapemart.product_slugs"]),
  };
}

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  const out: BlogPost[] = [];
  let after: string | null = null;
  for (let page = 0; page < 3; page++) {
    const data: any = await shopifyAdmin<any>(BLOG_QUERY, { id: BLOG_ID, first: 50, after }, 600);
    const conn: any = data.blog?.articles;
    if (!conn) break;
    out.push(...conn.nodes.map((n: any) => toBlogPost(n)));
    if (!conn.pageInfo.hasNextPage) break;
    after = conn.pageInfo.endCursor;
  }
  return out;
}

export async function fetchBlogPost(handle: string): Promise<BlogPost | null> {
  const data = await shopifyAdmin<any>(
    `query Article($id: ID!, $handle: String!) {
       blog(id: $id) {
         articleByHandle(handle: $handle) { handle title bodyHtml excerpt publishedAt tags image { url } metafields(first: 10, namespace: "vapemart") { nodes { namespace key type value } } }
       }
     }`,
    { id: BLOG_ID, handle }, 600
  );
  const node = data.blog?.articleByHandle;
  return node ? toBlogPost(node) : null;
}

/* ------------------------------------------------------------------ */
/*  Info pages (about, contact, privacy-policy, terms-conditions)      */
/* ------------------------------------------------------------------ */

export async function fetchShopifyPage(handle: string): Promise<{ title: string; bodyHtml: string } | null> {
  try {
    const data = await shopifyAdmin<any>(
      `query Page($q: String!) { pages(first: 1, query: $q) { nodes { title body } } }`,
      { q: `handle:${handle}` }, 600
    );
    const p = data.pages?.nodes?.[0];
    return p ? { title: p.title, bodyHtml: p.body || "" } : null;
  } catch {
    return null;
  }
}


/* ------------------------------------------------------------------ */
/*  Site content (hero slides, home sections, testimonials, FAQs)      */
/*  Everything here is edited in Shopify admin — no deploy needed.     */
/* ------------------------------------------------------------------ */

export interface HeroSlide {
  title: string;
  description: string;
  badge: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  position: number;
}

export interface HomeSectionData {
  key: string;
  title: string;
  subtitle: string;
  badgeText: string;
  products: ProductItem[];
}

export interface Testimonial {
  name: string;
  role: string;
  title: string;
  review: string;
  position: number;
}

export interface FaqItem {
  question: string;
  answer: string;
  position: number;
}

export interface SiteContent {
  heroSlides: HeroSlide[];
  homeSections: HomeSectionData[];
  testimonials: Testimonial[];
  faqs: FaqItem[];
}

interface MetaobjectNode {
  id: string;
  fields: { key: string; value: string | null }[];
  imageRef?: { reference: { image: { url: string } | null } | null } | null;
  productRefs?: { references: { nodes: (ShopifyProductNode | null)[] } | null } | null;
}

function moFields(n: MetaobjectNode): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of n.fields) if (f.value != null) out[f.key] = f.value;
  return out;
}

const SITE_CONTENT_QUERY = `
  query SiteContent {
    heroSlides: metaobjects(type: "hero_slide", first: 10) {
      nodes {
        id fields { key value }
        imageRef: field(key: "image") { reference { ... on MediaImage { image { url } } } }
      }
    }
    homeSections: metaobjects(type: "home_section", first: 12) {
      nodes {
        id fields { key value }
        productRefs: field(key: "products") {
          references(first: 24) { nodes { ... on Product { ${PRODUCT_FRAGMENT} } } }
        }
      }
    }
    testimonials: metaobjects(type: "testimonial", first: 20) {
      nodes { id fields { key value } }
    }
    faqItems: metaobjects(type: "faq_item", first: 20) {
      nodes { id fields { key value } }
    }
  }
`;

export async function fetchSiteContent(): Promise<SiteContent> {
  const empty: SiteContent = { heroSlides: [], homeSections: [], testimonials: [], faqs: [] };
  try {
    const data = await shopifyAdmin<any>(SITE_CONTENT_QUERY, {}, 600);
    const heroSlides: HeroSlide[] = (data.heroSlides?.nodes ?? [])
      .map((n: MetaobjectNode) => {
        const f = moFields(n);
        return {
          title: f.title || "",
          description: f.description || "",
          badge: f.badge || "",
          imageUrl: n.imageRef?.reference?.image?.url || "",
          buttonText: f.button_text || "",
          buttonLink: f.button_link || "",
          position: parseInt(f.position || "0", 10) || 0,
        };
      })
      .filter((s: HeroSlide) => s.title)
      .sort((a: HeroSlide, b: HeroSlide) => a.position - b.position);
    const homeSections: HomeSectionData[] = (data.homeSections?.nodes ?? [])
      .map((n: MetaobjectNode) => {
        const f = moFields(n);
        const products = (n.productRefs?.references?.nodes ?? [])
          .filter((pn: ShopifyProductNode | null): pn is ShopifyProductNode => !!pn && pn.status === "ACTIVE")
          .map((pn: ShopifyProductNode) => toProductItem(pn));
        return {
          key: f.section_key || "",
          title: f.title || "",
          subtitle: f.subtitle || "",
          badgeText: f.badge_text || "",
          products,
        };
      })
      .filter((s: HomeSectionData) => s.key);
    const testimonials: Testimonial[] = (data.testimonials?.nodes ?? [])
      .map((n: MetaobjectNode) => {
        const f = moFields(n);
        return {
          name: f.name || "",
          role: f.role || "Verified Buyer",
          title: f.title || "",
          review: f.review || "",
          position: parseInt(f.position || "0", 10) || 0,
        };
      })
      .filter((t: Testimonial) => t.name && t.review)
      .sort((a: Testimonial, b: Testimonial) => a.position - b.position);
    const faqs: FaqItem[] = (data.faqItems?.nodes ?? [])
      .map((n: MetaobjectNode) => {
        const f = moFields(n);
        return {
          question: f.question || "",
          answer: f.answer || "",
          position: parseInt(f.position || "0", 10) || 0,
        };
      })
      .filter((t: FaqItem) => t.question && t.answer)
      .sort((a: FaqItem, b: FaqItem) => a.position - b.position);
    return { heroSlides, homeSections, testimonials, faqs };
  } catch {
    return empty;
  }
}

/* ------------------------------------------------------------------ */
/*  Draft orders (custom checkout)                                     */
/* ------------------------------------------------------------------ */

export interface DraftOrderInput {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  notes?: string;
  items: { title: string; quantity: number; price: number }[];
}

const DRAFT_ORDER_MUTATION = `
  mutation DraftOrderCreate($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) {
      draftOrder { id name invoiceUrl }
      userErrors { field message }
    }
  }
`;

export async function createShopifyDraftOrder(input: DraftOrderInput): Promise<{ id: string; name: string; invoiceUrl: string }> {
  const lineItems = input.items.map((i) => ({
    title: i.title,
    quantity: i.quantity,
    originalUnitPrice: i.price.toFixed(2),
  }));
  const data: any = await shopifyAdmin<any>(DRAFT_ORDER_MUTATION, {
    input: {
      note: input.notes || "",
      email: input.email || undefined,
      shippingAddress: {
        firstName: input.name,
        phone: input.phone,
        address1: input.address,
        city: input.city,
        countryCode: "AE",
      },
      lineItems,
    },
  }, 0);
  const errs = data.draftOrderCreate?.userErrors;
  if (errs?.length) throw new Error(errs.map((e: any) => e.message).join("; "));
  const d = data.draftOrderCreate.draftOrder;
  return { id: d.id, name: d.name, invoiceUrl: d.invoiceUrl };
}
