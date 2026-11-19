import { NextResponse } from "next/server";
import { fetchNavMenu } from "@/components/menu";

/* Live Shopify menu, already mapped to Header nav items. Used only by the
   contact page, which is a client component (form) and cannot import the
   server header — every other page renders the menu server-side. */
export async function GET() {
  const items = await fetchNavMenu();
  return NextResponse.json({ items });
}
