/* Shown instantly while the article loads, so a tap feels instant. */
export default function Loading() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-10 sm:py-14 animate-pulse">
        <div className="h-4 w-40 rounded bg-neutral-100" />
        <div className="mt-4 h-10 w-full rounded bg-neutral-100" />
        <div className="mt-3 h-10 w-2/3 rounded bg-neutral-100" />
        <div className="mt-8 aspect-[16/9] rounded-2xl bg-neutral-100" />
        <div className="mt-8 space-y-3">
          <div className="h-4 w-full rounded bg-neutral-100" />
          <div className="h-4 w-full rounded bg-neutral-100" />
          <div className="h-4 w-5/6 rounded bg-neutral-100" />
          <div className="h-4 w-full rounded bg-neutral-100" />
          <div className="h-4 w-2/3 rounded bg-neutral-100" />
        </div>
      </div>
    </main>
  );
}
