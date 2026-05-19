import type { GetServerSideProps } from 'next'
import { useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { readData } from '../../lib/data'
import { checkPageAccess } from '../../lib/auth'

interface Stat {
  id: string
  value: string
  label: string
  order: number
}

interface Props { stats: Stat[] }

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 6)
}

export default function AdminStats({ stats: initial }: Props) {
  const [stats, setStats] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const sorted = [...stats].sort((a, b) => a.order - b.order)

  const update = (id: string, key: keyof Stat, value: string | number) =>
    setStats((prev) => prev.map((s) => (s.id === id ? { ...s, [key]: value } : s)))

  const remove = (id: string) => setStats((prev) => prev.filter((s) => s.id !== id))

  const add = () =>
    setStats((prev) => [
      ...prev,
      { id: genId(), value: '', label: '', order: prev.length + 1 },
    ])

  const handleSave = async () => {
    setSaving(true); setSaved(false); setError('')
    try {
      const res = await fetch('/api/stats', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stats),
      })
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
      else setError('บันทึกไม่สำเร็จ')
    } catch { setError('เกิดข้อผิดพลาด') }
    finally { setSaving(false) }
  }

  return (
    <AdminLayout title="จัดการสถิติ">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">จัดการตัวเลขสถิติ</h1>
          <p className="text-slate-500 text-sm mt-0.5">แถบสถิติที่แสดงบนหน้าแรก (70+, 3,200+ ฯลฯ)</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-primary-700 hover:bg-primary-800 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm"
        >
          {saving ? 'กำลังบันทึก...' : 'บันทึกทั้งหมด'}
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          บันทึกสำเร็จ
        </div>
      )}

      {/* Preview */}
      <div className="rounded-2xl overflow-hidden mb-6 bg-gradient-to-r from-primary-900 via-primary-800 to-primary-700 p-6">
        <p className="text-xs font-semibold text-primary-300 uppercase tracking-wider mb-4">ตัวอย่าง</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {sorted.map((s) => (
            <div key={s.id} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-gold-400 mb-0.5">{s.value || '—'}</div>
              <div className="text-primary-300 text-xs">{s.label || '...'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit list */}
      <div className="space-y-3">
        {sorted.map((s, i) => (
          <div key={s.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
            <span className="text-xs font-bold text-slate-400 w-5 text-center shrink-0">{i + 1}</span>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">ตัวเลข / ค่า</label>
                <input
                  type="text"
                  value={s.value}
                  onChange={(e) => update(s.id, 'value', e.target.value)}
                  placeholder="70+"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">คำอธิบาย</label>
                <input
                  type="text"
                  value={s.label}
                  onChange={(e) => update(s.id, 'label', e.target.value)}
                  placeholder="ปีแห่งการศึกษา"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">ลำดับ</label>
                <input
                  type="number"
                  min={1}
                  value={s.order}
                  onChange={(e) => update(s.id, 'order', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => remove(s.id)}
              className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={add}
          className="w-full py-4 border-2 border-dashed border-slate-200 hover:border-primary-300 hover:bg-primary-50/30 rounded-2xl text-slate-400 hover:text-primary-600 text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          เพิ่มสถิติ
        </button>
      </div>
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const denied = checkPageAccess(req as never, 'stats')
  if (denied) return denied
  const stats = await readData('stats.json', [])
  return { props: { stats } }
}
