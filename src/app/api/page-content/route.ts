import { NextResponse } from "next/server";
import { fetchShopifyPage } from "@/lib/shopify";

/**
 * Shopify Page body for client components (e.g. the Contact page intro).
 * Only the store's info pages are exposed.
 */
export const revalidate = 300;

const ALLOWED = new Set(["about", "contact", "privacy-policy", "terms-conditions"]);

export async function GET(req: Request) {
  const handle = new URL(req.url).searchParams.get("handle") || "";
  if (!ALLOWED.has(handle)) {
    return NextResponse.json({ title: "", bodyHtml: "" }, { status: 400 });
  }
  const page = await fetchShopifyPage(handle);
  return NextResponse.json({
    title: page?.title ?? "",
    bodyHtml: page?.bodyHtml ?? "",
  });
}
