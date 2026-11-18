"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  MessageCircle,
} from "lucide-react";
import { CartItem } from "@/types/product";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
}

/* Cart drawer is cart-only. Checkout lives on the dedicated /checkout
   page (full page, not a cramped drawer step) — the Proceed button
   closes the drawer and navigates there. */
export function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
}: CartDrawerProps) {
  const router = useRouter();

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
  const waPhone = (checkoutSettings?.phone || "+971 55 110 3401").replace(/[^0-9]/g, "");

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const freeShippingThreshold = checkout.freeShippingThreshold || 350;
  const isFreeDelivery = subtotal >= freeShippingThreshold;
  const deliveryFee = isFreeDelivery || items.length === 0 ? 0 : (checkout.deliveryFee || 25);
  const grandTotal = subtotal + deliveryFee;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleProceedToCheckout = () => {
    onClose();
    router.push("/checkout");
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
                <div className="w-9 h-9 rounded-full bg-[#064e3b] text-white flex items-center justify-center shadow-xs">
                  <ShoppingBag size={17} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-neutral-900 leading-tight">
                    Shopping Cart
                  </h3>
                  <p className="text-[11px] text-neutral-500 font-medium">
                    {`${items.length} ${items.length === 1 ? "item" : "items"} selected`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white border border-neutral-200/80 text-neutral-600 hover:text-neutral-900 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close cart"
              >
                <X size={17} />
              </button>
            </div>

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
                      {(item.flavor || item.nicotine || item.variantLabel) && (
                        <p className="text-[11px] text-neutral-500 truncate font-medium">
                          {item.variantLabel || (<>{item.flavor} {item.nicotine && `• ${item.nicotine}`}</>)}
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
                    <span>Proceed to Checkout</span>
                    <ArrowRight size={15} />
                  </button>

                  <a
                    href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                      `Hello Vape Mart UAE, I would like to order: ${items
                        .map((i) => `${i.title} (${i.variantLabel || i.flavor || "Standard"}) x${i.quantity}`)
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
