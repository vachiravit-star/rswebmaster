import type { GetServerSideProps } from 'next'
import { useState } from 'react'
import Link from 'next/link'
import AdminLayout from '../../../components/admin/AdminLayout'
import { readData } from '../../../lib/data'
import { checkPageAccess } from '../../../lib/auth'

interface Download {
  id: string
  title: string
  category: string
  description: string
  fileUrl: string
  fileType: string
  fileSize: string
  createdAt: string
}

interface Props { downloads: Download[] }

const categoryLabels: Record<string, string> = {
  teacher: 'สำหรับครู',
  student: 'สำหรับนักเรียน',
  parent: 'สำหรับผู้ปกครอง',
}

export default function AdminDownloads({ downloads: initial }: Props) {
  const [downloads, setDownloads] = useState(initial)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    category: 'student',
    description: '',
    fileUrl: '',
    fileType: 'PDF',
    fileSize: '',
  })

  const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.fileUrl) {
      setError('กรุณากรอกชื่อเอกสารและ URL ไฟล์')
      return
    }
    setSaving(true)
    setError('')
    const res = await fetch('/api/downloads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const created = await res.json()
      setDownloads((prev) => [created, ...prev])
      setForm({ title: '', category: 'student', description: '', fileUrl: '', fileType: 'PDF', fileSize: '' })
      setShowForm(false)
    } else {
      const data = await res.json()
      setError(data.error || 'เกิดข้อผิดพลาด')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('ลบเอกสารนี้?')) return
    setDeleting(id)
    const res = await fetch(`/api/downloads/${id}`, { method: 'DELETE' })
    if (res.ok) setDownloads((prev) => prev.filter((d) => d.id !== id))
    setDeleting(null)
  }

  return (
    <AdminLayout title="จัดการเอกสาร">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">จัดการเอกสารดาวน์โหลด</h1>
          <p className="text-slate-500 text-sm mt-0.5">{downloads.length} ไฟล์</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showForm ? 'M6 18L18 6M6 6l12 12' : 'M12 4v16m8-8H4'} />
          </svg>
          {showForm ? 'ยกเลิก' : 'เพิ่มเอกสาร'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6 animate-fade-in">
          <h2 className="font-bold text-slate-800 mb-4">เพิ่มเอกสารใหม่</h2>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleCreate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">ชื่อเอกสาร *</label>
                <input type="text" value={form.title} onChange={(e) => set('title', e.target.value)} required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">กลุ่มเป้าหมาย</label>
                <select value={form.category} onChange={(e) => set('category', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white">
                  <option value="student">สำหรับนักเรียน</option>
                  <option value="teacher">สำหรับครู</option>
                  <option value="parent">สำหรับผู้ปกครอง</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">รายละเอียด</label>
                <input type="text" value={form.description} onChange={(e) => set('description', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">URL ไฟล์ * (Google Drive, etc.)</label>
                <input type="text" value={form.fileUrl} onChange={(e) => set('fileUrl', e.target.value)} required
                  placeholder="https://drive.google.com/..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">ประเภทไฟล์</label>
                <select value={form.fileType} onChange={(e) => set('fileType', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white">
                  <option>PDF</option>
                  <option>DOCX</option>
                  <option>XLSX</option>
                  <option>PPTX</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">ขนาดไฟล์</label>
                <input type="text" value={form.fileSize} onChange={(e) => set('fileSize', e.target.value)}
                  placeholder="เช่น 245 KB"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm">
                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl transition-colors text-sm">
                ยกเลิก
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {downloads.length === 0 ? (
          <div className="text-center py-16 text-slate-400">ยังไม่มีเอกสาร</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">ชื่อเอกสาร</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">กลุ่มเป้าหมาย</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">ไฟล์</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {downloads.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-800">{doc.title}</div>
                      <div className="text-xs text-slate-400 truncate max-w-xs">{doc.description}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                        {categoryLabels[doc.category] || doc.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs">
                      <span className="font-medium">{doc.fileType}</span>
                      {doc.fileSize && ` · ${doc.fileSize}`}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a href={doc.fileUrl} target="_blank" rel="noreferrer"
                          className="text-xs text-primary-600 hover:underline px-2 py-1">
                          เปิด
                        </a>
                        <button onClick={() => handleDelete(doc.id)} disabled={deleting === doc.id}
                          className="text-xs text-red-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 disabled:opacity-50">
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const denied = checkPageAccess(req as never, 'downloads')
  if (denied) return denied
  const downloads = readData<Download[]>('downloads.json', [])
  return { props: { downloads } }
}
