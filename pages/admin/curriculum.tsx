import type { GetServerSideProps } from 'next'
import { useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { readData } from '../../lib/data'
import { checkPageAccess } from '../../lib/auth'

interface Program {
  id: string
  title: string
  subtitle: string
  levels: string[]
  desc: string
  subjects: string[]
  color: string
  featured: boolean
}

interface Achievement {
  id: string
  icon: string
  text: string
}

interface Cta {
  title: string
  description: string
  buttonText: string
  buttonLink: string
}

interface CurriculumData {
  pageTitle: string
  pageSubtitle: string
  programs: Program[]
  achievements: Achievement[]
  cta: Cta
}

interface Props { data: CurriculumData }

const PROGRAM_COLORS = [
  { key: 'slate',   label: 'เทา',       gradient: 'from-slate-700 to-slate-800',     badge: 'bg-slate-100 text-slate-700' },
  { key: 'primary', label: 'น้ำเงิน',   gradient: 'from-primary-700 to-primary-900', badge: 'bg-primary-100 text-primary-700' },
  { key: 'gold',    label: 'ทอง',       gradient: 'from-gold-600 to-gold-700',       badge: 'bg-gold-100 text-gold-700' },
  { key: 'emerald', label: 'เขียว',     gradient: 'from-emerald-600 to-emerald-800', badge: 'bg-emerald-100 text-emerald-700' },
  { key: 'rose',    label: 'ชมพู',      gradient: 'from-rose-600 to-rose-800',       badge: 'bg-rose-100 text-rose-700' },
  { key: 'indigo',  label: 'คราม',      gradient: 'from-indigo-600 to-indigo-800',   badge: 'bg-indigo-100 text-indigo-700' },
]

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 6)
}

