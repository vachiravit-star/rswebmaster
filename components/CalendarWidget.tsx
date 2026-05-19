import { useState, useMemo } from 'react'

export interface CalEvent {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  category: string
  color: string
}

interface CalendarWidgetProps {
  events: CalEvent[]
  initialYear?: number
  initialMonth?: number
}

const DAYS_TH = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
const MONTHS_TH = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
  'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
  'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
]

function formatDateTH(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function inRange(date: Date, start: Date, end: Date) {
  return date >= start && date <= end
}

export default function CalendarWidget({ events, initialYear, initialMonth }: CalendarWidgetProps) {
  const today = new Date()
  const [year, setYear] = useState(initialYear ?? today.getFullYear())
  const [month, setMonth] = useState(initialMonth ?? today.getMonth())
  const [selected, setSelected] = useState<Date | null>(null)

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDow = firstDay.getDay()
  const totalCells = Math.ceil((startDow + lastDay.getDate()) / 7) * 7

  const cells: (Date | null)[] = Array.from({ length: totalCells }, (_, i) => {
    const d = i - startDow + 1
    if (d < 1 || d > lastDay.getDate()) return null
    return new Date(year, month, d)
  })

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
    setSelected(null)
  }

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
    setSelected(null)
  }

  const getEventsForDate = (date: Date) =>
    events.filter((e) => {
      const s = new Date(e.startDate)
      const en = new Date(e.endDate)
      s.setHours(0, 0, 0, 0)
      en.setHours(23, 59, 59, 999)
      return inRange(date, s, en)
    })

  const selectedEvents = useMemo(() =>
    selected ? getEventsForDate(selected) : [],
    [selected, events]
  )

  const upcomingEvents = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return events
      .filter((e) => new Date(e.endDate) >= now)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 5)
  }, [events])

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-primary-700">
        <button
          onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-white font-semibold text-sm">
          {MONTHS_TH[month]} {year + 543}
        </div>
        <button
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-100">
        {DAYS_TH.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-slate-400 py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {cells.map((date, i) => {
          if (!date) return <div key={i} className="h-10 bg-slate-50/50" />
          const dayEvents = getEventsForDate(date)
          const isToday = isSameDay(date, today)
          const isSelected = selected ? isSameDay(date, selected) : false
          return (
            <button
              key={i}
              onClick={() => setSelected(isSelected ? null : date)}
              className={`relative h-10 flex flex-col items-center justify-start pt-1.5 text-sm transition-colors ${
                isSelected
                  ? 'bg-primary-50 text-primary-700 font-bold'
                  : isToday
                  ? 'text-primary-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span
                className={`w-7 h-7 flex items-center justify-center rounded-full text-sm leading-none ${
                  isSelected ? 'bg-primary-700 text-white font-bold' :
                  isToday ? 'bg-primary-100 text-primary-700 font-bold' : ''
                }`}
              >
                {date.getDate()}
              </span>
              {dayEvents.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayEvents.slice(0, 3).map((e, j) => (
                    <div
                      key={j}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: e.color }}
                    />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected day events */}
      {selected && (
        <div className="border-t border-slate-100 px-4 py-3">
          <div className="text-xs font-semibold text-slate-500 mb-2">
            {formatDateTH(selected.toISOString())}
          </div>
          {selectedEvents.length === 0 ? (
            <p className="text-xs text-slate-400">ไม่มีกิจกรรม</p>
          ) : (
            <div className="space-y-1.5">
              {selectedEvents.map((e) => (
                <div key={e.id} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ backgroundColor: e.color }} />
                  <div>
                    <div className="text-xs font-medium text-slate-700">{e.title}</div>
                    {e.description && (
                      <div className="text-xs text-slate-400 leading-snug">{e.description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upcoming */}
      {!selected && upcomingEvents.length > 0 && (
        <div className="border-t border-slate-100 px-4 py-3">
          <div className="text-xs font-semibold text-slate-500 mb-2">กิจกรรมที่กำลังจะมาถึง</div>
          <div className="space-y-1.5">
            {upcomingEvents.map((e) => (
              <div key={e.id} className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ backgroundColor: e.color }} />
                <div>
                  <div className="text-xs font-medium text-slate-700">{e.title}</div>
                  <div className="text-xs text-slate-400">
                    {formatDateTH(e.startDate)}
                    {e.startDate !== e.endDate ? ` – ${formatDateTH(e.endDate)}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
