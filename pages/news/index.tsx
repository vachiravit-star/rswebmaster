import type { GetServerSideProps } from 'next'
import { useState } from 'react'
import Link from 'next/link'
import Layout from '../../components/Layout'
import NewsCard, { type NewsItem, categoryConfig } from '../../components/NewsCard'
import { readData } from '../../lib/data'

interface NewsPageProps {
  news: NewsItem[]
  category: string
  search: string
}

export default function NewsPage({ news, category: initCat, search: initSearch }: NewsPageProps) {
  const [searchTerm, setSearchTerm] = useState(initSearch)
  const [activeCategory, setActiveCategory] = useState(initCat)

  const categories = [
    { key: '', label: 'ทั้งหมด' },
    { key: 'pr', label: 'ประชาสัมพันธ์' },
    { key: 'procurement', label: 'จัดซื้อจัดจ้าง' },
    { key: 'activity', label: 'กิจกรรม' },
  ]

  const filtered = news.filter((n) => {
    const matchCat = !activeCategory || n.category === activeCategory
    const matchSearch =
      !searchTerm ||
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <Layout title="ข่าวสารและประกาศ">
      {/* Page header */}
      <div className="gradient-page-header on-gradient py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 on-gradient-link text-sm mb-2">
            <Link href="/" className="hover:text-[var(--on-gradient-text)] transition-colors">หน้าแรก</Link>
            <span>›</span>
            <span>ข่าวสาร</span>
          </div>
          <h1 className="text-3xl font-bold">ข่าวสารและประกาศ</h1>
          <p className="on-gradient-muted mt-1">อัปเดตข่าวสาร ประกาศ และกิจกรรมจากโรงเรียน</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="ค้นหาข่าว..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300"
              />
            </div>
            {/* Category tabs */}
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

        {/* Results */}
        {filtered.length > 0 ? (
          <>
            <p className="text-sm text-slate-500 mb-4">
              แสดง {filtered.length} รายการ
              {activeCategory && ` ในหมวด "${categoryConfig[activeCategory]?.label ?? activeCategory}"`}
              {searchTerm && ` ที่ค้นหา "${searchTerm}"`}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((item) => (
                <NewsCard key={item.id} news={item} featured />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-slate-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>ไม่พบข่าวที่ค้นหา</p>
          </div>
        )}
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const category = (query.category as string) || ''
  const search = (query.search as string) || ''
  const allNews = readData<NewsItem[]>('news.json', [])
  const news = allNews
    .filter((n) => n.published)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  return { props: { news, category, search } }
}
