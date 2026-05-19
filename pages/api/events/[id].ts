import type { NextApiRequest, NextApiResponse } from 'next'
import { readData, writeData } from '../../../lib/data'
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

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string }
  const events = readData<CalEvent[]>('events.json', [])
  const idx = events.findIndex((e) => e.id === id)

  if (req.method === 'GET') {
    if (idx === -1) return res.status(404).json({ error: 'ไม่พบข้อมูล' })
    return res.status(200).json(events[idx])
  }

  if (!isAuthenticated(req)) return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'PUT') {
    if (idx === -1) return res.status(404).json({ error: 'ไม่พบข้อมูล' })
    events[idx] = { ...events[idx], ...req.body, id }
    writeData('events.json', events)
    return res.status(200).json(events[idx])
  }

  if (req.method === 'DELETE') {
    if (idx === -1) return res.status(404).json({ error: 'ไม่พบข้อมูล' })
    const deleted = events.splice(idx, 1)[0]
    writeData('events.json', events)
    return res.status(200).json(deleted)
  }

  res.status(405).end()
}
