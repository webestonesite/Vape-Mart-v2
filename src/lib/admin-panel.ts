import "server-only";
import { shopifyAdminMutation as gql } from "@/lib/shopify";
import {
  BLOG_ID,
  createAdminCollection,
  createAdminProduct,
  createAdminRedirect,
  deleteAdminBlogArticle,
  deleteAdminCollection,
  deleteAdminDiscount,
  deleteAdminFile,
  deleteAdminMetaobject,
  deleteAdminProduct,
  deleteAdminRedirect,
  fieldsMap,
  fulfillAdminOrder,
  getAdminCollectionDetail,
  getAdminCustomerDetail,
  getAdminOrderDetail,
  getAdminProductDetail,
  getAdminShopSettings,
  getPermanentFileUrl,
  listAllCollections,
  listAllPanelProducts,
  listAllRedirects,
  parseList,
  refundAdminOrder,
  saveAdminBlogArticle,
  saveAdminDiscount,
  saveAdminMenu,
  saveAdminMetaobject,
  saveAdminPage,
  saveBulkMetafields,
  updateAdminCollection,
  updateAdminCustomer,
  updateAdminProduct,
  updateAdminShopSettings,
} from "./admin";

// Re-export all domain functions, types, and constants
export * from "./admin";

// Legacy aliases
export const fulfillOrder = fulfillAdminOrder;
export const refundOrder = refundAdminOrder;
export const getCustomerDetail = getAdminCustomerDetail;
export const getOrderDetail = getAdminOrderDetail;
export const getCollectionDetail = getAdminCollectionDetail;
export const getProductDetail = getAdminProductDetail;
export const createProduct = createAdminProduct;
export const updateProduct = updateAdminProduct;
export const deleteProduct = deleteAdminProduct;
export const createCollection = createAdminCollection;
export const deleteCollection = deleteAdminCollection;

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
        id title url type resourceId
        items { id title url type resourceId items { id title url type resourceId } }
      }
    }
  }
