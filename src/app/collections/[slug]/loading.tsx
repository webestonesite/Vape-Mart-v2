/* Shown instantly while the collection page loads, so a tap feels instant
   and the layout is already in place when the real content streams in. */
export default function Loading() {
  return (
    <main className="min-h-screen bg-[#f7f8f7]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-8 pb-10 animate-pulse">
        <div className="h-9 w-72 rounded bg-neutral-200/70" />
        <div className="mt-3 h-4 w-96 max-w-full rounded bg-neutral-200/70" />
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border border-neutral-200/70 overflow-hidden">
              <div className="aspect-square bg-neutral-100" />
              <div className="p-4">
                <div className="h-4 w-3/4 rounded bg-neutral-100" />
                <div className="mt-2 h-4 w-1/3 rounded bg-neutral-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
