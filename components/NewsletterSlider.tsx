import { useState, useRef, useEffect } from 'react'

export interface NewsletterItem {
  id: string
  title: string
  image: string
  driveFileId: string
  order: number
  publishedAt: string
}

interface Props {
  items: NewsletterItem[]
  title?: string
}

function formatDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function NewsletterSlider({ items, title = 'จดหมายข่าว' }: Props) {
  const sorted = [...items].sort((a, b) => b.order - a.order)
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) el.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll)
    return () => {
      el?.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [sorted.length])

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -240 : 240, behavior: 'smooth' })
  }

  const openLightbox = (idx: number) => setLightboxIdx(idx)
  const closeLightbox = () => setLightboxIdx(null)
  const prevLightbox = () => setLightboxIdx((i) => (i != null && i > 0 ? i - 1 : i))
  const nextLightbox = () => setLightboxIdx((i) => (i != null && i < sorted.length - 1 ? i + 1 : i))

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (lightboxIdx == null) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') prevLightbox()
      if (e.key === 'ArrowRight') nextLightbox()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxIdx])

  if (sorted.length === 0) return null

  return (
    <section className="bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">

        {/* Section header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Newsletter</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
            <p className="text-slate-400 text-sm mt-0.5">{sorted.length} ฉบับ</p>
          </div>
        </div>

        {/* Slider */}
        <div className="relative">
          {/* Left arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 sm:-translate-x-4 z-10 w-9 h-9 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
              aria-label="เลื่อนซ้าย"
            >
              <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Scroll container */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-2"
            style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {sorted.map((item, idx) => (
              <div
                key={item.id}
                className="shrink-0 group cursor-pointer"
                style={{ width: '185px', scrollSnapAlign: 'start' }}
                onClick={() => openLightbox(idx)}
              >
                {/* A4 portrait: 210×297 ratio */}
                <div
                  className="relative rounded-xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 border border-slate-100"
                  style={{ aspectRatio: '210/297' }}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title || 'จดหมายข่าว'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center gap-3">
                      <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs text-slate-400">ไม่มีภาพ</span>
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2">
                      <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>

                  {/* Latest badge on first item */}
                  {idx === 0 && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-primary-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">ล่าสุด</span>
                    </div>
                  )}
                </div>

                {/* Caption */}
                <div className="mt-2 px-0.5">
                  {item.title && (
                    <p className="text-xs font-semibold text-slate-700 line-clamp-2 leading-snug">{item.title}</p>
                  )}
                  {item.publishedAt && (
                    <p className="text-xs text-slate-400 mt-0.5">{formatDate(item.publishedAt)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Right arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 sm:translate-x-4 z-10 w-9 h-9 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
              aria-label="เลื่อนขวา"
            >
              <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIdx != null && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
            onClick={closeLightbox}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {lightboxIdx + 1} / {sorted.length}
          </div>

          {/* Prev */}
          {lightboxIdx > 0 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); prevLightbox() }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Image */}
          <div className="max-h-[90vh] max-w-[90vw] flex items-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={sorted[lightboxIdx].image}
              alt={sorted[lightboxIdx].title || 'จดหมายข่าว'}
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Caption in lightbox */}
          {(sorted[lightboxIdx].title || sorted[lightboxIdx].publishedAt) && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
              {sorted[lightboxIdx].title && (
                <p className="text-white font-semibold text-sm">{sorted[lightboxIdx].title}</p>
              )}
              {sorted[lightboxIdx].publishedAt && (
                <p className="text-white/50 text-xs mt-0.5">{formatDate(sorted[lightboxIdx].publishedAt)}</p>
              )}
            </div>
          )}

          {/* Next */}
          {lightboxIdx < sorted.length - 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); nextLightbox() }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      )}
    </section>
  )
}
