import type { GetStaticProps } from 'next'
import Link from 'next/link'
import Layout from '../components/Layout'
import CalendarWidget, { type CalEvent } from '../components/CalendarWidget'
import { readData } from '../lib/data'

interface CalendarPageProps {
  events: CalEvent[]
}

const categoryConfig: Record<string, { label: string; color: string }> = {
  academic: { label: 'วิชาการ', color: '#943400' },
  activity: { label: 'กิจกรรม', color: '#059669' },
  exam: { label: 'สอบ', color: '#DC2626' },
}

function formatDateTH(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function CalendarPage({ events }: CalendarPageProps) {
  const upcoming = events
    .filter((e) => new Date(e.endDate) >= new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

  return (
    <Layout title="ปฏิทินกิจกรรม">
      <div className="gradient-page-header on-gradient py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 on-gradient-link text-sm mb-2">
            <Link href="/" className="hover:text-[var(--on-gradient-text)] transition-colors">หน้าแรก</Link>
            <span>›</span>
            <span>ปฏิทินกิจกรรม</span>
          </div>
          <h1 className="text-3xl font-bold">ปฏิทินกิจกรรม</h1>
          <p className="on-gradient-muted mt-1">ตารางกิจกรรมและกำหนดการสำคัญของโรงเรียน</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-8">
          {Object.entries(categoryConfig).map(([key, val]) => (
            <div key={key} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm border border-slate-100">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: val.color }} />
              <span className="text-sm text-slate-600 font-medium">{val.label}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <CalendarWidget events={events} />
          </div>

          {/* Upcoming events list */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4">กิจกรรมที่กำลังจะมาถึง</h2>
            <div className="space-y-3">
              {upcoming.length > 0 ? (
                upcoming.map((event) => {
                  const cat = categoryConfig[event.category] || { label: event.category, color: '#64748B' }
                  return (
                    <div key={event.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-3 h-3 rounded-full mt-1.5 shrink-0"
                          style={{ backgroundColor: event.color }}
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-slate-800 text-sm leading-snug mb-0.5">
                            {event.title}
                          </div>
                          <div className="text-xs text-slate-500 mb-1">
                            {formatDateTH(event.startDate)}
                            {event.startDate !== event.endDate
                              ? ` – ${formatDateTH(event.endDate)}`
                              : ''}
                          </div>
                          {event.description && (
                            <p className="text-xs text-slate-400 leading-relaxed">{event.description}</p>
                          )}
                        </div>
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
                          style={{ backgroundColor: `${event.color}18`, color: event.color }}
                        >
                          {cat.label}
                        </span>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-10 text-slate-400 text-sm">
                  ไม่มีกิจกรรมในช่วงนี้
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const events = await readData<CalEvent[]>('events.json', [])
  return { props: { events }, revalidate: 60 }
}
