'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { compareColleges, saveComparison } from '@/lib/api'
import { useAppStore } from '@/lib/store'
import type { ComparisonCollege } from '@/lib/types'
import { TableSkeleton } from './skeletons'

export function CompareTable() {
  const router = useRouter()
  const pathname = usePathname()
  const { compareIds, toggleCompare, user } = useAppStore()
  const [items, setItems] = useState<ComparisonCollege[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!compareIds.length) {
      setItems([])
      setLoading(false)
      return
    }

    setLoading(true)
    compareColleges(compareIds)
      .then(setItems)
      .finally(() => setLoading(false))
  }, [compareIds])

  if (!compareIds.length) {
    return (
      <div className="rounded-[2rem] border border-dashed border-dust-grey bg-white p-8 text-center text-blue-slate shadow-soft">
        Add 2 to 3 colleges from the listing page to compare them side by side.
      </div>
    )
  }

  if (loading) return <TableSkeleton />

  const handleSave = async () => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`)
      return
    }
    if (items.length < 2) return
    await saveComparison(
      items.map((item) => item.id),
      'My comparison',
    )
  }

  const rows: Array<[string, string[]]> = [
    ['Fees', items.map((item) => `INR ${item.fees.toLocaleString()}`)],
    ['Placement %', items.map((item) => `${item.placementRate}%`)],
    ['Average Package', items.map((item) => `INR ${item.avgPlacementPackage.toLocaleString()}`)],
    ['Rating', items.map((item) => item.rating.toFixed(1))],
    ['Location', items.map((item) => item.location)],
    ['Top Courses', items.map((item) => item.topCourses.join(', '))],
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-blue-slate">Decision tool</p>
          <h1 className="font-[family-name:var(--font-work-sans)] text-3xl font-bold text-shadow-grey">Compare your shortlisted colleges</h1>
        </div>
        <button
          className="rounded-full bg-grape-soda px-5 py-3 text-sm font-semibold text-white transition hover:bg-grape-soda/90"
          onClick={handleSave}
          disabled={!user || items.length < 2}
        >
          {user ? 'Save comparison' : 'Login to save'}
        </button>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-blue-slate/15 bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left">
            <thead>
              <tr className="bg-shadow-grey text-white">
                <th className="border-b border-white/10 p-4 text-sm font-semibold uppercase tracking-[0.18em] text-black">
                  Metric
                </th>
                {items.map((college) => (
                  <th key={college.id} className="border-b border-white/10 p-4 align-top">
                    <div className="flex items-start justify-between gap-3">
                      <span className="block max-w-xs text-sm font-semibold leading-6 text-black">{college.name}</span>
                      <button
                        className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-dust-grey transition hover:bg-white/10 hover:text-white"
                        onClick={() => toggleCompare(college.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, values], index) => (
                <tr key={label} className={index % 2 === 0 ? 'bg-dust-grey/10' : ''}>
                  <td className="border-t border-dust-grey p-4 font-semibold text-shadow-grey">{label}</td>
                  {values.map((value, valueIndex) => (
                    <td key={valueIndex} className="border-t border-dust-grey p-4 text-sm text-blue-slate">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-[2rem] border border-dust-grey bg-dust-grey/25 p-6 shadow-soft">
        <h2 className="mb-3 text-xl font-semibold text-shadow-grey">Recommended next step</h2>
        <p className="text-sm text-blue-slate">
          Use the compare table to narrow down by fee-to-placement ratio, then jump into the detail page for specific courses and reviews.
        </p>
        <Link href="/dashboard" className="mt-4 inline-flex rounded-xl bg-shadow-grey px-4 py-3 text-sm font-semibold text-white transition hover:bg-shadow-grey/90">
          Open dashboard
        </Link>
      </div>
    </div>
  )
}
