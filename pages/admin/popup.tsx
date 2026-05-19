import type { GetServerSideProps } from 'next'
import { useState } from 'react'
import Link from 'next/link'
import AdminLayout from '../../components/admin/AdminLayout'
import ImageUpload from '../../components/admin/ImageUpload'
import { readData } from '../../lib/data'
import { checkPageAccess } from '../../lib/auth'
import type { PopupData } from '../../components/WelcomePopup'

interface Props { data: PopupData }

export default function AdminPopup({ data: initial }: Props) {
  const [data, setData] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const set = (key: string, value: string | boolean) =>
    setData((prev) => ({ ...prev, [key]: value }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      const res = await fetch('/api/popup', {
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
    <AdminLayout title="Welcome Popup">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome Popup</h1>
          <p className="text-slate-500 text-sm mt-0.5">popup จะแสดงขึ้นมาเมื่อผู้เข้าชมเปิดหน้าแรก</p>
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
          {/* Left */}
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

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              {/* Toggle */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-bold text-slate-800">การแสดงผล</h2>
                  <p className="text-xs text-slate-500 mt-0.5">เปิด/ปิดการแสดง Popup บนหน้าแรก</p>
                </div>
                <button
                  type="button"
                  onClick={() => set('enabled', !data.enabled)}
                  className={`relative w-12 h-7 rounded-full transition-colors ${data.enabled ? 'bg-primary-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${data.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className={`space-y-4 ${!data.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                <ImageUpload
                  value={data.image}
                  onChange={(url) => set('image', url)}
                  folder="popup"
                  label="รูปภาพใน Popup (ไม่บังคับ)"
                  aspectRatio="aspect-[16/7]"
                />

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">หัวข้อ</label>
                  <input
                    type="text"
                    value={data.title}
                    onChange={(e) => set('title', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                    placeholder="ยินดีต้อนรับ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">เนื้อหา</label>
                  <textarea
                    value={data.content}
                    onChange={(e) => set('content', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
                    placeholder="ข้อความแจ้งเตือน หรือประชาสัมพันธ์..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">ข้อความปุ่ม (ไม่บังคับ)</label>
                    <input
                      type="text"
                      value={data.buttonText}
                      onChange={(e) => set('buttonText', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                      placeholder="อ่านเพิ่มเติม"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">ลิงก์ปุ่ม</label>
                    <input
                      type="text"
                      value={data.buttonLink}
                      onChange={(e) => set('buttonLink', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                      placeholder="/news"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer select-none pt-1">
                  <div
                    className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${data.showOnce ? 'bg-primary-600' : 'bg-slate-200'}`}
                    onClick={() => set('showOnce', !data.showOnce)}
                  >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${data.showOnce ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-700">แสดงครั้งเดียวต่อ session</div>
                    <div className="text-xs text-slate-400">ปิดหน้าแล้วกลับมาจะแสดงใหม่ ถ้าปิดตัวเลือกนี้จะแสดงทุกครั้งที่โหลดหน้า</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right: preview + save */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-800 text-sm mb-3">ตัวอย่าง Popup</h3>
              {data.enabled ? (
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow">
                  <div className="relative">
                    <div className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 z-10">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    {data.image && (
                      <div className="w-full aspect-[16/7] bg-slate-100 overflow-hidden">
                        <img src={data.image} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    {data.title && <div className="font-bold text-slate-800 text-sm mb-1">{data.title}</div>}
                    {data.content && <div className="text-xs text-slate-600 leading-relaxed line-clamp-3">{data.content}</div>}
                    <div className="flex gap-2 mt-3">
                      {data.buttonText && (
                        <div className="flex-1 text-center bg-primary-700 text-white text-xs font-semibold px-3 py-2 rounded-lg">
                          {data.buttonText}
                        </div>
                      )}
                      <div className="text-center border border-slate-200 text-slate-700 text-xs font-medium px-3 py-2 rounded-lg">
                        ปิด
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-slate-100 h-24 flex items-center justify-center">
                  <span className="text-xs text-slate-400">Popup ถูกปิดใช้งาน</span>
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
  const denied = checkPageAccess(req as never, 'popup')
  if (denied) return denied
  const data = await readData('popup.json', {
    enabled: false,
    title: '',
    content: '',
    image: '',
    buttonText: '',
    buttonLink: '',
    showOnce: true,
  })
  return { props: { data } }
}
