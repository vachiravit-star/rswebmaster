import type { GetServerSideProps } from 'next'
import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import AdminLayout from '../../../components/admin/AdminLayout'
import { checkPageAccess } from '../../../lib/auth'

const categoryColors: Record<string, string> = {
  academic: '#943400',
  activity: '#059669',
  exam: '#DC2626',
}

export default function CreateEvent() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    category: 'activity',
    color: '#059669',
  })

  const set = (key: string, value: string) => {
    const updates: Record<string, string> = { [key]: value }
    if (key === 'category') updates.color = categoryColors[value] || '#A83700'
    if (key === 'startDate' && !form.endDate) updates.endDate = value
    setForm((prev) => ({ ...prev, ...updates }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.startDate) {
      setError('กรุณากรอกชื่อกิจกรรมและวันที่')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, endDate: form.endDate || form.startDate }),
      })
      if (res.ok) {
        router.push('/admin/events')
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
    <AdminLayout title="เพิ่มกิจกรรม">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/events" className="text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">เพิ่มกิจกรรม</h1>
      </div>

      <div className="max-w-xl">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              ชื่อกิจกรรม <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              required
              placeholder="กรอกชื่อกิจกรรม..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">รายละเอียด</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              placeholder="รายละเอียดกิจกรรม..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                วันที่เริ่ม <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => set('startDate', e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">วันที่สิ้นสุด</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => set('endDate', e.target.value)}
                min={form.startDate}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">ประเภทกิจกรรม</label>
            <select
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
            >
              <option value="academic">วิชาการ</option>
              <option value="activity">กิจกรรม</option>
              <option value="exam">สอบ</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">สีในปฏิทิน</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.color}
                onChange={(e) => set('color', e.target.value)}
                className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer"
              />
              <div className="flex gap-2">
                {Object.entries(categoryColors).map(([cat, color]) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => set('color', color)}
                    className="w-7 h-7 rounded-full border-2 border-white shadow transition-transform hover:scale-110"
                    style={{ backgroundColor: color }}
                    title={cat}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึกกิจกรรม'}
            </button>
            <Link
              href="/admin/events"
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl transition-colors text-sm"
            >
              ยกเลิก
            </Link>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const denied = checkPageAccess(req as never, 'events')
  if (denied) return denied
  return { props: {} }
}
