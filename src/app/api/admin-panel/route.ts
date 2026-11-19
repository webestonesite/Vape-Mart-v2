import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidateTag, revalidatePath } from "next/cache";
import { invalidateAllMemoryCaches } from "@/lib/shopify";
import {
  SESSION_COOKIE,
  createCollection,
  createProduct,
  deleteCollection,
  deleteProduct,
  fulfillOrder,
  getAdminCollections,
  getAdminDraftOrders,
  getAdminMetaobjects,
  getAdminOrders,
  getAdminProducts,
  getAdminRedirects,
  getAdminShopSettings,
  getAuthState,
  getCollectionDetail,
  getCustomerDetail,
  getOrderDetail,
  getPanelData,
  getPanelExtras,
  getProductDetail,
  listBulkProducts,
  login,
  refundOrder,
  saveAction,
  saveBulkMetafields,
  searchBulkProducts,
  setupPassword,
  updateProduct,
} from "@/lib/admin-panel";

/**
 * Granular & backward-compatible endpoint for the /admin panel.
 * Supports granular domain fetching (domain: "products" | "orders" | "redirects" | "collections" | "metaobjects" | "settings")
 * to eliminate monolithic overfetching while preserving complete backward compatibility.
 */

const ALLOWED_DOMAINS = ["products", "orders", "redirects", "collections", "metaobjects", "settings"] as const;
type AllowedDomain = (typeof ALLOWED_DOMAINS)[number];

const COOKIE_OPTS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

async function sessionToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value;
}

export async function GET(req: Request) {
  try {
    const state = await getAuthState(await sessionToken());
    const url = new URL(req.url);
    const domain = url.searchParams.get("domain");

    if (domain && !state.authed) {
      return NextResponse.json({ ok: false, error: "Not logged in." }, { status: 401 });
    }

    if (domain) {
      if (!ALLOWED_DOMAINS.includes(domain.toLowerCase() as AllowedDomain)) {
        return NextResponse.json(
          {
            ok: false,
            error: `Invalid domain "${domain}". Supported domains: ${ALLOWED_DOMAINS.join(", ")}`,
          },
          { status: 400 }
        );
      }
    }

    if (domain === "products") {
      const res = await getAdminProducts({
        limit: Number(url.searchParams.get("limit")) || 50,
        status: url.searchParams.get("status") || undefined,
        query: url.searchParams.get("query") || undefined,
        cursor: url.searchParams.get("cursor") || undefined,
      });
      return NextResponse.json({ ok: true, ...res });
    }

    if (domain === "orders") {
      const res = await getAdminOrders({
        limit: Number(url.searchParams.get("limit")) || 25,
        status: url.searchParams.get("status") || undefined,
      });
      return NextResponse.json({ ok: true, ...res });
    }

    if (domain === "redirects") {
      const res = await getAdminRedirects({
        limit: Number(url.searchParams.get("limit")) || 100,
        after: url.searchParams.get("after") || undefined,
      });
      return NextResponse.json({ ok: true, ...res });
    }

    if (domain === "collections") {
      const res = await getAdminCollections({
        limit: Number(url.searchParams.get("limit")) || 50,
        after: url.searchParams.get("after") || undefined,
      });
      return NextResponse.json({ ok: true, ...res });
    }

    if (domain === "metaobjects") {
      const type = url.searchParams.get("type") || "hero_slide";
      const { metaobjects } = await getAdminMetaobjects(type);
      return NextResponse.json({ ok: true, data: { metaobjects } });
    }

    if (domain === "settings") {
      const settings = await getAdminShopSettings();
      return NextResponse.json({ ok: true, settings });
    }

    return NextResponse.json(state);
  } catch (e) {
    return NextResponse.json(
      { setupNeeded: false, authed: false, error: e instanceof Error ? e.message : "Auth check failed" },
      { status: 500 }
    );
  }
}

