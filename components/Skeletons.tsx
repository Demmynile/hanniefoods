export function HomeSkeleton() {
  return (
    <div className="flex flex-col gap-12 animate-pulse">
      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-center gap-6">
          <div className="h-4 w-32 bg-stone-200 rounded" />
          <div className="space-y-3">
            <div className="h-10 bg-stone-200 rounded w-full" />
            <div className="h-10 bg-stone-200 rounded w-5/6" />
          </div>
          <div className="h-20 bg-stone-200 rounded w-full" />
          <div className="flex gap-4">
            <div className="h-20 w-32 bg-stone-200 rounded-3xl" />
            <div className="h-20 w-32 bg-stone-200 rounded-3xl" />
            <div className="h-20 w-32 bg-stone-200 rounded-3xl" />
          </div>
        </div>
        <div className="h-96 bg-stone-200 rounded-3xl" />
      </section>
      <section className="flex flex-col gap-4">
        <div className="h-8 w-48 bg-stone-200 rounded" />
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="overflow-hidden rounded-[2rem] border border-stone-200/80 bg-white/80">
              <div className="h-64 bg-stone-200" />
              <div className="space-y-3 p-6">
                <div className="h-6 w-1/2 bg-stone-200 rounded" />
                <div className="h-4 w-4/5 bg-stone-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-96 bg-stone-200 rounded-3xl mb-6" />
      <div className="space-y-4">
        <div className="h-8 bg-stone-200 rounded w-3/4" />
        <div className="h-4 bg-stone-200 rounded w-1/2" />
        <div className="h-24 bg-stone-200 rounded" />
        <div className="h-12 bg-stone-200 rounded w-1/3" />
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="h-96 lg:h-[600px] bg-stone-200 rounded-3xl" />
        <div className="space-y-6">
          <div className="h-10 bg-stone-200 rounded w-3/4" />
          <div className="h-6 bg-stone-200 rounded w-1/2" />
          <div className="h-32 bg-stone-200 rounded" />
          <div className="h-12 bg-stone-200 rounded w-32" />
          <div className="h-14 bg-stone-200 rounded w-full" />
        </div>
      </div>
    </div>
  );
}
