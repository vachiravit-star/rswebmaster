import type { GetStaticProps } from 'next'
import Link from 'next/link'
import Layout from '../components/Layout'
import HeroSlider, { type Slide } from '../components/HeroSlider'
import DriveGallery, { type GalleryFolder } from '../components/DriveGallery'
import { readData } from '../lib/data'

interface GalleryConfig {
  enabled: boolean
  title: string
  folders: GalleryFolder[]
}

interface Props {
  gallery: GalleryConfig
  heroSlides: Slide[]
}

export default function GalleryPage({ gallery, heroSlides }: Props) {
  return (
    <Layout title="คลังภาพกิจกรรม">
      {/* Hero */}
      <HeroSlider slides={heroSlides} />

      {/* Page header */}
      <div className="gradient-page-header on-gradient py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 on-gradient-link text-sm mb-2">
            <Link href="/" className="hover:text-[var(--on-gradient-text)] transition-colors">หน้าแรก</Link>
            <span>›</span>
            <span>คลังภาพ</span>
          </div>
          <h1 className="text-3xl font-bold">{gallery.title || 'คลังภาพกิจกรรม'}</h1>
          <p className="on-gradient-muted text-sm mt-1">{gallery.folders.length} อัลบั้มทั้งหมด</p>
        </div>
      </div>

      {gallery.folders.length > 0 ? (
        <DriveGallery
          folders={gallery.folders}
          title={gallery.title}
          showAll
        />
      ) : (
        <div className="bg-slate-900 min-h-60 flex items-center justify-center">
          <div className="text-center text-slate-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>ยังไม่มีอัลบั้มภาพ</p>
          </div>
        </div>
      )}
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const gallery = await readData<GalleryConfig>('gallery.json', {
    enabled: true,
    title: 'ภาพกิจกรรม',
    folders: [],
  })
  const settings = await readData<{ heroSlides: Slide[] }>('settings.json', { heroSlides: [] })
  return {
    props: { gallery, heroSlides: settings.heroSlides },
    revalidate: 60,
  }
}