export default function AdminCurriculum({ data: initial }: Props) {
  const [data, setData] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [expandedProgram, setExpandedProgram] = useState<string | null>(
    initial.programs[0]?.id ?? null
  )

  const setField = (key: keyof CurriculumData, value: unknown) =>
    setData((d) => ({ ...d, [key]: value }))

  const setCta = (key: keyof Cta, value: string) =>
    setData((d) => ({ ...d, cta: { ...d.cta, [key]: value } }))

  /* Programs */
  const updateProgram = (id: string, key: keyof Program, value: unknown) =>
    setData((d) => ({
      ...d,
      programs: d.programs.map((p) => (p.id === id ? { ...p, [key]: value } : p)),
    }))

  const addProgram = () => {
    const p: Program = {
      id: genId(),
      title: '',
      subtitle: '',
      levels: [],
      desc: '',
      subjects: [],
      color: 'primary',
      featured: false,
    }
    setData((d) => ({ ...d, programs: [...d.programs, p] }))
    setExpandedProgram(p.id)
  }

  const removeProgram = (id: string) =>
    setData((d) => ({ ...d, programs: d.programs.filter((p) => p.id !== id) }))

  /* Achievements */
  const updateAchievement = (id: string, key: 'icon' | 'text', value: string) =>
    setData((d) => ({
      ...d,
      achievements: d.achievements.map((a) => (a.id === id ? { ...a, [key]: value } : a)),
    }))

  const addAchievement = () =>
    setData((d) => ({
      ...d,
      achievements: [...d.achievements, { id: genId(), icon: '🏆', text: '' }],
    }))

  const removeAchievement = (id: string) =>
    setData((d) => ({ ...d, achievements: d.achievements.filter((a) => a.id !== id) }))

  const handleSave = async () => {
    setSaving(true); setSaved(false); setError('')
    try {
      const res = await fetch('/api/curriculum', {
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
    <AdminLayout title="จัดการหลักสูตร">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">จัดการหลักสูตรการเรียน</h1>
          <p className="text-slate-500 text-sm mt-0.5">ประเภทห้องเรียน ความสำเร็จ และ CTA</p>
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

      {/* Page header settings */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
        <h2 className="font-bold text-slate-800 mb-4">หัวข้อหน้า</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">ชื่อหน้า (Page Title)</label>
            <input
              type="text"
              value={data.pageTitle}
              onChange={(e) => setField('pageTitle', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">คำอธิบายใต้หัวข้อ</label>
            <input
              type="text"
              value={data.pageSubtitle}
              onChange={(e) => setField('pageSubtitle', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>
        </div>
      </div>

      {/* Programs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800">ประเภทห้องเรียน</h2>
          <button
            type="button"
            onClick={addProgram}
            className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-800 font-medium px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            เพิ่มห้องเรียน
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {data.programs.map((prog, i) => {
            const colorOpt = PROGRAM_COLORS.find((c) => c.key === prog.color) ?? PROGRAM_COLORS[0]
            return (
              <div key={prog.id}>
                {/* Row header */}
                <div
                  className="flex items-center gap-3 px-6 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setExpandedProgram(expandedProgram === prog.id ? null : prog.id)}
                >
                  <span className="text-xs font-bold text-slate-400 w-5 text-center shrink-0">{i + 1}</span>
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${colorOpt.gradient} shrink-0`} />
                  <span className="flex-1 text-sm font-semibold text-slate-700">{prog.title || '(ยังไม่ระบุชื่อ)'}</span>
                  {prog.featured && (
                    <span className="text-xs bg-gold-100 text-gold-700 px-2 py-0.5 rounded-full font-medium">⭐ แนะนำ</span>
                  )}
                  <svg
                    className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${expandedProgram === prog.id ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Expanded form */}
                {expandedProgram === prog.id && (
                  <div className="px-6 pb-6 bg-slate-50 border-t border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">ชื่อห้องเรียน</label>
                          <input type="text" value={prog.title} onChange={(e) => updateProgram(prog.id, 'title', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-300" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">ชื่อภาษาอังกฤษ / ชื่อย่อ</label>
                          <input type="text" value={prog.subtitle} onChange={(e) => updateProgram(prog.id, 'subtitle', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-300" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">ระดับชั้น (หนึ่งบรรทัดต่อระดับ)</label>
                          <textarea
                            value={prog.levels.join('\n')}
                            onChange={(e) => updateProgram(prog.id, 'levels', e.target.value.split('\n').filter(Boolean))}
                            rows={2}
                            placeholder="ม.1 – ม.3&#10;ม.4 – ม.6"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">คำอธิบาย</label>
                          <textarea
                            value={prog.desc}
                            onChange={(e) => updateProgram(prog.id, 'desc', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">วิชาที่สอน (หนึ่งวิชาต่อบรรทัด)</label>
                          <textarea
                            value={prog.subjects.join('\n')}
                            onChange={(e) => updateProgram(prog.id, 'subjects', e.target.value.split('\n').filter(Boolean))}
                            rows={4}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-2">สีธีม</label>
                          <div className="grid grid-cols-3 gap-2">
                            {PROGRAM_COLORS.map((col) => (
                              <button
                                key={col.key}
                                type="button"
                                onClick={() => updateProgram(prog.id, 'color', col.key)}
                                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-medium transition-all ${
                                  prog.color === col.key
                                    ? 'border-primary-400 ring-2 ring-primary-200 bg-white text-primary-800'
                                    : 'border-slate-200 text-slate-600 bg-white hover:border-slate-300'
                                }`}
                              >
                                <span className={`w-3 h-3 rounded-full bg-gradient-to-br shrink-0 ${col.gradient}`} />
                                {col.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-3">
                          <span className="text-sm text-slate-700 flex-1">แนะนำ (Highlighted)</span>
                          <button
                            type="button"
                            onClick={() => updateProgram(prog.id, 'featured', !prog.featured)}
                            className={`relative w-10 h-6 rounded-full transition-colors ${prog.featured ? 'bg-primary-600' : 'bg-slate-200'}`}
                          >
                            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${prog.featured ? 'translate-x-4' : 'translate-x-0.5'}`} />
                          </button>
                        </div>
                        {/* Mini preview */}
                        <div>
                          <p className="text-xs text-slate-400 mb-2">ตัวอย่าง</p>
                          <div className="rounded-xl overflow-hidden shadow-sm border border-slate-100 max-w-52">
                            <div className={`bg-gradient-to-br ${colorOpt.gradient} p-4 text-white`}>
                              {prog.featured && <span className="text-xs bg-gold-400/20 text-gold-300 border border-gold-400/30 px-2 py-0.5 rounded-full mb-2 inline-block">⭐ แนะนำ</span>}
                              <div className="font-bold text-sm leading-snug">{prog.title || '...'}</div>
                              <div className="text-white/70 text-xs mt-0.5">{prog.subtitle}</div>
                            </div>
                            <div className="bg-white p-3">
                              <p className="text-xs text-slate-500 line-clamp-2">{prog.desc || '...'}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {prog.subjects.slice(0, 3).map((s) => (
                                  <span key={s} className={`text-xs px-2 py-0.5 rounded-full ${colorOpt.badge}`}>{s}</span>
                                ))}
                                {prog.subjects.length > 3 && <span className="text-xs text-slate-400">+{prog.subjects.length - 3}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeProgram(prog.id)}
                          className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          ลบห้องเรียนนี้
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-800">ความสำเร็จทางวิชาการ</h2>
          <button type="button" onClick={addAchievement}
            className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-800 font-medium px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            เพิ่ม
          </button>
        </div>
        <div className="space-y-3">
          {data.achievements.map((a) => (
            <div key={a.id} className="flex items-center gap-3">
              <input
                type="text"
                value={a.icon}
                onChange={(e) => updateAchievement(a.id, 'icon', e.target.value)}
                className="w-14 px-2 py-2 rounded-xl border border-slate-200 text-xl text-center focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
              <input
                type="text"
                value={a.text}
                onChange={(e) => updateAchievement(a.id, 'text', e.target.value)}
                placeholder="ข้อความความสำเร็จ"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
              <button type="button" onClick={() => removeAchievement(a.id)}
                className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
          {data.achievements.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">ยังไม่มีรายการ</p>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="font-bold text-slate-800 mb-4">ส่วน CTA (ปุ่มเรียกร้องด้านล่างหน้า)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">หัวข้อ</label>
            <input type="text" value={data.cta.title} onChange={(e) => setCta('title', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">คำอธิบาย</label>
            <input type="text" value={data.cta.description} onChange={(e) => setCta('description', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">ข้อความปุ่ม</label>
            <input type="text" value={data.cta.buttonText} onChange={(e) => setCta('buttonText', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">ลิงก์ปุ่ม</label>
            <input type="text" value={data.cta.buttonLink} onChange={(e) => setCta('buttonLink', e.target.value)}
              placeholder="/admissions"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const denied = checkPageAccess(req as never, 'curriculum')
  if (denied) return denied
  const data = readData<CurriculumData>('curriculum.json', {
    pageTitle: 'หลักสูตรการเรียนการสอน',
    pageSubtitle: '',
    programs: [],
    achievements: [],
    cta: { title: '', description: '', buttonText: '', buttonLink: '' },
  })
  return { props: { data } }
}
