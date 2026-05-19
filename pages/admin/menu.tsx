import type { GetServerSideProps } from 'next'
import { useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { readData } from '../../lib/data'
import { checkPageAccess } from '../../lib/auth'

interface MenuItem {
  id: string
  label: string
  href: string
  order: number
  children: { id: string; label: string; href: string }[]
}

interface Props { items: MenuItem[] }

function newItem(order: number): MenuItem {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    label: '',
    href: '',
    order,
    children: [],
  }
}

function newChild(): { id: string; label: string; href: string } {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    label: '',
    href: '',
  }
}

export default function AdminMenu({ items: initial }: Props) {
  const [items, setItems] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const sorted = [...items].sort((a, b) => a.order - b.order)

  const updateItem = (id: string, key: keyof MenuItem, value: string | number) =>
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)))

  const removeItem = (id: string) => setItems((prev) => prev.filter((item) => item.id !== id))

  const addItem = () => {
    const item = newItem(items.length + 1)
    setItems((prev) => [...prev, item])
    setExpanded(item.id)
  }

  const addChild = (parentId: string) =>
    setItems((prev) =>
      prev.map((item) =>
        item.id === parentId
          ? { ...item, children: [...item.children, newChild()] }
          : item
      )
    )

  const updateChild = (parentId: string, childId: string, key: 'label' | 'href', value: string) =>
    setItems((prev) =>
      prev.map((item) =>
        item.id === parentId
          ? {
              ...item,
              children: item.children.map((c) => (c.id === childId ? { ...c, [key]: value } : c)),
            }
          : item
      )
    )

  const removeChild = (parentId: string, childId: string) =>
    setItems((prev) =>
      prev.map((item) =>
        item.id === parentId
          ? { ...item, children: item.children.filter((c) => c.id !== childId) }
          : item
      )
    )

  const handleSave = async () => {
    setSaving(true); setSaved(false); setError('')
    try {
      const res = await fetch('/api/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
      })
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
      else setError('บันทึกไม่สำเร็จ')
    } catch { setError('เกิดข้อผิดพลาด') }
    finally { setSaving(false) }
  }

  return (
    <AdminLayout title="จัดการเมนูนำทาง">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">จัดการเมนูนำทาง</h1>
          <p className="text-slate-500 text-sm mt-0.5">เมนูหลักบน Navbar ของเว็บไซต์</p>
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

      {/* Preview navbar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6 overflow-x-auto">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">ตัวอย่างเมนู</p>
        <div className="flex gap-1 min-w-max">
          {sorted.map((item) => (
            <div key={item.id} className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 bg-slate-50 flex items-center gap-1 whitespace-nowrap">
              {item.label || '...'}
              {item.children.length > 0 && (
                <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Menu items */}
      <div className="space-y-3">
        {sorted.map((item, i) => (
          <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Header row */}
            <div className="flex items-center gap-3 px-5 py-4">
              <span className="text-xs font-bold text-slate-400 w-5 shrink-0 text-center">{i + 1}</span>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => updateItem(item.id, 'label', e.target.value)}
                  placeholder="ชื่อเมนู"
                  className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
                <input
                  type="text"
                  value={item.href}
                  onChange={(e) => updateItem(item.id, 'href', e.target.value)}
                  placeholder="URL เช่น /about"
                  className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
                <input
                  type="number"
                  min={1}
                  value={item.order}
                  onChange={(e) => updateItem(item.id, 'order', parseInt(e.target.value) || 1)}
                  placeholder="ลำดับ"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>
              {/* Toggle children */}
              <button
                type="button"
                onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                title="เมนูย่อย"
                className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                  item.children.length > 0
                    ? 'border-primary-200 bg-primary-50 text-primary-700'
                    : 'border-slate-200 text-slate-400 hover:border-slate-300'
                }`}
              >
                <svg className={`w-3.5 h-3.5 transition-transform ${expanded === item.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {item.children.length > 0 ? `${item.children.length} ย่อย` : 'ย่อย'}
              </button>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            {/* Children section */}
            {expanded === item.id && (
              <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
                <p className="text-xs font-semibold text-slate-500 mb-3">เมนูย่อย (Dropdown)</p>
                {item.children.length === 0 && (
                  <p className="text-xs text-slate-400 mb-3">ยังไม่มีเมนูย่อย</p>
                )}
                <div className="space-y-2 mb-3">
                  {item.children.map((child, ci) => (
                    <div key={child.id} className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 w-4 text-center">{ci + 1}</span>
                      <input
                        type="text"
                        value={child.label}
                        onChange={(e) => updateChild(item.id, child.id, 'label', e.target.value)}
                        placeholder="ชื่อเมนูย่อย"
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-300"
                      />
                      <input
                        type="text"
                        value={child.href}
                        onChange={(e) => updateChild(item.id, child.id, 'href', e.target.value)}
                        placeholder="URL เช่น /about#section"
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeChild(item.id, child.id)}
                        className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addChild(item.id)}
                  className="flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-800 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-colors border border-primary-200"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  เพิ่มเมนูย่อย
                </button>
              </div>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="w-full py-4 border-2 border-dashed border-slate-200 hover:border-primary-300 hover:bg-primary-50/30 rounded-2xl text-slate-400 hover:text-primary-600 text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          เพิ่มเมนูหลัก
        </button>
      </div>
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const denied = checkPageAccess(req as never, 'menu')
  if (denied) return denied
  const items = await readData('menu.json', [])
  return { props: { items } }
}
