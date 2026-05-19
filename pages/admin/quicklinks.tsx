import type { GetServerSideProps } from 'next'
import { useState, useRef, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { readData } from '../../lib/data'
import { checkPageAccess } from '../../lib/auth'

export interface QuickLink {
  id: string
  label: string
  href: string
  icon: string
  color: string
  order: number
}

interface Props { links: QuickLink[] }

export const COLOR_OPTIONS = [
  { key: 'blue',    label: 'น้ำเงิน',   classes: 'bg-blue-50 text-blue-700 border-blue-100',       dot: 'bg-blue-500' },
  { key: 'emerald', label: 'เขียว',     classes: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500' },
  { key: 'purple',  label: 'ม่วง',      classes: 'bg-purple-50 text-purple-700 border-purple-100',   dot: 'bg-purple-500' },
  { key: 'amber',   label: 'เหลือง',    classes: 'bg-amber-50 text-amber-700 border-amber-100',     dot: 'bg-amber-400' },
  { key: 'rose',    label: 'ชมพู',      classes: 'bg-rose-50 text-rose-700 border-rose-100',         dot: 'bg-rose-500' },
  { key: 'slate',   label: 'เทา',       classes: 'bg-slate-50 text-slate-700 border-slate-100',     dot: 'bg-slate-400' },
  { key: 'indigo',  label: 'ครามเข้ม', classes: 'bg-indigo-50 text-indigo-700 border-indigo-100',   dot: 'bg-indigo-500' },
  { key: 'teal',    label: 'เขียวน้ำ', classes: 'bg-teal-50 text-teal-700 border-teal-100',         dot: 'bg-teal-500' },
]

const ICON_LIST = [
  '📋','📚','🎯','📥','📅','📢','🏫','🏆','📝','🎓',
  '🔬','🎨','🏃','🤝','💡','📊','🔭','⚽','🎭','🌍',
  '🖥️','📰','🎪','🏅','📌','🔔','💼','🏠','📷','🎵',
]

function newLink(order: number): QuickLink {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    label: '',
    href: '',
    icon: '📋',
    color: 'blue',
    order,
  }
}

function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-12 h-12 text-2xl flex items-center justify-center rounded-xl border border-slate-200 hover:border-primary-300 bg-white transition-colors"
      >
        {value}
      </button>
      {open && (
        <div className="absolute z-20 top-14 left-0 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 w-56">
          <div className="grid grid-cols-6 gap-1.5">
            {ICON_LIST.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => { onChange(emoji); setOpen(false) }}
                className={`text-xl h-8 flex items-center justify-center rounded-lg hover:bg-primary-50 transition-colors ${value === emoji ? 'bg-primary-100 ring-1 ring-primary-400' : ''}`}
              >
                {emoji}
              </button>
            ))}
          </div>
          <div className="mt-2 border-t border-slate-100 pt-2">
            <label className="block text-xs text-slate-500 mb-1">หรือพิมพ์อีโมจิเอง</label>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full px-2 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminQuickLinks({ links: initial }: Props) {
  const [links, setLinks] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const sorted = [...links].sort((a, b) => a.order - b.order)

  const update = (id: string, key: keyof QuickLink, value: string | number) =>
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, [key]: value } : l)))

  const remove = (id: string) => setLinks((prev) => prev.filter((l) => l.id !== id))

  const add = () =>
    setLinks((prev) => {
      const minOrder = prev.reduce((m, l) => Math.min(m, l.order), 1)
      return [newLink(Math.max(0, minOrder - 1)), ...prev]
    })

  const handleSave = async () => {
    setSaving(true); setSaved(false); setError('')
    try {
      const res = await fetch('/api/quicklinks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(links),
      })
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
      else setError('บันทึกไม่สำเร็จ')
    } catch { setError('เกิดข้อผิดพลาด') }
    finally { setSaving(false) }
  }

  const colorOption = (key: string) => COLOR_OPTIONS.find((c) => c.key === key) ?? COLOR_OPTIONS[0]

  return (
    <AdminLayout title="ลิงก์ด่วน">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">จัดการลิงก์ด่วน</h1>
          <p className="text-slate-500 text-sm mt-0.5">การ์ดลัดที่แสดงใต้ Hero บนหน้าแรก</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-primary-700 hover:bg-primary-800 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm"
        >
          {saving ? 'กำลังบันทึก...' : 'บันทึกทั้งหมด'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
      )}
      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          บันทึกสำเร็จแล้ว
        </div>
      )}

      {/* Preview strip */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6 overflow-x-auto">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">ตัวอย่าง</p>
        <div className="flex gap-3 min-w-max">
          {sorted.map((link) => {
            const col = colorOption(link.color)
            return (
              <div key={link.id} className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border text-xs font-medium min-w-24 ${col.classes}`}>
                <span className="text-xl">{link.icon}</span>
                <span className="text-center leading-tight">{link.label || '...'}</span>
              </div>
            )
          })}
          {sorted.length === 0 && (
            <span className="text-sm text-slate-400 py-4">ยังไม่มีลิงก์</span>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={add}
          className="w-full py-4 border-2 border-dashed border-slate-200 hover:border-primary-300 hover:bg-primary-50/30 rounded-2xl text-slate-400 hover:text-primary-600 text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          เพิ่มลิงก์ด่วน
        </button>

        {sorted.map((link, i) => (
          <div key={link.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-slate-600">ลิงก์ที่ {i + 1}</span>
              <button
                type="button"
                onClick={() => remove(link.id)}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                ลบ
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">ไอคอน</label>
                  <IconPicker value={link.icon} onChange={(v) => update(link.id, 'icon', v)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">ชื่อที่แสดง</label>
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => update(link.id, 'label', e.target.value)}
                    placeholder="ชื่อลิงก์"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">URL ปลายทาง</label>
                  <input
                    type="text"
                    value={link.href}
                    onChange={(e) => update(link.id, 'href', e.target.value)}
                    placeholder="/page-path หรือ https://..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">ลำดับ</label>
                  <input
                    type="number"
                    min={1}
                    value={link.order}
                    onChange={(e) => update(link.id, 'order', parseInt(e.target.value) || 1)}
                    className="w-28 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">สีธีมการ์ด</label>
                <div className="grid grid-cols-4 gap-2">
                  {COLOR_OPTIONS.map((col) => (
                    <button
                      key={col.key}
                      type="button"
                      onClick={() => update(link.id, 'color', col.key)}
                      className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-medium transition-all ${
                        link.color === col.key
                          ? 'border-primary-400 ring-2 ring-primary-200 bg-primary-50 text-primary-800'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full shrink-0 ${col.dot}`} />
                      {col.label}
                    </button>
                  ))}
                </div>
                {/* Mini preview */}
                <div className="mt-4">
                  <p className="text-xs text-slate-400 mb-2">ตัวอย่างการ์ด</p>
                  <div className={`inline-flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border text-xs font-medium ${colorOption(link.color).classes}`}>
                    <span className="text-2xl">{link.icon}</span>
                    <span className="leading-tight">{link.label || '...'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

      </div>
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const denied = checkPageAccess(req as never, 'quicklinks')
  if (denied) return denied
  const links = await readData('quicklinks.json', [])
  return { props: { links } }
}