`;

export async function getPanelData() {
  const [settings, d, allProducts, allRedirects] = await Promise.all([
    getAdminShopSettings(),
    gql<any>(PANEL_QUERY),
    listAllPanelProducts(),
    listAllRedirects(),
  ]);

  const mo = (nodes: any[] | undefined) =>
    (nodes ?? []).map((n) => ({ id: n.id as string, f: fieldsMap(n.fields), raw: n }));

  const heroSlides = mo(d.hero?.nodes)
    .map(({ id, f, raw }) => ({
      id,
      title: f.title || "",
      description: f.description || "",
      badge: f.badge || "",
      buttonText: f.button_text || "",
      buttonLink: f.button_link || "",
      position: parseInt(f.position || "0", 10) || 0,
      imageUrl: raw.imageRef?.reference?.image?.url || "",
      imageFileId: raw.imageRef?.reference?.id || "",
    }))
    .sort((a, b) => a.position - b.position);

  const sections = mo(d.sections?.nodes)
    .map(({ id, f }) => ({
      id,
      key: f.section_key || "",
      title: f.title || "",
      subtitle: f.subtitle || "",
      badgeText: f.badge_text || "",
      productIds: parseList(f.products),
    }))
    .filter((s) => s.key);

  const testimonials = mo(d.testimonials?.nodes)
    .map(({ id, f }) => ({
      id,
      name: f.name || "",
      role: f.role || "",
      title: f.title || "",
      review: f.review || "",
      position: parseInt(f.position || "0", 10) || 0,
    }))
    .sort((a, b) => a.position - b.position);

  const faqs = mo(d.faqs?.nodes)
    .map(({ id, f }) => ({
      id,
      question: f.question || "",
      answer: f.answer || "",
      position: parseInt(f.position || "0", 10) || 0,
    }))
    .sort((a, b) => a.position - b.position);

  const showcase = mo(d.showcase?.nodes)
    .map(({ id, f }) => ({
      id,
      sectionKey: f.section_key || "",
      title: f.title || "",
      price: f.price || "",
      revs: parseInt(f.revs || "0", 10) || 0,
      badge: f.badge || "",
      brand: f.brand || "",
      imageUrl: f.image_url || "",
      position: parseInt(f.position || "0", 10) || 0,
    }))
    .sort((a, b) => a.sectionKey.localeCompare(b.sectionKey) || a.position - b.position);

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
    .map((p: any) => ({
      id: p.id as string,
      handle: p.handle as string,
      title: p.title as string,
      body: p.body || "",
    }));

  const menuNode = (d.menus?.nodes ?? []).find((m: any) => m.handle === "vape-mart-main-menu");
  let menu: any = null;
  if (menuNode) {
    const md = await gql<any>(MENU_QUERY, { id: menuNode.id });
    if (md.menu) {
      const mapItem = (it: any): any => ({
        id: it.id,
        title: it.title || "",
        url: it.url || "",
        type: it.type || "HTTP",
        resourceId: it.resourceId || "",
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
    id: o.id as string,
    name: o.name as string,
    customer: o.customer?.displayName || o.customer?.email || "Guest",
    fulfillment: o.displayFulfillmentStatus || "",
    financial: o.displayFinancialStatus || "",
    total: o.totalPriceSet?.shopMoney?.amount || "",
    currency: o.totalPriceSet?.shopMoney?.currencyCode || "AED",
    createdAt: o.createdAt || "",
  }));

  const draftOrders = (d.draftOrders?.nodes ?? []).map((o: any) => ({
    id: o.id as string,
    name: o.name as string,
    status: o.status || "",
    customer: o.customer?.displayName || o.customer?.email || "—",
    total: o.totalPriceSet?.shopMoney?.amount || "",
    currency: o.totalPriceSet?.shopMoney?.currencyCode || "AED",
    createdAt: o.createdAt || "",
  }));

  const customers = (d.customers?.nodes ?? []).map((c: any) => ({
    id: c.id as string,
    name: c.displayName || "",
    email: c.email || "",
    phone: c.phone || "",
    orders: c.numberOfOrders ?? 0,
    spent: c.amountSpent?.amount || "",
    currency: c.amountSpent?.currencyCode || "AED",
    note: c.note || "",
    tags: (c.tags ?? []).join(", "),
  }));

  const discounts = (d.discountNodes?.nodes ?? []).map((n: any) => ({
    id: n.id as string,
    title: n.discount?.title || "",
    code: n.discount?.codes?.nodes?.[0]?.code || (n.discount ? "Automatic" : ""),
    status: n.discount?.status || "",
  }));

  return {
    settings,
    heroSlides,
    sections,
    testimonials,
    faqs,
    showcase,
    products: allProducts,
    files,
    blogPosts,
    pages,
    menu,
    orders,
    draftOrders,
    customers,
    discounts,
    redirects: allRedirects,
    locationId: d.locations?.nodes?.[0]?.id || "",
  };
}

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
    return {
      id: n.id as string,
      name: f.name || "",
      color: f.color || "",
      inStock: f.in_stock !== "false",
      image: f.image || "",
    };
  });

  const moList = (nodes: any[]) =>
    (nodes ?? []).map((n: any) => {
      const f: Record<string, string> = {};
      for (const fld of n.fields ?? []) if (fld.value != null) f[fld.key] = fld.value;
      return { id: n.id as string, ...f };
    });

  return {
    collections: allCollections,
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

export async function saveAction(action: string, p: any) {
  switch (action) {
    case "settings":
      return updateAdminShopSettings("general", p);

    case "checkout.save":
      return updateAdminShopSettings("checkout", p);

    case "productPage.save":
      return updateAdminShopSettings("productPage", p);

    case "collectionPage.save":
      return updateAdminShopSettings("collectionPage", p);

    case "theme.save":
      return updateAdminShopSettings("theme", p);

    case "home.save":
      return updateAdminShopSettings("home", p);

    case "blogSettings.save":
      return updateAdminShopSettings("blogSettings", p);

    case "pages.save":
      return updateAdminShopSettings("pages", p);

    case "hero.save":
      return saveAdminMetaobject("hero_slide", p);

    case "hero.delete":
      return deleteAdminMetaobject(p.id);

    case "section.save":
      return saveAdminMetaobject("home_section", p);

    case "testimonial.save":
      return saveAdminMetaobject("testimonial", p);

    case "testimonial.delete":
      return deleteAdminMetaobject(p.id);

    case "faq.save":
      return saveAdminMetaobject("faq_item", p);

    case "faq.delete":
      return deleteAdminMetaobject(p.id);

    case "showcase.save":
      return saveAdminMetaobject("showcase_card", p);

    case "showcase.delete":
      return deleteAdminMetaobject(p.id);

    case "flavor.save":
      return saveAdminMetaobject("flavor", p);

    case "flavor.delete":
      return deleteAdminMetaobject(p.id);

    case "review.save":
      return saveAdminMetaobject("vm_product_review", p);

    case "review.delete":
      return deleteAdminMetaobject(p.id);

    case "collectionFaq.save":
      return saveAdminMetaobject("vm_collection_faq", p);

    case "collectionFaq.delete":
      return deleteAdminMetaobject(p.id);

    case "product.save":
      return updateAdminProduct(p);

    case "product.create":
      return createAdminProduct(p);

    case "product.update":
      return updateAdminProduct(p);

    case "product.delete":
      return deleteAdminProduct(p.id);

    case "collection.save":
      return updateAdminCollection(p);

    case "collection.create":
      return createAdminCollection(p.title, p);

    case "collection.delete":
      return deleteAdminCollection(p.id);

    case "blog.save":
      return saveAdminBlogArticle(p);

    case "blog.delete":
      return deleteAdminBlogArticle(p.id);

    case "page.save":
      return saveAdminPage(p.id, p);

    case "menu.save":
      return saveAdminMenu(p);

    case "discount.save":
      return saveAdminDiscount(p);

    case "discount.delete":
      return deleteAdminDiscount(p.id);

    case "customer.save":
      return updateAdminCustomer(p);

    case "redirect.save":
      return createAdminRedirect(p);

    case "redirect.delete":
      return deleteAdminRedirect(p.id);

    case "media.delete":
      return deleteAdminFile(p.id);

    case "file.permanentUrl":
      return getPermanentFileUrl(p.url);

    case "bulk.save":
      return saveBulkMetafields(Array.isArray(p.changes) ? p.changes : []);

    default:
      throw new Error(`Unknown action: ${action}`);
  }
}
