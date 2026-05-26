'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppStore } from '@/lib/store'

const navItems = [
  { href: '/colleges', label: 'Colleges' },
  { href: '/compare', label: 'Compare' },
  { href: '/dashboard', label: 'Dashboard' },
]

export function Navbar() {
  const pathname = usePathname()
  const { user, logout } = useAppStore()

  return (
    <header
      className="sticky top-0 z-50 border-b border-white/10 text-white shadow-[0_12px_40px_rgba(29,30,44,0.18)]"
      style={{ backgroundColor: '#1d1e2c' }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="flex items-center gap-3 self-start">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-grape-soda text-white shadow-soft ring-1 ring-white/10">
            <span className="material-symbols-outlined text-[22px]">school</span>
          </div>
          <div>
            <p className="font-[family-name:var(--font-work-sans)] text-xl font-bold text-white">AcademiaLink</p>
            <p className="text-xs uppercase tracking-[0.22em]" style={{ color: '#d7cdcc' }}>
              Explore. Compare. Decide.
            </p>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-white/5 p-2">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href as any}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  active ? 'bg-grape-soda text-white shadow-soft' : 'text-dust-grey hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
          {user?.role === 'ADMIN' ? (
            <Link
              href="/admin"
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                pathname?.startsWith('/admin') ? 'bg-grape-soda text-white shadow-soft' : 'text-dust-grey hover:bg-white/10 hover:text-white'
              }`}
            >
              Admin
            </Link>
          ) : null}
        </nav>

        <div className="flex items-center gap-2 self-end">
          {user ? (
            <>
              <Link href="/dashboard" className="inline-flex items-center rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/8">
                {user.name}
              </Link>
              <button
                className="rounded-full bg-grape-soda px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
                onClick={logout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/8">
                Login
              </Link>
              <Link href="/register" className="rounded-full bg-grape-soda px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
