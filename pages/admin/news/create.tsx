import type { GetServerSideProps } from 'next'
import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import AdminLayout from '../../../components/admin/AdminLayout'
import ImageUpload from '../../../components/admin/ImageUpload'
import { checkPageAccess } from '../../../lib/auth'

const CATEGORY_COLORS: Record<string, string> = {
  pr: '#943400',
  activity: '#059669',
  procurement: '#6B21A8',
}

export default function CreateNews() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    category: 'pr',
    excerpt: '',
    content: '',
    image: '',
    publishedAt: new Date().toISOString().split('T')[0],
    published: true,
  })
  const [addToCalendar, setAddToCalendar] = useState(false)
  const [calStartDate, setCalStartDate] = useState('')
  const [calEndDate, setCalEndDate] = useState('')

  const set = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.category) {
      setError('กรุณากรอกชื่อข่าวและหมวดหมู่')
      return
    }
    if (addToCalendar && !calStartDate) {
      setError('กรุณากรอกวันที่สำหรับปฏิทิน')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'เกิดข้อผิดพลาด')
        setSaving(false)
        return
      }

      if (addToCalendar && calStartDate) {
        await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: form.title,
            description: form.excerpt || '',
            startDate: calStartDate,
            endDate: calEndDate || calStartDate,
            category: form.category === 'activity' ? 'activity' : 'academic',
            color: CATEGORY_COLORS[form.category] || '#A83700',
          }),
        })
      }

      router.push('/admin/news')
    } catch {
      setError('ไม่สามารถบันทึกได้')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout title="เพิ่มข่าวใหม่">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/news" className="text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">เพิ่มข่าวใหม่</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    ชื่อข่าว <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => set('title', e.target.value)}
                    required
                    placeholder="กรอกชื่อข่าว..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">บทนำ (Excerpt)</label>
                  <textarea
                    value={form.excerpt}
                    onChange={(e) => set('excerpt', e.target.value)}
                    rows={2}
                    placeholder="สรุปเนื้อหาข่าวสั้นๆ..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">เนื้อหาข่าว</label>
                  <textarea
                    value={form.content}
                    onChange={(e) => set('content', e.target.value)}
                    rows={12}
                    placeholder="กรอกเนื้อหาข่าว (รองรับการขึ้นบรรทัดใหม่)..."
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

            {/* Calendar integration card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="font-semibold text-slate-800 text-sm">เพิ่มลงปฏิทินกิจกรรม</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setAddToCalendar(!addToCalendar)}
                  className={`relative w-10 h-6 rounded-full transition-colors ${addToCalendar ? 'bg-primary-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${addToCalendar ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </div>
              {addToCalendar && (
                <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">วันที่เริ่มต้น <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={calStartDate}
                      onChange={(e) => { setCalStartDate(e.target.value); if (!calEndDate) setCalEndDate(e.target.value) }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">วันที่สิ้นสุด</label>
                    <input
                      type="date"
                      value={calEndDate}
                      min={calStartDate}
                      onChange={(e) => setCalEndDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                    />
                  </div>
                  <p className="col-span-2 text-xs text-slate-400">ข่าวนี้จะถูกเพิ่มในปฏิทินกิจกรรมโดยอัตโนมัติพร้อมชื่อและบทนำ</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-800 text-sm mb-4">การตั้งค่า</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    หมวดหมู่ <span className="text-red-500">*</span>
                  </label>
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
                  <span className="text-sm font-medium text-slate-700">เผยแพร่ทันที</span>
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

            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-primary-700 hover:bg-primary-800 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                {saving ? 'กำลังบันทึก...' : 'บันทึกข่าว'}
              </button>
              <Link
                href="/admin/news"
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl transition-colors text-sm text-center"
              >
                ยกเลิก
              </Link>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const denied = checkPageAccess(req as never, 'news')
  if (denied) return denied
  return { props: {} }
}
