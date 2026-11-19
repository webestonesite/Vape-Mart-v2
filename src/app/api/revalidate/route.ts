import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import crypto from "crypto";
import { env } from "@/core/config/env";
import { invalidateAllMemoryCaches } from "@/lib/shopify";

export const runtime = "nodejs";

function verifyShopifyHmac(body: string, hmacHeader: string, secret: string): boolean {
  if (!secret || !hmacHeader) return false;
  try {
    const generated = crypto.createHmac("sha256", secret).update(body, "utf8").digest("base64");
    return crypto.timingSafeEqual(Buffer.from(generated), Buffer.from(hmacHeader));
  } catch {
    return false;
  }
}

function purgeTag(tag: string) {
  try {
    invalidateAllMemoryCaches();
  } catch {
    // Non-fatal
  }
  try {
    // Next.js 16 revalidateTag requires tag and cache profile / expire object
    revalidateTag(tag, { expire: 0 });
  } catch (err) {
    console.warn(`[Revalidate] revalidateTag error on ${tag}:`, err);
  }
}

/**
 * POST /api/revalidate
 * Live Shopify Webhook receiver with HMAC-SHA256 signature verification.
 * Automatically invalidates edge tags without redeploying.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const hmac = req.headers.get("x-shopify-hmac-sha256") || "";
    const topic = req.headers.get("x-shopify-topic") || "";

    // If webhook secret configured, strictly verify HMAC
    if (env.SHOPIFY_WEBHOOK_SECRET) {
      const isValid = verifyShopifyHmac(rawBody, hmac, env.SHOPIFY_WEBHOOK_SECRET);
      if (!isValid) {
        return NextResponse.json({ error: "Invalid webhook HMAC signature" }, { status: 401 });
      }
    }

    const revalidatedTags: string[] = [];

    if (topic.startsWith("products/")) {
      purgeTag("products");
      purgeTag("sitemap");
      revalidatedTags.push("products", "sitemap");
    } else if (topic.startsWith("collections/")) {
      purgeTag("collections");
      purgeTag("sitemap");
      revalidatedTags.push("collections", "sitemap");
    } else if (topic.startsWith("metaobjects/")) {
      purgeTag("cms-content");
      purgeTag("home");
      revalidatedTags.push("cms-content", "home");
    } else if (topic.startsWith("pages/")) {
      purgeTag("pages");
      purgeTag("sitemap");
      revalidatedTags.push("pages", "sitemap");
    } else {
      purgeTag("cms-content");
      purgeTag("products");
      revalidatedTags.push("cms-content", "products");
    }

    // Refresh homepage layout cache
    try {
      revalidatePath("/", "layout");
    } catch {
      // Ignore in development
    }

    return NextResponse.json({
      revalidated: true,
      topic,
      tags: revalidatedTags,
      timestamp: Date.now(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Revalidation error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * GET /api/revalidate?secret=...&tag=...
 * 1-Click manual edge-cache clear fallback.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  const tag = searchParams.get("tag") || "all";

  if (!secret || secret !== env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Invalid revalidation secret" }, { status: 401 });
  }

  const allTags = ["products", "collections", "cms-content", "home", "site-settings", "pages", "sitemap"];

  if (tag === "all") {
    for (const t of allTags) {
      purgeTag(t);
    }
    try {
      revalidatePath("/", "layout");
    } catch {
      // Ignore in dev
    }
    return NextResponse.json({
      revalidated: true,
      tags: allTags,
      timestamp: Date.now(),
    });
  }

  purgeTag(tag);
  return NextResponse.json({
    revalidated: true,
    tag,
    timestamp: Date.now(),
  });
}
