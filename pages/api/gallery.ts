import type { NextApiRequest, NextApiResponse } from 'next'
import { readData, writeData } from '../../lib/data'
import { isAuthenticated } from '../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const data = await readData('gallery.json', { enabled: true, title: 'ภาพกิจกรรม', folders: [] })
    return res.status(200).json(data)
  }

  if (req.method === 'PUT') {
    if (!isAuthenticated(req)) return res.status(401).json({ error: 'Unauthorized' })
    await writeData('gallery.json', req.body)
    return res.status(200).json(req.body)
  }

  res.status(405).end()
}
