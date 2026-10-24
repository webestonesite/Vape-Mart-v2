"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Truck,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  MessageCircle,
  CheckCircle2,
  MapPin,
  Phone,
  User,
  CreditCard,
  Banknote,
  Clock
} from "lucide-react";
import { CartItem } from "@/types/product";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart?: () => void;
}

const DEFAULT_CITIES = [
  { city: "Dubai", promise: "2-3 Hours Express Dispatch" },
  { city: "Abu Dhabi", promise: "Same-Day Delivery" },
  { city: "Sharjah", promise: "Same-Day Delivery" },
  { city: "Ajman", promise: "Same-Day Delivery" },
  { city: "Ras Al Khaimah", promise: "Next-Day Morning" },
  { city: "Fujairah", promise: "Next-Day Morning" },
  { city: "Umm Al Quwain", promise: "Same-Day Delivery" },
];

export function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart
}: CartDrawerProps) {
  const [step, setStep] = useState<"cart" | "checkout" | "success">("cart");
  
  // Checkout Form State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCity, setCustomerCity] = useState("Dubai");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card_on_delivery">("cod");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState("");

  // Cart & checkout rules from the panel (shop metafields, namespace checkout).
  // Empty values fall back to the previous literals, so nothing changes
  // until the owner edits something in the panel.
  const [checkoutSettings, setCheckoutSettings] = useState<any>(null);
  useEffect(() => {
    fetch("/api/site-content")
      .then((res) => res.json())
      .then((data) => { if (data?.settings) setCheckoutSettings(data.settings); })
      .catch(() => {});
  }, []);
  const checkout = checkoutSettings?.checkout || {};
  const waPhone = (checkoutSettings?.phone || "+971 55 168 8299").replace(/[^0-9]/g, "");
  const cityPromises = checkout.cityPromises?.length ? checkout.cityPromises : DEFAULT_CITIES;
  const paymentLabel = (key: string, fallback: string) =>
    (checkout.paymentLabels || []).find((l: any) => l.key === key)?.label || fallback;
  const cityPromise = (city: string) =>
    cityPromises.find((c: any) => c.city === city)?.promise ||
    (city === "Dubai" ? "2-3 Hours Today" : "Same-Day Courier");

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const freeShippingThreshold = checkout.freeShippingThreshold || 350;
  const isFreeDelivery = subtotal >= freeShippingThreshold;
  const deliveryFee = isFreeDelivery || items.length === 0 ? 0 : (checkout.deliveryFee || 25);
  const grandTotal = subtotal + deliveryFee;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleProceedToCheckout = () => {
    setStep("checkout");
  };

  const [orderError, setOrderError] = useState("");

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setOrderError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customerName,
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
          })),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Order failed");
      setPlacedOrderId(json.orderName || "VM-ORDER");
      setStep("success");
      if (onClearCart) onClearCart();
    } catch (err: any) {
      setOrderError(err?.message || "Order failed. Please try WhatsApp ordering.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep("cart");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col justify-between overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-neutral-200/80 bg-neutral-50/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                {step === "checkout" ? (
                  <button
                    type="button"
                    onClick={() => setStep("cart")}
                    className="w-8 h-8 rounded-full bg-white border border-neutral-200 text-neutral-700 flex items-center justify-center hover:bg-neutral-100 transition-colors"
                    aria-label="Back to Cart"
                  >
                    <ArrowLeft size={16} />
                  </button>
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#064e3b] text-white flex items-center justify-center shadow-xs">
                    <ShoppingBag size={17} />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-base text-neutral-900 leading-tight">
                    {step === "cart" && "Shopping Cart"}
                    {step === "checkout" && "Express Checkout"}
                    {step === "success" && "Order Confirmed!"}
                  </h3>
                  <p className="text-[11px] text-neutral-500 font-medium">
                    {step === "cart" && `${items.length} ${items.length === 1 ? "item" : "items"} selected`}
                    {step === "checkout" && "UAE Fast Courier Dispatch (2-3 Hours)"}
                    {step === "success" && `Reference ID: ${placedOrderId}`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="w-8 h-8 rounded-full bg-white border border-neutral-200/80 text-neutral-600 hover:text-neutral-900 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close cart"
              >
                <X size={17} />
              </button>
            </div>

            {/* STEP 1: CART VIEW */}
            {step === "cart" && (
              <>
                {/* Free Shipping Progress Meter */}
                <div className="px-5 py-3 bg-emerald-50/90 border-b border-emerald-200/60 shrink-0">
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

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
                  {items.length === 0 ? (
                    <div className="text-center py-16 px-4">
                      <div className="w-16 h-16 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag size={28} />
                      </div>
                      <h4 className="font-bold text-base text-neutral-900 mb-1">Your cart is currently empty</h4>
                      <p className="text-xs text-neutral-500 max-w-xs mx-auto mb-6">
                        Browse our authentic disposable vapes, pod systems, and e-liquids with same-day UAE delivery.
                      </p>
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 bg-[#064e3b] text-white text-xs font-bold rounded-xl hover:bg-[#022c22] transition-colors cursor-pointer"
                      >
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white border border-neutral-200/80 rounded-2xl p-3 sm:p-3.5 flex items-center gap-3.5 shadow-xs hover:border-emerald-300 transition-colors"
                      >
                        <div className="w-16 h-16 relative bg-neutral-50 rounded-xl p-1 shrink-0 border border-neutral-100">
                          <Image src={item.image} alt={item.title} fill className="object-contain" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-black text-neutral-900 uppercase tracking-widest bg-neutral-100 px-1.5 py-0.5 rounded">
                            {item.brand}
                          </span>
                          <h4 className="font-bold text-xs sm:text-sm text-neutral-900 truncate mt-0.5">
                            {item.title}
                          </h4>
                          {(item.flavor || item.nicotine) && (
                            <p className="text-[11px] text-neutral-500 truncate font-medium">
                              {item.flavor} {item.nicotine && `• ${item.nicotine}`}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-black text-xs sm:text-sm text-[#064e3b]">
                              AED {(item.price * item.quantity).toFixed(2)}
                            </span>

                            <div className="flex items-center border border-neutral-200 rounded-lg bg-neutral-50 p-0.5">
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(item.id, -1)}
                                className="w-5 h-5 flex items-center justify-center text-neutral-600 hover:bg-white rounded transition-colors cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={11} />
                              </button>
                              <span className="w-6 text-center text-xs font-bold text-neutral-900">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(item.id, 1)}
                                className="w-5 h-5 flex items-center justify-center text-neutral-600 hover:bg-white rounded transition-colors cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                <Plus size={11} />
                              </button>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          className="text-neutral-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer Summary & Actions */}
                {items.length > 0 && (
                  <div className="p-4 sm:p-5 border-t border-neutral-200/80 bg-neutral-50/80 space-y-3 shrink-0">
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-neutral-600">
                        <span>Subtotal</span>
                        <span className="font-bold text-neutral-900">AED {subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-neutral-600">
                        <span>Estimated UAE Delivery</span>
                        <span className="font-bold text-[#064e3b]">
                          {deliveryFee === 0 ? "FREE" : `AED ${deliveryFee.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-black text-neutral-900 pt-1.5 border-t border-neutral-200">
                        <span>{checkout.vatNote || "Total (VAT Included)"}</span>
                        <span className="text-base text-[#064e3b]">AED {grandTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <button
                        type="button"
                        onClick={handleProceedToCheckout}
                        className="w-full py-3.5 bg-[#064e3b] hover:bg-[#022c22] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                      >
                        <span>Proceed to Express Checkout</span>
                        <ArrowRight size={15} />
                      </button>

                      <a
                        href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                          `Hello Vape Mart UAE, I would like to order: ${items
                            .map((i) => `${i.title} (${i.flavor || "Standard"}) x${i.quantity}`)
                            .join(", ")} - Total: AED ${grandTotal.toFixed(2)}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer no-underline text-center"
                      >
                        <MessageCircle size={15} />
                        <span>Order via WhatsApp (Instant Dispatch)</span>
                      </a>
                    </div>

                    <div className="flex items-center justify-center gap-4 text-[11px] text-neutral-500 pt-1">
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
                )}
              </>
            )}

            {/* STEP 2: EXPRESS CHECKOUT FORM */}
            {step === "checkout" && (
              <form onSubmit={handlePlaceOrder} className="flex-1 flex flex-col justify-between overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                  {/* Order Summary Pill */}
                  <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-neutral-800">{items.length} items selected</span>
                      <p className="text-neutral-500 text-[11px]">Free delivery above AED {freeShippingThreshold}</p>
                    </div>
                    <span className="font-black text-sm text-[#064e3b]">AED {grandTotal.toFixed(2)}</span>
                  </div>

                  {/* Customer Information */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-500">
                      Delivery Details
                    </h4>

                    {/* Name */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="e.g. Tariq Al Mansoori"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:border-[#064e3b] focus:ring-1 focus:ring-[#064e3b]"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        UAE Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                          type="tel"
                          required
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="+971 50 123 4567"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:border-[#064e3b] focus:ring-1 focus:ring-[#064e3b]"
                        />
                      </div>
                    </div>

                    {/* City Select */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Emirate / City <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={customerCity}
                        onChange={(e) => setCustomerCity(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:border-[#064e3b] bg-white cursor-pointer"
                      >
                        {cityPromises.map((c: any) => (
                          <option key={c.city} value={c.city}>{c.city} ({c.promise})</option>
                        ))}
                      </select>
                    </div>

                    {/* Street Address */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Street Address / Apartment & Villa <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin size={15} className="absolute left-3 top-3 text-neutral-400" />
                        <textarea
                          required
                          rows={2}
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          placeholder="Building name, apartment number, street name..."
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:border-[#064e3b] focus:ring-1 focus:ring-[#064e3b]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-2 pt-2 border-t border-neutral-200">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-500">
                      Payment on Delivery
                    </h4>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("cod")}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                          paymentMethod === "cod"
                            ? "border-[#064e3b] bg-emerald-50/70 text-neutral-900 ring-1 ring-[#064e3b]"
                            : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Banknote size={15} className="text-[#064e3b]" />
                          <span className="font-bold text-xs">{paymentLabel("cod", "Cash on Delivery")}</span>
                        </div>
                        <span className="text-[10px] text-neutral-500">Pay courier in cash</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("card_on_delivery")}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                          paymentMethod === "card_on_delivery"
                            ? "border-[#064e3b] bg-emerald-50/70 text-neutral-900 ring-1 ring-[#064e3b]"
                            : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <CreditCard size={15} className="text-[#064e3b]" />
                          <span className="font-bold text-xs">{paymentLabel("card_on_delivery", "Card on Delivery")}</span>
                        </div>
                        <span className="text-[10px] text-neutral-500">POS machine on door</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="p-4 sm:p-5 border-t border-neutral-200/80 bg-neutral-50/80 space-y-2 shrink-0">
                  {orderError && (
                    <p className="text-[11px] text-center text-red-600 font-semibold bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                      {orderError}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#064e3b] hover:bg-[#022c22] disabled:opacity-60 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    {isSubmitting ? (
                      <span className="animate-pulse">Confirming Order with Dispatch...</span>
                    ) : (
                      <>
                        <Truck size={16} />
                        <span>Confirm Order (AED {grandTotal.toFixed(2)})</span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-center text-neutral-500">
                    21+ Age Verification strictly conducted by courier upon delivery.
                  </p>
                </div>
              </form>
            )}

            {/* STEP 3: SUCCESS & ORDER CONFIRMATION VIEW */}
            {step === "success" && (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 shadow-xs">
                  <CheckCircle2 size={36} />
                </div>

                <span className="text-[10px] font-black uppercase tracking-widest text-[#064e3b] bg-emerald-100/80 px-2.5 py-0.5 rounded-full mb-1">
                  Order Successfully Placed
                </span>

                <h3 className="font-bold text-xl text-neutral-900 mb-1">
                  Thank You, {customerName || "Valued Customer"}!
                </h3>

                <p className="text-xs text-neutral-500 max-w-xs mb-4">
                  Your order is booked for fast courier delivery in {customerCity}. Our driver will contact you prior to arrival.
                </p>

                {/* Details Card */}
                <div className="w-full bg-neutral-50 border border-neutral-200/80 rounded-2xl p-4 text-xs text-left space-y-2.5 mb-6">
                  <div className="flex justify-between border-b border-neutral-200 pb-2">
                    <span className="text-neutral-500">Order Reference:</span>
                    <span className="font-mono font-bold text-neutral-900">{placedOrderId}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-200 pb-2">
                    <span className="text-neutral-500">Payment:</span>
                    <span className="font-bold text-neutral-900 capitalize">
{paymentLabel(paymentMethod, paymentMethod === "cod" ? "Cash on Delivery" : "Card on Delivery")} (AED {grandTotal.toFixed(2)})
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-200 pb-2">
                    <span className="text-neutral-500">Estimated Delivery:</span>
                    <span className="font-bold text-[#064e3b] flex items-center gap-1">
                      <Clock size={12} />
                      {cityPromise(customerCity)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Mobile:</span>
                    <span className="font-bold text-neutral-900">{customerPhone || "+971"}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="w-full space-y-2.5">
                  <a
                    href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                      `Hello Vape Mart Dispatch, I just placed Order ${placedOrderId} for AED ${grandTotal.toFixed(2)} to ${customerCity}. My phone is ${customerPhone}. Please confirm driver dispatch status.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 no-underline"
                  >
                    <MessageCircle size={15} />
                    <span>Track Order on WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full py-2.5 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
