import Link from 'next/link'

export interface NewsItem {
  id: string
  title: string
  slug: string
  category: string
  excerpt: string
  content: string
  image: string
  publishedAt: string
  createdAt: string
  published: boolean
}

const categoryConfig: Record<string, { label: string; color: string; bg: string }> = {
  pr: { label: 'ประชาสัมพันธ์', color: 'text-primary-700', bg: 'bg-primary-50' },
  procurement: { label: 'จัดซื้อจัดจ้าง', color: 'text-amber-700', bg: 'bg-amber-50' },
  activity: { label: 'กิจกรรม', color: 'text-emerald-700', bg: 'bg-emerald-50' },
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

interface NewsCardProps {
  news: NewsItem
  featured?: boolean
}

export default function NewsCard({ news, featured = false }: NewsCardProps) {
  const cat = categoryConfig[news.category] || { label: news.category, color: 'text-slate-700', bg: 'bg-slate-100' }

  if (featured) {
    return (
      <Link href={`/news/${news.slug}`} className="group block">
        <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-slate-100 transition-all duration-200 h-full flex flex-col">
          {/* Image */}
          <div className="h-52 bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center relative overflow-hidden">
            {news.image ? (
              <img src={news.image} alt={news.title} className="w-full h-full object-cover" />
            ) : (
              <>
                <div
                  className="absolute inset-0 opacity-5"
                  style={{
                    backgroundImage: `radial-gradient(circle at 30% 30%, white 1px, transparent 0)`,
                    backgroundSize: '32px 32px',
                  }}
                />
                <div className="relative text-white/30 text-6xl font-bold">ร</div>
              </>
            )}
          </div>

          <div className="p-5 flex flex-col flex-1">
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cat.bg} ${cat.color}`}>
                {cat.label}
              </span>
              <time className="text-xs text-slate-400">{formatDate(news.publishedAt)}</time>
            </div>
            <h3 className="font-bold text-slate-800 text-base leading-snug mb-2 group-hover:text-primary-700 transition-colors line-clamp-2 flex-1">
              {news.title}
            </h3>
            <p className="text-slate-500 text-sm line-clamp-2">{news.excerpt}</p>
            <div className="mt-4 flex items-center gap-1 text-primary-600 text-sm font-medium">
              อ่านต่อ
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </article>
      </Link>
    )
  }

  return (
    <Link href={`/news/${news.slug}`} className="group block">
      <article className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md border border-slate-100 transition-all duration-200 flex gap-4">
        {/* Tiny image */}
        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center shrink-0 overflow-hidden">
          {news.image ? (
            <img src={news.image} alt={news.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white/30 text-xl font-bold">ร</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cat.bg} ${cat.color}`}>
              {cat.label}
            </span>
            <time className="text-xs text-slate-400">{formatDate(news.publishedAt)}</time>
          </div>
          <h3 className="font-semibold text-slate-800 text-sm leading-snug group-hover:text-primary-700 transition-colors line-clamp-2">
            {news.title}
          </h3>
        </div>
      </article>
    </Link>
  )
}

export { categoryConfig, formatDate }
