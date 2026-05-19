import type { GetServerSideProps } from 'next'
import { useState } from 'react'
import AdminLayout from '../../../components/admin/AdminLayout'
import { readData } from '../../../lib/data'
import { checkPageAccess } from '../../../lib/auth'
import { type CalEvent } from '../../../components/CalendarWidget'

interface Props { events: CalEvent[] }

const CATEGORY_OPTIONS = [
  { value: 'academic', label: 'วิชาการ', color: '#943400', bg: 'bg-orange-100', text: 'text-orange-800' },
  { value: 'activity', label: 'กิจกรรม', color: '#059669', bg: 'bg-emerald-100', text: 'text-emerald-800' },
  { value: 'exam',     label: 'สอบ',     color: '#DC2626', bg: 'bg-red-100',     text: 'text-red-800'     },
  { value: 'holiday',  label: 'วันหยุด', color: '#7C3AED', bg: 'bg-violet-100',  text: 'text-violet-800'  },
  { value: 'other',    label: 'อื่นๆ',   color: '#64748B', bg: 'bg-slate-100',   text: 'text-slate-700'   },
]

const catInfo = (cat: string) =>
  CATEGORY_OPTIONS.find((c) => c.value === cat) ?? CATEGORY_OPTIONS[4]

const EMPTY_FORM = {
  title: '', description: '', startDate: '', endDate: '', category: 'activity', color: '#059669',
}

export default function AdminEventsList({ events: initial }: Props) {
  const [events, setEvents] = useState<CalEvent[]>(initial)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState<string | null>(null)

  const setF = (key: string, value: string) => {
    const updates: Record<string, string> = { [key]: value }
    if (key === 'category') updates.color = catInfo(value).color
    if (key === 'startDate' && !form.endDate) updates.endDate = value
    setForm((prev) => ({ ...prev, ...updates }))
  }

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setEditId(null)
    setShowForm(true)
  }

  const openEdit = (ev: CalEvent) => {
    setForm({ title: ev.title, description: ev.description, startDate: ev.startDate, endDate: ev.endDate, category: ev.category, color: ev.color })
    setEditId(ev.id)
    setShowForm(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.startDate) return
    setSaving(true)
    if (editId) {
      const res = await fetch(`/api/events/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const updated = await res.json()
        setEvents((prev) =>
          prev.map((e) => (e.id === editId ? updated : e))
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        )
        setSaved(true); setTimeout(() => setSaved(false), 2500)
        setShowForm(false)
      }
    } else {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const created = await res.json()
        setEvents((prev) =>
          [...prev, created].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        )
        setSaved(true); setTimeout(() => setSaved(false), 2500)
        setForm(EMPTY_FORM)
        setShowForm(false)
      }
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('ลบกิจกรรมนี้?')) return
    setDeleting(id)
    const res = await fetch(`/api/events/${id}`, { method: 'DELETE' })
    if (res.ok) setEvents((prev) => prev.filter((e) => e.id !== id))
    setDeleting(null)
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <AdminLayout title="จัดการปฏิทินกิจกรรม">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">จัดการปฏิทินกิจกรรม</h1>
          <p className="text-slate-500 text-sm mt-0.5">{events.length} กิจกรรม</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          เพิ่มกิจกรรม
        </button>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          บันทึกสำเร็จ
        </div>
      )}

      {/* Category legend */}
      <div className="flex flex-wrap gap-2 mb-4">
        {CATEGORY_OPTIONS.map((c) => (
          <span key={c.value} className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${c.bg} ${c.text}`}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
            {c.label}
          </span>
        ))}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-5">{editId ? 'แก้ไขกิจกรรม' : 'เพิ่มกิจกรรมใหม่'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">ชื่อกิจกรรม <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setF('title', e.target.value)}
                  required
                  placeholder="ชื่อกิจกรรม..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">คำอธิบาย</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setF('description', e.target.value)}
                  rows={2}
                  placeholder="รายละเอียดเพิ่มเติม..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">วันที่เริ่ม <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setF('startDate', e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">วันที่สิ้นสุด</label>
                  <input
                    type="date"
                    value={form.endDate}
                    min={form.startDate}
                    onChange={(e) => setF('endDate', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">ประเภท</label>
                  <select
                    value={form.category}
                    onChange={(e) => setF('category', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">สีกิจกรรม</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.color}
                      onChange={(e) => setF('color', e.target.value)}
                      className="w-10 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={form.color}
                      onChange={(e) => setF('color', e.target.value)}
                      className="flex-1 px-2 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary-300"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-primary-700 hover:bg-primary-800 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors"
                >
                  {saving ? 'กำลังบันทึก...' : editId ? 'บันทึกการแก้ไข' : 'เพิ่มกิจกรรม'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl text-sm transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Events list */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {events.length === 0 ? (
          <div className="text-center py-16 text-slate-400">ยังไม่มีกิจกรรม</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">ชื่อกิจกรรม</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">วันที่</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">ประเภท</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {events.map((ev) => {
                  const cat = catInfo(ev.category)
                  return (
                    <tr key={ev.id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-3.5 h-3.5 rounded-full shrink-0 border-2 border-white shadow-sm" style={{ backgroundColor: ev.color }} />
                          <div>
                            <div className="font-medium text-slate-800">{ev.title}</div>
                            {ev.description && (
                              <div className="text-xs text-slate-400 truncate max-w-xs mt-0.5">{ev.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                        {formatDate(ev.startDate)}
                        {ev.startDate !== ev.endDate && <><br /><span className="text-slate-400">ถึง {formatDate(ev.endDate)}</span></>}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cat.bg} ${cat.text}`}>
                          {cat.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => openEdit(ev)}
                          className="text-xs text-primary-600 hover:text-primary-700 px-2 py-1 rounded hover:bg-primary-50 transition-colors font-medium"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDelete(ev.id)}
                          disabled={deleting === ev.id}
                          className="text-xs text-red-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          ลบ
                        </button>
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
  const denied = checkPageAccess(req as never, 'events')
  if (denied) return denied
  const events = (await readData<CalEvent[]>('events.json', []))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
  return { props: { events } }
}
