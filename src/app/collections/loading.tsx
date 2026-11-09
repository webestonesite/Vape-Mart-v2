/* Shown instantly while the collections list loads. */
export default function Loading() {
  return (
    <main className="min-h-screen bg-[#f7f8f7]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-10 pb-10 animate-pulse">
        <div className="h-9 w-64 rounded bg-neutral-200/70" />
        <div className="mt-3 h-4 w-80 max-w-full rounded bg-neutral-200/70" />
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] rounded-2xl bg-neutral-200/60" />
          ))}
        </div>
      </div>
    </main>
  );
}
