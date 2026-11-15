"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, ShoppingBag } from "lucide-react";

export default function CollectionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[CollectionError] Caught collection page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 mb-4 border border-amber-500/20">
        <AlertCircle className="h-7 w-7" />
      </div>

      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
        Collection Unavailable
      </h2>
      <p className="mt-2 max-w-sm text-sm text-zinc-400">
        We were unable to load this collection. Try refreshing or explore all categories.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-black shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reload Collection
        </button>

        <Link
          href="/collections"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          View All Collections
        </Link>
      </div>
    </div>
  );
}

