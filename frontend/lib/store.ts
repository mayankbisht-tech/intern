'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser } from './types'
import { clearAuthCookie } from './session'

interface AppState {
  token: string | null
  user: AuthUser | null
  compareIds: number[]
  authReady: boolean
  setAuth: (token: string | null, user: AuthUser | null) => void
  setAuthReady: (ready: boolean) => void
  logout: () => void
  toggleCompare: (id: number) => void
  clearCompare: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      compareIds: [],
      authReady: false,
      setAuth: (token, user) => set({ token, user }),
      setAuthReady: (ready) => set({ authReady: ready }),
      logout: () => {
        window.localStorage.removeItem('academialink-token')
        clearAuthCookie()
        set({ token: null, user: null, compareIds: [], authReady: true })
      },
      toggleCompare: (id) =>
        set({
          compareIds: get().compareIds.includes(id)
            ? get().compareIds.filter((current) => current !== id)
            : [...get().compareIds, id].slice(0, 3),
        }),
      clearCompare: () => set({ compareIds: [] }),
    }),
    {
      name: 'academialink-store',
      partialize: (state) => ({ compareIds: state.compareIds, user: state.user, token: state.token }),
    },
  ),
)
