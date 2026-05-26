'use client'

import { useEffect, useState } from 'react'
import { getMySaved } from '@/lib/api'
import { useAppStore } from '@/lib/store'
import type { SavedComparison } from '@/lib/types'
import Link from 'next/link'

export function DashboardClient() {
  const user = useAppStore((state) => state.user)
  const authReady = useAppStore((state) => state.authReady)
  const [savedColleges, setSavedColleges] = useState<Array<{ college: { id: number; name: string; location: string } }>>([])
  const [savedComparisons, setSavedComparisons] = useState<SavedComparison[]>([])

  useEffect(() => {
    if (!user) return
    getMySaved().then((data) => {
      setSavedColleges(data.savedColleges)
      setSavedComparisons(data.savedComparisons)
    })
  }, [user])

  if (!authReady) {
    return <div className="rounded-[2rem] border border-shadow-grey/10 bg-white/95 p-8 text-blue-slate shadow-soft backdrop-blur">Checking your session...</div>
  }

  if (!user) {
    return (
      <div className="rounded-[2rem] border border-white/60 bg-white/90 p-8 text-center text-blue-slate shadow-soft backdrop-blur">
        Please login to view your dashboard.
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      <section
        className="relative overflow-hidden rounded-[2.25rem] border border-white/10 px-8 py-8 text-white shadow-soft md:px-10 md:py-10"
        style={{ backgroundColor: '#1d1e2c' }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(156,82,139,0.28),_transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(215,205,204,0.12),_transparent_30%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.28em] text-dust-grey">Dashboard</p>
            <h1 className="max-w-2xl font-[family-name:var(--font-work-sans)] text-4xl font-bold leading-tight md:text-5xl">
              Welcome back, {user.name}
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-dust-grey md:text-base">
              Your saved colleges and comparisons are collected in one place, so it&apos;s easier to revisit, compare, and decide.
            </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/colleges" className="rounded-full bg-grape-soda px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110">
              Explore colleges
            </Link>
            <Link href="/compare" className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/8">
              Open compare
            </Link>
            {user.role === 'ADMIN' ? (
              <Link href="/admin" className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/8">
                Admin tools
              </Link>
            ) : null}
          </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-dust-grey">Saved colleges</p>
              <p className="mt-3 text-4xl font-bold">{savedColleges.length}</p>
              <p className="mt-1 text-sm text-dust-grey">colleges ready for quick access</p>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-dust-grey">Saved comparisons</p>
              <p className="mt-3 text-4xl font-bold">{savedComparisons.length}</p>
              <p className="mt-1 text-sm text-dust-grey">comparison sets waiting to review</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-shadow-grey/10 bg-white/95 p-8 shadow-soft backdrop-blur">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-shadow-grey md:text-2xl">Saved colleges</h2>
              <p className="text-sm text-blue-slate">Your favorite institutions in one place.</p>
            </div>
            <span className="rounded-full bg-dust-grey/35 px-3 py-1 text-sm font-semibold text-shadow-grey">{savedColleges.length}</span>
          </div>
          <div className="space-y-3">
            {savedColleges.map((item) => (
              <Link
                key={item.college.id}
                href={`/college/${item.college.id}`}
                className="block rounded-[1.5rem] border border-dust-grey/50 bg-white p-4 transition hover:-translate-y-0.5 hover:border-grape-soda/40 hover:shadow-[0_10px_30px_rgba(29,30,44,0.08)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-shadow-grey">{item.college.name}</p>
                    <p className="mt-1 text-sm text-blue-slate">{item.college.location}</p>
                  </div>
                  <span className="rounded-full bg-shadow-grey px-3 py-1 text-xs font-semibold text-white">View</span>
                </div>
              </Link>
            ))}
            {!savedColleges.length ? (
              <div className="rounded-[1.5rem] border border-dashed border-dust-grey bg-dust-grey/15 p-5 text-sm text-blue-slate">
                No saved colleges yet. Browse the listing page and save a few schools to build your shortlist.
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-[2rem] border border-shadow-grey/10 bg-white/95 p-8 shadow-soft backdrop-blur">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-shadow-grey md:text-2xl">Saved comparisons</h2>
              <p className="text-sm text-blue-slate">Keep an eye on the options you&apos;re weighing.</p>
            </div>
            <span className="rounded-full bg-dust-grey/35 px-3 py-1 text-sm font-semibold text-shadow-grey">{savedComparisons.length}</span>
          </div>
          <div className="space-y-3">
            {savedComparisons.map((comparison) => (
              <div key={comparison.id} className="rounded-[1.5rem] border border-dust-grey/50 bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-shadow-grey">{comparison.title}</p>
                    <p className="mt-2 text-sm text-blue-slate">{comparison.items.map((item) => item.college.name).join(' vs ')}</p>
                  </div>
                  <span className="rounded-full bg-grape-soda/10 px-3 py-1 text-xs font-semibold text-grape-soda">
                    {comparison.items.length} colleges
                  </span>
                </div>
              </div>
            ))}
            {!savedComparisons.length ? (
              <div className="rounded-[1.5rem] border border-dashed border-dust-grey bg-dust-grey/15 p-5 text-sm text-blue-slate">
                No saved comparisons yet. Add two or three colleges to the compare flow and save the set here.
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  )
}
