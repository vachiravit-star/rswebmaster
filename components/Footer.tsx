import { useState, useEffect } from 'react'
import Link from 'next/link'

interface FooterLink { id: string; label: string; href: string }

interface FooterData {
  schoolNameTh: string
  schoolNameEn: string
  address: string
  phone: string
  email: string
  quickLinksTitle: string
  quickLinks: FooterLink[]
  servicesTitle: string
  services: FooterLink[]
  copyright: string
}

const DEFAULT: FooterData = {
  schoolNameTh: 'โรงเรียนราชสีมาวิทยาลัย',
  schoolNameEn: 'Ratchasima Wittayalai School',
  address: 'เลขที่ 1497 ถนนมิตรภาพ ตำบลในเมือง อำเภอเมือง\nจังหวัดนครราชสีมา 30000',
  phone: '044-242-571',
  email: 'admin@rachasimawit.ac.th',
  quickLinksTitle: 'ลิงก์ด่วน',
  quickLinks: [
    { id: 'fl1', label: 'หน้าแรก', href: '/' },
    { id: 'fl2', label: 'เกี่ยวกับโรงเรียน', href: '/about' },
    { id: 'fl3', label: 'หลักสูตรการเรียน', href: '/curriculum' },
    { id: 'fl4', label: 'การรับสมัครนักเรียน', href: '/admissions' },
    { id: 'fl5', label: 'กิจกรรมนักเรียน', href: '/student-life' },
    { id: 'fl6', label: 'ปฏิทินกิจกรรม', href: '/calendar' },
  ],
  servicesTitle: 'บริการ',
  services: [
    { id: 'fs1', label: 'ข่าวสารและประกาศ', href: '/news' },
    { id: 'fs2', label: 'ดาวน์โหลดเอกสาร', href: '/downloads' },
    { id: 'fs3', label: 'ข่าวประชาสัมพันธ์', href: '/news?category=pr' },
    { id: 'fs4', label: 'ข่าวจัดซื้อจัดจ้าง', href: '/news?category=procurement' },
    { id: 'fs5', label: 'ข่าวกิจกรรม', href: '/news?category=activity' },
  ],
  copyright: 'โรงเรียนราชสีมาวิทยาลัย. สงวนลิขสิทธิ์.',
}

export default function Footer() {
  const [info, setInfo] = useState<FooterData>(DEFAULT)

  useEffect(() => {
    fetch('/api/footer')
      .then((r) => r.ok ? r.json() : null)
      .then((d: FooterData | null) => { if (d && d.schoolNameTh) setInfo(d) })
      .catch(() => {})
  }, [])

  return (
    <footer style={{ background: 'linear-gradient(160deg, color-mix(in srgb, var(--color-primary-900) 95%, black) 0%, var(--color-primary-800) 55%, var(--color-primary-900) 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-6">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">

          {/* School info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-gold-500 flex items-center justify-center shadow-lg shrink-0">
                <span className="text-primary-900 font-bold text-xl">ร</span>
              </div>
              <div>
                <div className="font-bold text-white text-base leading-snug">{info.schoolNameTh}</div>
                <div className="text-white/50 text-xs mt-0.5">{info.schoolNameEn}</div>
              </div>
            </div>

            <p className="text-white/55 text-sm leading-relaxed mb-5 whitespace-pre-line">
              {info.address}
            </p>

            <div className="space-y-2.5">
              {info.phone && (
                <a href={`tel:${info.phone.replace(/-/g, '')}`} className="flex items-center gap-2.5 text-white/55 hover:text-white text-sm transition-colors group">
                  <span className="w-7 h-7 rounded-lg bg-white/10 group-hover:bg-white/15 flex items-center justify-center shrink-0 transition-colors">
                    <svg className="w-3.5 h-3.5 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </span>
                  {info.phone}
                </a>
              )}
              {info.email && (
                <a href={`mailto:${info.email}`} className="flex items-center gap-2.5 text-white/55 hover:text-white text-sm transition-colors group">
                  <span className="w-7 h-7 rounded-lg bg-white/10 group-hover:bg-white/15 flex items-center justify-center shrink-0 transition-colors">
                    <svg className="w-3.5 h-3.5 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  {info.email}
                </a>
              )}
            </div>
          </div>

          {/* Quick links */}
          {info.quickLinks.length > 0 && (
            <div>
              <h4 className="font-bold text-white text-sm mb-5 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-gold-400 shrink-0" />
                {info.quickLinksTitle}
              </h4>
              <ul className="space-y-2.5">
                {info.quickLinks.map((link) => (
                  <li key={link.id}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-1.5 text-white/55 hover:text-white text-sm transition-colors group"
                    >
                      <svg className="w-3 h-3 text-gold-500 group-hover:text-gold-400 shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Services */}
          {info.services.length > 0 && (
            <div>
              <h4 className="font-bold text-white text-sm mb-5 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-gold-400 shrink-0" />
                {info.servicesTitle}
              </h4>
              <ul className="space-y-2.5">
                {info.services.map((link) => (
                  <li key={link.id}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-1.5 text-white/55 hover:text-white text-sm transition-colors group"
                    >
                      <svg className="w-3 h-3 text-gold-500 group-hover:text-gold-400 shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/35">
          <p>© {new Date().getFullYear()} {info.copyright}</p>
          <Link href="/admin" className="hover:text-white/60 transition-colors">
            ระบบจัดการเนื้อหา
          </Link>
        </div>

      </div>
    </footer>
  )
}
