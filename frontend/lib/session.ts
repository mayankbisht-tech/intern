const TOKEN_COOKIE = 'academialink-token'

export function setAuthCookie(token: string) {
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(token)}; Max-Age=${60 * 60 * 24 * 7}; Path=/; SameSite=Lax`
}

export function clearAuthCookie() {
  document.cookie = `${TOKEN_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`
}

export function getAuthToken() {
  if (typeof window === 'undefined') return null

  const localToken = window.localStorage.getItem(TOKEN_COOKIE)
  if (localToken) return localToken

  const cookieToken = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${TOKEN_COOKIE}=`))
    ?.split('=')[1]

  return cookieToken ? decodeURIComponent(cookieToken) : null
}
