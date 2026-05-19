import type { GetServerSideProps } from 'next'
import { useState } from 'react'
import Link from 'next/link'
import AdminLayout from '../../../components/admin/AdminLayout'
import ImageUpload from '../../../components/admin/ImageUpload'
import { readData } from '../../../lib/data'
import { checkPageAccess } from '../../../lib/auth'

interface ManagementMember {
  id: string
  title: string
  name: string
  dept: string
  order: number
  photo: string
}

interface Props { members: ManagementMember[] }

const emptyForm = { title: '', name: '', dept: '', order: 1, photo: '' }

export default function AdminManagement({ members: initial }: Props) {
  const [members, setMembers] = useState(initial)
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [addForm, setAddForm] = useState({ ...emptyForm, order: initial.length + 1 })
  const [editForm, setEditForm] = useState<ManagementMember | null>(null)

  const setAdd = (key: string, value: string | number) =>
    setAddForm((p) => ({ ...p, [key]: value }))

  const setEdit = (key: string, value: string | number) =>
    setEditForm((p) => p ? { ...p, [key]: value } : p)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addForm.title || !addForm.name) { setError('กรุณากรอกชื่อและตำแหน่ง'); return }
    setSaving(true)
    setError('')
    const res = await fetch('/api/management', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addForm),
    })
    if (res.ok) {
      const created = await res.json()
      setMembers((p) => [...p, created].sort((a, b) => a.order - b.order))
      setAddForm({ ...emptyForm, order: members.length + 2 })
      setShowAdd(false)
    } else {
      setError('เกิดข้อผิดพลาด')
    }
    setSaving(false)
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editForm) return
    setSaving(true)
    const res = await fetch(`/api/management/${editForm.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    if (res.ok) {
      const updated = await res.json()
      setMembers((p) => p.map((m) => m.id === updated.id ? updated : m).sort((a, b) => a.order - b.order))
      setEditingId(null)
      setEditForm(null)
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('ลบผู้บริหารคนนี้?')) return
    setDeleting(id)
    const res = await fetch(`/api/management/${id}`, { method: 'DELETE' })
    if (res.ok) setMembers((p) => p.filter((m) => m.id !== id))
    setDeleting(null)
  }

  const startEdit = (m: ManagementMember) => {
    setEditingId(m.id)
    setEditForm({ ...m })
    setShowAdd(false)
  }

  return (
    <AdminLayout title="จัดการผู้บริหาร">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">จัดการทำเนียบผู้บริหาร</h1>
          <p className="text-slate-500 text-sm mt-0.5">{members.length} คน</p>
        </div>
        <button
          onClick={() => { setShowAdd(!showAdd); setEditingId(null) }}
          className="flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showAdd ? 'M6 18L18 6M6 6l12 12' : 'M12 4v16m8-8H4'} />
          </svg>
          {showAdd ? 'ยกเลิก' : 'เพิ่มผู้บริหาร'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
      )}

      {/* Add form */}
      {showAdd && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6 animate-fade-in">
          <h2 className="font-bold text-slate-800 mb-5">เพิ่มผู้บริหารใหม่</h2>
          <form onSubmit={handleAdd}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">ตำแหน่ง *</label>
                  <input type="text" value={addForm.title} onChange={(e) => setAdd('title', e.target.value)}
                    required placeholder="ผู้อำนวยการโรงเรียน"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">ชื่อ-นามสกุล *</label>
                  <input type="text" value={addForm.name} onChange={(e) => setAdd('name', e.target.value)}
                    required placeholder="ดร. ชื่อ นามสกุล"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">ฝ่าย/กลุ่มงาน</label>
                  <input type="text" value={addForm.dept} onChange={(e) => setAdd('dept', e.target.value)}
                    placeholder="ฝ่ายวิชาการ"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">ลำดับการแสดงผล</label>
                  <input type="number" value={addForm.order} min={1}
                    onChange={(e) => setAdd('order', parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                </div>
              </div>
              <div>
                <ImageUpload
                  value={addForm.photo}
                  onChange={(url) => setAdd('photo', url)}
                  folder="management"
                  label="รูปถ่าย"
                  aspectRatio="aspect-[3/4]"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button type="submit" disabled={saving}
                className="px-6 py-2.5 bg-primary-700 hover:bg-primary-800 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm">
                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
              <button type="button" onClick={() => setShowAdd(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl transition-colors text-sm">
                ยกเลิก
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Members list */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {members.map((member) => (
          <div key={member.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {editingId === member.id && editForm ? (
              /* Edit form inline */
              <form onSubmit={handleEdit} className="p-5 space-y-3">
                <h3 className="font-semibold text-slate-800 text-sm mb-3">แก้ไข</h3>
                <ImageUpload
                  value={editForm.photo}
                  onChange={(url) => setEdit('photo', url)}
                  folder="management"
                  label="รูปถ่าย"
                  aspectRatio="aspect-[3/4]"
                />
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">ตำแหน่ง</label>
                  <input type="text" value={editForm.title} onChange={(e) => setEdit('title', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">ชื่อ-นามสกุล</label>
                  <input type="text" value={editForm.name} onChange={(e) => setEdit('name', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">ฝ่าย</label>
                  <input type="text" value={editForm.dept} onChange={(e) => setEdit('dept', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">ลำดับ</label>
                  <input type="number" value={editForm.order} min={1}
                    onChange={(e) => setEdit('order', parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={saving}
                    className="flex-1 py-2 bg-primary-700 text-white text-xs font-semibold rounded-lg disabled:opacity-60">
                    {saving ? '...' : 'บันทึก'}
                  </button>
                  <button type="button" onClick={() => { setEditingId(null); setEditForm(null) }}
                    className="flex-1 py-2 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg">
                    ยกเลิก
                  </button>
                </div>
              </form>
            ) : (
              /* Card view */
              <>
                <div className="flex items-start gap-4 p-5">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center shrink-0">
                    {member.photo ? (
                      <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-7 h-7 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gold-600 mb-0.5">{member.title}</div>
                    <div className="font-semibold text-slate-800 text-sm leading-snug">{member.name}</div>
                    {member.dept && <div className="text-xs text-slate-400 mt-0.5">{member.dept}</div>}
                    <div className="text-xs text-slate-300 mt-1">ลำดับ {member.order}</div>
                  </div>
                </div>
                <div className="flex border-t border-slate-100">
                  <button onClick={() => startEdit(member)}
                    className="flex-1 py-2.5 text-xs font-medium text-primary-600 hover:bg-primary-50 transition-colors">
                    แก้ไข
                  </button>
                  <button onClick={() => handleDelete(member.id)} disabled={deleting === member.id}
                    className="flex-1 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors border-l border-slate-100 disabled:opacity-50">
                    ลบ
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {members.length === 0 && (
          <div className="col-span-3 text-center py-16 text-slate-400">
            ยังไม่มีข้อมูลผู้บริหาร
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const denied = checkPageAccess(req as never, 'management')
  if (denied) return denied
  const members = readData<ManagementMember[]>('management.json', [])
    .sort((a, b) => a.order - b.order)
  return { props: { members } }
}
