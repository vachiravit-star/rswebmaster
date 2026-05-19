import { useRef, useState } from 'react'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  folder?: string
  label?: string
  aspectRatio?: string
}

export default function ImageUpload({
  value,
  onChange,
  folder = 'news',
  label = 'รูปภาพ',
  aspectRatio = 'aspect-video',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('กรุณาเลือกไฟล์รูปภาพเท่านั้น')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('ขนาดไฟล์ต้องไม่เกิน 10MB')
      return
    }

    setUploading(true)
    setError('')

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const base64 = e.target?.result as string
        const res = await fetch('/api/uploads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64, filename: file.name, folder }),
        })
        if (res.ok) {
          const data = await res.json()
          onChange(data.url)
        } else {
          setError('อัพโหลดไม่สำเร็จ กรุณาลองใหม่')
        }
      } catch {
        setError('เกิดข้อผิดพลาด')
      } finally {
        setUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      )}

      <div className="space-y-2">
        {value ? (
          <div className="relative group rounded-xl overflow-hidden border border-slate-200">
            <img
              src={value}
              alt="Preview"
              className={`w-full ${aspectRatio} object-cover`}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="bg-white text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                เปลี่ยนรูป
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors"
              >
                ลบรูป
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => !uploading && inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className={`border-2 border-dashed border-slate-200 rounded-xl p-6 text-center transition-colors ${
              uploading
                ? 'bg-slate-50 cursor-not-allowed'
                : 'cursor-pointer hover:border-primary-300 hover:bg-primary-50/30'
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-500">กำลังอัพโหลด...</p>
              </div>
            ) : (
              <>
                <svg
                  className="w-8 h-8 text-slate-300 mx-auto mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm font-medium text-slate-600">คลิกหรือลากไฟล์มาวาง</p>
                <p className="text-xs text-slate-400 mt-0.5">JPG, PNG, WebP • ไม่เกิน 10MB</p>
              </>
            )}
          </div>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  )
}
