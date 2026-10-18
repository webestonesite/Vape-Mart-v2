import { NextResponse } from "next/server";
import { fetchShopifyMenu } from "@/lib/shopify";

export async function GET() {
  const items = await fetchShopifyMenu();
  return NextResponse.json({ items });
}
