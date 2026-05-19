import type { GetServerSideProps } from 'next'
import { useState } from 'react'
import Link from 'next/link'
import AdminLayout from '../../components/admin/AdminLayout'
import ImageUpload from '../../components/admin/ImageUpload'
import { readData } from '../../lib/data'
import { checkPageAccess } from '../../lib/auth'

interface HomepageData {
  banner: {
    enabled: boolean
    image: string
    title: string
    subtitle: string
    description: string
    buttonText: string
    buttonLink: string
  }
}

interface Props { data: HomepageData }

export default function AdminHomepage({ data: initial }: Props) {
  const [data, setData] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const setBanner = (key: string, value: string | boolean) =>
    setData((prev) => ({ ...prev, banner: { ...prev.banner, [key]: value } }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      const res = await fetch('/api/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        setError('บันทึกไม่สำเร็จ')
      }
    } catch {
      setError('เกิดข้อผิดพลาด')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout title="ตั้งค่าหน้าแรก">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">ตั้งค่าหน้าแรก</h1>
          <p className="text-slate-500 text-sm mt-0.5">จัดการ Banner Section ใต้ Hero ของหน้าแรก</p>
        </div>
        <Link href="/" target="_blank" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          ดูหน้าแรก
        </Link>
      </div>

      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: content form */}
          <div className="lg:col-span-2 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
            )}
            {saved && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                บันทึกสำเร็จ
              </div>
            )}

            {/* Banner section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-slate-800">Welcome Banner Section</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">แสดงบนหน้าแรก</span>
                  <button
                    type="button"
                    onClick={() => setBanner('enabled', !data.banner.enabled)}
                    className={`relative w-10 h-6 rounded-full transition-colors ${data.banner.enabled ? 'bg-primary-600' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${data.banner.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>

              <div className={`space-y-4 ${!data.banner.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                <ImageUpload
                  value={data.banner.image}
                  onChange={(url) => setBanner('image', url)}
                  folder="homepage"
                  label="รูปภาพพื้นหลัง Banner (ถ้าไม่มีจะใช้สีพื้นหลังแทน)"
                  aspectRatio="aspect-[21/6]"
                />

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">หัวข้อหลัก</label>
                  <input
                    type="text"
                    value={data.banner.title}
                    onChange={(e) => setBanner('title', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                    placeholder="ยินดีต้อนรับสู่โรงเรียนราชสีมาวิทยาลัย"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">หัวข้อรอง</label>
                  <input
                    type="text"
                    value={data.banner.subtitle}
                    onChange={(e) => setBanner('subtitle', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                    placeholder="สถาบันการศึกษาชั้นนำแห่งจังหวัดนครราชสีมา"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">คำอธิบาย</label>
                  <textarea
                    value={data.banner.description}
                    onChange={(e) => setBanner('description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
                    placeholder="คำอธิบายโรงเรียน..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">ข้อความปุ่ม CTA</label>
                    <input
                      type="text"
                      value={data.banner.buttonText}
                      onChange={(e) => setBanner('buttonText', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                      placeholder="เรียนรู้เพิ่มเติม"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">ลิงก์ปุ่ม CTA</label>
                    <input
                      type="text"
                      value={data.banner.buttonLink}
                      onChange={(e) => setBanner('buttonLink', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                      placeholder="/about"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: preview + save */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-800 text-sm mb-3">ตัวอย่าง Banner</h3>
              {data.banner.enabled ? (
                <div
                  className="rounded-xl overflow-hidden relative min-h-28 flex items-center"
                  style={{
                    background: data.banner.image
                      ? `url(${data.banner.image}) center/cover`
                      : 'linear-gradient(135deg, #471900, #BD4200)',
                  }}
                >
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="relative p-4 text-white">
                    <div className="text-xs font-bold mb-0.5 text-gold-300">{data.banner.subtitle}</div>
                    <div className="text-sm font-bold leading-snug">{data.banner.title}</div>
                    <div className="text-xs text-white/70 mt-1 leading-relaxed line-clamp-2">{data.banner.description}</div>
                    {data.banner.buttonText && (
                      <div className="mt-2 inline-block bg-gold-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
                        {data.banner.buttonText}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-slate-100 h-24 flex items-center justify-center">
                  <span className="text-xs text-slate-400">Banner ถูกซ่อน</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-primary-700 hover:bg-primary-800 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
            </button>
          </div>
        </div>
      </form>
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const denied = checkPageAccess(req as never, 'homepage')
  if (denied) return denied
  const data = await readData('homepage.json', {
    banner: { enabled: true, image: '', title: '', subtitle: '', description: '', buttonText: '', buttonLink: '' },
  })
  return { props: { data } }
}
