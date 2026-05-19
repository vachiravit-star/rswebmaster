import type { GetStaticProps } from 'next'
import { useState } from 'react'
import Link from 'next/link'
import Layout from '../components/Layout'
import { readData } from '../lib/data'

interface Download {
  id: string
  title: string
  category: string
  description: string
  fileUrl: string
  fileType: string
  fileSize: string
  createdAt: string
}

interface DownloadsPageProps {
  downloads: Download[]
}

const categoryConfig: Record<string, { label: string; color: string; bg: string }> = {
  teacher: { label: 'สำหรับครู', color: 'text-blue-700', bg: 'bg-blue-50' },
  student: { label: 'สำหรับนักเรียน', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  parent: { label: 'สำหรับผู้ปกครอง', color: 'text-purple-700', bg: 'bg-purple-50' },
}

const fileTypeIcon: Record<string, string> = {
  PDF: '📄',
  DOCX: '📝',
  XLSX: '📊',
  PPTX: '📊',
}

export default function DownloadsPage({ downloads }: DownloadsPageProps) {
  const [activeCategory, setActiveCategory] = useState('')
  const [search, setSearch] = useState('')

  const categories = [
    { key: '', label: 'ทั้งหมด' },
    { key: 'teacher', label: 'สำหรับครู' },
    { key: 'student', label: 'สำหรับนักเรียน' },
    { key: 'parent', label: 'สำหรับผู้ปกครอง' },
  ]

  const filtered = downloads.filter((d) => {
    const matchCat = !activeCategory || d.category === activeCategory
    const matchSearch =
      !search ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <Layout title="ศูนย์ดาวน์โหลดเอกสาร">
      <div className="gradient-page-header on-gradient py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 on-gradient-link text-sm mb-2">
            <Link href="/" className="hover:text-[var(--on-gradient-text)] transition-colors">หน้าแรก</Link>
            <span>›</span>
            <span>ดาวน์โหลด</span>
          </div>
          <h1 className="text-3xl font-bold">ศูนย์ดาวน์โหลดเอกสาร</h1>
          <p className="on-gradient-muted mt-1">แบบฟอร์มและเอกสารสำหรับครู นักเรียน และผู้ปกครอง</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="ค้นหาเอกสาร..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                    activeCategory === cat.key
                      ? 'bg-primary-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Downloads list */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((doc) => {
              const cat = categoryConfig[doc.category] || { label: doc.category, color: 'text-slate-700', bg: 'bg-slate-100' }
              return (
                <div key={doc.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-start gap-4 hover:shadow-md transition-all duration-150">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl shrink-0">
                    {fileTypeIcon[doc.fileType] || '📄'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-slate-800 text-sm leading-snug">{doc.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${cat.bg} ${cat.color}`}>
                        {cat.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-3 leading-relaxed">{doc.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="font-medium text-slate-500">{doc.fileType}</span>
                        <span>{doc.fileSize}</span>
                      </div>
                      <a
                        href={doc.fileUrl}
                        download
                        className="flex items-center gap-1.5 text-xs font-semibold text-primary-700 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        ดาวน์โหลด
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400">
            <span className="text-5xl block mb-3">📭</span>
            <p>ไม่พบเอกสารที่ค้นหา</p>
          </div>
        )}
      </div>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const downloads = await readData<Download[]>('downloads.json', [])
  return { props: { downloads }, revalidate: 60 }
}
