import type { GetServerSideProps } from 'next'
import { useState, useCallback } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { readData } from '../../lib/data'
import { checkPageAccess } from '../../lib/auth'

interface Palette { [shade: string]: string }
interface ThemeData { palette: Palette; mode?: string }

interface Props { theme: ThemeData }

const SHADES = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900']
const L_SCALE = [97, 93, 85, 72, 60, 47, 38, 30, 21, 13]

const PRESETS = [
  { label: 'ส้มน้ำตาล', desc: 'ธีมเริ่มต้น', base: '#E65100', emoji: '🟠' },
  { label: 'น้ำเงิน',   desc: 'สีน้ำเงินคลาสสิก', base: '#1D4ED8', emoji: '🔵' },
  { label: 'เขียวเข้ม', desc: 'สีเขียวธรรมชาติ', base: '#059669', emoji: '🟢' },
  { label: 'แดงเข้ม',  desc: 'สีแดงทรงพลัง', base: '#DC2626', emoji: '🔴' },
  { label: 'ม่วง',      desc: 'สีม่วงสง่างาม', base: '#7C3AED', emoji: '🟣' },
  { label: 'บอร์กันดี', desc: 'สีทางการ', base: '#9F1239', emoji: '🍷' },
]

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min
  if (d < 0.001) return [0, 0, l * 100]
  const s = d / (1 - Math.abs(2 * l - 1))
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60
  else if (max === g) h = ((b - r) / d + 2) * 60
  else h = ((r - g) / d + 4) * 60
  return [h, s * 100, l * 100]
}

