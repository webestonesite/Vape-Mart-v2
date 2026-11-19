import type { Metadata } from "next";
import { fetchShopSettings } from "@/lib/shopify";
import { fetchNavMenu } from "@/components/menu";
import { CheckoutView } from "@/components/checkout/CheckoutView";

export const metadata: Metadata = {
  title: "Checkout | Vape Mart UAE",
  description:
    "Fast, secure checkout with Cash on Delivery or Card on Delivery across Dubai and the UAE.",
};

/* Checkout settings (delivery fee, free-shipping threshold, city
   promises) are panel-managed in Shopify; revalidate every 5 minutes
   so edits show up without a deploy, same as /api/site-content. */
export const revalidate = 300;

export default async function CheckoutPage() {
  const [settings, menu] = await Promise.all([fetchShopSettings(), fetchNavMenu()]);
  return <CheckoutView checkoutSettings={settings.checkout} menu={menu} />;
}
