"use client";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-[#f6f6f7]">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm text-center">
        <h1 className="text-lg font-bold text-neutral-900 mb-2">Something went wrong in the panel</h1>
        <p className="text-sm text-neutral-500 mb-5">
          The page got stuck while loading. Please try again — if that doesn't work, log out and log back in.
        </p>
        <button
          onClick={() => reset()}
          className="w-full rounded-md bg-neutral-900 py-2.5 font-semibold text-white hover:bg-neutral-700 transition"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
