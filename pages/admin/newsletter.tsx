import type { GetServerSideProps } from 'next'
import { useState, useRef } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { readData } from '../../lib/data'
import { checkPageAccess } from '../../lib/auth'
import type { NewsletterItem, NewsletterConfig } from '../api/newsletter'

interface Props { config: NewsletterConfig }

const newItem = (order: number): NewsletterItem => ({
  id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
  title: '',
  image: '',
  driveFileId: '',
  order,
  publishedAt: new Date().toISOString().slice(0, 10),
})

function DriveIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0a15.92 15.92 0 000 3.3z" fill="#0066da"/>
      <path d="M43.65 25L29.9 1.2C28.55 2 27.4 3.1 26.6 4.5L1.7 49.5a15.92 15.92 0 00-1.7 7h27.5z" fill="#00ac47"/>
      <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75L87.3 56a15.92 15.92 0 000-13H59.8l5.85 11.5z" fill="#ea4335"/>
      <path d="M43.65 25L57.4 1.2C56.05.45 54.5 0 52.85 0H34.45a16.2 16.2 0 00-4.55 1.2z" fill="#00832d"/>
      <path d="M59.8 43H27.5L13.75 66.8c1.35.75 2.9 1.2 4.55 1.2h50.7c1.65 0 3.2-.45 4.55-1.2z" fill="#2684fc"/>
      <path d="M73.4 26.5l-12.45-21.6C60.15 3.3 59 2.2 57.65 1.45l-14 24.8 16.15 27.7H87.3a16.65 16.65 0 000-6.8z" fill="#ffba00"/>
    </svg>
  )
}

