'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { listColleges, saveCollege } from '@/lib/api'
import type { College, PaginatedResponse } from '@/lib/types'
import { useAppStore } from '@/lib/store'
import { CollegeCardSkeleton } from './skeletons'

const FALLBACK_BANNER =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480">
      <defs>
        <linearGradient id="g" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="#1d1e2c" />
          <stop offset="55%" stop-color="#59656f" />
          <stop offset="100%" stop-color="#9c528b" />
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill="url(#g)" />
      <circle cx="660" cy="110" r="110" fill="rgba(255,255,255,0.08)" />
      <circle cx="140" cy="360" r="150" fill="rgba(255,255,255,0.06)" />
      <text x="50%" y="50%" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="34" font-weight="700">AcademiaLink</text>
    </svg>
  `)

function useDebouncedValue<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export function CollegeBrowser() {
  const router = useRouter()
  const pathname = usePathname()
  const { compareIds, toggleCompare, user } = useAppStore()
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [minFees, setMinFees] = useState('')
  const [maxFees, setMaxFees] = useState('')
  const [sortBy, setSortBy] = useState<'rating' | 'fees'>('rating')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<PaginatedResponse<College>>({
    items: [],
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 1,
  })
  const [error, setError] = useState('')

  const debouncedSearch = useDebouncedValue(search)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')

    listColleges({
      search: debouncedSearch || undefined,
      state: location || undefined,
      minFees: minFees ? Number(minFees) : undefined,
      maxFees: maxFees ? Number(maxFees) : undefined,
      sortBy,
      sortOrder,
      page,
      limit: 6,
    })
      .then((result) => {
        if (active) setData(result)
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Failed to load colleges')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [debouncedSearch, location, minFees, maxFees, sortBy, sortOrder, page])

  const locations = useMemo(() => ['Delhi', 'Maharashtra', 'Tamil Nadu', 'Karnataka', 'Rajasthan'], [])
  const popularCourses = useMemo(
    () => ['Engineering (B.Tech)', 'Computer Science', 'Medicine (MBBS)', 'Business Management'],
    [],
  )

  const handleSave = async (collegeId: number) => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`)
      return
    }
    await saveCollege(collegeId)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="h-fit rounded-[2rem] border p-6 text-white shadow-soft" style={{ backgroundColor: '#1d1e2c', borderColor: 'rgba(215,205,204,0.16)' }}>
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-dust-grey">Filters</p>
            <p className="mt-1 text-sm text-blue-slate">Narrow down colleges quickly.</p>
          </div>
          <button
            className="text-sm font-semibold"
            style={{ color: '#9c528b' }}
            onClick={() => {
              setSearch('')
              setLocation('')
              setMinFees('')
              setMaxFees('')
              setSortBy('rating')
              setSortOrder('desc')
            }}
          >
            Clear all
          </button>
        </div>

        <div className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-dust-grey">Search</span>
            <input
              className="w-full rounded-2xl border border-white/12 bg-[#2a2b3d] px-4 py-3 text-sm text-white outline-none transition placeholder:text-dust-grey/70 focus:border-grape-soda focus:ring-2 focus:ring-grape-soda/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search colleges"
            />
          </label>

          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-dust-grey">Location</p>
            <div className="grid gap-3">
              {locations.map((value) => {
                const active = value === location
                return (
                  <button
                    key={value}
                    type="button"
                    className="rounded-2xl border px-4 py-3 text-left text-sm font-medium transition"
                    style={{
                      borderColor: active ? '#9c528b' : 'rgba(215,205,204,0.18)',
                      backgroundColor: active ? 'rgba(156,82,139,0.2)' : 'rgba(42,43,61,0.95)',
                      color: active ? '#ffffff' : '#f4ecea',
                    }}
                    onClick={() => setLocation(active ? '' : value)}
                  >
                    {value}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-dust-grey/20 bg-white/10 p-4">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-dust-grey">Fees range</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs uppercase tracking-[0.18em] text-dust-grey">Min</span>
                <input
                  className="w-full rounded-2xl border border-white/12 bg-[#2a2b3d] px-4 py-3 text-sm text-white outline-none transition placeholder:text-dust-grey/70 focus:border-grape-soda focus:ring-2 focus:ring-grape-soda/20"
                  type="number"
                  value={minFees}
                  onChange={(e) => setMinFees(e.target.value)}
                  placeholder="10,000"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs uppercase tracking-[0.18em] text-dust-grey">Max</span>
                <input
                  className="w-full rounded-2xl border border-white/12 bg-[#2a2b3d] px-4 py-3 text-sm text-white outline-none transition placeholder:text-dust-grey/70 focus:border-grape-soda focus:ring-2 focus:ring-grape-soda/20"
                  type="number"
                  value={maxFees}
                  onChange={(e) => setMaxFees(e.target.value)}
                  placeholder="100,000"
                />
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-dust-grey/20 bg-white/10 p-4">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold uppercase tracking-[0.18em] text-dust-grey">Sort by</span>
              <select
                className="w-full rounded-2xl border border-white/12 bg-[#2a2b3d] px-4 py-3 text-sm text-white outline-none transition focus:border-grape-soda focus:ring-2 focus:ring-grape-soda/20"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'rating' | 'fees')}
              >
                <option value="rating">Highest rating</option>
                <option value="fees">Lowest fees</option>
              </select>
            </label>
            <label className="mt-4 block">
              <span className="mb-1 block text-sm font-semibold uppercase tracking-[0.18em] text-dust-grey">Order</span>
              <select
                className="w-full rounded-2xl border border-white/12 bg-[#2a2b3d] px-4 py-3 text-sm text-white outline-none transition focus:border-grape-soda focus:ring-2 focus:ring-grape-soda/20"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </label>
          </div>

          <div className="rounded-2xl border border-dust-grey/20 bg-white/10 p-4">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-dust-grey">Popular courses</p>
            <div className="flex flex-wrap gap-2">
              {popularCourses.map((course) => (
                <button
                  key={course}
                  type="button"
                  className="rounded-full border px-4 py-2 text-xs font-medium transition"
                  style={{
                    borderColor: search === course ? '#9c528b' : 'rgba(215,205,204,0.18)',
                    backgroundColor: search === course ? '#9c528b' : 'transparent',
                    color: search === course ? '#ffffff' : '#f4ecea',
                  }}
                  onClick={() => setSearch(search === course ? '' : course)}
                >
                  {course}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-blue-slate">Explore colleges</p>
            <h1 className="font-[family-name:var(--font-work-sans)] text-3xl font-bold text-shadow-grey">Find the right college faster</h1>
          </div>
          <p className="text-sm text-blue-slate">{data.total} colleges found</p>
        </div>

        {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => <CollegeCardSkeleton key={index} />)
            : data.items.map((college) => (
                <article
                  key={college.id}
                  className="relative flex h-full flex-col overflow-hidden rounded-[2rem] border bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-lg"
                  style={{ borderColor: 'rgba(89,101,111,0.18)' }}
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-slate via-grape-soda to-shadow-grey" />
                  <div className="relative h-48 shrink-0 overflow-hidden bg-gradient-to-br from-shadow-grey via-blue-slate to-grape-soda">
                    <img
                      src={college.bannerImage}
                      alt={college.name}
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        const target = event.currentTarget
                        if (target.src !== FALLBACK_BANNER) {
                          target.src = FALLBACK_BANNER
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/35" />
                    <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-shadow-grey shadow-sm">
                      {college.rating.toFixed(1)}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col space-y-4 p-5">
                    <div>
                      <h3 className="text-xl font-semibold text-shadow-grey">{college.name}</h3>
                      <p className="mt-1 text-sm text-blue-slate">{college.location}</p>
                    </div>
                    <p className="min-h-[3.5rem] text-sm leading-6 text-blue-slate">{college.shortDescription}</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-2xl bg-dust-grey/25 p-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-blue-slate">Fees</p>
                        <p className="mt-2 font-semibold text-shadow-grey">INR {college.fees.toLocaleString()}</p>
                      </div>
                      <div className="rounded-2xl bg-dust-grey/25 p-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-blue-slate">Rating</p>
                        <p className="mt-2 font-semibold text-shadow-grey">{college.rating.toFixed(1)}</p>
                      </div>
                    </div>
                    <div className="mt-auto space-y-3 pt-1">
                      <div className="flex flex-wrap gap-3">
                      <Link href={`/college/${college.id}`} className="rounded-2xl bg-shadow-grey px-4 py-3 text-sm font-semibold text-white transition hover:bg-shadow-grey/90">
                        Details
                      </Link>
                      <button
                        className="rounded-2xl border px-4 py-3 text-sm font-semibold transition"
                        style={{
                          borderColor: compareIds.includes(college.id) ? '#9c528b' : '#d7cdcc',
                          backgroundColor: compareIds.includes(college.id) ? '#9c528b' : '#ffffff',
                          color: compareIds.includes(college.id) ? '#ffffff' : '#1d1e2c',
                        }}
                        onClick={() => toggleCompare(college.id)}
                      >
                        {compareIds.includes(college.id) ? 'Added' : 'Compare'}
                      </button>
                      </div>
                      <button
                        className="w-full rounded-2xl border px-4 py-3 text-sm font-medium text-shadow-grey transition hover:bg-dust-grey/25"
                        style={{ borderColor: 'rgba(89,101,111,0.2)' }}
                        onClick={() => handleSave(college.id)}
                      >
                        {user ? 'Save college' : 'Login to save'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 rounded-full border border-dust-grey/30 bg-white/90 px-4 py-3 text-sm text-blue-slate shadow-soft">
          <button
            className="rounded-full px-4 py-2 transition hover:bg-blue-slate/10"
            disabled={page === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </button>
          <span>
            Page {page} of {data.totalPages}
          </span>
          <button
            className="rounded-full px-4 py-2 transition hover:bg-blue-slate/10"
            disabled={page === data.totalPages}
            onClick={() => setPage((current) => Math.min(data.totalPages, current + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