function hslToHex(h: number, s: number, l: number): string {
  const l2 = l / 100
  const a = (s / 100) * Math.min(l2, 1 - l2)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const c = l2 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    return Math.round(255 * c).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

function generatePalette(baseHex: string): Palette {
  if (!/^#[0-9a-fA-F]{6}$/.test(baseHex)) return {}
  const [h, s] = hexToHsl(baseHex)
  return Object.fromEntries(SHADES.map((k, i) => [k, hslToHex(h, s, L_SCALE[i])]))
}

export default function AdminTheme({ theme: initial }: Props) {
  const [palette, setPalette] = useState<Palette>(initial.palette)
  const [mode, setMode] = useState<string>(initial.mode ?? 'dark')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [customBase, setCustomBase] = useState(initial.palette['500'] ?? '#E65100')

  const applyPreset = useCallback((base: string) => {
    setCustomBase(base)
    setPalette(generatePalette(base))
  }, [])

  const applyCustomBase = useCallback((hex: string) => {
    setCustomBase(hex)
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
      setPalette(generatePalette(hex))
    }
  }, [])

  const handleSave = async () => {
    setSaving(true); setSaved(false); setError('')
    try {
      const res = await fetch('/api/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ palette, mode }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 4000)
      } else setError('บันทึกไม่สำเร็จ')
    } catch { setError('เกิดข้อผิดพลาด') }
    finally { setSaving(false) }
  }

  const p50  = palette['50']  ?? '#fff'
  const p100 = palette['100'] ?? '#f0f0f0'
  const p200 = palette['200'] ?? '#ddd'
  const p300 = palette['300'] ?? '#bbb'
  const p500 = palette['500'] ?? '#E65100'
  const p700 = palette['700'] ?? '#943400'
  const p900 = palette['900'] ?? '#471900'

  type ModeConfig = { headerBg: string; statsBg: string; textColor: string; mutedColor: string; valueColor: string; labelColor: string }
  const PREVIEW: Record<string, ModeConfig> = {
    'light':       { headerBg: `linear-gradient(135deg, ${p100} 0%, ${p200} 60%, ${p300} 100%)`,  statsBg: `linear-gradient(135deg, ${p100} 0%, ${p200} 45%, ${p300} 75%, ${p50} 100%)`,  textColor: p900, mutedColor: p700, valueColor: p900, labelColor: p700 },
    'dark':        { headerBg: `linear-gradient(135deg, ${p900} 0%, ${p700} 60%, ${palette['600'] ?? p700} 100%)`, statsBg: `linear-gradient(135deg, ${p900} 0%, ${p700} 45%, ${palette['600'] ?? p700} 75%, ${p500} 100%)`, textColor: '#fff', mutedColor: 'rgba(255,255,255,0.7)', valueColor: '#fbbf24', labelColor: '#fed7aa' },
    'solid-light': { headerBg: p100, statsBg: p100, textColor: p900, mutedColor: p700, valueColor: p900, labelColor: p700 },
    'solid-dark':  { headerBg: p700, statsBg: p700, textColor: '#fff', mutedColor: 'rgba(255,255,255,0.7)', valueColor: '#fbbf24', labelColor: '#fed7aa' },
  }
  const preview = PREVIEW[mode] ?? PREVIEW['dark']

  return (
    <AdminLayout title="ธีมสี">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">ธีมสีเว็บไซต์</h1>
          <p className="text-slate-500 text-sm mt-0.5">เปลี่ยนสีหลักของเว็บไซต์ทั้งหมด</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-primary-700 hover:bg-primary-800 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm"
        >
          {saving ? 'กำลังบันทึก...' : 'บันทึกและใช้งาน'}
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          บันทึกสำเร็จ — รีโหลดหน้าเว็บเพื่อดูการเปลี่ยนแปลง
        </div>
      )}

      {/* Mode toggle */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6">
        <h2 className="font-bold text-slate-800 mb-3">โหมดธีม</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {([
            { value: 'light',       icon: '☀', label: 'สว่าง Gradient',  desc: 'ไล่สีอ่อน',   swatch: `linear-gradient(135deg, ${p100}, ${p300})`, textColor: p900 },
            { value: 'dark',        icon: '☾', label: 'เข้ม Gradient',   desc: 'ไล่สีเข้ม',   swatch: `linear-gradient(135deg, ${p900}, ${p700})`, textColor: '#fff' },
            { value: 'solid-light', icon: '◻', label: 'สว่าง สีเดียว',  desc: 'พื้นสีอ่อน',  swatch: p100,                                         textColor: p900 },
            { value: 'solid-dark',  icon: '◼', label: 'เข้ม สีเดียว',   desc: 'พื้นสีเข้ม',  swatch: p700,                                         textColor: '#fff' },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setMode(opt.value)}
              className={`flex flex-col rounded-xl overflow-hidden border-2 transition-all text-left ${
                mode === opt.value ? 'border-slate-800 shadow' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="h-10 w-full flex items-center justify-center text-lg font-bold" style={{ background: opt.swatch, color: opt.textColor }}>
                {opt.icon}
              </div>
              <div className="px-2.5 py-2 bg-white">
                <div className="text-xs font-semibold text-slate-800 leading-tight">{opt.label}</div>
                <div className="text-xs text-slate-400">{opt.desc}</div>
              </div>
              {mode === opt.value && (
                <div className="px-2.5 pb-2 bg-white">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-700 bg-primary-50 px-1.5 py-0.5 rounded-full">
                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    ใช้งานอยู่
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Presets + Custom */}
        <div className="lg:col-span-2 space-y-6">

          {/* Preset themes */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="font-bold text-slate-800 mb-4">ธีมสำเร็จรูป</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PRESETS.map((p) => {
                const pal = generatePalette(p.base)
                const isActive = palette['500'] === pal['500']
                return (
                  <button
                    key={p.base}
                    type="button"
                    onClick={() => applyPreset(p.base)}
                    className={`relative flex flex-col rounded-2xl overflow-hidden border-2 transition-all ${
                      isActive ? 'border-slate-800 shadow-lg' : 'border-transparent hover:border-slate-300'
                    }`}
                  >
                    {/* Gradient swatch */}
                    <div
                      className="h-14 w-full"
                      style={{ background: `linear-gradient(135deg, ${pal['900']} 0%, ${pal['700']} 50%, ${pal['600']} 100%)` }}
                    />
                    {/* Color strip */}
                    <div className="flex h-3">
                      {['900','700','600','500','400','200'].map((s) => (
                        <div key={s} className="flex-1" style={{ background: pal[s] }} />
                      ))}
                    </div>
                    <div className="bg-white px-3 py-2 text-left">
                      <div className="text-sm font-semibold text-slate-800">{p.emoji} {p.label}</div>
                      <div className="text-xs text-slate-400">{p.desc}</div>
                    </div>
                    {isActive && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow">
                        <svg className="w-3 h-3 text-slate-800" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Custom color */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="font-bold text-slate-800 mb-1">สีกำหนดเอง</h2>
            <p className="text-slate-500 text-xs mb-4">เลือกสีหลักแล้วระบบจะสร้างชุดสีอัตโนมัติ</p>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={customBase}
                onChange={(e) => applyCustomBase(e.target.value)}
                className="w-14 h-14 rounded-xl border border-slate-200 cursor-pointer p-1"
              />
              <div>
                <input
                  type="text"
                  value={customBase}
                  onChange={(e) => applyCustomBase(e.target.value)}
                  placeholder="#E65100"
                  className="w-32 px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
                <p className="text-xs text-slate-400 mt-1">กรอก hex color เช่น #1D4ED8</p>
              </div>
            </div>
          </div>

          {/* Palette fine-tune */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="font-bold text-slate-800 mb-4">ปรับละเอียดแต่ละโทนสี</h2>
            <div className="space-y-2">
              {SHADES.map((shade) => (
                <div key={shade} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-500 w-8 shrink-0">{shade}</span>
                  <input
                    type="color"
                    value={palette[shade] ?? '#ffffff'}
                    onChange={(e) => setPalette((prev) => ({ ...prev, [shade]: e.target.value }))}
                    className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5 shrink-0"
                  />
                  <div
                    className="flex-1 h-8 rounded-lg border border-slate-100"
                    style={{ background: palette[shade] }}
                  />
                  <span className="text-xs font-mono text-slate-400 w-20 shrink-0">{palette[shade]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 sticky top-4">
            <h2 className="font-bold text-slate-800 mb-4">ตัวอย่าง</h2>

            {/* Page header preview */}
            <div
              className="rounded-xl overflow-hidden mb-3 p-4"
              style={{ background: preview.headerBg }}
            >
              <div className="text-xs mb-0.5" style={{ color: preview.mutedColor }}>หน้าแรก › ข่าวสาร</div>
              <div className="font-bold text-base" style={{ color: preview.textColor }}>หัวข้อหน้า</div>
            </div>

            {/* Button preview */}
            <div className="flex gap-2 mb-3">
              <div
                className="px-4 py-2 rounded-xl text-white text-xs font-semibold"
                style={{ background: p700 }}
              >
                ปุ่มหลัก
              </div>
              <div
                className="px-4 py-2 rounded-xl text-xs font-semibold border"
                style={{ color: p700, borderColor: palette['200'] ?? '#ddd', background: palette['50'] ?? '#fff' }}
              >
                ปุ่มรอง
              </div>
            </div>

            {/* Nav active state */}
            <div className="flex gap-2 mb-3">
              {['เมนู 1', 'เมนู 2', 'เมนู 3'].map((m, i) => (
                <div
                  key={m}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={i === 0
                    ? { background: palette['50'] ?? '#fff', color: p700 }
                    : { color: '#475569' }
                  }
                >
                  {m}
                </div>
              ))}
            </div>

            {/* Palette strip */}
            <div className="rounded-xl overflow-hidden flex h-6">
              {SHADES.map((s) => (
                <div key={s} className="flex-1" style={{ background: palette[s] }} title={`${s}: ${palette[s]}`} />
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>50</span><span>900</span>
            </div>

            {/* Stats section preview */}
            <div
              className="rounded-xl mt-3 p-4 text-center"
              style={{ background: preview.statsBg }}
            >
              <div className="font-bold text-lg" style={{ color: preview.valueColor }}>2,400+</div>
              <div className="text-xs" style={{ color: preview.labelColor }}>นักเรียนทั้งหมด</div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const denied = checkPageAccess(req as never, 'theme')
  if (denied) return denied
  const theme = readData<ThemeData>('theme.json', {
    mode: 'dark',
    palette: {
      '50': '#FFF2EB', '100': '#FFDECC', '200': '#FFB68F', '300': '#FF8E52',
      '400': '#FF6A1A', '500': '#E65100', '600': '#BD4200', '700': '#943400',
      '800': '#6B2500', '900': '#471900',
    },
  })
  return { props: { theme } }
}
