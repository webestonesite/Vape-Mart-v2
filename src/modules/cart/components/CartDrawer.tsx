"use client";

import React from "react";
import { useCart } from "@/modules/cart/CartProvider";
import { CartDrawer as VisualCartDrawer } from "@/components/CartDrawer";

/**
 * Domain-Connected Cart Drawer
 * Automatically binds CartProvider state to the high-converting UAE Checkout UI.
 */
export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeFromCart } = useCart();

  return (
    <VisualCartDrawer
      isOpen={isOpen}
      onClose={closeCart}
      items={items}
      onUpdateQuantity={updateQuantity}
      onRemoveItem={removeFromCart}
    />
  );
}

export default CartDrawer;

