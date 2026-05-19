import type { GetServerSideProps } from 'next'
import { useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import ImageUpload from '../../components/admin/ImageUpload'
import { readData } from '../../lib/data'
import { checkPageAccess } from '../../lib/auth'

interface SchoolInfo {
  logoUrl: string
  nameTh: string
  nameEn: string
  address: string
  phone: string
  fax: string
  email: string
  website: string
  facebook: string
  vision: string
  mission: string
}

interface Settings { heroSlides: unknown[]; schoolInfo: SchoolInfo }

interface Props { info: SchoolInfo }

const DEFAULT: SchoolInfo = {
  logoUrl: '', nameTh: '', nameEn: '', address: '', phone: '',
  fax: '', email: '', website: '', facebook: '', vision: '', mission: '',
}

export default function AdminSchoolSettings({ info: initial }: Props) {
  const [info, setInfo] = useState<SchoolInfo>(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof SchoolInfo, val: string) =>
    setInfo((prev) => ({ ...prev, [key]: val }))

  const handleSave = async () => {
    setSaving(true); setSaved(false); setError('')
    try {
      const res = await fetch('/api/school-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(info),
      })
      if (!res.ok) throw new Error('Save failed')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('บันทึกไม่สำเร็จ')
    } finally {
      setSaving(false)
    }
  }

  const Field = ({ label, field, placeholder = '' }: { label: string; field: keyof SchoolInfo; placeholder?: string }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        type="text"
        value={info[field] as string}
        onChange={(e) => set(field, e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
      />
    </div>
  )

  const TextArea = ({ label, field, rows = 3 }: { label: string; field: keyof SchoolInfo; rows?: number }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <textarea
        rows={rows}
        value={info[field] as string}
        onChange={(e) => set(field, e.target.value)}
        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
      />
    </div>
  )

  return (
    <AdminLayout title="ตั้งค่าโรงเรียน">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">ตั้งค่าโรงเรียน</h1>
            <p className="text-slate-500 text-sm mt-0.5">ข้อมูลทั่วไปและโลโก้โรงเรียน</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
          >
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>

        {saved && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">
            บันทึกสำเร็จแล้ว
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Logo */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-800">โลโก้โรงเรียน</h2>
          <div className="flex items-start gap-6">
            {/* Preview */}
            <div className="shrink-0">
              <p className="text-xs text-slate-500 mb-2">ตัวอย่างใน Navbar</p>
              <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 w-64">
                {info.logoUrl ? (
                  <img src={info.logoUrl} alt="logo" className="w-10 h-10 rounded-full object-cover shadow-sm" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-700 flex items-center justify-center shadow-sm">
                    <span className="text-gold-400 font-bold text-lg">ร</span>
                  </div>
                )}
                <div>
                  <div className="text-primary-800 font-bold text-sm leading-tight">{info.nameTh || 'ราชสีมาวิทยาลัย'}</div>
                  <div className="text-slate-400 text-xs">{info.nameEn || 'Ratchasima Wittayalai School'}</div>
                </div>
              </div>
            </div>
            {/* Upload */}
            <div className="flex-1">
              <ImageUpload
                value={info.logoUrl}
                onChange={(url) => set('logoUrl', url)}
                folder="hero"
                label="อัพโหลดโลโก้ (แนะนำ 1:1 รูปวงกลม)"
                aspectRatio="aspect-square"
              />
              {info.logoUrl && (
                <button
                  onClick={() => set('logoUrl', '')}
                  className="mt-2 text-xs text-red-500 hover:text-red-700"
                >
                  ลบโลโก้ (ใช้ตัวอักษร ร แทน)
                </button>
              )}
            </div>
          </div>
        </div>

        {/* School Name */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-800">ชื่อโรงเรียน</h2>
          <Field label="ชื่อภาษาไทย" field="nameTh" placeholder="โรงเรียนราชสีมาวิทยาลัย" />
          <Field label="ชื่อภาษาอังกฤษ" field="nameEn" placeholder="Ratchasima Wittayalai School" />
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-800">ข้อมูลติดต่อ</h2>
          <Field label="ที่อยู่" field="address" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="เบอร์โทรศัพท์" field="phone" placeholder="044-000-000" />
            <Field label="แฟกซ์" field="fax" placeholder="044-000-000" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="อีเมล" field="email" placeholder="admin@school.ac.th" />
            <Field label="เว็บไซต์" field="website" placeholder="www.school.ac.th" />
          </div>
          <Field label="Facebook URL" field="facebook" placeholder="https://facebook.com/..." />
        </div>

        {/* Vision & Mission */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-800">วิสัยทัศน์และพันธกิจ</h2>
          <TextArea label="วิสัยทัศน์" field="vision" rows={3} />
          <TextArea label="พันธกิจ" field="mission" rows={3} />
        </div>
      </div>
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const access = checkPageAccess(req as never, 'school-settings')
  if (access) return access
  const s = await readData<Settings>('settings.json', { heroSlides: [], schoolInfo: DEFAULT })
  return { props: { info: { ...DEFAULT, ...(s.schoolInfo ?? {}) } } }
}
