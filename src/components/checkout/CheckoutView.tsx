"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Clock,
  CreditCard,
  Mail,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Truck,
  User,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/modules/cart/CartProvider";
import type { CheckoutSettings } from "@/lib/shopify";

const DEFAULT_CITIES = [
  { city: "Dubai", promise: "2-3 Hours Express Dispatch" },
  { city: "Abu Dhabi", promise: "Same-Day Delivery" },
  { city: "Sharjah", promise: "Same-Day Delivery" },
  { city: "Ajman", promise: "Same-Day Delivery" },
  { city: "Ras Al Khaimah", promise: "Next-Day Morning" },
  { city: "Fujairah", promise: "Next-Day Morning" },
  { city: "Umm Al Quwain", promise: "Same-Day Delivery" },
];

interface CheckoutViewProps {
  checkoutSettings: CheckoutSettings | null;
  phone: string;
}

export function CheckoutView({ checkoutSettings, phone }: CheckoutViewProps) {
  const { items, subtotal, clearCart, openCart, isHydrated } = useCart();
  const [step, setStep] = useState<"form" | "success">("form");

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCity, setCustomerCity] = useState("Dubai");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card_on_delivery">("cod");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [placedOrderId, setPlacedOrderId] = useState("");

  // Same rules as the cart drawer (panel-managed, with the old literals
  // as fallback so nothing changes until the owner edits the panel).
  const checkout = checkoutSettings || ({} as CheckoutSettings);
  const waPhone = (phone || "+971 55 110 3401").replace(/[^0-9]/g, "");
  const cityPromises = checkout.cityPromises?.length ? checkout.cityPromises : DEFAULT_CITIES;
  const paymentLabel = (key: string, fallback: string) =>
    (checkout.paymentLabels || []).find((l: any) => l.key === key)?.label || fallback;
  const cityPromise = (city: string) =>
    cityPromises.find((c: any) => c.city === city)?.promise ||
    (city === "Dubai" ? "2-3 Hours Today" : "Same-Day Courier");

  const freeShippingThreshold = checkout.freeShippingThreshold || 350;
  const isFreeDelivery = subtotal >= freeShippingThreshold;
  const deliveryFee = isFreeDelivery || items.length === 0 ? 0 : checkout.deliveryFee || 25;
  const grandTotal = subtotal + deliveryFee;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const waOrderText = `Hello Vape Mart UAE, I would like to order: ${items
    .map((i) => `${i.title} (${i.variantLabel || i.flavor || "Standard"}) x${i.quantity}`)
    .join(", ")} - Total: AED ${grandTotal.toFixed(2)}`;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = customerPhone.replace(/\D/g, "");
    if (digits.length < 9) {
      setOrderError("Please enter a valid UAE mobile number (e.g. 050 123 4567).");
      return;
    }
    setIsSubmitting(true);
    setOrderError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          city: customerCity,
          address: customerAddress,
          paymentMethod,
          items: items.map((i) => ({
            title: i.title,
            quantity: i.quantity,
            price: i.price,
            flavor: i.flavor,
            nicotine: i.nicotine,
            variantLabel: i.variantLabel,
          })),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Order failed");
      setPlacedOrderId(json.orderName || "VM-ORDER");
      setStep("success");
      clearCart();
    } catch (err: any) {
      setOrderError(err?.message || "Order failed. Please try WhatsApp ordering.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls =
    "w-full pl-10 pr-3 py-3 rounded-xl border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:border-[#064e3b] focus:ring-1 focus:ring-[#064e3b] bg-white";
  const labelCls = "block text-xs font-bold text-neutral-700 mb-1.5";

  return (
    <>
      <Header />
      <main className="min-h-screen bg-neutral-50">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
          {/* Crumbs + title */}
          <nav className="flex items-center gap-1.5 text-xs text-neutral-500 mb-4">
            <Link href="/" className="hover:text-[#064e3b] font-semibold">
              Home
            </Link>
            <span>/</span>
            <span className="text-neutral-900 font-bold">Checkout</span>
          </nav>

          {step === "success" ? (
            /* ---------- SUCCESS ---------- */
            <div className="max-w-xl mx-auto bg-white rounded-3xl border border-neutral-200/80 shadow-sm p-6 sm:p-10 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={36} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#064e3b] bg-emerald-100/80 px-2.5 py-0.5 rounded-full mb-2 inline-block">
                Order Successfully Placed
              </span>
              <h1 className="font-bold text-2xl text-neutral-900 mb-2">
                Thank You, {customerName || "Valued Customer"}!
              </h1>
              <p className="text-sm text-neutral-500 max-w-sm mx-auto mb-6">
                Your order is booked for fast courier delivery in {customerCity}. Our driver will
                contact you prior to arrival.
              </p>

              <div className="bg-neutral-50 border border-neutral-200/80 rounded-2xl p-4 text-sm text-left space-y-2.5 mb-6">
                <div className="flex justify-between border-b border-neutral-200 pb-2">
                  <span className="text-neutral-500">Order Reference:</span>
                  <span className="font-mono font-bold text-neutral-900">{placedOrderId}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-200 pb-2">
                  <span className="text-neutral-500">Payment:</span>
                  <span className="font-bold text-neutral-900">
                    {paymentLabel(
                      paymentMethod,
                      paymentMethod === "cod" ? "Cash on Delivery" : "Card on Delivery"
                    )}{" "}
                    (AED {grandTotal.toFixed(2)})
                  </span>
                </div>
                <div className="flex justify-between border-b border-neutral-200 pb-2">
                  <span className="text-neutral-500">Estimated Delivery:</span>
                  <span className="font-bold text-[#064e3b] flex items-center gap-1">
                    <Clock size={13} />
                    {cityPromise(customerCity)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Mobile:</span>
                  <span className="font-bold text-neutral-900">{customerPhone || "+971"}</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <a
                  href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                    `Hello Vape Mart Dispatch, I just placed Order ${placedOrderId} to ${customerCity}. My phone is ${customerPhone}. Please confirm driver dispatch status.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 no-underline"
                >
                  <MessageCircle size={16} />
                  <span>Track Order on WhatsApp</span>
                </a>
                <Link
                  href="/"
                  className="w-full py-3 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 no-underline"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          ) : !isHydrated ? (
            /* ---------- LOADING (cart reads from localStorage after mount) ---------- */
            <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm p-10 text-center">
              <p className="text-sm text-neutral-500 animate-pulse">Loading your cart…</p>
            </div>
          ) : items.length === 0 ? (
            /* ---------- EMPTY CART ---------- */
            <div className="max-w-xl mx-auto bg-white rounded-3xl border border-neutral-200/80 shadow-sm p-10 text-center">
              <div className="w-16 h-16 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-4">
                <ShoppingBag size={28} />
              </div>
              <h1 className="font-bold text-xl text-neutral-900 mb-1">Your cart is empty</h1>
              <p className="text-sm text-neutral-500 mb-6">
                Add something you like first — checkout takes less than a minute.
              </p>
              <Link
                href="/collections"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#064e3b] text-white text-sm font-bold rounded-xl hover:bg-[#022c22] transition-colors no-underline"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            /* ---------- FORM + SUMMARY ---------- */
            <>
              <div className="mb-6">
                <h1 className="font-bold text-2xl sm:text-3xl text-neutral-900 leading-tight">
                  Checkout
                </h1>
                <p className="text-sm text-neutral-500 mt-1">
                  Fast UAE delivery • Cash or Card on Delivery • No account needed
                </p>
              </div>

              {/* Free delivery progress */}
              <div className="px-4 sm:px-5 py-3 bg-emerald-50/90 border border-emerald-200/60 rounded-2xl mb-6">
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="flex items-center gap-1.5 text-[#064e3b]">
                    <Truck size={14} className="text-amber-500" />
                    {amountToFreeShipping > 0
                      ? `Add AED ${amountToFreeShipping.toFixed(2)} more for FREE UAE Delivery`
                      : "🎉 You unlocked FREE UAE Express Delivery!"}
                  </span>
                  <span className="text-[#064e3b] font-black">{Math.round(progressPercent)}%</span>
                </div>
                <div className="h-2 bg-emerald-200/70 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#064e3b] to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
                {/* ----- Form ----- */}
                <form
                  onSubmit={handlePlaceOrder}
                  className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm p-5 sm:p-7 space-y-7"
                >
                  <section className="space-y-4">
                    <h2 className="font-bold text-sm uppercase tracking-wider text-neutral-500">
                      Delivery Details
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="co-name" className={labelCls}>
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User
                            size={16}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                          />
                          <input
                            id="co-name"
                            type="text"
                            required
                            autoComplete="name"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="e.g. Tariq Al Mansoori"
                            className={inputCls}
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="co-email" className={labelCls}>
                          Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail
                            size={16}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                          />
                          <input
                            id="co-email"
                            type="email"
                            required
                            autoComplete="email"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            placeholder="you@example.com"
                            className={inputCls}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="co-phone" className={labelCls}>
                          UAE Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone
                            size={16}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                          />
                          <input
                            id="co-phone"
                            type="tel"
                            required
                            autoComplete="tel"
                            inputMode="tel"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="+971 50 123 4567"
                            className={inputCls}
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="co-city" className={labelCls}>
                          Emirate / City <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="co-city"
                          value={customerCity}
                          onChange={(e) => setCustomerCity(e.target.value)}
                          className="w-full px-3 py-3 rounded-xl border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:border-[#064e3b] bg-white cursor-pointer"
                        >
                          {cityPromises.map((c: any) => (
                            <option key={c.city} value={c.city}>
                              {c.city} ({c.promise})
                            </option>
                          ))}
                        </select>
                        <p className="text-[11px] text-[#064e3b] font-semibold mt-1.5">
                          {cityPromise(customerCity)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="co-address" className={labelCls}>
                        Street Address / Apartment &amp; Villa{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin
                          size={16}
                          className="absolute left-3.5 top-3.5 text-neutral-400 pointer-events-none"
                        />
                        <textarea
                          id="co-address"
                          required
                          rows={2}
                          autoComplete="street-address"
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          placeholder="Building name, apartment number, street name..."
                          className="w-full pl-10 pr-3 py-3 rounded-xl border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:border-[#064e3b] focus:ring-1 focus:ring-[#064e3b] bg-white"
                        />
                      </div>
                    </div>
                  </section>

                  <section className="space-y-3 pt-6 border-t border-neutral-200">
                    <h2 className="font-bold text-sm uppercase tracking-wider text-neutral-500">
                      Payment on Delivery
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("cod")}
                        aria-pressed={paymentMethod === "cod"}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                          paymentMethod === "cod"
                            ? "border-[#064e3b] bg-emerald-50/70 text-neutral-900 ring-1 ring-[#064e3b]"
                            : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Banknote size={18} className="text-[#064e3b]" />
                          <span className="font-bold text-sm">
                            {paymentLabel("cod", "Cash on Delivery")}
                          </span>
                        </span>
                        <span className="text-xs text-neutral-500">Pay courier in cash</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("card_on_delivery")}
                        aria-pressed={paymentMethod === "card_on_delivery"}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                          paymentMethod === "card_on_delivery"
                            ? "border-[#064e3b] bg-emerald-50/70 text-neutral-900 ring-1 ring-[#064e3b]"
                            : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <CreditCard size={18} className="text-[#064e3b]" />
                          <span className="font-bold text-sm">
                            {paymentLabel("card_on_delivery", "Card on Delivery")}
                          </span>
                        </span>
                        <span className="text-xs text-neutral-500">POS machine on door</span>
                      </button>
                    </div>
                  </section>

                  {orderError && (
                    <p className="text-xs text-center text-red-600 font-semibold bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                      {orderError}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-[#064e3b] hover:bg-[#022c22] disabled:opacity-60 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    {isSubmitting ? (
                      <span className="animate-pulse">Confirming Order with Dispatch…</span>
                    ) : (
                      <>
                        <Truck size={17} />
                        <span>Place Order • AED {grandTotal.toFixed(2)}</span>
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-center text-neutral-500 -mt-3">
                    21+ Age Verification strictly conducted by courier upon delivery.
                  </p>

                  <div className="pt-1 border-t border-neutral-200">
                    <a
                      href={`https://wa.me/${waPhone}?text=${encodeURIComponent(waOrderText)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer no-underline text-center"
                    >
                      <MessageCircle size={16} />
                      <span>Order via WhatsApp (Instant Dispatch)</span>
                    </a>
                    <div className="flex items-center justify-center gap-4 text-[11px] text-neutral-500 pt-3">
                      <span className="flex items-center gap-1 font-semibold">
                        <ShieldCheck size={13} className="text-[#064e3b]" />
                        100% Authentic
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-semibold">
                        <Truck size={13} className="text-[#064e3b]" />
                        Cash or Card on Delivery
                      </span>
                    </div>
                  </div>
                </form>

                {/* ----- Order summary ----- */}
                <aside className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm p-5 sm:p-6 lg:sticky lg:top-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-base text-neutral-900">Your Order</h2>
                    <button
                      type="button"
                      onClick={openCart}
                      className="flex items-center gap-1 text-xs font-bold text-[#064e3b] hover:underline cursor-pointer"
                    >
                      <Pencil size={12} />
                      Edit cart
                    </button>
                  </div>

                  <div className="space-y-3 mb-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-14 h-14 relative bg-neutral-50 rounded-xl p-1 shrink-0 border border-neutral-100">
                          <Image src={item.image} alt={item.title} fill className="object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs sm:text-sm text-neutral-900 truncate">
                            {item.title}
                          </p>
                          {(item.flavor || item.nicotine || item.variantLabel) && (
                            <p className="text-[11px] text-neutral-500 truncate font-medium">
                              {item.variantLabel || (
                                <>
                                  {item.flavor} {item.nicotine && `• ${item.nicotine}`}
                                </>
                              )}
                            </p>
                          )}
                          <p className="text-[11px] text-neutral-500">Qty {item.quantity}</p>
                        </div>
                        <span className="font-black text-xs sm:text-sm text-[#064e3b] shrink-0">
                          AED {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1.5 text-sm border-t border-neutral-200 pt-4">
                    <div className="flex justify-between text-neutral-600">
                      <span>Subtotal</span>
                      <span className="font-bold text-neutral-900">AED {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>UAE Delivery</span>
                      <span className="font-bold text-[#064e3b]">
                        {deliveryFee === 0 ? "FREE" : `AED ${deliveryFee.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-black text-neutral-900 pt-2 border-t border-neutral-200">
                      <span>{checkout.vatNote || "Total (VAT Included)"}</span>
                      <span className="text-[#064e3b]">AED {grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <Link
                    href="/"
                    className="mt-5 flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-[#064e3b] no-underline"
                  >
                    <ArrowLeft size={13} />
                    Continue shopping
                  </Link>
                </aside>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
