export function CollegeCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-dust-grey bg-white shadow-soft">
      <div className="h-1 bg-gradient-to-r from-blue-slate via-grape-soda to-shadow-grey" />
      <div className="h-48 animate-pulse bg-dust-grey/50" />
      <div className="space-y-4 p-5">
        <div className="h-5 w-3/4 animate-pulse rounded bg-dust-grey/60" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-dust-grey/50" />
        <div className="h-16 animate-pulse rounded bg-dust-grey/40" />
      </div>
    </div>
  )
}

export function TableSkeleton() {
  return <div className="rounded-2xl border border-dust-grey bg-white p-6 text-blue-slate shadow-soft">Loading comparison...</div>
}
