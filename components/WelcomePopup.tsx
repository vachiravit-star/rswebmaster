import { useEffect, useState } from 'react'
import Link from 'next/link'

export interface PopupData {
  enabled: boolean
  title: string
  content: string
  image: string
  buttonText: string
  buttonLink: string
  showOnce: boolean
}

const STORAGE_KEY = 'welcome_popup_closed'

interface Props {
  popup: PopupData
}

export default function WelcomePopup({ popup }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!popup.enabled) return
    if (popup.showOnce) {
      try {
        if (sessionStorage.getItem(STORAGE_KEY)) return
      } catch {}
    }
    const t = setTimeout(() => setVisible(true), 400)
    return () => clearTimeout(t)
  }, [popup.enabled, popup.showOnce])

  const close = () => {
    setVisible(false)
    if (popup.showOnce) {
      try { sessionStorage.setItem(STORAGE_KEY, '1') } catch {}
    }
  }

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={popup.title || 'ยินดีต้อนรับ'}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto overflow-hidden animate-popup">
        {/* Close button — always visible, large touch target */}
        <button
          type="button"
          onClick={close}
          aria-label="ปิด"
          className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/35 active:bg-black/50 transition-colors"
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image */}
        {popup.image && (
          <div className="w-full aspect-[16/7] overflow-hidden bg-slate-100">
            <img src={popup.image} alt="" className="w-full h-full object-cover" aria-hidden="true" />
          </div>
        )}

        {/* Content */}
        <div className="px-6 pt-5 pb-6">
          {popup.title && (
            <h2 className="text-xl font-bold text-slate-800 leading-snug mb-2">{popup.title}</h2>
          )}
          {popup.content && (
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{popup.content}</p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-5">
            {popup.buttonText && popup.buttonLink && (
              <Link
                href={popup.buttonLink}
                onClick={close}
                className="flex-1 text-center bg-primary-700 hover:bg-primary-800 text-white font-semibold text-sm px-5 py-3 rounded-xl transition-colors"
              >
                {popup.buttonText}
              </Link>
            )}
            <button
              type="button"
              onClick={close}
              className="flex-1 sm:flex-none text-center border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm px-5 py-3 rounded-xl transition-colors"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
