import Link from 'next/link'

export default function HomePage() {
  return (
    <main style={{ backgroundColor: '#ffffff' }}>
      <section
        className="relative overflow-hidden border-b text-white"
        style={{
          backgroundColor: '#1d1e2c',
          borderColor: '#d7cdcc',
          color: '#ffffff',
          minHeight: 'calc(100vh - 88px)',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at top right, rgba(156,82,139,0.28), transparent 34%), radial-gradient(circle at bottom left, rgba(215,205,204,0.2), transparent 28%)',
          }}
        />
        <div
          className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 0.9fr)',
            alignItems: 'center',
            gap: '2.5rem',
            maxWidth: '80rem',
            margin: '0 auto',
            padding: '4rem 1rem',
          }}
        >
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <p className="text-sm uppercase tracking-[0.22em]" style={{ color: '#d7cdcc' }}>
              College discovery platform
            </p>
            <h1 className="max-w-xl font-[family-name:var(--font-work-sans)] text-5xl font-bold leading-tight text-white" style={{ maxWidth: '42rem', fontSize: '3.5rem', lineHeight: 1.05 }}>
              Compare colleges, save shortlists, and make better decisions.
            </h1>
            <p className="max-w-xl text-lg" style={{ color: '#d7cdcc', maxWidth: '42rem', fontSize: '1.125rem', lineHeight: 1.7 }}>
              A production-grade MVP inspired by Careers360 and Collegedunia with search, detail pages, comparison, and authentication.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <Link href="/colleges" className="rounded-full px-6 py-3 text-sm font-semibold text-white shadow-soft" style={{ backgroundColor: '#9c528b' }}>
                Explore colleges
              </Link>
              <Link
                href="/compare"
                className="rounded-full border px-6 py-3 text-sm font-semibold text-white"
                style={{ borderColor: 'rgba(215,205,204,0.4)', backgroundColor: 'rgba(255,255,255,0.06)' }}
              >
                Compare now
              </Link>
            </div>
          </div>
          <div
            className="grid gap-4 rounded-[2rem] border p-4 shadow-soft backdrop-blur sm:grid-cols-2"
            style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.08)' }}
          >
          {[
            ['25+', 'colleges in database'],
            ['Search', 'by name, location, fees'],
            ['Compare', '2 to 3 colleges'],
            ['Saved', 'colleges and comparisons'],
          ].map(([title, description]) => (
            <div key={title} className="rounded-2xl border p-5" style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.12)' }}>
              <p className="text-3xl font-bold text-white">{title}</p>
              <p className="mt-1 text-sm" style={{ color: '#d7cdcc' }}>
                {description}
              </p>
            </div>
          ))}
        </div>
        </div>
      </section>
    </main>
  )
}
