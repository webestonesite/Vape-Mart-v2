import { NextRequest, NextResponse } from "next/server";
import { createShopifyDraftOrder } from "@/lib/shopify";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, address, city, notes, paymentMethod, items } = body;

    if (!name || !phone || !address || !city) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const order = await createShopifyDraftOrder({
      name: String(name),
      phone: String(phone),
      email: email ? String(email) : undefined,
      address: String(address),
      city: String(city),
      notes: `${notes || ""}\nPayment: ${paymentMethod === "card_on_delivery" ? "Card on delivery" : "Cash on delivery"}`.trim(),
      items: items.map((i: any) => ({
        title: `${String(i.title)}${i.variantLabel ? ` (${String(i.variantLabel)})` : ""}${i.flavor ? ` (${String(i.flavor)})` : ""}${i.nicotine ? ` - ${String(i.nicotine)}` : ""}`,
        quantity: Math.max(1, parseInt(i.quantity, 10) || 1),
        price: parseFloat(i.price) || 0,
      })),
    });

    return NextResponse.json({ ok: true, orderName: order.name, orderId: order.id });
  } catch (e: any) {
    console.error("Checkout error:", e?.message);
    return NextResponse.json({ error: "Order failed. Please try WhatsApp ordering." }, { status: 500 });
  }
}
