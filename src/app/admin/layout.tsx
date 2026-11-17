import type { Metadata } from "next";
import React from "react";
import { ToastProvider } from "@/components/admin/ActionPrimitives";

export const metadata: Metadata = {
  title: "Admin | Vape Mart",
  description: "Manage the Vape Mart store: products, content, blog, menu and settings.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#f6f6f7] text-neutral-900 antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </div>
    </ToastProvider>
  );
}
