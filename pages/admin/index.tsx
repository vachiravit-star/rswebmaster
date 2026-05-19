import type { GetServerSideProps } from 'next'
import Link from 'next/link'
import AdminLayout from '../../components/admin/AdminLayout'
import { readData } from '../../lib/data'
import { isAuthenticated } from '../../lib/auth'
import { type NewsItem } from '../../components/NewsCard'
import { type CalEvent } from '../../components/CalendarWidget'

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

interface DashboardProps {
  newsCount: number
  publishedCount: number
  eventsCount: number
  downloadsCount: number
  recentNews: NewsItem[]
  upcomingEvents: CalEvent[]
}

export default function AdminDashboard({
  newsCount, publishedCount, eventsCount, downloadsCount, recentNews, upcomingEvents,
}: DashboardProps) {
  const stats = [
    { label: 'ข่าวทั้งหมด', value: newsCount, sub: `เผยแพร่ ${publishedCount} รายการ`, href: '/admin/news', color: 'bg-primary-50 text-primary-700 border-primary-100' },
    { label: 'กิจกรรม', value: eventsCount, sub: 'ในปฏิทิน', href: '/admin/events', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    { label: 'เอกสาร', value: downloadsCount, sub: 'ไฟล์ดาวน์โหลด', href: '/admin/downloads', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  ]

  return (
    <AdminLayout title="แดชบอร์ด">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">แดชบอร์ด</h1>
        <p className="text-slate-500 text-sm mt-0.5">ระบบจัดการเนื้อหาเว็บไซต์โรงเรียนราชสีมาวิทยาลัย</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`rounded-2xl p-5 border transition-all hover:shadow-md ${stat.color}`}
          >
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="font-semibold text-sm">{stat.label}</div>
            <div className="text-xs opacity-70 mt-0.5">{stat.sub}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6">
        <h2 className="font-bold text-slate-800 text-sm mb-4">การดำเนินการด่วน</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/news/create"
            className="flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            เพิ่มข่าวใหม่
          </Link>
          <Link
            href="/admin/events/create"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            เพิ่มกิจกรรม
          </Link>
          <Link
            href="/admin/downloads"
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            เพิ่มเอกสาร
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent news */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800">ข่าวล่าสุด</h2>
            <Link href="/admin/news" className="text-xs text-primary-600 font-medium hover:underline">
              ดูทั้งหมด
            </Link>
          </div>
          <div className="space-y-3">
            {recentNews.map((news) => (
              <div key={news.id} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${news.published ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-700 truncate">{news.title}</div>
                  <div className="text-xs text-slate-400">{news.publishedAt}</div>
                </div>
                <Link
                  href={`/admin/news/${news.id}`}
                  className="text-xs text-primary-600 hover:underline shrink-0"
                >
                  แก้ไข
                </Link>
              </div>
            ))}
            {recentNews.length === 0 && (
              <p className="text-sm text-slate-400">ยังไม่มีข่าว</p>
            )}
          </div>
        </div>

        {/* Upcoming events */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800">กิจกรรมที่กำลังจะมาถึง</h2>
            <Link href="/admin/events" className="text-xs text-primary-600 font-medium hover:underline">
              ดูทั้งหมด
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingEvents.map((ev) => (
              <div key={ev.id} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: ev.color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-700 truncate">{ev.title}</div>
                  <div className="text-xs text-slate-400">{ev.startDate}</div>
                </div>
              </div>
            ))}
            {upcomingEvents.length === 0 && (
              <p className="text-sm text-slate-400">ไม่มีกิจกรรม</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  if (!isAuthenticated(req as never)) {
    return { redirect: { destination: '/admin/login', permanent: false } }
  }
  const allNews = await readData<NewsItem[]>('news.json', [])
  const events = await readData<CalEvent[]>('events.json', [])
  const downloads = await readData<Download[]>('downloads.json', [])

  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const recentNews = [...allNews]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const upcomingEvents = events
    .filter((e) => new Date(e.endDate) >= now)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5)

  return {
    props: {
      newsCount: allNews.length,
      publishedCount: allNews.filter((n) => n.published).length,
      eventsCount: events.length,
      downloadsCount: downloads.length,
      recentNews,
      upcomingEvents,
    },
  }
}
