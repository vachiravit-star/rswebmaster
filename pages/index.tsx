import type { GetStaticProps } from 'next'
import Link from 'next/link'
import Layout from '../components/Layout'
import HeroSlider from '../components/HeroSlider'
import NewsCard, { type NewsItem } from '../components/NewsCard'
import CalendarWidget, { type CalEvent } from '../components/CalendarWidget'
import DriveGallery, { type GalleryFolder } from '../components/DriveGallery'
import WelcomePopup, { type PopupData } from '../components/WelcomePopup'
import NewsletterSlider from '../components/NewsletterSlider'
import type { NewsletterItem } from '../components/NewsletterSlider'
import { readData } from '../lib/data'

interface Settings {
  heroSlides: {
    id: string
    title: string
    subtitle: string
    bgFrom: string
    bgTo: string
    link: string
  }[]
  schoolInfo: {
    nameTh: string
    vision: string
    mission: string
  }
}

interface ManagementMember {
  id: string
  title: string
  name: string
  dept: string
  order: number
  photo: string
}

interface GalleryConfig {
  enabled: boolean
  title: string
  folders: GalleryFolder[]
}

interface BannerData {
  enabled: boolean
  image: string
  title: string
  subtitle: string
  description: string
  buttonText: string
  buttonLink: string
}

interface QuickLink {
  id: string
  label: string
  href: string
  icon: string
  color: string
  order: number
}

interface Stat {
  id: string
  value: string
  label: string
  order: number
}

interface NewsletterConfig {
  enabled: boolean
  title: string
  driveFolderId: string
  items: NewsletterItem[]
}

const COLOR_MAP: Record<string, string> = {
  blue:    'bg-blue-50 text-blue-700 border-blue-100',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  purple:  'bg-purple-50 text-purple-700 border-purple-100',
  amber:   'bg-amber-50 text-amber-700 border-amber-100',
  rose:    'bg-rose-50 text-rose-700 border-rose-100',
  slate:   'bg-slate-50 text-slate-700 border-slate-100',
  indigo:  'bg-indigo-50 text-indigo-700 border-indigo-100',
  teal:    'bg-teal-50 text-teal-700 border-teal-100',
}

interface HomeProps {
  settings: Settings
  latestNews: NewsItem[]
  events: CalEvent[]
  banner: BannerData
  popup: PopupData
  management: ManagementMember[]
  gallery: GalleryConfig
  quickLinks: QuickLink[]
  stats: Stat[]
  newsletter: NewsletterConfig
}

