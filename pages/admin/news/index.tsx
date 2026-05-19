import type { GetServerSideProps } from 'next'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import AdminLayout from '../../../components/admin/AdminLayout'
import { readData } from '../../../lib/data'
import { checkPageAccess } from '../../../lib/auth'
import { type NewsItem, categoryConfig } from '../../../components/NewsCard'

interface Props { news: NewsItem[] }

export default function AdminNewsList({ news: initial }: Props) {
  const [news, setNews] = useState(initial)
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`ลบข่าว "${title}" ?`)) return
    setDeleting(id)
    const res = await fetch(`/api/news/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setNews((prev) => prev.filter((n) => n.id !== id))
    }
    setDeleting(null)
  }

  const handleTogglePublish = async (item: NewsItem) => {
    const res = await fetch(`/api/news/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...item, published: !item.published }),
    })
    if (res.ok) {
      const updated = await res.json()
      setNews((prev) => prev.map((n) => (n.id === item.id ? updated : n)))
    }
  }

  return (
    <AdminLayout title="จัดการข่าวสาร">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">จัดการข่าวสาร</h1>
          <p className="text-slate-500 text-sm mt-0.5">{news.length} รายการ</p>
        </div>
        <Link
          href="/admin/news/create"
          className="flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          เพิ่มข่าวใหม่
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {news.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="mb-3">ยังไม่มีข่าว</p>
            <Link href="/admin/news/create" className="text-primary-600 font-medium hover:underline text-sm">
              เพิ่มข่าวแรก
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">ชื่อข่าว</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">หมวด</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">วันที่</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">สถานะ</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {news.map((item) => {
                  const cat = categoryConfig[item.category]
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-slate-800 truncate max-w-xs">{item.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{item.excerpt}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cat?.bg ?? 'bg-slate-100'} ${cat?.color ?? 'text-slate-600'}`}>
                          {cat?.label ?? item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500">{item.publishedAt}</td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => handleTogglePublish(item)}
                          className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                            item.published
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {item.published ? '● เผยแพร่' : '○ ร่าง'}
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/news/${item.slug}`}
                            target="_blank"
                            className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                          >
                            ดู
                          </Link>
                          <Link
                            href={`/admin/news/${item.id}`}
                            className="text-xs text-primary-600 hover:text-primary-700 px-2 py-1 rounded hover:bg-primary-50 transition-colors font-medium"
                          >
                            แก้ไข
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id, item.title)}
                            disabled={deleting === item.id}
                            className="text-xs text-red-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const denied = checkPageAccess(req as never, 'news')
  if (denied) return denied
  const news = (await readData<NewsItem[]>('news.json', []))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return { props: { news } }
}
