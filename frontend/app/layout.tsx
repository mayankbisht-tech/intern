import type { Metadata } from 'next'
import './globals.css'
import { ReactNode } from 'react'
import { Navbar } from '@/components/navbar'
import { AuthBootstrap } from '@/components/auth-bootstrap'

export const metadata: Metadata = {
  title: 'AcademiaLink | College Discovery Platform',
  description: 'Explore, compare, and save colleges with a production-grade decision platform.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen overflow-x-hidden font-sans antialiased text-shadow-grey">
        <div className="relative min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(156,82,139,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(29,30,44,0.08),_transparent_24%),linear-gradient(180deg,_#f5f0ee_0%,_#ffffff_44%,_#efe8e6_100%)]">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-grape-soda/10 blur-3xl" />
            <div className="absolute right-0 top-[28rem] h-80 w-80 rounded-full bg-blue-slate/10 blur-3xl" />
            <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-dust-grey/35 blur-3xl" />
          </div>
          <div className="relative">
            <AuthBootstrap />
            <Navbar />
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
