/* Shown instantly while the product page loads, so a tap feels instant
   and the layout is already in place when the real content streams in. */
export default function Loading() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-pulse">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="aspect-square rounded-3xl bg-neutral-100" />
          <div>
            <div className="h-4 w-32 rounded bg-neutral-100" />
            <div className="mt-4 h-9 w-3/4 rounded bg-neutral-100" />
            <div className="mt-3 h-4 w-1/2 rounded bg-neutral-100" />
            <div className="mt-6 h-8 w-40 rounded bg-neutral-100" />
            <div className="mt-8 h-12 w-full rounded-full bg-neutral-100" />
            <div className="mt-3 h-12 w-full rounded-full bg-neutral-100" />
          </div>
        </div>
      </div>
    </main>
  );
}
