import type { GetServerSideProps } from 'next'
import { useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import ImageUpload from '../../components/admin/ImageUpload'
import { readData } from '../../lib/data'
import { checkPageAccess } from '../../lib/auth'
import type { Slide } from '../../components/HeroSlider'

interface Props { slides: Slide[] }

const GRADIENT_PRESETS = [
  { label: 'ส้มเข้ม', from: '#471900', to: '#BD4200' },
  { label: 'ส้มไฟ', from: '#6B2500', to: '#E65100' },
  { label: 'ส้ม-ทอง', from: '#943400', to: '#F59E0B' },
  { label: 'พระอาทิตย์ตก', from: '#2D1000', to: '#FF6A1A' },
  { label: 'น้ำตาล-ส้ม', from: '#1E0A00', to: '#943400' },
  { label: 'ส้ม-แดง', from: '#7F1D1D', to: '#BD4200' },
]

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 6)
}

export default function AdminHero({ slides: initial }: Props) {
  const [slides, setSlides] = useState<Slide[]>(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<string | null>(initial[0]?.id ?? null)

  const update = (id: string, key: keyof Slide, value: string) =>
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, [key]: value } : s)))

  const remove = (id: string) => {
    setSlides((prev) => prev.filter((s) => s.id !== id))
    setExpanded((e) => (e === id ? null : e))
  }

  const add = () => {
    const s: Slide = {
      id: genId(),
      title: '',
      subtitle: '',
      bgFrom: '#471900',
      bgTo: '#BD4200',
      image: '',
      link: '/',
      buttonText: 'เรียนรู้เพิ่มเติม',
    }
    setSlides((prev) => [...prev, s])
    setExpanded(s.id)
  }

  const applyPreset = (id: string, from: string, to: string) => {
    setSlides((prev) =>
      prev.map((s) => (s.id === id ? { ...s, bgFrom: from, bgTo: to, image: '' } : s))
    )
  }

  const handleSave = async () => {
    setSaving(true); setSaved(false); setError('')
    try {
      const res = await fetch('/api/hero', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slides),
      })
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
      else setError('บันทึกไม่สำเร็จ')
    } catch { setError('เกิดข้อผิดพลาด') }
    finally { setSaving(false) }
  }

  return (
    <AdminLayout title="จัดการ Hero">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">จัดการ Hero Slider</h1>
          <p className="text-slate-500 text-sm mt-0.5">สไลด์แบนเนอร์หลักที่แสดงบนสุดของหน้าแรก</p>
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

      <div className="space-y-4">
        {slides.map((slide, i) => (
          <div key={slide.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Header row */}
            <div
              className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setExpanded(expanded === slide.id ? null : slide.id)}
            >
              {/* Mini preview swatch */}
              <div
                className="w-10 h-10 rounded-xl shrink-0 overflow-hidden"
                style={
                  slide.image
                    ? { backgroundImage: `url(${slide.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                    : { background: `linear-gradient(135deg, ${slide.bgFrom}, ${slide.bgTo})` }
                }
              />
              <span className="text-xs font-bold text-slate-400 w-5 text-center shrink-0">{i + 1}</span>
              <span className="flex-1 text-sm font-semibold text-slate-700 truncate">{slide.title || '(ยังไม่ระบุหัวข้อ)'}</span>
              <svg
                className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${expanded === slide.id ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Expanded form */}
            {expanded === slide.id && (
              <div className="border-t border-slate-100 p-5 bg-slate-50">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left — text fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">หัวข้อหลัก</label>
                      <input
                        type="text"
                        value={slide.title}
                        onChange={(e) => update(slide.id, 'title', e.target.value)}
                        placeholder="ชื่อโรงเรียนหรือหัวข้อสไลด์"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">คำอธิบาย (Subtitle)</label>
                      <textarea
                        value={slide.subtitle}
                        onChange={(e) => update(slide.id, 'subtitle', e.target.value)}
                        rows={2}
                        placeholder="คำอธิบายสั้นๆ ใต้หัวข้อ"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">ปุ่มหลัก</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1.5">ข้อความปุ่ม</label>
                          <input
                            type="text"
                            value={slide.buttonText ?? ''}
                            onChange={(e) => update(slide.id, 'buttonText', e.target.value)}
                            placeholder="เรียนรู้เพิ่มเติม"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1.5">ลิงก์ปุ่ม</label>
                          <input
                            type="text"
                            value={slide.link}
                            onChange={(e) => update(slide.id, 'link', e.target.value)}
                            placeholder="/about"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">ปุ่มรอง (ไม่บังคับ)</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1.5">ข้อความปุ่มรอง</label>
                          <input
                            type="text"
                            value={slide.buttonText2 ?? ''}
                            onChange={(e) => update(slide.id, 'buttonText2', e.target.value)}
                            placeholder="สมัครเรียน"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1.5">ลิงก์ปุ่มรอง</label>
                          <input
                            type="text"
                            value={slide.link2 ?? ''}
                            onChange={(e) => update(slide.id, 'link2', e.target.value)}
                            placeholder="/admissions"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Gradient controls */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-2">พื้นหลัง Gradient (ถ้าไม่ใช้ภาพ)</label>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {GRADIENT_PRESETS.map((p) => (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => applyPreset(slide.id, p.from, p.to)}
                            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-primary-300 transition-colors overflow-hidden"
                          >
                            <span
                              className="w-4 h-4 rounded shrink-0"
                              style={{ background: `linear-gradient(135deg, ${p.from}, ${p.to})` }}
                            />
                            {p.label}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-slate-600">จาก</label>
                          <input
                            type="color"
                            value={slide.bgFrom}
                            onChange={(e) => update(slide.id, 'bgFrom', e.target.value)}
                            className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                          />
                          <input
                            type="text"
                            value={slide.bgFrom}
                            onChange={(e) => update(slide.id, 'bgFrom', e.target.value)}
                            className="w-24 px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary-300"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-slate-600">ถึง</label>
                          <input
                            type="color"
                            value={slide.bgTo}
                            onChange={(e) => update(slide.id, 'bgTo', e.target.value)}
                            className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                          />
                          <input
                            type="text"
                            value={slide.bgTo}
                            onChange={(e) => update(slide.id, 'bgTo', e.target.value)}
                            className="w-24 px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary-300"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right — image + preview */}
                  <div className="space-y-4">
                    <ImageUpload
                      value={slide.image ?? ''}
                      onChange={(url) => update(slide.id, 'image', url)}
                      folder="hero"
                      label="รูปภาพพื้นหลัง (ทับ Gradient ถ้ามี)"
                      aspectRatio="aspect-video"
                    />
                    {slide.image && (
                      <button
                        type="button"
                        onClick={() => update(slide.id, 'image', '')}
                        className="text-xs text-red-500 hover:text-red-700 transition-colors"
                      >
                        ลบรูปภาพ (ใช้ Gradient แทน)
                      </button>
                    )}

                    {/* Mini slide preview */}
                    <div>
                      <p className="text-xs text-slate-400 mb-2">ตัวอย่างสไลด์</p>
                      <div
                        className="rounded-xl overflow-hidden relative h-28"
                        style={
                          slide.image
                            ? { backgroundImage: `url(${slide.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                            : { background: `linear-gradient(135deg, ${slide.bgFrom}, ${slide.bgTo})` }
                        }
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-yellow-300" />
                        <div className="absolute bottom-3 left-4 right-4">
                          <div className="text-white font-bold text-sm leading-snug drop-shadow">{slide.title || '...'}</div>
                          <div className="text-white/75 text-xs mt-0.5 line-clamp-1">{slide.subtitle}</div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(slide.id)}
                      className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      ลบสไลด์นี้
                    </button>
                  </div>
                </div>
              </div>
            )}
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
          เพิ่มสไลด์ใหม่
        </button>
      </div>
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const denied = checkPageAccess(req as never, 'hero')
  if (denied) return denied
  interface Settings { heroSlides: Slide[]; schoolInfo: unknown }
  const settings = await readData<Settings>('settings.json', { heroSlides: [], schoolInfo: {} })
  return { props: { slides: settings.heroSlides } }
}