export default function Home({ settings, latestNews, events, banner, popup, management, gallery, quickLinks, stats, newsletter }: HomeProps) {
  const featured = latestNews.slice(0, 3)
  const rest = latestNews.slice(3, 6)

  return (
    <Layout>
      <WelcomePopup popup={popup} />
      {/* Hero */}
      <HeroSlider slides={settings.heroSlides} />

      {/* Welcome Banner */}
      {banner.enabled && (
        <section
          className="relative flex items-center min-h-40 overflow-hidden"
          style={{
            background: banner.image
              ? `url(${banner.image}) center/cover`
              : 'linear-gradient(135deg, #471900, #BD4200)',
          }}
        >
          <div className="absolute inset-0 bg-black/45" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6 w-full">
            <div className="text-white">
              {banner.subtitle && (
                <div className="text-xs font-semibold tracking-wider text-yellow-300 uppercase mb-1">{banner.subtitle}</div>
              )}
              <h2 className="text-xl sm:text-2xl font-bold leading-snug">{banner.title}</h2>
              {banner.description && (
                <p className="text-white/75 text-sm mt-1.5 max-w-xl leading-relaxed">{banner.description}</p>
              )}
            </div>
            {banner.buttonText && banner.buttonLink && (
              <Link
                href={banner.buttonLink}
                className="shrink-0 bg-gold-500 hover:bg-gold-600 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
              >
                {banner.buttonText}
              </Link>
            )}
          </div>
        </section>
      )}

      {/* Quick Links */}
      {quickLinks.length > 0 && (
        <section className="bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[...quickLinks].sort((a, b) => a.order - b.order).map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 ${COLOR_MAP[link.color] ?? COLOR_MAP.slate}`}
                >
                  <span className="text-2xl">{link.icon}</span>
                  <span className="text-xs font-medium text-center leading-tight">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* News + Calendar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* News section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">ข่าวสารและประกาศ</h2>
                <p className="text-slate-500 text-sm mt-0.5">อัปเดตข่าวล่าสุดจากโรงเรียน</p>
              </div>
              <Link
                href="/news"
                className="text-sm font-medium text-primary-700 hover:text-primary-800 flex items-center gap-1 shrink-0"
              >
                ดูทั้งหมด
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
              {[
                { label: 'ทั้งหมด', href: '/news' },
                { label: 'ประชาสัมพันธ์', href: '/news?category=pr' },
                { label: 'จัดซื้อจัดจ้าง', href: '/news?category=procurement' },
                { label: 'กิจกรรม', href: '/news?category=activity' },
              ].map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border border-slate-200 text-slate-600 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50 transition-colors"
                >
                  {tab.label}
                </Link>
              ))}
            </div>

            {featured.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {featured.map((news) => (
                  <NewsCard key={news.id} news={news} featured />
                ))}
              </div>
            )}

            {rest.length > 0 && (
              <div className="space-y-3">
                {rest.map((news) => (
                  <NewsCard key={news.id} news={news} />
                ))}
              </div>
            )}

            {latestNews.length === 0 && (
              <div className="text-center py-12 text-slate-400">ยังไม่มีข่าวสาร</div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-4">ปฏิทินกิจกรรม</h2>
              <CalendarWidget events={events} />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      {newsletter.enabled && newsletter.items.length > 0 && (
        <NewsletterSlider items={newsletter.items} title={newsletter.title} />
      )}

      {/* Stats */}
      {stats.length > 0 && (
        <section className="gradient-stats">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[...stats].sort((a, b) => a.order - b.order).map((stat) => (
                <div key={stat.id} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold stats-value mb-1 drop-shadow">{stat.value}</div>
                  <div className="stats-label text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Management */}
      {management.length > 0 && (
        <section className="bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 text-gold-600 text-sm font-medium mb-2">
                <div className="h-px w-8 bg-gold-400" />
                โรงเรียนราชสีมาวิทยาลัย
                <div className="h-px w-8 bg-gold-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">ทำเนียบผู้บริหาร</h2>
            </div>

            {/* Director — portrait card, prominent centered */}
            <div className="flex justify-center mb-6">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 w-48 sm:w-56">
                <div className="w-full aspect-[3/4] bg-gradient-to-br from-primary-700 to-primary-900 overflow-hidden">
                  {management[0].photo ? (
                    <img src={management[0].photo} alt={management[0].name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-14 h-14 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-3 sm:p-4 text-center">
                  <div className="text-xs font-semibold text-gold-600 mb-1">{management[0].title}</div>
                  <div className="font-bold text-slate-800 text-sm sm:text-base leading-snug">{management[0].name}</div>
                  {management[0].dept && <div className="text-xs text-slate-400 mt-0.5">{management[0].dept}</div>}
                </div>
              </div>
            </div>

            {/* Deputies — horizontal cards, 2 cols on mobile → 4 on desktop */}
            {management.length > 1 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {management.slice(1).map((person) => (
                  <div key={person.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex">
                    <div className="w-16 sm:w-20 shrink-0 bg-gradient-to-br from-primary-700 to-primary-900 overflow-hidden self-stretch">
                      {person.photo ? (
                        <img src={person.photo} alt={person.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full min-h-20 flex items-center justify-center">
                          <svg className="w-7 h-7 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-2 sm:p-3 flex flex-col justify-center min-w-0">
                      <div className="text-xs font-medium text-gold-600 leading-tight mb-0.5 line-clamp-2">{person.title}</div>
                      <div className="font-semibold text-slate-800 text-xs sm:text-sm leading-snug">{person.name}</div>
                      {person.dept && <div className="text-xs text-slate-400 mt-0.5 truncate">{person.dept}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Vision & Mission */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 text-gold-600 text-sm font-medium mb-3">
              <div className="h-px w-8 bg-gold-400" />
              โรงเรียนราชสีมาวิทยาลัย
              <div className="h-px w-8 bg-gold-400" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800">วิสัยทัศน์และพันธกิจ</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-slate-50 rounded-2xl p-7 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-primary-700 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">วิสัยทัศน์</h3>
              <p className="text-slate-600 leading-relaxed text-sm">{settings.schoolInfo.vision}</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-7 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-gold-500 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">พันธกิจ</h3>
              <p className="text-slate-600 leading-relaxed text-sm">{settings.schoolInfo.mission}</p>
            </div>
          </div>
        </div>
      </section>
      {/* Drive Gallery — before footer */}
      {gallery.enabled && gallery.folders.length > 0 && (
        <DriveGallery folders={gallery.folders} title={gallery.title} />
      )}
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const settings = readData<Settings>('settings.json', {
    heroSlides: [],
    schoolInfo: { nameTh: '', vision: '', mission: '' },
  })
  const allNews = readData<NewsItem[]>('news.json', [])
  const events = readData<CalEvent[]>('events.json', [])
  const homepageData = readData<{ banner: BannerData }>('homepage.json', {
    banner: { enabled: false, image: '', title: '', subtitle: '', description: '', buttonText: '', buttonLink: '' },
  })
  const popup = readData<PopupData>('popup.json', {
    enabled: false, title: '', content: '', image: '', buttonText: '', buttonLink: '', showOnce: true,
  })
  const management = readData<ManagementMember[]>('management.json', [])
    .sort((a, b) => a.order - b.order)
  const gallery = readData<GalleryConfig>('gallery.json', {
    enabled: false,
    title: 'ภาพกิจกรรม',
    folders: [],
  })
  const quickLinks = readData<QuickLink[]>('quicklinks.json', [])
  const stats = readData<Stat[]>('stats.json', [])
  const newsletter = readData<NewsletterConfig>('newsletter.json', {
    enabled: true, title: 'จดหมายข่าว', driveFolderId: '', items: [],
  })

  const latestNews = allNews
    .filter((n) => n.published)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 6)

  return {
    props: { settings, latestNews, events, banner: homepageData.banner, popup, management, gallery, quickLinks, stats, newsletter },
    revalidate: 60,
  }
}
