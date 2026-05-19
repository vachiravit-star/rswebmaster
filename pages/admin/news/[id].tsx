import type { GetServerSideProps } from 'next'
import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import AdminLayout from '../../../components/admin/AdminLayout'
import ImageUpload from '../../../components/admin/ImageUpload'
import { readData } from '../../../lib/data'
import { checkPageAccess } from '../../../lib/auth'
import { type NewsItem } from '../../../components/NewsCard'

interface Props { news: NewsItem }

export default function EditNews({ news: initial }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(initial)

  const set = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/news/${form.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        router.push('/admin/news')
      } else {
        const data = await res.json()
        setError(data.error || 'เกิดข้อผิดพลาด')
      }
    } catch {
      setError('ไม่สามารถบันทึกได้')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout title="แก้ไขข่าว">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/news" className="text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">แก้ไขข่าว</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">ชื่อข่าว</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">บทนำ</label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => set('excerpt', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">เนื้อหาข่าว</label>
                <textarea
                  value={form.content}
                  onChange={(e) => set('content', e.target.value)}
                  rows={12}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-y"
                />
              </div>
              <ImageUpload
                value={form.image}
                onChange={(url) => set('image', url)}
                folder="news"
                label="รูปภาพประกอบข่าว"
                aspectRatio="aspect-video"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-800 text-sm mb-4">การตั้งค่า</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">หมวดหมู่</label>
                  <select
                    value={form.category}
                    onChange={(e) => set('category', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
                  >
                    <option value="pr">ประชาสัมพันธ์</option>
                    <option value="procurement">จัดซื้อจัดจ้าง</option>
                    <option value="activity">กิจกรรม</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">วันที่เผยแพร่</label>
                  <input
                    type="date"
                    value={form.publishedAt}
                    onChange={(e) => set('publishedAt', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  />
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm font-medium text-slate-700">เผยแพร่</span>
                  <button
                    type="button"
                    onClick={() => set('published', !form.published)}
                    className={`relative w-10 h-6 rounded-full transition-colors ${form.published ? 'bg-primary-600' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.published ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <div className="text-xs text-slate-500 space-y-1">
                <div>ID: <span className="font-mono text-slate-600">{form.id}</span></div>
                <div>Slug: <span className="font-mono text-slate-600">{form.slug}</span></div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-primary-700 hover:bg-primary-800 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                {saving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
              </button>
              <Link
                href={`/news/${form.slug}`}
                target="_blank"
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl transition-colors text-sm text-center"
              >
                ดูหน้าข่าว
              </Link>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req, params }) => {
  const denied = checkPageAccess(req as never, 'news')
  if (denied) return denied
  const { id } = params as { id: string }
  const allNews = await readData<NewsItem[]>('news.json', [])
  const news = allNews.find((n) => n.id === id)
  if (!news) return { notFound: true }
  return { props: { news } }
}