export default function AdminNewsletter({ config: initial }: Props) {
  const [config, setConfig] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const handleSave = async () => {
    setSaving(true); setSaved(false); setError('')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
      else setError('บันทึกไม่สำเร็จ')
    } catch { setError('เกิดข้อผิดพลาด') }
    finally { setSaving(false) }
  }

  const updateItem = (id: string, key: keyof NewsletterItem, value: string | number) =>
    setConfig((c) => ({
      ...c,
      items: c.items.map((it) => (it.id === id ? { ...it, [key]: value } : it)),
    }))

  const addItem = () =>
    setConfig((c) => {
      const maxOrder = c.items.reduce((m, it) => Math.max(m, it.order), 0)
      return { ...c, items: [newItem(maxOrder + 1), ...c.items] }
    })

  const removeItem = (id: string) =>
    setConfig((c) => ({ ...c, items: c.items.filter((it) => it.id !== id) }))

  const handleFileChange = async (id: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('รองรับเฉพาะไฟล์รูปภาพ')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('ไฟล์ใหญ่เกิน 10MB')
      return
    }
    setUploading(id)
    setUploadError(null)
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const base64 = e.target?.result as string
        const res = await fetch('/api/drive/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64,
            filename: file.name,
            folderId: config.driveFolderId || undefined,
          }),
        })
        const data = await res.json()
        if (res.ok) {
          updateItem(id, 'image', data.url)
          if (data.driveFileId) updateItem(id, 'driveFileId', data.driveFileId)
        } else {
          setUploadError(data.error || 'อัปโหลดไม่สำเร็จ')
        }
      } catch {
        setUploadError('เกิดข้อผิดพลาดในการอัปโหลด')
      } finally {
        setUploading(null)
      }
    }
    reader.readAsDataURL(file)
  }

  const sorted = [...config.items].sort((a, b) => b.order - a.order)

  return (
    <AdminLayout title="จดหมายข่าว">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">จัดการจดหมายข่าว</h1>
          <p className="text-slate-500 text-sm mt-0.5">ภาพแนวตั้ง A4 แสดงบนหน้าแรก — ภาพใหม่สุดแสดงก่อน</p>
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
          บันทึกสำเร็จ
        </div>
      )}

      {/* Settings */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6 space-y-4">
        <h2 className="font-bold text-slate-800">ตั้งค่าส่วน</h2>
        <div className="flex flex-wrap items-end gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">แสดงบนหน้าแรก</span>
            <button
              type="button"
              onClick={() => setConfig((c) => ({ ...c, enabled: !c.enabled }))}
              className={`relative w-10 h-6 rounded-full transition-colors ${config.enabled ? 'bg-primary-600' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${config.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">ชื่อหัวข้อส่วน</label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => setConfig((c) => ({ ...c, title: e.target.value }))}
              placeholder="จดหมายข่าว"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>
        </div>

        {/* Drive folder ID */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
            <DriveIcon />
            Google Drive Folder ID (สำหรับเก็บภาพ)
          </label>
          <input
            type="text"
            value={config.driveFolderId}
            onChange={(e) => setConfig((c) => ({ ...c, driveFolderId: e.target.value }))}
            placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
          <p className="text-xs text-slate-400 mt-1">
            ต้องตั้งค่า <code className="bg-slate-100 px-1 rounded">GOOGLE_SA_EMAIL</code> และ <code className="bg-slate-100 px-1 rounded">GOOGLE_SA_PRIVATE_KEY</code> ใน .env.local จึงจะอัปโหลดสู่ Drive ได้ — หากไม่ตั้งค่าจะเก็บบนเซิร์ฟเวอร์แทน
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-4">
        <button
          onClick={addItem}
          className="w-full py-4 border-2 border-dashed border-slate-200 hover:border-primary-300 hover:bg-primary-50/30 rounded-2xl text-slate-400 hover:text-primary-600 text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          เพิ่มจดหมายข่าวฉบับใหม่
        </button>

        {uploadError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-2 rounded-xl">{uploadError}</div>
        )}

        {sorted.map((item, i) => (
          <div key={item.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                ฉบับที่ {i + 1}
                {i === 0 && (
                  <span className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full">ล่าสุด</span>
                )}
              </span>
              <button
                onClick={() => removeItem(item.id)}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                ลบ
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: metadata */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">ชื่อ / หัวเรื่อง</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                    placeholder="จดหมายข่าว ฉบับที่ 1/2568"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">วันที่เผยแพร่</label>
                  <input
                    type="date"
                    value={item.publishedAt}
                    onChange={(e) => updateItem(item.id, 'publishedAt', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  />
                </div>
                {item.driveFileId && (
                  <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
                    <DriveIcon />
                    เก็บใน Google Drive: <code className="font-mono ml-1 opacity-70 truncate max-w-32">{item.driveFileId}</code>
                  </div>
                )}
              </div>

              {/* Right: image upload — A4 portrait preview */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">ภาพจดหมายข่าว (แนวตั้ง A4)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  ref={(el) => { fileInputRefs.current[item.id] = el }}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileChange(item.id, file)
                    e.target.value = ''
                  }}
                />

                <div
                  className="relative rounded-xl overflow-hidden border-2 border-dashed border-slate-200 hover:border-primary-300 transition-colors cursor-pointer bg-slate-50"
                  style={{ aspectRatio: '210/297' }}
                  onClick={() => fileInputRefs.current[item.id]?.click()}
                >
                  {uploading === item.id ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80">
                      <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-slate-500">กำลังอัปโหลด...</span>
                    </div>
                  ) : item.image ? (
                    <>
                      <img src={item.image} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                        <span className="text-white text-xs font-medium bg-black/50 px-3 py-1 rounded-full">เปลี่ยนภาพ</span>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-primary-500 transition-colors">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-xs font-medium">คลิกเพื่ออัปโหลด</span>
                      <span className="text-xs opacity-60">JPG, PNG, WebP</span>
                    </div>
                  )}
                </div>

                {item.image && (
                  <button
                    type="button"
                    onClick={() => { updateItem(item.id, 'image', ''); updateItem(item.id, 'driveFileId', '') }}
                    className="mt-2 w-full text-xs text-slate-400 hover:text-red-500 transition-colors py-1"
                  >
                    ลบภาพ
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {sorted.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">ยังไม่มีจดหมายข่าว — กดปุ่มด้านบนเพื่อเพิ่ม</p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const denied = checkPageAccess(req as never, 'newsletter')
  if (denied) return denied
  const config = readData('newsletter.json', {
    enabled: true,
    title: 'จดหมายข่าว',
    driveFolderId: '',
    items: [],
  })
  return { props: { config } }
}
