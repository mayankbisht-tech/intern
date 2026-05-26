'use client'

import { useEffect } from 'react'
import { getMe } from '@/lib/api'
import { useAppStore } from '@/lib/store'
import { getAuthToken } from '@/lib/session'

export function AuthBootstrap() {
  const token = useAppStore((state) => state.token)
  const user = useAppStore((state) => state.user)
  const setAuth = useAppStore((state) => state.setAuth)
  const setAuthReady = useAppStore((state) => state.setAuthReady)
  const logout = useAppStore((state) => state.logout)

  useEffect(() => {
    let active = true

    async function bootstrap() {
      const storedToken = token || getAuthToken()
      if (!storedToken) {
        if (active) setAuthReady(true)
        return
      }

      if (user) {
        if (active) setAuthReady(true)
        return
      }

      try {
        window.localStorage.setItem('academialink-token', storedToken)
        const currentUser = await getMe()
        if (!active) return
        setAuth(storedToken, currentUser)
      } catch {
        if (!active) return
        logout()
      } finally {
        if (active) setAuthReady(true)
      }
    }

    void bootstrap()

    return () => {
      active = false
    }
  }, [logout, setAuth, setAuthReady, token, user])

  return null
}
