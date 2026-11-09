/* Shown instantly while the blog list loads. */
export default function Loading() {
  return (
    <main className="min-h-screen bg-[#f7f8f7]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-10 animate-pulse">
        <div className="h-9 w-72 rounded bg-neutral-200/70" />
        <div className="mt-3 h-4 w-96 max-w-full rounded bg-neutral-200/70" />
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border border-neutral-200/70 overflow-hidden">
              <div className="aspect-[16/9] bg-neutral-100" />
              <div className="p-5">
                <div className="h-4 w-3/4 rounded bg-neutral-100" />
                <div className="mt-2 h-4 w-1/2 rounded bg-neutral-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
