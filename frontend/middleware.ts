import { NextRequest, NextResponse } from 'next/server'

function decodeJwtPayload(token: string): { role?: string; exp?: number } | null {
  try {
    const [, payload] = token.split('.')
    if (!payload) return null
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    const json = atob(padded)
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('academialink-token')?.value
  const { pathname } = request.nextUrl
  const payload = token ? decodeJwtPayload(token) : null
  const isExpired = Boolean(payload?.exp && payload.exp * 1000 < Date.now())

  if (pathname.startsWith('/dashboard')) {
    if (!token || isExpired) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
  }

  if (pathname.startsWith('/admin')) {
    if (!token || isExpired) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (payload?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
