import type { NextApiRequest, NextApiResponse } from 'next'
import { readData, writeData, generateId } from '../../../lib/data'
import { isAuthenticated } from '../../../lib/auth'

interface CalEvent {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  category: string
  color: string
  createdAt: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const events = await readData<CalEvent[]>('events.json', [])

  if (req.method === 'GET') {
    events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    return res.status(200).json(events)
  }

  if (req.method === 'POST') {
    if (!isAuthenticated(req)) return res.status(401).json({ error: 'Unauthorized' })
    const { title, description, startDate, endDate, category, color } = req.body
    if (!title || !startDate) return res.status(400).json({ error: 'ข้อมูลไม่ครบ' })

    const categoryColors: Record<string, string> = {
      academic: '#A83700',
      activity: '#059669',
      exam: '#DC2626',
    }
    const item: CalEvent = {
      id: generateId(),
      title,
      description: description || '',
      startDate,
      endDate: endDate || startDate,
      category: category || 'activity',
      color: color || categoryColors[category] || '#A83700',
      createdAt: new Date().toISOString(),
    }
    await writeData('events.json', [...events, item])
    return res.status(201).json(item)
  }

  res.status(405).end()
}
