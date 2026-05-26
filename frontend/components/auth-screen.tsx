'use client'

import { useState } from 'react'
import { AuthForm } from '@/components/auth-form'

type AuthTab = 'student' | 'admin'
type StudentMode = 'login' | 'register'

export function AuthScreen({
  initialTab,
  initialMode,
}: {
  initialTab: AuthTab
  initialMode: StudentMode
}) {
  const [tab, setTab] = useState<AuthTab>(initialTab)
  const [studentMode, setStudentMode] = useState<StudentMode>(initialMode)

  return (
    <div className="mx-auto grid min-h-[calc(100vh-88px)] max-w-5xl items-center gap-10 px-4 py-12 lg:grid-cols-[1fr_1.1fr]">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 p-8 text-white shadow-soft" style={{ backgroundColor: '#1d1e2c' }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(156,82,139,0.3),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(215,205,204,0.12),_transparent_30%)]" />
        <div className="relative space-y-5">
          <p className="text-sm uppercase tracking-[0.22em] text-dust-grey">
            {tab === 'student' ? 'Student access' : 'Admin access'}
          </p>
          <h1 className="max-w-xl font-[family-name:var(--font-work-sans)] text-4xl font-bold leading-tight">
            {tab === 'student'
              ? studentMode === 'login'
                ? 'Sign in to manage your saved colleges and comparisons.'
                : 'Create a student account to save colleges and comparisons.'
              : 'Admin login to manage college data and publish updates.'}
          </h1>
          <p className="max-w-md text-sm leading-6 text-dust-grey">
            {tab === 'student'
              ? 'Students can register, sign in, and keep their shortlist synced across devices.'
              : 'Admin access is restricted to staff accounts and is used for content management only.'}
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              className={`rounded-full border px-5 py-3 text-sm font-semibold transition ${
                tab === 'student'
                  ? 'border-transparent bg-[#f5f0ee] text-[#1d1e2c] shadow-sm'
                  : 'border-white/20 bg-transparent text-[#f5f0ee] hover:bg-white/10'
              }`}
              onClick={() => setTab('student')}
            >
              Student
            </button>
            <button
              type="button"
              className={`rounded-full border px-5 py-3 text-sm font-semibold transition ${
                tab === 'admin'
                  ? 'border-transparent bg-[#f5f0ee] text-[#1d1e2c] shadow-sm'
                  : 'border-white/20 bg-transparent text-[#f5f0ee] hover:bg-white/10'
              }`}
              onClick={() => setTab('admin')}
            >
              Admin
            </button>
          </div>
          {tab === 'student' ? (
            <div className="mt-6 flex flex-wrap gap-3 rounded-full border border-white/10 bg-white/5 p-2">
              <button
                type="button"
                className={`min-w-28 rounded-full px-5 py-2 text-sm font-semibold transition ${
                  studentMode === 'login'
                    ? 'bg-[#1d1e2c] text-white shadow-sm ring-1 ring-white/10'
                    : 'border border-white/15 bg-white/10 text-[#f5f0ee] hover:bg-white/20'
                }`}
                onClick={() => setStudentMode('login')}
              >
                Login
              </button>
              <button
                type="button"
                className={`min-w-28 rounded-full px-5 py-2 text-sm font-semibold transition ${
                  studentMode === 'register'
                    ? 'bg-[#1d1e2c] text-white shadow-sm ring-1 ring-white/10'
                    : 'border border-white/15 bg-white/10 text-[#f5f0ee] hover:bg-white/20'
                }`}
                onClick={() => setStudentMode('register')}
              >
                Register
              </button>
            </div>
          ) : null}
        </div>
      </section>

      <div className="mx-auto w-full max-w-lg">
        {tab === 'student' ? (
          <AuthForm mode={studentMode} />
        ) : (
          <AuthForm mode="login" />
        )}
        {tab === 'admin' ? (
          <p className="mt-4 text-center text-sm text-blue-slate">
            Use the admin account provided by the project seed data.
          </p>
        ) : null}
      </div>
    </div>
  )
}
