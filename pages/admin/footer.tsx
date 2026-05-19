import type { GetServerSideProps } from 'next'
import { useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { readData } from '../../lib/data'
import { checkPageAccess } from '../../lib/auth'

interface FooterLink { id: string; label: string; href: string }

interface FooterData {
  schoolNameTh: string
  schoolNameEn: string
  address: string
  phone: string
  email: string
  quickLinksTitle: string
  quickLinks: FooterLink[]
  servicesTitle: string
  services: FooterLink[]
  copyright: string
}

interface Props { data: FooterData }

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 6)
}

function LinkList({
  title,
  links,
  onTitleChange,
  onLinkChange,
  onAddLink,
  onRemoveLink,
}: {
  title: string
  links: FooterLink[]
  onTitleChange: (v: string) => void
  onLinkChange: (id: string, key: 'label' | 'href', value: string) => void
  onAddLink: () => void
  onRemoveLink: (id: string) => void
}) {
  return (
    <div>
      <div className="mb-3">
        <label className="block text-xs font-medium text-slate-700 mb-1.5">ชื่อคอลัมน์</label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
        />
      </div>
      <div className="space-y-2 mb-2">
        {links.map((link) => (
          <div key={link.id} className="flex items-center gap-2">
            <input
              type="text"
              value={link.label}
              onChange={(e) => onLinkChange(link.id, 'label', e.target.value)}
              placeholder="ชื่อลิงก์"
              className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
            <input
              type="text"
              value={link.href}
              onChange={(e) => onLinkChange(link.id, 'href', e.target.value)}
              placeholder="/path"
              className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
            <button
              type="button"
              onClick={() => onRemoveLink(link.id)}
              className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors shrink-0"
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
        onClick={onAddLink}
        className="flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-800 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-colors border border-primary-200"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        เพิ่มลิงก์
      </button>
    </div>
  )
}

export default function AdminFooter({ data: initial }: Props) {
  const [data, setData] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof FooterData, value: unknown) =>
    setData((d) => ({ ...d, [key]: value }))

  const updateLink = (col: 'quickLinks' | 'services', id: string, key: 'label' | 'href', value: string) =>
    setData((d) => ({
      ...d,
      [col]: d[col].map((l) => (l.id === id ? { ...l, [key]: value } : l)),
    }))

  const addLink = (col: 'quickLinks' | 'services') =>
    setData((d) => ({ ...d, [col]: [...d[col], { id: genId(), label: '', href: '' }] }))

  const removeLink = (col: 'quickLinks' | 'services', id: string) =>
    setData((d) => ({ ...d, [col]: d[col].filter((l) => l.id !== id) }))

  const handleSave = async () => {
    setSaving(true); setSaved(false); setError('')
    try {
      const res = await fetch('/api/footer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
      else setError('บันทึกไม่สำเร็จ')
    } catch { setError('เกิดข้อผิดพลาด') }
    finally { setSaving(false) }
  }

  return (
    <AdminLayout title="จัดการ Footer">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">จัดการ Footer</h1>
          <p className="text-slate-500 text-sm mt-0.5">ข้อมูลโรงเรียน ลิงก์ และลิขสิทธิ์ที่ด้านล่างเว็บ</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* School info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
          <h2 className="font-bold text-slate-800">ข้อมูลโรงเรียน</h2>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">ชื่อโรงเรียน (ภาษาไทย)</label>
            <input type="text" value={data.schoolNameTh} onChange={(e) => set('schoolNameTh', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">ชื่อโรงเรียน (ภาษาอังกฤษ)</label>
            <input type="text" value={data.schoolNameEn} onChange={(e) => set('schoolNameEn', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">ที่อยู่</label>
            <textarea value={data.address} onChange={(e) => set('address', e.target.value)} rows={3}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">เบอร์โทรศัพท์</label>
              <input type="text" value={data.phone} onChange={(e) => set('phone', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">อีเมล</label>
              <input type="email" value={data.email} onChange={(e) => set('email', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">ข้อความลิขสิทธิ์ (ปีจะถูกใส่อัตโนมัติ)</label>
            <input type="text" value={data.copyright} onChange={(e) => set('copyright', e.target.value)}
              placeholder="โรงเรียนราชสีมาวิทยาลัย. สงวนลิขสิทธิ์."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
          </div>
        </div>

        {/* Preview */}
        <div className="bg-primary-900 rounded-2xl p-5 text-white text-xs">
          <p className="text-primary-400 font-semibold uppercase tracking-wider mb-3 text-xs">ตัวอย่าง Footer</p>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-gold-500 flex items-center justify-center shrink-0">
              <span className="text-primary-900 font-bold text-xs">ร</span>
            </div>
            <div>
              <div className="font-bold text-xs">{data.schoolNameTh || '...'}</div>
              <div className="text-primary-400 text-xs">{data.schoolNameEn}</div>
            </div>
          </div>
          <div className="text-primary-300 text-xs leading-relaxed mb-2 whitespace-pre-line">{data.address}</div>
          <div className="text-primary-300 text-xs">📞 {data.phone}</div>
          <div className="text-primary-300 text-xs">✉️ {data.email}</div>
          <div className="border-t border-primary-800 mt-4 pt-3 text-primary-500 text-xs">
            © {new Date().getFullYear()} {data.copyright}
          </div>
        </div>

        {/* Quick links column */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="font-bold text-slate-800 mb-4">คอลัมน์ลิงก์ด่วน</h2>
          <LinkList
            title={data.quickLinksTitle}
            links={data.quickLinks}
            onTitleChange={(v) => set('quickLinksTitle', v)}
            onLinkChange={(id, key, val) => updateLink('quickLinks', id, key, val)}
            onAddLink={() => addLink('quickLinks')}
            onRemoveLink={(id) => removeLink('quickLinks', id)}
          />
        </div>

        {/* Services column */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="font-bold text-slate-800 mb-4">คอลัมน์บริการ</h2>
          <LinkList
            title={data.servicesTitle}
            links={data.services}
            onTitleChange={(v) => set('servicesTitle', v)}
            onLinkChange={(id, key, val) => updateLink('services', id, key, val)}
            onAddLink={() => addLink('services')}
            onRemoveLink={(id) => removeLink('services', id)}
          />
        </div>
      </div>
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const denied = checkPageAccess(req as never, 'footer')
  if (denied) return denied
  const data = await readData<FooterData>('footer.json', {
    schoolNameTh: 'โรงเรียนราชสีมาวิทยาลัย',
    schoolNameEn: 'Ratchasima Wittayalai School',
    address: '',
    phone: '',
    email: '',
    quickLinksTitle: 'ลิงก์ด่วน',
    quickLinks: [],
    servicesTitle: 'บริการ',
    services: [],
    copyright: 'โรงเรียนราชสีมาวิทยาลัย. สงวนลิขสิทธิ์.',
  })
  return { props: { data } }
}
