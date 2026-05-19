import { useState, useEffect } from 'react'
import Link from 'next/link'

export interface GalleryFolder {
  id: string
  name: string
  link: string
  image: string
  order: number
}

interface Props {
  folders: GalleryFolder[]
  title?: string
  showAll?: boolean
}

const HOMEPAGE_LIMIT = 12

function DriveIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0a15.92 15.92 0 000 3.3z" fill="#0066da"/>
      <path d="M43.65 25L29.9 1.2C28.55 2 27.4 3.1 26.6 4.5L1.7 49.5a15.92 15.92 0 00-1.7 7h27.5z" fill="#00ac47"/>
      <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75L87.3 56a15.92 15.92 0 000-13H59.8l5.85 11.5z" fill="#ea4335"/>
      <path d="M43.65 25L57.4 1.2C56.05.45 54.5 0 52.85 0H34.45a16.2 16.2 0 00-4.55 1.2z" fill="#00832d"/>
      <path d="M59.8 43H27.5L13.75 66.8c1.35.75 2.9 1.2 4.55 1.2h50.7c1.65 0 3.2-.45 4.55-1.2z" fill="#2684fc"/>
      <path d="M73.4 26.5l-12.45-21.6C60.15 3.3 59 2.2 57.65 1.45l-14 24.8 16.15 27.7H87.3a16.65 16.65 0 000-6.8z" fill="#ffba00"/>
    </svg>
  )
}

function FeaturedFolderCard({ folder, thumb }: { folder: GalleryFolder; thumb?: string }) {
  const coverImage = folder.image || thumb
  const href = folder.link || '#'
  const isExternal = href.startsWith('http')

  const inner = (
    <div className="relative rounded-2xl overflow-hidden aspect-[16/7] min-h-44 group cursor-pointer" style={{ background: 'var(--gallery-placeholder-bg)' }}>
      {coverImage ? (
        <img
          src={coverImage}
          alt={folder.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center gradient-card-placeholder">
          <svg className="w-20 h-20 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

      <div className="absolute top-4 left-4 flex items-center gap-2">
        <span className="bg-primary-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">ล่าสุด</span>
      </div>
      <div className="absolute top-4 right-4 opacity-80 group-hover:opacity-100 transition-opacity">
        <DriveIcon className="w-5 h-5" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
        <p className="text-white text-xl sm:text-2xl md:text-3xl font-bold leading-tight group-hover:text-gold-300 transition-colors drop-shadow mb-2">
          {folder.name || 'ไม่ระบุชื่อ'}
        </p>
        {folder.link && (
          <div className="flex items-center gap-2 text-white/75 text-sm font-medium group-hover:text-white/95 transition-colors">
            <span>ดูรูปภาพทั้งหมด</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
        )}
      </div>
    </div>
  )

  if (isExternal) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className="block">{inner}</a>
  }
  return <div>{inner}</div>
}

function FolderCard({
  folder,
  thumb,
  isNew,
}: {
  folder: GalleryFolder
  thumb?: string
  isNew?: boolean
}) {
  const coverImage = folder.image || thumb
  const href = folder.link || '#'
  const isExternal = href.startsWith('http')

  const inner = (
    <div className="relative rounded-xl overflow-hidden aspect-video group cursor-pointer" style={{ background: 'var(--gallery-placeholder-bg)' }}>
      {/* Image */}
      {coverImage ? (
        <img
          src={coverImage}
          alt={folder.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center gradient-card-placeholder">
          <svg className="w-10 h-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* "ใหม่" badge */}
      {isNew && (
        <div className="absolute top-2 left-2 bg-primary-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          ใหม่
        </div>
      )}

      {/* Drive icon */}
      <div className="absolute top-2 right-2 opacity-70 group-hover:opacity-100 transition-opacity">
        <DriveIcon className="w-4 h-4" />
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-white text-sm font-semibold leading-tight line-clamp-2 group-hover:text-gold-300 transition-colors">
          {folder.name || 'ไม่ระบุชื่อ'}
        </p>
        {folder.link && (
          <div className="flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white/70 text-xs">ดูรูปภาพ</span>
            <svg className="w-3 h-3 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
        )}
      </div>
    </div>
  )

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        {inner}
      </a>
    )
  }
  return <div>{inner}</div>
}

export default function DriveGallery({ folders, title = 'ภาพกิจกรรม', showAll = false }: Props) {
  const sorted = [...folders].sort((a, b) => b.order - a.order)
  const featuredItem = sorted.length > 0 ? sorted[0] : null
  const regularItems = showAll ? sorted.slice(1) : sorted.slice(1, HOMEPAGE_LIMIT + 1)
  const hasMore = !showAll && sorted.length > HOMEPAGE_LIMIT + 1

  const allDisplayed = featuredItem ? [featuredItem, ...regularItems] : regularItems

  const [autoThumbs, setAutoThumbs] = useState<Record<string, string>>({})

  useEffect(() => {
    const toFetch = allDisplayed.filter((f) => !f.image && f.link)
    if (toFetch.length === 0) return
    toFetch.forEach(async (f) => {
      try {
        const res = await fetch(`/api/drive/folder-thumb?link=${encodeURIComponent(f.link)}`)
        if (res.ok) {
          const data = await res.json()
          setAutoThumbs((prev) => ({ ...prev, [f.id]: data.thumbnailUrl }))
        }
      } catch { /* silently fall back to placeholder */ }
    })
  }, [allDisplayed.length])

  if (!featuredItem && regularItems.length === 0) return null

  return (
    <section style={{ background: 'var(--gallery-bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <DriveIcon />
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--gallery-text-muted)' }}>Google Drive</span>
            </div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--gallery-text)' }}>{title}</h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--gallery-text-muted)' }}>{sorted.length} อัลบั้ม</p>
          </div>
          {hasMore && (
            <Link
              href="/gallery"
              className="flex items-center gap-1.5 text-sm font-medium text-gold-500 hover:text-gold-400 transition-colors"
            >
              ดูคลังภาพทั้งหมด
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>

        {/* Featured first card */}
        {featuredItem && (
          <div className="mb-3 sm:mb-4">
            <FeaturedFolderCard folder={featuredItem} thumb={autoThumbs[featuredItem.id]} />
          </div>
        )}

        {/* Card grid - remaining items */}
        {regularItems.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {regularItems.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                thumb={autoThumbs[folder.id]}
              />
            ))}
          </div>
        )}

        {/* "ดูทั้งหมด" button at bottom (when has more) */}
        {hasMore && (
          <div className="mt-6 text-center">
            <Link
              href="/gallery"
              className="gallery-btn inline-flex items-center gap-2 font-medium text-sm px-6 py-2.5 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              ดูคลังภาพทั้งหมด ({sorted.length} อัลบั้ม)
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
