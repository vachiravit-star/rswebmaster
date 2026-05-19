import type { GetServerSideProps } from 'next'
import { useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import ImageUpload from '../../components/admin/ImageUpload'
import { readData } from '../../lib/data'
import { checkPageAccess } from '../../lib/auth'

interface GalleryFolder {
  id: string
  name: string
  link: string
  image: string
  order: number
}

interface GalleryConfig {
  enabled: boolean
  title: string
  folders: GalleryFolder[]
}

interface Props { config: GalleryConfig }

const newFolder = (order: number): GalleryFolder => ({
  id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
  name: '',
  link: '',
  image: '',
  order,
})

export default function AdminGallery({ config: initial }: Props) {
  const [config, setConfig] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [fetchingThumb, setFetchingThumb] = useState<string | null>(null)
  const [thumbError, setThumbError] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      const res = await fetch('/api/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
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

  const updateFolder = (id: string, key: string, value: string | number) =>
    setConfig((c) => ({
      ...c,
      folders: c.folders.map((f) => (f.id === id ? { ...f, [key]: value } : f)),
    }))

  const addFolder = () =>
    setConfig((c) => {
      const maxOrder = c.folders.reduce((m, f) => Math.max(m, f.order), 0)
      return { ...c, folders: [newFolder(maxOrder + 1), ...c.folders] }
    })

  const removeFolder = (id: string) =>
    setConfig((c) => ({ ...c, folders: c.folders.filter((f) => f.id !== id) }))

  const fetchThumbnail = async (folder: GalleryFolder) => {
    if (!folder.link) return
    setFetchingThumb(folder.id)
    setThumbError(null)
    try {
      const res = await fetch(`/api/drive/folder-thumb?link=${encodeURIComponent(folder.link)}`)
      const data = await res.json()
      if (res.ok) {
        updateFolder(folder.id, 'image', data.thumbnailUrl)
      } else {
        setThumbError(data.error || 'ดึงภาพไม่สำเร็จ')
      }
    } catch {
      setThumbError('เกิดข้อผิดพลาด กรุณาตรวจสอบการเชื่อมต่อ')
    } finally {
      setFetchingThumb(null)
    }
  }

  const sorted = [...config.folders].sort((a, b) => b.order - a.order)

  return (
    <AdminLayout title="จัดการแกลเลอรี">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">จัดการแกลเลอรีรูปภาพ</h1>
          <p className="text-slate-500 text-sm mt-0.5">โฟลเดอร์ Google Drive สำหรับแสดงบนหน้าแรก</p>
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
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
        <h2 className="font-bold text-slate-800 mb-4">ตั้งค่าส่วน</h2>
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
              placeholder="ภาพกิจกรรม"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>
        </div>
      </div>

      {/* Folder list */}
      <div className="space-y-4">
        <button
          onClick={addFolder}
          className="w-full py-4 border-2 border-dashed border-slate-200 hover:border-primary-300 hover:bg-primary-50/30 rounded-2xl text-slate-400 hover:text-primary-600 text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          เพิ่มโฟลเดอร์
        </button>

        {sorted.map((folder, i) => (
          <div key={folder.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-slate-700">โฟลเดอร์ที่ {i + 1}</span>
              <button
                onClick={() => removeFolder(folder.id)}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                ลบ
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">ชื่อโฟลเดอร์ / ชื่อกิจกรรม</label>
                  <input
                    type="text"
                    value={folder.name}
                    onChange={(e) => updateFolder(folder.id, 'name', e.target.value)}
                    placeholder="กิจกรรมวันไหว้ครู 2567"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">ลิ้งค์โฟลเดอร์ Google Drive</label>
                  <input
                    type="url"
                    value={folder.link}
                    onChange={(e) => updateFolder(folder.id, 'link', e.target.value)}
                    placeholder="https://drive.google.com/drive/folders/..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  />
                  <button
                    type="button"
                    onClick={() => fetchThumbnail(folder)}
                    disabled={!folder.link || fetchingThumb === folder.id}
                    className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {fetchingThumb === folder.id ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                        กำลังดึงภาพ...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0a15.92 15.92 0 000 3.3z" fill="#0066da"/>
                          <path d="M43.65 25L29.9 1.2C28.55 2 27.4 3.1 26.6 4.5L1.7 49.5a15.92 15.92 0 00-1.7 7h27.5z" fill="#00ac47"/>
                          <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75L87.3 56a15.92 15.92 0 000-13H59.8l5.85 11.5z" fill="#ea4335"/>
                          <path d="M43.65 25L57.4 1.2C56.05.45 54.5 0 52.85 0H34.45a16.2 16.2 0 00-4.55 1.2z" fill="#00832d"/>
                          <path d="M59.8 43H27.5L13.75 66.8c1.35.75 2.9 1.2 4.55 1.2h50.7c1.65 0 3.2-.45 4.55-1.2z" fill="#2684fc"/>
                          <path d="M73.4 26.5l-12.45-21.6C60.15 3.3 59 2.2 57.65 1.45l-14 24.8 16.15 27.7H87.3a16.65 16.65 0 000-6.8z" fill="#ffba00"/>
                        </svg>
                        ดึงภาพปกจาก Drive อัตโนมัติ
                      </>
                    )}
                  </button>
                  {thumbError && fetchingThumb === null && (
                    <p className="text-xs text-red-500 mt-1">{thumbError}</p>
                  )}
                </div>
              </div>
              <div>
                <ImageUpload
                  value={folder.image}
                  onChange={(url) => updateFolder(folder.id, 'image', url)}
                  folder="gallery"
                  label="รูปภาพปกโฟลเดอร์"
                  aspectRatio="aspect-video"
                />
              </div>
            </div>
          </div>
        ))}

      </div>
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const denied = checkPageAccess(req as never, 'gallery')
  if (denied) return denied
  const config = readData('gallery.json', {
    enabled: true,
    title: 'ภาพกิจกรรม',
    folders: [],
  })
  return { props: { config } }
}
