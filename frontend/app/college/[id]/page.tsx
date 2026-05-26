import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCollege } from '@/lib/api'

export const dynamic = 'force-dynamic'

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
      <text x="50%" y="50%" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="34" font-weight="700">AcademiaLink</text>
    </svg>
  `)

export default async function CollegeDetailPage({ params }: { params: { id: string } }) {
  try {
    const college = await getCollege(params.id)

    return (
      <main className="pb-12">
        <section className="relative overflow-hidden text-white" style={{ backgroundColor: '#1d1e2c' }}>
          <div className="absolute inset-0">
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
            <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/35 to-black/10" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-24">
            <div className="max-w-3xl space-y-6 rounded-[2rem] border border-white/10 bg-white/10 p-8 shadow-soft backdrop-blur">
              <p className="text-sm uppercase tracking-[0.22em] text-dust-grey">College profile</p>
              <h1 className="font-[family-name:var(--font-work-sans)] text-4xl font-bold leading-tight text-white md:text-5xl">
                {college.name}
              </h1>
              <p className="text-lg leading-7 text-dust-grey">{college.shortDescription}</p>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="rounded-full bg-white/10 px-4 py-2 text-white">Rating {college.rating.toFixed(1)}</span>
                <span className="rounded-full bg-white/10 px-4 py-2 text-white">INR {college.fees.toLocaleString()} / year</span>
                <span className="rounded-full bg-white/10 px-4 py-2 text-white">{college.location}</span>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/compare" className="rounded-full bg-grape-soda px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110">
                  Compare now
                </Link>
                <Link href="/colleges" className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                  Back to browse
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-[1.65fr_0.95fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-shadow-grey/10 bg-white/96 p-8 shadow-soft backdrop-blur">
              <h2 className="mb-4 text-2xl font-semibold text-shadow-grey">Overview</h2>
              <p className="text-sm leading-7 text-blue-slate">{college.overview}</p>
            </div>

            <div className="rounded-[2rem] border border-shadow-grey/10 bg-white/96 p-8 shadow-soft backdrop-blur">
              <h2 className="mb-6 text-2xl font-semibold text-shadow-grey">Courses offered</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {college.courses.map((course) => (
                  <div key={course.id} className="rounded-3xl bg-dust-grey/25 p-5">
                    <p className="font-semibold text-shadow-grey">{course.name}</p>
                    <p className="mt-2 text-sm text-blue-slate">
                      {course.degree} · {course.duration}
                    </p>
                    <p className="mt-3 text-sm font-semibold text-shadow-grey">INR {course.fees.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-shadow-grey/10 bg-white/96 p-8 shadow-soft backdrop-blur">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-shadow-grey">Reviews</h2>
                  <p className="text-sm text-blue-slate">What students say about this campus.</p>
                </div>
                <span className="rounded-full bg-dust-grey/50 px-3 py-1 text-sm font-semibold text-shadow-grey">
                  {college.reviews.length} reviews
                </span>
              </div>
              <div className="space-y-4">
                {college.reviews.map((review) => (
                  <div key={review.id} className="rounded-3xl border border-dust-grey p-5">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold text-shadow-grey">{review.author}</p>
                      <span className="rounded-full bg-grape-soda/10 px-3 py-1 text-sm font-semibold text-grape-soda">
                        {review.rating.toFixed(1)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-blue-slate">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-shadow-grey/10 bg-white/96 p-8 shadow-soft backdrop-blur">
              <h2 className="mb-4 text-2xl font-semibold text-shadow-grey">Placements</h2>
              <div className="space-y-4 text-sm text-blue-slate">
                <div className="flex justify-between rounded-2xl bg-dust-grey/20 p-4">
                  <span>Placement rate</span>
                  <span className="font-semibold text-shadow-grey">{college.placementPercent}%</span>
                </div>
                <div className="flex justify-between rounded-2xl bg-dust-grey/20 p-4">
                  <span>Average package</span>
                  <span className="font-semibold text-shadow-grey">INR {college.averagePackage.toLocaleString()}</span>
                </div>
                <div className="rounded-2xl bg-dust-grey/20 p-4">
                  <p className="text-sm font-semibold text-shadow-grey">Top recruiters</p>
                  <p className="mt-2 text-sm text-blue-slate">
                    Google · Microsoft · Amazon · Deloitte · Accenture · Infosys · TCS
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-shadow-grey/10 bg-dust-grey/30 p-8 shadow-soft backdrop-blur">
              <h2 className="mb-4 text-2xl font-semibold text-shadow-grey">Recruiters</h2>
              <div className="grid gap-3 text-sm text-blue-slate">
                {['Google', 'Microsoft', 'Amazon', 'Deloitte', 'Accenture'].map((company) => (
                  <div key={company} className="rounded-2xl bg-white/80 p-4">
                    {company}
                  </div>
                ))}
              </div>
              <Link
                href="/compare"
                className="mt-6 inline-flex rounded-xl bg-shadow-grey px-4 py-3 text-sm font-semibold text-white transition hover:bg-shadow-grey/90"
              >
                Add to compare
              </Link>
            </div>
          </aside>
        </section>
      </main>
    )
  } catch {
    notFound()
  }
}
