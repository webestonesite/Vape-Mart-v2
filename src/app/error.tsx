"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError] Caught unhandled route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 mb-6 border border-amber-500/20">
        <AlertTriangle className="h-8 w-8" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md text-sm text-zinc-400">
        We encountered a temporary hiccup loading this page. Please try refreshing, or return to the homepage.
      </p>

      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-black shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
        >
          <Home className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}

