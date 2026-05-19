import type { GetServerSideProps } from 'next'
import { useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { isSuperAdmin } from '../../lib/auth'

interface SubAdmin {
  id: string
  username: string
  displayName: string
  allowedPages: string[]
}

interface Props { admins: SubAdmin[] }

const ALL_PAGES = [
  { key: 'hero',       label: 'จัดการ Hero' },
  { key: 'news',       label: 'จัดการข่าวสาร' },
  { key: 'events',     label: 'จัดการกิจกรรม' },
  { key: 'downloads',  label: 'จัดการเอกสาร' },
  { key: 'stats',      label: 'จัดการสถิติ' },
  { key: 'quicklinks', label: 'ลิงก์ด่วน' },
  { key: 'menu',       label: 'เมนูนำทาง' },
  { key: 'management', label: 'จัดการผู้บริหาร' },
  { key: 'curriculum', label: 'จัดการหลักสูตร' },
  { key: 'footer',     label: 'จัดการ Footer' },
  { key: 'homepage',   label: 'ตั้งค่าหน้าแรก' },
  { key: 'gallery',    label: 'แกลเลอรี Drive' },
]

const EMPTY = { username: '', password: '', displayName: '', allowedPages: [] as string[] }

export default function AdminAdmins({ admins: initial }: Props) {
  const [admins, setAdmins] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<(SubAdmin & { password?: string }) | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const setF = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }))

  const togglePage = (key: string) => {
    setForm((p) => ({
      ...p,
      allowedPages: p.allowedPages.includes(key)
        ? p.allowedPages.filter((k) => k !== key)
        : [...p.allowedPages, key],
    }))
  }

  const openCreate = () => {
    setForm(EMPTY)
    setEditItem(null)
    setError('')
    setShowForm(true)
  }

  const openEdit = (a: SubAdmin) => {
    setForm({ username: a.username, password: '', displayName: a.displayName, allowedPages: [...a.allowedPages] })
    setEditItem(a)
    setError('')
    setShowForm(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.username || (!editItem && !form.password) || !form.displayName) {
      setError('กรุณากรอกข้อมูลให้ครบ')
      return
    }
    setSaving(true)
    setError('')
    const body = editItem
      ? { id: editItem.id, ...form, ...(form.password ? {} : { password: undefined }) }
      : form
    const res = await fetch('/api/subadmins', {
      method: editItem ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (res.ok) {
      if (editItem) {
        setAdmins((prev) => prev.map((a) => (a.id === editItem.id ? { ...a, ...data } : a)))
      } else {
        setAdmins((prev) => [...prev, data])
      }
      setSaved(true); setTimeout(() => setSaved(false), 2500)
      setShowForm(false)
    } else {
      setError(data.error || 'เกิดข้อผิดพลาด')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('ลบแอดมินรองคนนี้?')) return
    setDeleting(id)
    const res = await fetch('/api/subadmins', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) setAdmins((prev) => prev.filter((a) => a.id !== id))
    setDeleting(null)
  }

  return (
    <AdminLayout title="จัดการแอดมินรอง">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">จัดการแอดมินรอง</h1>
          <p className="text-slate-500 text-sm mt-0.5">กำหนดสิทธิ์การเข้าถึงสำหรับแต่ละบัญชี</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          เพิ่มแอดมินรอง
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

      {/* Super admin notice */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-amber-800 mb-0.5">Super Admin</p>
          <p className="text-xs text-amber-700">บัญชี Super Admin มีสิทธิ์เข้าถึงทุกส่วนและเป็นผู้กำหนดสิทธิ์ให้แอดมินรอง</p>
        </div>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-800 mb-5">{editItem ? 'แก้ไขแอดมินรอง' : 'เพิ่มแอดมินรอง'}</h2>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2.5 rounded-xl mb-4">{error}</div>}
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">ชื่อที่แสดง <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.displayName}
                    onChange={(e) => setF('displayName', e.target.value)}
                    placeholder="ชื่อผู้ดูแล"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">ชื่อผู้ใช้ <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setF('username', e.target.value)}
                    placeholder="username"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                    disabled={!!editItem}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  รหัสผ่าน {editItem ? '(เว้นว่างถ้าไม่เปลี่ยน)' : <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setF('password', e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">สิทธิ์การเข้าถึงเมนู</label>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_PAGES.map((p) => (
                    <label
                      key={p.key}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-colors ${
                        form.allowedPages.includes(p.key)
                          ? 'border-primary-300 bg-primary-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                        form.allowedPages.includes(p.key) ? 'bg-primary-600 border-primary-600' : 'border-slate-300'
                      }`}>
                        {form.allowedPages.includes(p.key) && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <input type="checkbox" className="sr-only" checked={form.allowedPages.includes(p.key)} onChange={() => togglePage(p.key)} />
                      <span className="text-xs font-medium text-slate-700">{p.label}</span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={() => setForm((p) => ({ ...p, allowedPages: ALL_PAGES.map((x) => x.key) }))} className="text-xs text-primary-600 hover:text-primary-700">เลือกทั้งหมด</button>
                  <span className="text-slate-300">|</span>
                  <button type="button" onClick={() => setForm((p) => ({ ...p, allowedPages: [] }))} className="text-xs text-slate-500 hover:text-slate-700">ล้างทั้งหมด</button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-primary-700 hover:bg-primary-800 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors"
                >
                  {saving ? 'กำลังบันทึก...' : editItem ? 'บันทึกการแก้ไข' : 'เพิ่มแอดมินรอง'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl text-sm">
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {admins.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 shadow-sm border border-slate-100">
            ยังไม่มีแอดมินรอง — กด "เพิ่มแอดมินรอง" เพื่อเริ่มต้น
          </div>
        ) : (
          admins.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 font-bold text-sm flex items-center justify-center shrink-0">
                    {a.displayName.slice(0, 1)}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">{a.displayName}</div>
                    <div className="text-xs text-slate-500 font-mono">@{a.username}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => openEdit(a)} className="text-xs text-primary-600 hover:text-primary-700 px-3 py-1.5 rounded-lg hover:bg-primary-50 font-medium transition-colors">
                    แก้ไข
                  </button>
                  <button onClick={() => handleDelete(a.id)} disabled={deleting === a.id} className="text-xs text-red-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
                    ลบ
                  </button>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-500 mb-2">สิทธิ์เข้าถึง ({a.allowedPages.length} เมนู):</p>
                {a.allowedPages.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">ยังไม่มีสิทธิ์</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {a.allowedPages.map((key) => {
                      const page = ALL_PAGES.find((p) => p.key === key)
                      return page ? (
                        <span key={key} className="text-xs px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 font-medium">
                          {page.label}
                        </span>
                      ) : null
                    })}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  if (!isSuperAdmin(req as never)) {
    return { redirect: { destination: '/admin', permanent: false } }
  }
  const { readData } = await import('../../lib/data')
  interface SubAdminData { id: string; username: string; displayName: string; allowedPages: string[] }
  const raw = readData<Array<SubAdminData & { password: string }>>('subadmins.json', [])
  const admins: SubAdminData[] = raw.map(({ password: _p, ...rest }) => rest)
  return { props: { admins } }
}
