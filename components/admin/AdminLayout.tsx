'use client'
import Head from 'next/head'
import { useState } from 'react'
import Sidebar from './Sidebar'

interface AdminLayoutProps {
  children: React.ReactNode
  title?: string
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <Head>
        <title>{title ? `${title} | CMS ราชสีมาวิทยาลัย` : 'CMS ราชสีมาวิทยาลัย'}</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="min-h-screen bg-slate-100 flex">
        {/* Mobile backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-30 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar — drawer on mobile, always visible on md+ */}
        <div
          className={`fixed inset-y-0 left-0 z-40 md:relative md:z-auto md:translate-x-0 transition-transform duration-200 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <Sidebar onMobileClose={() => setMobileOpen(false)} />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Mobile top bar */}
          <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-20">
            <button
              onClick={() => setMobileOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="เปิดเมนู"
            >
              <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-gold-500 flex items-center justify-center">
                <span className="text-primary-900 font-bold text-xs">ร</span>
              </div>
              <span className="font-semibold text-slate-800 text-sm">
                {title || 'ราชสีมาวิทยาลัย CMS'}
              </span>
            </div>
          </div>

          <div className="flex-1 p-4 md:p-8">{children}</div>
        </div>
      </div>
    </>
  )
}