function purgeCache(tags: string[], paths: string[] = []) {
  try {
    invalidateAllMemoryCaches();
  } catch {
    // Non-fatal
  }
  for (const tag of tags) {
    try {
      revalidateTag(tag, { expire: 0 });
    } catch {
      // Non-fatal
    }
  }
  for (const p of paths) {
    try {
      revalidatePath(p);
    } catch {
      // Non-fatal
    }
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "");

    if (action === "setup") {
      const token = await setupPassword(String(body.code || ""), String(body.password || ""));
      const res = NextResponse.json({ ok: true, authed: true });
      res.cookies.set(SESSION_COOKIE, token, COOKIE_OPTS);
      return res;
    }

    if (action === "login") {
      const token = await login(String(body.password || ""));
      const res = NextResponse.json({ ok: true, authed: true });
      res.cookies.set(SESSION_COOKIE, token, COOKIE_OPTS);
      return res;
    }

    if (action === "logout") {
      const res = NextResponse.json({ ok: true, authed: false });
      res.cookies.set(SESSION_COOKIE, "", { ...COOKIE_OPTS, maxAge: 0 });
      return res;
    }

    const state = await getAuthState(await sessionToken());
    if (!state.authed) {
      return NextResponse.json({ ok: false, error: "Not logged in." }, { status: 401 });
    }

    // Granular domain-specific fetching
    if (action === "data") {
      const domain = body.domain ? String(body.domain).toLowerCase() : "";

      if (domain) {
        if (!ALLOWED_DOMAINS.includes(domain as AllowedDomain)) {
          return NextResponse.json(
            {
              ok: false,
              error: `Invalid domain "${domain}". Supported domains: ${ALLOWED_DOMAINS.join(", ")}`,
            },
            { status: 400 }
          );
        }

        if (domain === "products") {
          const res = await getAdminProducts(body.opts || {});
          return NextResponse.json({ ok: true, data: { products: res.products, pageInfo: res.pageInfo } });
        }

        if (domain === "orders") {
          const [ordersRes, draftsRes] = await Promise.all([
            getAdminOrders(body.opts || {}),
            getAdminDraftOrders(body.opts || {}),
          ]);
          return NextResponse.json({
            ok: true,
            data: {
              orders: ordersRes.orders,
              draftOrders: draftsRes.draftOrders,
              pageInfo: ordersRes.pageInfo,
            },
          });
        }

        if (domain === "redirects") {
          const res = await getAdminRedirects(body.opts || {});
          return NextResponse.json({ ok: true, data: { redirects: res.redirects, pageInfo: res.pageInfo } });
        }

        if (domain === "collections") {
          const res = await getAdminCollections(body.opts || {});
          return NextResponse.json({ ok: true, data: { collections: res.collections, pageInfo: res.pageInfo } });
        }

        if (domain === "metaobjects") {
          const res = await getAdminMetaobjects(String(body.type || ""), body.opts || {});
          return NextResponse.json({ ok: true, data: { metaobjects: res.metaobjects, pageInfo: res.pageInfo } });
        }

        if (domain === "settings") {
          const settings = await getAdminShopSettings();
          return NextResponse.json({ ok: true, data: { settings } });
        }
      }

      // Backward compatible full panel fetch when no domain specified
      const [data, extras] = await Promise.all([getPanelData(), getPanelExtras()]);
      return NextResponse.json({ ok: true, data: { ...data, ...extras } });
    }

    // Granular list endpoints
    if (action === "products" || action === "products.list") {
      const res = await getAdminProducts(body.opts || {});
      return NextResponse.json({ ok: true, ...res });
    }

    if (action === "orders" || action === "orders.list") {
      const res = await getAdminOrders(body.opts || {});
      return NextResponse.json({ ok: true, ...res });
    }

    if (action === "redirects" || action === "redirects.list") {
      const res = await getAdminRedirects(body.opts || {});
      return NextResponse.json({ ok: true, ...res });
    }

    if (action === "collections" || action === "collections.list") {
      const res = await getAdminCollections(body.opts || {});
      return NextResponse.json({ ok: true, ...res });
    }

    if (action === "metaobjects" || action === "metaobjects.list") {
      const res = await getAdminMetaobjects(String(body.type || ""), body.opts || {});
      return NextResponse.json({ ok: true, ...res });
    }

    // Details endpoints
    if (action === "productDetail") {
      const detail = await getProductDetail(String(body.id || ""));
      return NextResponse.json({ ok: true, detail });
    }

    if (action === "collectionDetail") {
      const detail = await getCollectionDetail(String(body.id || ""));
      return NextResponse.json({ ok: true, detail });
    }

    if (action === "orderDetail") {
      const detail = await getOrderDetail(String(body.id || ""));
      return NextResponse.json({ ok: true, detail });
    }

    if (action === "customerDetail") {
      const detail = await getCustomerDetail(String(body.id || ""));
      return NextResponse.json({ ok: true, detail });
    }

    // Direct mutation actions
    if (action === "order.fulfill") {
      const result = await fulfillOrder(String(body.id || ""));
      return NextResponse.json({ ok: true, ...result });
    }

    if (action === "order.refund") {
      const result = await refundOrder(String(body.id || ""));
      return NextResponse.json({ ok: true, ...result });
    }

    if (action === "product.create") {
      const result = await createProduct(body.payload ?? {});
      const handle = body.payload?.handle;
      purgeCache(
        ["products", "catalog", "sitemap", ...(handle ? [`product-${handle}`] : [])],
        ["/", "/collections", ...(handle ? [`/product/${handle}`] : [])]
      );
      return NextResponse.json({ ok: true, ...result });
    }

    if (action === "product.update") {
      const result = await updateProduct(body.payload ?? {});
      const handle = body.payload?.handle;
      purgeCache(
        ["products", "catalog", "sitemap", ...(handle ? [`product-${handle}`] : [])],
        ["/", "/collections", ...(handle ? [`/product/${handle}`] : [])]
      );
      return NextResponse.json({ ok: true, ...result });
    }

    if (action === "product.delete") {
      const result = await deleteProduct(String(body.id || ""));
      purgeCache(["products", "catalog", "sitemap"], ["/", "/collections"]);
      return NextResponse.json({ ok: true, ...result });
    }

    if (action === "collection.create") {
      const result = await createCollection(String(body.title || ""), {
        sortOrder: body.sortOrder,
        descriptionHtml: body.descriptionHtml,
      });
      purgeCache(["collections", "catalog", "sitemap"], ["/collections"]);
      return NextResponse.json({ ok: true, ...result });
    }

    if (action === "collection.delete") {
      const result = await deleteCollection(String(body.id || ""));
      purgeCache(["collections", "catalog", "sitemap"], ["/collections"]);
      return NextResponse.json({ ok: true, ...result });
    }

    if (action === "bulk.list") {
      const result = await listBulkProducts({
        cursor: body.cursor ?? null,
        search: String(body.search || ""),
        status: String(body.status || "ALL"),
      });
      return NextResponse.json({ ok: true, ...result });
    }

    if (action === "bulk.save") {
      const result = await saveBulkMetafields(Array.isArray(body.changes) ? body.changes : []);
      purgeCache(["products", "catalog"], ["/", "/collections"]);
      return NextResponse.json({ ok: true, ...result });
    }

    if (action === "bulk.search") {
      const result = await searchBulkProducts(String(body.search || ""));
      return NextResponse.json({ ok: true, ...result });
    }

    if (action === "save") {
      const saveKey = String(body.saveAction || "");
      const result = await saveAction(saveKey, body.payload ?? {});
      if (saveKey === "menu") {
        purgeCache(["menu"], ["/"]);
      } else if (saveKey === "theme" || saveKey === "settings") {
        purgeCache(["shop-settings", "theme"], ["/"]);
      } else if (saveKey === "hero" || saveKey === "home") {
        purgeCache(["hero-slides", "cms-content", "home"], ["/"]);
      } else if (saveKey === "blog" || saveKey === "blog-settings") {
        purgeCache(["blog"], ["/blog"]);
      } else {
        purgeCache(["shop-settings", "cms-content"], ["/"]);
      }
      return NextResponse.json({ ok: true, ...result });
    }

    return NextResponse.json({ ok: false, error: "Unknown action." }, { status: 400 });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Something went wrong." },
      { status: 400 }
    );
  }
}
