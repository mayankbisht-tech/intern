'use client'

import type { FormEvent } from 'react'
import { useState } from 'react'
import axios from 'axios'
import { useRouter, useSearchParams } from 'next/navigation'
import { login, register } from '@/lib/api'
import { useAppStore } from '@/lib/store'
import { setAuthCookie } from '@/lib/session'

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setAuth = useAppStore((state) => state.setAuth)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const email = form.email.trim().toLowerCase()
      const result =
        mode === 'login'
          ? await login({ email, password: form.password })
          : await register({ name: form.name.trim(), email, password: form.password })

      window.localStorage.setItem('academialink-token', result.token)
      setAuthCookie(result.token)
      setAuth(result.token, result.user)
      router.push(searchParams.get('next') || '/dashboard')
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.error?.message
        const details = err.response?.data?.error?.details
        const detailMessage = Array.isArray(details) && details.length > 0 ? details.map((detail: { issue?: string }) => detail.issue).filter(Boolean).join(', ') : ''
        setError(message || detailMessage || err.message || 'Authentication failed')
      } else {
        setError(err instanceof Error ? err.message : 'Authentication failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-5 rounded-3xl border bg-white/95 p-8 shadow-soft backdrop-blur" style={{ borderColor: 'rgba(89, 101, 111, 0.22)' }} onSubmit={handleSubmit}>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-shadow-grey">{mode === 'login' ? 'Login' : 'Create account'}</h1>
        <p className="text-sm leading-6 text-blue-slate">
          {mode === 'login' ? 'Access your saved colleges and comparisons.' : 'Create your account to save colleges and comparisons.'}
        </p>
      </div>

      {mode === 'register' ? (
        <label className="block space-y-2">
          <span className="block text-sm font-medium text-blue-slate">Name</span>
          <input
            className="block h-12 w-full rounded-xl border bg-[#f7f2f0] px-4 py-3 text-shadow-grey shadow-sm outline-none transition placeholder:text-blue-slate/60 focus:border-grape-soda focus:ring-2 focus:ring-grape-soda/20"
            style={{ borderColor: 'rgba(89, 101, 111, 0.18)' }}
            type="text"
            required
            value={form.name}
            placeholder="Your full name"
            onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
          />
        </label>
      ) : null}

      <label className="block space-y-2">
        <span className="block text-sm font-medium text-blue-slate">Email</span>
        <input
          className="block h-12 w-full rounded-xl border bg-[#f7f2f0] px-4 py-3 text-shadow-grey shadow-sm outline-none transition placeholder:text-blue-slate/60 focus:border-grape-soda focus:ring-2 focus:ring-grape-soda/20"
          style={{ borderColor: 'rgba(89, 101, 111, 0.18)' }}
          type="email"
          autoComplete="email"
          required
          value={form.email}
          placeholder="you@example.com"
          onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
        />
      </label>

      <label className="block space-y-2">
        <span className="block text-sm font-medium text-blue-slate">Password</span>
        <input
          className="block h-12 w-full rounded-xl border bg-[#f7f2f0] px-4 py-3 text-shadow-grey shadow-sm outline-none transition placeholder:text-blue-slate/60 focus:border-grape-soda focus:ring-2 focus:ring-grape-soda/20"
          style={{ borderColor: 'rgba(89, 101, 111, 0.18)' }}
          type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          minLength={mode === 'register' ? 8 : undefined}
          pattern={mode === 'register' ? '.*\\d.*' : undefined}
          title={mode === 'register' ? 'Password must be at least 8 characters and contain at least one number.' : undefined}
          required
          value={form.password}
          placeholder="Password"
          onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
        />
      </label>

      {mode === 'register' ? (
        <p className="text-xs leading-5 text-blue-slate">
          Use at least 8 characters and include at least one number.
        </p>
      ) : null}

      {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

      <button className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-soft" style={{ backgroundColor: '#1d1e2c' }} disabled={loading}>
        {loading ? 'Working...' : mode === 'login' ? 'Login' : 'Register'}
      </button>
    </form>
  )
}
