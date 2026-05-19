import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

interface NavChild { id: string; label: string; href: string }
interface NavItem { id: string; label: string; href: string; order: number; children: NavChild[] }

const DEFAULT_NAV: NavItem[] = [
  { id: 'm1', label: 'หน้าแรก', href: '/', order: 1, children: [] },
  { id: 'm2', label: 'เกี่ยวกับโรงเรียน', href: '/about', order: 2, children: [
    { id: 'm2a', label: 'ประวัติโรงเรียน', href: '/about#history' },
    { id: 'm2b', label: 'วิสัยทัศน์และพันธกิจ', href: '/about#vision' },
    { id: 'm2c', label: 'โครงสร้างการบริหาร', href: '/about#management' },
  ]},
  { id: 'm3', label: 'วิชาการ', href: '/curriculum', order: 3, children: [
    { id: 'm3a', label: 'หลักสูตรการเรียนการสอน', href: '/curriculum' },
    { id: 'm3b', label: 'การรับสมัครนักเรียน', href: '/admissions' },
  ]},
  { id: 'm4', label: 'กิจกรรมนักเรียน', href: '/student-life', order: 4, children: [] },
  { id: 'm5', label: 'ข่าวสาร', href: '/news', order: 5, children: [] },
  { id: 'm6', label: 'ปฏิทินกิจกรรม', href: '/calendar', order: 6, children: [] },
  { id: 'm7', label: 'ดาวน์โหลด', href: '/downloads', order: 7, children: [] },
]

interface SchoolInfo { logoUrl?: string; nameTh?: string; nameEn?: string; phone?: string }

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [navLinks, setNavLinks] = useState<NavItem[]>(DEFAULT_NAV)
  const [school, setSchool] = useState<SchoolInfo>({})
  const router = useRouter()

  useEffect(() => {
    fetch('/api/menu')
      .then((r) => r.ok ? r.json() : null)
      .then((data: NavItem[] | null) => {
        if (Array.isArray(data) && data.length > 0) {
          setNavLinks([...data].sort((a, b) => a.order - b.order))
        }
      })
      .catch(() => {})
    fetch('/api/school-settings')
      .then((r) => r.ok ? r.json() : null)
      .then((data: SchoolInfo | null) => { if (data) setSchool(data) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setActiveDropdown(null)
  }, [router.pathname])

  const isActive = (href: string) =>
    href === '/' ? router.pathname === '/' : router.pathname.startsWith(href)

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm shadow-sm'
        }`}
        style={{ borderTop: '3px solid transparent', borderImage: 'linear-gradient(90deg, #471900, #E65100, #FBBF24) 1' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 min-w-0">
              {school.logoUrl ? (
                <img src={school.logoUrl} alt="logo" className="w-10 h-10 rounded-full object-cover shadow-sm shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary-700 flex items-center justify-center shadow-sm shrink-0">
                  <span className="text-gold-400 font-bold text-lg leading-none">ร</span>
                </div>
              )}
              <div className="min-w-0">
                <div className="text-primary-800 font-bold text-sm leading-tight truncate">
                  {school.nameTh || 'ราชสีมาวิทยาลัย'}
                </div>
                <div className="text-slate-400 text-xs truncate hidden xs:block">
                  {school.nameEn || 'Ratchasima Wittayalai School'}
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <div key={link.id} className="relative group">
                  <Link
                    href={link.href}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 flex items-center gap-1 ${
                      isActive(link.href)
                        ? 'text-primary-700 bg-primary-50'
                        : 'text-slate-600 hover:text-primary-700 hover:bg-slate-50'
                    }`}
                  >
                    {link.label}
                    {link.children.length > 0 && (
                      <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </Link>
                  {link.children.length > 0 && (
                    <div className="absolute top-full left-0 pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
                      <div className="bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 min-w-48">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2 text-sm text-slate-600 hover:text-primary-700 hover:bg-primary-50 transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-1">
              {/* Phone quick-dial (mobile only) */}
              {school.phone && (
                <a
                  href={`tel:${school.phone.replace(/[^0-9+]/g, '')}`}
                  className="lg:hidden p-2 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors"
                  aria-label="โทรหาโรงเรียน"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </a>
              )}
              {/* Hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="เมนู"
              >
                {mobileOpen ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white">
            <div className="px-3 py-3 space-y-0.5">
              {navLinks.map((link) => (
                <div key={link.id}>
                  <div className="flex items-center gap-1">
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive(link.href)
                          ? 'text-primary-700 bg-primary-50'
                          : 'text-slate-700 hover:text-primary-700 hover:bg-slate-50'
                      }`}
                    >
                      {link.label}
                    </Link>
                    {link.children.length > 0 && (
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === link.href ? null : link.href)}
                        className="p-3 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        <svg className={`w-4 h-4 transition-transform ${activeDropdown === link.href ? 'rotate-180' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {link.children.length > 0 && activeDropdown === link.href && (
                    <div className="ml-3 mb-1 bg-slate-50 rounded-xl overflow-hidden">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:text-primary-700 hover:bg-primary-50 transition-colors border-b border-slate-100 last:border-0"
                        >
                          <svg className="w-3.5 h-3.5 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* Bottom info bar */}
            {school.phone && (
              <div className="mx-3 mb-3 bg-primary-50 rounded-xl px-4 py-3 flex items-center gap-3">
                <svg className="w-4 h-4 text-primary-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href={`tel:${school.phone.replace(/[^0-9+]/g, '')}`} className="text-sm font-medium text-primary-700">
                  {school.phone}
                </a>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Spacer */}
      <div className="h-16 md:h-18" />
    </>
  )
}
