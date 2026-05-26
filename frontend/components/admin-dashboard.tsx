'use client'

import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createAdminCollege, deleteAdminCollege, getAdminColleges, updateAdminCollege } from '@/lib/api'
import { useAppStore } from '@/lib/store'
import type { AdminCollegeForm, Course, Placement } from '@/lib/types'

type AdminCollegeRecord = AdminCollegeForm & {
  id: number
  createdAt: string
  updatedAt: string
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function createBlankCollege(): AdminCollegeForm {
  return {
    slug: '',
    name: '',
    location: '',
    city: '',
    state: '',
    fees: 0,
    rating: 0,
    logoUrl: 'https://via.placeholder.com/200?text=College+Logo',
    shortDescription: '',
    overview: '',
    placementPercent: 0,
    averagePackage: 0,
    bannerImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
    courses: [
      { id: 0, name: '', degree: 'B.Tech', duration: '4 Years', fees: 0 },
    ],
    placements: [
      { id: 0, year: new Date().getFullYear(), avgPackage: 0, highestPackage: 0, placementRate: 0 },
    ],
  }
}

function fromRecord(college: AdminCollegeRecord): AdminCollegeForm {
  return {
    slug: college.slug,
    name: college.name,
    location: college.location,
    city: college.city,
    state: college.state,
    fees: college.fees,
    rating: college.rating,
    logoUrl: college.logoUrl,
    shortDescription: college.shortDescription,
    overview: college.overview,
    placementPercent: college.placementPercent,
    averagePackage: college.averagePackage,
    bannerImage: college.bannerImage,
    courses: college.courses,
    placements: college.placements,
  }
}

function sanitizePayload(form: AdminCollegeForm): AdminCollegeForm {
  return {
    ...form,
    slug: (form.slug.trim() || slugify(form.name)).toLowerCase(),
    name: form.name.trim(),
    location: form.location.trim(),
    city: form.city.trim(),
    state: form.state.trim(),
    logoUrl: form.logoUrl.trim(),
    shortDescription: form.shortDescription.trim(),
    overview: form.overview.trim(),
    bannerImage: form.bannerImage.trim(),
    courses: form.courses.map((course) => ({
      ...course,
      name: course.name.trim(),
      degree: course.degree.trim(),
      duration: course.duration.trim(),
      fees: Number(course.fees),
    })),
    placements: form.placements.map((placement) => ({
      ...placement,
      year: Number(placement.year),
      avgPackage: Number(placement.avgPackage),
      highestPackage: Number(placement.highestPackage),
      placementRate: Number(placement.placementRate),
    })),
  }
}

const coreFields: Array<{
  label: string
  field: keyof AdminCollegeForm
  type: 'text' | 'number'
  span?: boolean
  step?: string
}> = [
  { label: 'Name', field: 'name', type: 'text' },
  { label: 'Slug', field: 'slug', type: 'text' },
  { label: 'City', field: 'city', type: 'text' },
  { label: 'State', field: 'state', type: 'text' },
  { label: 'Location', field: 'location', type: 'text', span: true },
  { label: 'Fees', field: 'fees', type: 'number' },
  { label: 'Rating', field: 'rating', type: 'number', step: '0.1' },
  { label: 'Placement %', field: 'placementPercent', type: 'number', step: '0.1' },
  { label: 'Average Package', field: 'averagePackage', type: 'number' },
  { label: 'Logo URL', field: 'logoUrl', type: 'text', span: true },
  { label: 'Banner URL', field: 'bannerImage', type: 'text', span: true },
]

export function AdminDashboard() {
  const user = useAppStore((state) => state.user)
  const authReady = useAppStore((state) => state.authReady)
  const [colleges, setColleges] = useState<AdminCollegeRecord[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [form, setForm] = useState<AdminCollegeForm>(createBlankCollege())
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')

  const filteredColleges = useMemo(
    () =>
      colleges.filter((college) => {
        const haystack = `${college.name} ${college.slug} ${college.city} ${college.state}`.toLowerCase()
        return haystack.includes(search.trim().toLowerCase())
      }),
    [colleges, search],
  )

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)
    setError('')
    getAdminColleges()
      .then((items) => {
        if (!active) return
        setColleges(items)
        if (items.length > 0) {
          setSelectedId((current) => current ?? items[0].id)
          setForm((current) => (current.name ? current : fromRecord(items[0])))
        }
      })
      .catch((err: unknown) => {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Failed to load colleges')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [user])

  useEffect(() => {
    if (selectedId === null) {
      return
    }
    const selected = colleges.find((college) => college.id === selectedId)
    if (selected) {
      setForm(fromRecord(selected))
      setStatus('')
      setError('')
    }
  }, [selectedId, colleges])

  if (!authReady) {
    return (
      <div className="rounded-[2rem] border border-shadow-grey/10 bg-white/95 p-8 text-blue-slate shadow-soft backdrop-blur">
        Checking your session...
      </div>
    )
  }

  if (!user) {
    return (
      <div className="rounded-[2rem] border border-shadow-grey/10 bg-white/95 p-8 text-blue-slate shadow-soft backdrop-blur">
        Please log in to access the admin dashboard.
      </div>
    )
  }

  if (user.role !== 'ADMIN') {
    return (
      <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 text-red-700 shadow-soft">
        You do not have access to the admin dashboard.
      </div>
    )
  }

  async function handleSave() {
    try {
      setSaving(true)
      setError('')
      setStatus('')
      const payload = sanitizePayload(form)
      const saved = selectedId ? await updateAdminCollege(selectedId, payload) : await createAdminCollege(payload)
      const refreshed = await getAdminColleges()
      setColleges(refreshed)
      setSelectedId(saved.id)
      setForm(fromRecord(saved))
      setStatus(selectedId ? 'College updated successfully.' : 'College created successfully.')
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.error?.message
        const details = err.response?.data?.error?.details
        const detailMessage =
          Array.isArray(details) && details.length > 0
            ? details.map((detail: { issue?: string }) => detail.issue).filter(Boolean).join(', ')
            : ''
        setError(message || detailMessage || err.message || 'Failed to save college')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to save college')
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!selectedId) return
    if (!window.confirm('Delete this college? This will remove its courses, placements, and related data.')) {
      return
    }

    try {
      setSaving(true)
      setError('')
      await deleteAdminCollege(selectedId)
      const refreshed = await getAdminColleges()
      setColleges(refreshed)
      if (refreshed.length > 0) {
        setSelectedId(refreshed[0].id)
        setForm(fromRecord(refreshed[0]))
      } else {
        setSelectedId(null)
        setForm(createBlankCollege())
      }
      setStatus('College deleted.')
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error?.message || err.message || 'Failed to delete college')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to delete college')
      }
    } finally {
      setSaving(false)
    }
  }

  function updateCourse(index: number, field: keyof Course, value: string | number) {
    setForm((current) => ({
      ...current,
      courses: current.courses.map((course, currentIndex) =>
        currentIndex === index ? { ...course, [field]: value } : course,
      ),
    }))
  }

  function addCourse() {
    setForm((current) => ({
      ...current,
      courses: [...current.courses, { id: Date.now(), name: '', degree: 'B.Tech', duration: '4 Years', fees: 0 }],
    }))
  }

  function removeCourse(index: number) {
    setForm((current) => ({
      ...current,
      courses: current.courses.filter((_, currentIndex) => currentIndex !== index),
    }))
  }

  function updatePlacement(index: number, field: keyof Placement, value: string | number) {
    setForm((current) => ({
      ...current,
      placements: current.placements.map((placement, currentIndex) =>
        currentIndex === index ? { ...placement, [field]: value } : placement,
      ),
    }))
  }

  function addPlacement() {
    setForm((current) => ({
      ...current,
      placements: [
        ...current.placements,
        {
          id: Date.now(),
          year: new Date().getFullYear(),
          avgPackage: 0,
          highestPackage: 0,
          placementRate: 0,
        },
      ],
    }))
  }

  function removePlacement(index: number) {
    setForm((current) => ({
      ...current,
      placements: current.placements.filter((_, currentIndex) => currentIndex !== index),
    }))
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
      <aside className="h-fit rounded-[2rem] border border-shadow-grey/10 bg-white/95 p-5 shadow-soft backdrop-blur">
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-blue-slate">Admin</p>
            <h2 className="mt-2 text-2xl font-bold text-shadow-grey">Manage colleges</h2>
            <p className="mt-2 text-sm leading-6 text-blue-slate">
              Add or update a college, keep its courses and placement data tied to the same database record, and publish changes instantly.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/dashboard" className="rounded-full border border-shadow-grey/10 px-4 py-2 text-sm font-semibold text-shadow-grey">
              Dashboard
            </Link>
            <button
              type="button"
              className="rounded-full bg-grape-soda px-4 py-2 text-sm font-semibold text-white"
              onClick={() => {
                setSelectedId(null)
                setForm(createBlankCollege())
                setStatus('')
                setError('')
              }}
            >
              New
            </button>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-blue-slate">Search</span>
            <input
              className="w-full rounded-2xl border border-white/12 bg-[#f7f2f0] px-4 py-3 text-sm text-shadow-grey outline-none transition placeholder:text-blue-slate/60 focus:border-grape-soda focus:ring-2 focus:ring-grape-soda/20"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search colleges"
            />
          </label>

          <div className="space-y-2">
            {loading ? (
              <div className="rounded-2xl border border-dust-grey/40 bg-dust-grey/20 p-4 text-sm text-blue-slate">Loading colleges...</div>
            ) : null}
            {!loading && filteredColleges.map((college) => {
              const active = college.id === selectedId
              return (
                <button
                  key={college.id}
                  type="button"
                  className="w-full rounded-2xl border px-4 py-4 text-left transition"
                  style={{
                    borderColor: active ? '#9c528b' : 'rgba(89,101,111,0.12)',
                    backgroundColor: active ? 'rgba(156,82,139,0.12)' : '#ffffff',
                  }}
                  onClick={() => setSelectedId(college.id)}
                >
                  <p className="font-semibold text-shadow-grey">{college.name}</p>
                  <p className="mt-1 text-sm text-blue-slate">{college.city}, {college.state}</p>
                </button>
              )
            })}
          </div>
        </div>
      </aside>

      <section className="space-y-6">
        <div className="rounded-[2rem] border border-shadow-grey/10 bg-white/95 p-6 shadow-soft backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-blue-slate">College editor</p>
              <h1 className="mt-2 font-[family-name:var(--font-work-sans)] text-3xl font-bold text-shadow-grey">
                {selectedId ? 'Update college' : 'Create a new college'}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-slate">
                The form saves core details and the related course and placement rows in the database in one transaction.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-full bg-shadow-grey px-5 py-3 text-sm font-semibold text-white transition hover:bg-shadow-grey/90 disabled:opacity-60"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : selectedId ? 'Save changes' : 'Create college'}
              </button>
              {selectedId ? (
                <button
                  type="button"
                  className="rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                  onClick={handleDelete}
                  disabled={saving}
                >
                  Delete
                </button>
              ) : null}
            </div>
          </div>

          {error ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}
          {status ? <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{status}</div> : null}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-shadow-grey/10 bg-white/95 p-6 shadow-soft backdrop-blur">
            <h2 className="text-xl font-semibold text-shadow-grey">Core details</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {coreFields.map(({ label, field, type, span, step }) => (
                <label key={field} className={span ? 'sm:col-span-2' : ''}>
                  <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-blue-slate">{label}</span>
                  <input
                    className="w-full rounded-2xl border border-white/12 bg-[#f7f2f0] px-4 py-3 text-sm text-shadow-grey outline-none transition placeholder:text-blue-slate/60 focus:border-grape-soda focus:ring-2 focus:ring-grape-soda/20"
                    type={type}
                    step={step}
                    value={String(form[field])}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        [field]: type === 'number' ? Number(event.target.value) : event.target.value,
                      }))
                    }
                  />
                </label>
              ))}
              <label className="sm:col-span-2">
                <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-blue-slate">Short description</span>
                <textarea
                  className="min-h-24 w-full rounded-2xl border border-white/12 bg-[#f7f2f0] px-4 py-3 text-sm text-shadow-grey outline-none transition placeholder:text-blue-slate/60 focus:border-grape-soda focus:ring-2 focus:ring-grape-soda/20"
                  value={form.shortDescription}
                  onChange={(event) => setForm((current) => ({ ...current, shortDescription: event.target.value }))}
                />
              </label>
              <label className="sm:col-span-2">
                <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-blue-slate">Overview</span>
                <textarea
                  className="min-h-36 w-full rounded-2xl border border-white/12 bg-[#f7f2f0] px-4 py-3 text-sm text-shadow-grey outline-none transition placeholder:text-blue-slate/60 focus:border-grape-soda focus:ring-2 focus:ring-grape-soda/20"
                  value={form.overview}
                  onChange={(event) => setForm((current) => ({ ...current, overview: event.target.value }))}
                />
              </label>
            </div>
          </div>

          <div className="rounded-[2rem] border border-shadow-grey/10 bg-white/95 p-6 shadow-soft backdrop-blur">
            <h2 className="text-xl font-semibold text-shadow-grey">Courses</h2>
            <div className="mt-5 space-y-4">
              {form.courses.map((course, index) => (
                <div key={`${course.id}-${index}`} className="rounded-2xl border border-dust-grey/40 bg-dust-grey/15 p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      className="rounded-xl border border-white/12 bg-[#f7f2f0] px-4 py-3 text-sm text-shadow-grey outline-none transition focus:border-grape-soda focus:ring-2 focus:ring-grape-soda/20"
                      value={course.name}
                      placeholder="Course name"
                      onChange={(event) => updateCourse(index, 'name', event.target.value)}
                    />
                    <input
                      className="rounded-xl border border-white/12 bg-[#f7f2f0] px-4 py-3 text-sm text-shadow-grey outline-none transition focus:border-grape-soda focus:ring-2 focus:ring-grape-soda/20"
                      value={course.degree}
                      placeholder="Degree"
                      onChange={(event) => updateCourse(index, 'degree', event.target.value)}
                    />
                    <input
                      className="rounded-xl border border-white/12 bg-[#f7f2f0] px-4 py-3 text-sm text-shadow-grey outline-none transition focus:border-grape-soda focus:ring-2 focus:ring-grape-soda/20"
                      value={course.duration}
                      placeholder="Duration"
                      onChange={(event) => updateCourse(index, 'duration', event.target.value)}
                    />
                    <input
                      className="rounded-xl border border-white/12 bg-[#f7f2f0] px-4 py-3 text-sm text-shadow-grey outline-none transition focus:border-grape-soda focus:ring-2 focus:ring-grape-soda/20"
                      type="number"
                      value={course.fees}
                      placeholder="Fees"
                      onChange={(event) => updateCourse(index, 'fees', Number(event.target.value))}
                    />
                  </div>
                  <button type="button" className="mt-3 text-sm font-semibold text-grape-soda" onClick={() => removeCourse(index)}>
                    Remove course
                  </button>
                </div>
              ))}
              <button type="button" className="rounded-full border border-shadow-grey/10 px-4 py-2 text-sm font-semibold text-shadow-grey" onClick={addCourse}>
                Add course
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-shadow-grey/10 bg-white/95 p-6 shadow-soft backdrop-blur">
          <h2 className="text-xl font-semibold text-shadow-grey">Placement records</h2>
          <div className="mt-5 space-y-4">
            {form.placements.map((placement, index) => (
              <div key={`${placement.id}-${index}`} className="rounded-2xl border border-dust-grey/40 bg-dust-grey/15 p-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <input
                    className="rounded-xl border border-white/12 bg-[#f7f2f0] px-4 py-3 text-sm text-shadow-grey outline-none transition focus:border-grape-soda focus:ring-2 focus:ring-grape-soda/20"
                    type="number"
                    value={placement.year}
                    onChange={(event) => updatePlacement(index, 'year', Number(event.target.value))}
                    placeholder="Year"
                  />
                  <input
                    className="rounded-xl border border-white/12 bg-[#f7f2f0] px-4 py-3 text-sm text-shadow-grey outline-none transition focus:border-grape-soda focus:ring-2 focus:ring-grape-soda/20"
                    type="number"
                    value={placement.avgPackage}
                    onChange={(event) => updatePlacement(index, 'avgPackage', Number(event.target.value))}
                    placeholder="Avg package"
                  />
                  <input
                    className="rounded-xl border border-white/12 bg-[#f7f2f0] px-4 py-3 text-sm text-shadow-grey outline-none transition focus:border-grape-soda focus:ring-2 focus:ring-grape-soda/20"
                    type="number"
                    value={placement.highestPackage}
                    onChange={(event) => updatePlacement(index, 'highestPackage', Number(event.target.value))}
                    placeholder="Highest package"
                  />
                  <input
                    className="rounded-xl border border-white/12 bg-[#f7f2f0] px-4 py-3 text-sm text-shadow-grey outline-none transition focus:border-grape-soda focus:ring-2 focus:ring-grape-soda/20"
                    type="number"
                    value={placement.placementRate}
                    onChange={(event) => updatePlacement(index, 'placementRate', Number(event.target.value))}
                    placeholder="Placement rate"
                  />
                </div>
                <button type="button" className="mt-3 text-sm font-semibold text-grape-soda" onClick={() => removePlacement(index)}>
                  Remove placement
                </button>
              </div>
            ))}
            <button type="button" className="rounded-full border border-shadow-grey/10 px-4 py-2 text-sm font-semibold text-shadow-grey" onClick={addPlacement}>
              Add placement
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
