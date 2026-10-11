import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Admin Panel | Vape Mart Theme & Header Manager",
  description: "Manage header, navigation, and storefront customizer settings for Vape Mart.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#070d0b] text-neutral-100 antialiased selection:bg-emerald-500 selection:text-white">
      {children}
    </div>
  );
}
