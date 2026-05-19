import type { GetServerSideProps } from 'next'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { type NewsItem, categoryConfig, formatDate } from '../../components/NewsCard'
import { readData } from '../../lib/data'

interface NewsDetailProps {
  news: NewsItem
  related: NewsItem[]
}

export default function NewsDetail({ news, related }: NewsDetailProps) {
  const cat = categoryConfig[news.category] || { label: news.category, color: 'text-slate-700', bg: 'bg-slate-100' }

  return (
    <Layout title={news.title} description={news.excerpt}>
      <div className="gradient-page-header on-gradient py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 on-gradient-link text-sm mb-4">
            <Link href="/" className="hover:text-[var(--on-gradient-text)] transition-colors">หน้าแรก</Link>
            <span>›</span>
            <Link href="/news" className="hover:text-[var(--on-gradient-text)] transition-colors">ข่าวสาร</Link>
            <span>›</span>
            <span className="on-gradient truncate">{news.title}</span>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cat.bg} ${cat.color}`}>
              {cat.label}
            </span>
            <time className="on-gradient-muted text-sm">{formatDate(news.publishedAt)}</time>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold leading-snug">{news.title}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Content */}
          <article className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
              <p className="text-slate-600 text-base leading-relaxed mb-6 font-medium border-l-4 border-gold-400 pl-4">
                {news.excerpt}
              </p>
              <div className="prose-school text-slate-700 text-base">
                {news.content.split('\n').map((para, i) =>
                  para.trim() ? (
                    <p key={i} className="mb-4 leading-relaxed">
                      {para}
                    </p>
                  ) : null
                )}
              </div>
            </div>

            {/* Share */}
            <div className="mt-5 flex items-center gap-3">
              <span className="text-sm text-slate-500">แชร์:</span>
              <button
                onClick={() => navigator.share?.({ title: news.title, url: window.location.href })}
                className="flex items-center gap-1.5 text-sm text-primary-700 hover:text-primary-800 font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                แชร์
              </button>
            </div>
          </article>

          {/* Sidebar: related */}
          <aside>
            <h3 className="font-bold text-slate-800 mb-4">ข่าวที่เกี่ยวข้อง</h3>
            <div className="space-y-3">
              {related.map((item) => (
                <Link key={item.id} href={`/news/${item.slug}`} className="group block bg-white rounded-xl p-3.5 shadow-sm border border-slate-100 hover:border-primary-200 transition-colors">
                  <div className="text-xs text-slate-400 mb-1">{formatDate(item.publishedAt)}</div>
                  <div className="text-sm font-medium text-slate-700 group-hover:text-primary-700 transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </div>
                </Link>
              ))}
              {related.length === 0 && (
                <p className="text-sm text-slate-400">ไม่มีข่าวที่เกี่ยวข้อง</p>
              )}
            </div>

            <div className="mt-5">
              <Link
                href="/news"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-primary-50 text-primary-700 text-sm font-medium hover:bg-primary-100 transition-colors"
              >
                ดูข่าวทั้งหมด
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug as string
  const allNews = readData<NewsItem[]>('news.json', [])
  const news = allNews.find((n) => n.slug === slug && n.published)

  if (!news) return { notFound: true }

  const related = allNews
    .filter((n) => n.id !== news.id && n.published && n.category === news.category)
    .slice(0, 4)

  return { props: { news, related } }
}
