import type { NextApiRequest, NextApiResponse } from 'next'
import { readData, writeData } from '../../lib/data'
import { isAuthenticated } from '../../lib/auth'

interface Settings { heroSlides: unknown[]; schoolInfo: unknown }

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const s = readData<Settings>('settings.json', { heroSlides: [], schoolInfo: {} })
    return res.status(200).json(s.heroSlides)
  }
  if (req.method === 'PUT') {
    if (!isAuthenticated(req as never)) return res.status(401).json({ error: 'Unauthorized' })
    const s = readData<Settings>('settings.json', { heroSlides: [], schoolInfo: {} })
    writeData('settings.json', { ...s, heroSlides: req.body })
    return res.status(200).json({ ok: true })
  }
  res.status(405).end()
}
